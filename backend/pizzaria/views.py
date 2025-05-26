# backend/pizzaria/views.py

from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from decimal import Decimal, InvalidOperation
from rest_framework.permissions import IsAuthenticated # Import padrão do DRF
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse
import requests
import re
from django.conf import settings
from django.db import IntegrityError
from django.utils import timezone
# --- CORREÇÃO PRINCIPAL AQUI ---
from .permissions import IsFuncionario, IsOwnerAndCanCancel
# -------------------------------
from .models import (
    Funcionario, Motoboy, Pizza, Bebida, Cliente,
    Pedido, ItemPedido, Cupom
)
from .serializers import (
    FuncionarioSerializer, MotoboySerializer, PizzaSerializer,
    BebidaSerializer, ClienteSerializer,
    ClienteCreateSerializer,
    PedidoSerializer, ItemPedidoSerializer,
    FuncionarioCreateSerializer, MotoboyCreateSerializer,
    CupomSerializer
)

User = get_user_model()

# ==============================================================================
# ESTRUTURA DE DADOS (LISTA) E FUNÇÃO PARA TAXAS DE FRETE
# ==============================================================================

TAXAS_FRETE_LISTA = [
    {'descricao': 'Entrega Curta', 'distancia_max_km': Decimal('3.00'), 'valor': Decimal('5.00')},
    {'descricao': 'Entrega Padrão', 'distancia_max_km': Decimal('7.00'), 'valor': Decimal('8.50')},
    {'descricao': 'Entrega Média', 'distancia_max_km': Decimal('12.00'), 'valor': Decimal('15.00')},
    {'descricao': 'Entrega Longa', 'distancia_max_km': Decimal('20.00'), 'valor': Decimal('22.00')},
]

def encontrar_frete_na_lista(distancia_calculada):
    try:
        distancia_calculada_decimal = Decimal(str(distancia_calculada))
    except (TypeError, InvalidOperation):
        print(f"Erro: Distância calculada inválida para Decimal: {distancia_calculada}")
        return None
    taxas_ordenadas = sorted(TAXAS_FRETE_LISTA, key=lambda x: x['distancia_max_km'])
    for taxa in taxas_ordenadas:
        if distancia_calculada_decimal <= taxa['distancia_max_km']:
            return taxa
    return None

# ==============================================================================
# FUNÇÕES AUXILIARES PARA CÁLCULO DE ROTA E FRETE
# ==============================================================================

def _buscar_coordenadas(cep_str: str):
    cep_limpo = re.sub(r'\D', '', cep_str)
    if not re.match(r'^\d{8}$', cep_limpo):
        print(f"Formato de CEP inválido para _buscar_coordenadas: {cep_str}")
        return None, "Formato de CEP inválido. Utilize 8 dígitos."
    try:
        r_via_cep = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/', timeout=5)
        r_via_cep.raise_for_status()
        dados_cep = r_via_cep.json()
        if dados_cep.get('erro'):
            print(f"ViaCEP não encontrou o CEP: {cep_limpo}")
            return None, f"CEP {cep_str} não encontrado na base do ViaCEP."
        parts = [dados_cep.get('logradouro'), dados_cep.get('bairro'), dados_cep.get('localidade'), dados_cep.get('uf')]
        endereco_completo = ", ".join(filter(None, parts))
        if not endereco_completo.strip():
            print(f"Endereço resultante vazio para CEP: {cep_limpo} (Dados ViaCEP: {dados_cep})")
            return None, "Não foi possível montar um endereço para geocodificação a partir do CEP."
        if not hasattr(settings, 'GEOAPIFY_API_KEY') or not settings.GEOAPIFY_API_KEY:
            print("CRÍTICO: GEOAPIFY_API_KEY não configurada em settings.py!")
            return None, "Erro interno do servidor (configuração de geocodificação ausente)."
        params_geo = {'text': endereco_completo, 'apiKey': settings.GEOAPIFY_API_KEY, 'limit': 1, 'lang': 'pt'}
        r_geo = requests.get('https://api.geoapify.com/v1/geocode/search', params=params_geo, timeout=10)
        r_geo.raise_for_status()
        geo_data = r_geo.json()
        if geo_data.get('features') and len(geo_data['features']) > 0:
            return geo_data['features'][0]['geometry']['coordinates'], None
        else:
            print(f"Geoapify não encontrou coordenadas para: {endereco_completo} (CEP: {cep_limpo}). Resposta: {geo_data}")
            return None, f"Não foi possível obter coordenadas precisas para o endereço do CEP {cep_str}."
    except requests.exceptions.Timeout:
        print(f"Timeout ao conectar com API de geocodificação para CEP: {cep_limpo}")
        return None, "Serviço de geolocalização indisponível (timeout). Tente mais tarde."
    except requests.exceptions.HTTPError as http_err:
        print(f"Erro HTTP ao buscar coordenadas para CEP {cep_limpo}: {http_err}")
        return None, f"Erro ao comunicar com serviço de geolocalização (HTTP {http_err.response.status_code})."
    except requests.exceptions.RequestException as req_err:
        print(f"Erro de requisição ao buscar coordenadas para CEP {cep_limpo}: {req_err}")
        return None, "Erro de rede ao buscar informações de geolocalização."
    except Exception as e:
        print(f"Erro inesperado em _buscar_coordenadas para CEP {cep_limpo}: {e}")
        return None, "Erro interno ao processar informações de geolocalização."

def _calcular_distancia_rota(origem_coord, destino_coord):
    if not origem_coord or not destino_coord:
        return None, "Coordenadas de origem ou destino ausentes."

    if not hasattr(settings, 'ORS_API_KEY') or not settings.ORS_API_KEY:
        print("CRÍTICO: ORS_API_KEY não configurada em settings.py!")
        return None, "Erro interno do servidor (configuração de rotas ausente)."

    rota_url = 'https://api.openrouteservice.org/v2/directions/driving-car'
    headers = {'Authorization': settings.ORS_API_KEY, 'Content-Type': 'application/json; charset=utf-8'}
    rota_body = {'coordinates': [origem_coord, destino_coord], "instructions": "false", "units": "km"}

    try:
        rota_resposta = requests.post(rota_url, json=rota_body, headers=headers, timeout=15)
        rota_resposta.raise_for_status()
        rota_dados = rota_resposta.json()

        if rota_dados.get('routes') and \
           isinstance(rota_dados['routes'], list) and \
           len(rota_dados['routes']) > 0 and \
           rota_dados['routes'][0].get('summary'):
            summary = rota_dados['routes'][0]['summary']
            distancia_km_ors = summary.get('distance')
            if distancia_km_ors is not None:
                try:
                    return Decimal(str(distancia_km_ors)), None
                except InvalidOperation:
                    print(f"Valor de distância inválido retornado pelo ORS: {distancia_km_ors}")
                    return None, "Formato de distância inválido retornado pelo serviço de rotas."
            else:
                print(f"Campo 'distance' ausente no summary do ORS: {summary}")
                return None, "Campo 'distance' ausente na resposta do serviço de rotas."
        print(f"Estrutura inesperada na resposta do ORS ao tentar obter distância: {rota_dados}")
        return None, "Não foi possível extrair a distância da resposta do serviço de rotas (estrutura inesperada)."
    except requests.exceptions.Timeout:
        print(f"Timeout ao calcular a rota com OpenRouteService.")
        return None, "Serviço de cálculo de rotas indisponível (timeout). Tente mais tarde."
    except requests.exceptions.HTTPError as http_err:
        print(f"Erro HTTP ao calcular rota (ORS): {http_err} - Resposta: {http_err.response.text if http_err.response else 'Sem resposta'}")
        return None, f"Erro ao comunicar com serviço de rotas (HTTP {http_err.response.status_code})."
    except requests.exceptions.RequestException as req_err:
        print(f"Erro de requisição ao calcular rota (ORS): {req_err}")
        return None, "Erro de rede ao calcular a rota."
    except (IndexError, KeyError, TypeError) as e:
        print(f"Erro ao processar resposta da API de rotas (ORS): {e}. Resposta: {rota_dados if 'rota_dados' in locals() else 'N/A'}")
        return None, "Erro ao processar os dados da rota."
    except Exception as e:
        print(f"Erro geral em _calcular_distancia_rota: {e}. Resposta ORS (se houver): {rota_dados if 'rota_dados' in locals() else 'N/A'}")
        return None, "Ocorreu um erro inesperado ao calcular a distância da rota."

# ==============================================================================
# VIEWS DE AUTENTICAÇÃO E CADASTRO
# ==============================================================================
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user_obj_for_auth = None
    try:
        user_obj_for_auth = User.objects.get(email__iexact=email)
        username_for_auth = user_obj_for_auth.username
    except User.DoesNotExist:
        username_or_email = request.data.get('username', email)
        try:
            user_obj_for_auth = User.objects.get(username__iexact=username_or_email)
            username_for_auth = user_obj_for_auth.username
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    user = authenticate(request=request, username=username_for_auth, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        is_funcionario = hasattr(user, 'funcionario')
        cliente_id = None
        if hasattr(user, 'cliente'):
            cliente_id = user.cliente.id
        return JsonResponse({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'userName': user.username,
            'userEmail': user.email,
            'clienteId': cliente_id,
            'is_funcionario': is_funcionario,
        })
    else:
        return JsonResponse({'error': 'Credenciais inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def register_view(request):
    serializer = ClienteCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return JsonResponse({'message': 'Cliente registrado com sucesso!'}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            error_message = 'Erro de integridade ao registrar.'
            if 'UNIQUE constraint' in str(e).upper():
                if 'username' in str(e): error_message = 'Este nome de usuário já existe.'
                elif 'email' in str(e): error_message = 'Este email já está cadastrado.'
                elif 'cpf' in str(e): error_message = 'Este CPF já está cadastrado.'
            return JsonResponse({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({'error': f'Erro ao registrar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ==============================================================================
# VIEWS DE LISTAGEM E CRIAÇÃO/EDIÇÃO
# ==============================================================================
class FuncionarioListCreate(generics.ListCreateAPIView):
    queryset = Funcionario.objects.all()
    permission_classes = [IsAuthenticated, IsFuncionario]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FuncionarioCreateSerializer
        return FuncionarioSerializer

class FuncionarioRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class ClienteRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if hasattr(user, 'funcionario') or (hasattr(user, 'cliente') and user.cliente == obj):
            return obj
        self.permission_denied(self.request, message='Você não tem permissão para acessar este perfil de cliente.')

class MotoboyListCreate(generics.ListCreateAPIView):
    queryset = Motoboy.objects.all()
    permission_classes = [IsAuthenticated, IsFuncionario]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MotoboyCreateSerializer
        return MotoboySerializer

class MotoboyRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Motoboy.objects.all()
    serializer_class = MotoboySerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class PizzaListCreate(generics.ListCreateAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsFuncionario()]
        return []

class PizzaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsFuncionario()]
        return []

class BebidaListCreate(generics.ListCreateAPIView):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsFuncionario()]
        return []

class BebidaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsFuncionario()]
        return []

class AplicarDescontoPizzaView(APIView):
    permission_classes = [IsAuthenticated, IsFuncionario]
    def post(self, request, pk):
        try:
            pizza = Pizza.objects.get(pk=pk)
            percentual_str = request.data.get('percentual')
            if percentual_str is None:
                return Response({'erro': 'Percentual de desconto não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                percentual = Decimal(percentual_str)
                if not (Decimal('0') <= percentual <= Decimal('100')):
                    raise ValueError("Percentual deve estar entre 0 e 100.")
            except (ValueError, InvalidOperation):
                return Response({'erro': f'Percentual inválido: {percentual_str}'}, status=status.HTTP_400_BAD_REQUEST)
            pizza.aplicar_desconto(percentual)
            return Response(PizzaSerializer(pizza).data, status=status.HTTP_200_OK)
        except Pizza.DoesNotExist:
            return Response({'erro': 'Pizza não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as ve:
            return Response({'erro': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erro inesperado em AplicarDescontoPizzaView: {e}")
            return Response({'erro': 'Ocorreu um erro interno ao aplicar o desconto.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==============================================================================
# VIEWSETS
# ==============================================================================
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('-data_pedido')
    serializer_class = PedidoSerializer
    # permission_classes = [IsAuthenticated] # Removido, pois get_permissions cuidará disso

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        # Removido: if not user.is_authenticated: return queryset.none()
        # Pois IsAuthenticated já é verificado em get_permissions para 'list'/'retrieve'

        if hasattr(user, 'funcionario'):
            status_filter = self.request.query_params.getlist('status')
            if status_filter:
                return queryset.filter(status__in=status_filter)
            return queryset
        elif hasattr(user, 'cliente'):
            return queryset.filter(cliente=user.cliente)
        
        # Se não for funcionário nem cliente (e chegou aqui, significaria que IsAuthenticated passou
        # mas o usuário não tem os atributos esperados - caso de borda ou configuração errada)
        # É mais seguro retornar none() se não cair nos casos esperados após autenticação.
        return queryset.none()


    def perform_create(self, serializer):
        user = self.request.user
        cliente_obj = None
        funcionario_obj = None
        if hasattr(user, 'cliente'):
            cliente_obj = user.cliente
        elif hasattr(user, 'funcionario'):
            funcionario_obj = user.funcionario
            cliente_id = self.request.data.get('cliente')
            if cliente_id:
                try:
                    cliente_obj = Cliente.objects.get(id=cliente_id)
                except Cliente.DoesNotExist:
                    raise serializers.ValidationError({"cliente": "Cliente especificado não encontrado."})
                except (ValueError, TypeError):
                    raise serializers.ValidationError({"cliente": "ID de cliente inválido."})
            else: # Funcionário criando pedido precisa especificar o cliente
                raise serializers.ValidationError({"cliente": "ID do Cliente é obrigatório para funcionário criar pedido."})
        else:
            # Se IsAuthenticated passou em get_permissions para 'create', mas o user não é nem cliente nem func.
            # Isso indica uma possível falha na lógica de atribuição de 'cliente' ou 'funcionario' ao User.
            raise serializers.ValidationError("Usuário autenticado não identificado como cliente ou funcionário.")
        serializer.save(cliente=cliente_obj, funcionario_responsavel=funcionario_obj, context={'request': self.request})

    def get_permissions(self):
        """Define as permissões com base na ação."""
        if self.action == 'cancelar':
            return [IsAuthenticated(), IsOwnerAndCanCancel()]

        elif self.action in ['update', 'partial_update', 'destroy', 'atualizar_status', 'atribuir_motoboy']:
            return [IsAuthenticated(), IsFuncionario()]

        elif self.action in ['create', 'validar_cupom_action', 'list', 'retrieve']:
            return [IsAuthenticated()]

        # Default para qualquer outra ação (se houver alguma customizada não listada)
        return [IsAuthenticated()]


    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        pedido = self.get_object()
        pedido.status = 'Cancelado'
        pedido.save()
        serializer = self.get_serializer(pedido)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def atualizar_status(self, request, pk=None):
        pedido = self.get_object()
        novo_status = request.data.get('status')
        if not novo_status:
            return Response({'error': 'Novo status não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        status_validos = [s[0] for s in Pedido.STATUS_CHOICES]
        if novo_status not in status_validos:
            return Response({'error': f'Status inválido. Válidos: {", ".join(status_validos)}'}, status=status.HTTP_400_BAD_REQUEST)
        pedido.status = novo_status
        now = timezone.now()
        if novo_status in ['Pronto para Entrega', 'Retirada']: pedido.data_pronto = now
        elif novo_status == 'Em Rota': pedido.data_saiu_para_entrega = now
        elif novo_status == 'Entregue': pedido.data_entregue_ou_retirado = now
        pedido.save()
        return Response(self.get_serializer(pedido).data)

    @action(detail=True, methods=['post'])
    def atribuir_motoboy(self, request, pk=None):
        pedido = self.get_object()
        motoboy_id = request.data.get('motoboy_id')
        if not motoboy_id:
            return Response({'error': 'ID do Motoboy não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            motoboy = Motoboy.objects.get(id=motoboy_id)
            pedido.motoboy = motoboy
            pedido.save()
            return Response(self.get_serializer(pedido).data)
        except Motoboy.DoesNotExist:
            return Response({'error': 'Motoboy não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, TypeError):
            return Response({'error': 'ID de Motoboy inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def validar_cupom_action(self, request):
        codigo_cupom = request.data.get('codigo_cupom')
        subtotal_str = request.data.get('subtotal_itens')
        if not codigo_cupom:
            return Response({'error': 'Código do cupom não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        if not subtotal_str:
            return Response({'error': 'Subtotal dos itens não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            subtotal = Decimal(subtotal_str)
            if subtotal < Decimal('0.00'):
                raise ValueError("Subtotal não pode ser negativo.")
        except (TypeError, ValueError, InvalidOperation):
            return Response({'error': 'Subtotal inválido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            cupom = Cupom.objects.get(codigo__iexact=codigo_cupom)
            if cupom.is_valido():
                valor_desconto = subtotal * (cupom.percentual_desconto / Decimal('100.00'))
                return Response({
                    'valido': True, 'codigo': cupom.codigo,
                    'percentual_desconto': cupom.percentual_desconto,
                    'valor_desconto_calculado': valor_desconto.quantize(Decimal('0.01'))
                })
            else:
                return Response({'valido': False, 'error': 'Cupom inválido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)
        except Cupom.DoesNotExist:
            return Response({'valido': False, 'error': 'Cupom não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

class CupomViewSet(viewsets.ModelViewSet):
    queryset = Cupom.objects.all().order_by('-data_validade')
    serializer_class = CupomSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class CupomListCreate(generics.ListCreateAPIView):
    queryset = Cupom.objects.all()
    serializer_class = CupomSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class CupomRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cupom.objects.all()
    serializer_class = CupomSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# ==============================================================================
# VIEWS DE API (CEP, ROTAS E FRETE)
# ==============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_cep_api(request):
    cep_str = request.GET.get('cep')
    if not cep_str:
        return JsonResponse({'erro': 'CEP não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
    cep_limpo = re.sub(r'\D', '', cep_str)
    if not re.match(r'^\d{8}$', cep_limpo):
        return JsonResponse({'erro': 'Formato de CEP inválido. Use 8 dígitos.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        response = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/')
        response.raise_for_status()
        data = response.json()
        if data.get('erro'):
            return JsonResponse({'erro': 'CEP não encontrado ou inválido.'}, status=status.HTTP_404_NOT_FOUND)
        return JsonResponse(data)
    except requests.exceptions.HTTPError as e:
        return JsonResponse({'erro': f'Erro ao buscar CEP (serviço ViaCEP): {e.response.status_code}'}, status=e.response.status_code)
    except requests.exceptions.RequestException as e:
        return JsonResponse({'erro': f'Erro de rede ao buscar CEP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsFuncionario])
def calcular_rota(request):
    origem_cep_str = request.data.get('origem_cep')
    destino_cep_str = request.data.get('destino_cep')
    if not origem_cep_str or not destino_cep_str:
        return JsonResponse({'erro': 'CEP de origem e destino são necessários.'}, status=status.HTTP_400_BAD_REQUEST)
    origem_coord, erro_origem = _buscar_coordenadas(origem_cep_str)
    if erro_origem:
        return JsonResponse({'erro': f'Origem: {erro_origem}'}, status=status.HTTP_400_BAD_REQUEST)
    destino_coord, erro_destino = _buscar_coordenadas(destino_cep_str)
    if erro_destino:
        return JsonResponse({'erro': f'Destino: {erro_destino}'}, status=status.HTTP_400_BAD_REQUEST)
    distancia_km, erro_distancia = _calcular_distancia_rota(origem_coord, destino_coord)
    if erro_distancia:
        return JsonResponse({'erro': erro_distancia}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    if distancia_km is not None:
        return JsonResponse({'distancia_km': distancia_km.quantize(Decimal('0.01'))})
    else:
        return JsonResponse({'erro': 'Não foi possível calcular a distância da rota.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calcular_frete_view(request):
    destino_cep_str = request.data.get('destino_cep')
    origem_cep_str = getattr(settings, 'PIZZARIA_CEP', None)
    if not destino_cep_str:
        return JsonResponse({'erro': 'CEP de destino não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
    destino_cep_limpo = re.sub(r'\D', '', destino_cep_str)
    if not re.match(r'^\d{8}$', destino_cep_limpo):
        return JsonResponse({'erro': 'Formato de CEP de destino inválido. Use 8 dígitos.'}, status=status.HTTP_400_BAD_REQUEST)
    if not origem_cep_str:
        print("ALERTA CRÍTICO: PIZZARIA_CEP não está configurado em settings.py!")
        return JsonResponse({'erro': 'Erro interno do servidor (E01 - origem não configurada).'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    origem_cep_limpo = re.sub(r'\D', '', origem_cep_str)
    if destino_cep_limpo == origem_cep_limpo:
        return JsonResponse({
            'valor_frete': Decimal('0.00'),
            'distancia_km': Decimal('0.00'),
            'mensagem': 'CEP de origem e destino são iguais (retirada no local).',
            'descricao_taxa': 'Retirada no Local'
            })
    origem_coord, erro_origem = _buscar_coordenadas(origem_cep_limpo)
    if erro_origem:
        print(f"Erro ao processar CEP de origem ({origem_cep_limpo}): {erro_origem}")
        return JsonResponse({'erro': 'Não foi possível processar o CEP de origem da loja.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    destino_coord, erro_destino = _buscar_coordenadas(destino_cep_limpo)
    if erro_destino:
        return JsonResponse({'erro': f'Erro ao processar CEP de destino ({destino_cep_str}): {erro_destino}'}, status=status.HTTP_400_BAD_REQUEST)
    distancia_km, erro_distancia = _calcular_distancia_rota(origem_coord, destino_coord)
    if erro_distancia:
        return JsonResponse({'erro': f'Não foi possível calcular a rota: {erro_distancia}'}, status=status.HTTP_400_BAD_REQUEST)
    if distancia_km is None:
        return JsonResponse({'erro': 'Não foi possível determinar a distância para o cálculo do frete (E02).'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    taxa_aplicavel_info = encontrar_frete_na_lista(distancia_km)
    if taxa_aplicavel_info:
        return JsonResponse({
            'valor_frete': taxa_aplicavel_info['valor'].quantize(Decimal('0.01')),
            'distancia_km': distancia_km.quantize(Decimal('0.01')),
            'descricao_taxa': taxa_aplicavel_info['descricao']
        })
    else:
        return JsonResponse({
            'erro': 'Desculpe, não entregamos nesta localidade (distância excede nossas áreas de cobertura).',
            'distancia_km': distancia_km.quantize(Decimal('0.01'))
        }, status=status.HTTP_400_BAD_REQUEST)