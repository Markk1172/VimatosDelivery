# backend/pizzaria/views.py

from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers
from decimal import Decimal, InvalidOperation
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse
import requests
import re
from django.conf import settings
from django.db import IntegrityError
from django.utils import timezone
# Importa as permissões personalizadas definidas localmente.
from .permissions import IsFuncionario, IsOwnerAndCanCancel
# Importa os modelos e serializers definidos localmente.
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

# Obtém o modelo de usuário ativo.
User = get_user_model()

# ==============================================================================
# ESTRUTURA DE DADOS (LISTA) E FUNÇÃO PARA TAXAS DE FRETE
# ==============================================================================

# Define as faixas de distância e seus respectivos valores de frete.
# Esta lista é usada para determinar o custo da entrega com base na distância.
TAXAS_FRETE_LISTA = [
    {'descricao': 'Entrega Curta', 'distancia_max_km': Decimal('3.00'), 'valor': Decimal('5.00')},
    {'descricao': 'Entrega Padrão', 'distancia_max_km': Decimal('7.00'), 'valor': Decimal('8.50')},
    {'descricao': 'Entrega Média', 'distancia_max_km': Decimal('12.00'), 'valor': Decimal('15.00')},
    {'descricao': 'Entrega Longa', 'distancia_max_km': Decimal('20.00'), 'valor': Decimal('22.00')},
]

# Encontra a taxa de frete correspondente a uma distância calculada.
# Percorre a lista `TAXAS_FRETE_LISTA` (ordenada por distância) e retorna
# a primeira taxa cuja `distancia_max_km` seja maior ou igual à distância fornecida.
# Retorna None se a distância exceder todas as faixas definidas.
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

# Busca coordenadas geográficas (longitude, latitude) a partir de um CEP.
# Utiliza a API ViaCEP para obter o endereço e, em seguida, a API Geoapify
# para converter o endereço em coordenadas. Requer `GEOAPIFY_API_KEY` nas settings.
# Retorna (coordenadas, None) em caso de sucesso ou (None, mensagem_de_erro) em caso de falha.
def _buscar_coordenadas(cep_str: str):
    cep_limpo = re.sub(r'\D', '', cep_str)
    if not re.match(r'^\d{8}$', cep_limpo):
        return None, "Formato de CEP inválido. Utilize 8 dígitos."
    try:
        r_via_cep = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/', timeout=5)
        r_via_cep.raise_for_status()
        dados_cep = r_via_cep.json()
        if dados_cep.get('erro'):
            return None, f"CEP {cep_str} não encontrado."

        parts = [dados_cep.get('logradouro'), dados_cep.get('bairro'), dados_cep.get('localidade'), dados_cep.get('uf')]
        endereco_completo = ", ".join(filter(None, parts))
        if not endereco_completo.strip():
            return None, "Não foi possível montar endereço para geocodificação."

        if not hasattr(settings, 'GEOAPIFY_API_KEY') or not settings.GEOAPIFY_API_KEY:
            return None, "Erro interno (configuração de geocodificação ausente)."

        params_geo = {'text': endereco_completo, 'apiKey': settings.GEOAPIFY_API_KEY, 'limit': 1, 'lang': 'pt'}
        r_geo = requests.get('https://api.geoapify.com/v1/geocode/search', params=params_geo, timeout=10)
        r_geo.raise_for_status()
        geo_data = r_geo.json()

        if geo_data.get('features') and len(geo_data['features']) > 0:
            return geo_data['features'][0]['geometry']['coordinates'], None
        else:
            return None, f"Não foi possível obter coordenadas para o CEP {cep_str}."

    except requests.exceptions.Timeout:
        return None, "Serviço de geolocalização indisponível (timeout)."
    except requests.exceptions.HTTPError as http_err:
        return None, f"Erro ao comunicar com serviço de geolocalização (HTTP {http_err.response.status_code})."
    except requests.exceptions.RequestException as req_err:
        return None, f"Erro de rede ao buscar geolocalização: {req_err}"
    except Exception as e:
        return None, f"Erro inesperado ao buscar coordenadas: {e}"

# Calcula a distância da rota entre duas coordenadas usando a API OpenRouteService.
# Requer `ORS_API_KEY` nas settings.
# Retorna (distancia_em_km, None) em caso de sucesso ou (None, mensagem_de_erro) em caso de falha.
def _calcular_distancia_rota(origem_coord, destino_coord):
    if not origem_coord or not destino_coord:
        return None, "Coordenadas de origem ou destino ausentes."
    if not hasattr(settings, 'ORS_API_KEY') or not settings.ORS_API_KEY:
        return None, "Erro interno (configuração de rotas ausente)."

    rota_url = 'https://api.openrouteservice.org/v2/directions/driving-car'
    headers = {'Authorization': settings.ORS_API_KEY, 'Content-Type': 'application/json; charset=utf-8'}
    rota_body = {'coordinates': [origem_coord, destino_coord], "instructions": "false", "units": "km"}

    try:
        rota_resposta = requests.post(rota_url, json=rota_body, headers=headers, timeout=15)
        rota_resposta.raise_for_status()
        rota_dados = rota_resposta.json()

        if rota_dados.get('routes') and rota_dados['routes'][0].get('summary'):
            distancia_km_ors = rota_dados['routes'][0]['summary'].get('distance')
            if distancia_km_ors is not None:
                return Decimal(str(distancia_km_ors)), None
        return None, "Não foi possível extrair a distância da resposta do serviço de rotas."

    except requests.exceptions.Timeout:
        return None, "Serviço de cálculo de rotas indisponível (timeout)."
    except requests.exceptions.HTTPError as http_err:
        return None, f"Erro ao comunicar com serviço de rotas (HTTP {http_err.response.status_code})."
    except requests.exceptions.RequestException as req_err:
        return None, f"Erro de rede ao calcular a rota: {req_err}"
    except Exception as e:
        return None, f"Erro ao processar dados da rota: {e}"


# ==============================================================================
# VIEWS DE AUTENTICAÇÃO E CADASTRO
# ==============================================================================

# View para autenticar usuários (login).
# Aceita email/username e senha, tenta autenticar e, se bem-sucedido,
# retorna tokens JWT (refresh e access) e informações básicas do usuário.
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    username_for_auth = None

    # Tenta encontrar o usuário pelo email, depois pelo username.
    try:
        user_obj = User.objects.get(email__iexact=email)
        username_for_auth = user_obj.username
    except User.DoesNotExist:
        username_or_email = request.data.get('username', email)
        try:
            user_obj = User.objects.get(username__iexact=username_or_email)
            username_for_auth = user_obj.username
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    # Autentica o usuário.
    user = authenticate(request=request, username=username_for_auth, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        # Verifica se é funcionário e obtém o ID do cliente, se houver.
        is_funcionario = hasattr(user, 'funcionario')
        cliente_id = user.cliente.id if hasattr(user, 'cliente') else None
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

# View para registrar novos clientes.
# Utiliza o `ClienteCreateSerializer` para validar e criar um novo Cliente e seu User.
@api_view(['POST'])
def register_view(request):
    serializer = ClienteCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return JsonResponse({'message': 'Cliente registrado com sucesso!'}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            # Tratamento básico para erros de unicidade.
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
# VIEWS DE LISTAGEM E CRIAÇÃO/EDIÇÃO (CRUD)
# ==============================================================================

# View para listar e criar Funcionários.
# Apenas usuários autenticados e que são funcionários podem acessar.
# Usa `FuncionarioCreateSerializer` para POST e `FuncionarioSerializer` para GET.
class FuncionarioListCreate(generics.ListCreateAPIView):
    queryset = Funcionario.objects.all()
    permission_classes = [IsAuthenticated, IsFuncionario]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FuncionarioCreateSerializer
        return FuncionarioSerializer

# View para detalhar, atualizar e deletar Funcionários.
# Apenas funcionários autenticados podem acessar.
class FuncionarioRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# View para listar e criar Clientes.
# Apenas funcionários autenticados podem acessar esta view.
class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# View para detalhar, atualizar e deletar Clientes.
# Funcionários podem acessar qualquer cliente. Clientes podem acessar apenas
# seus próprios perfis.
class ClienteRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    # Sobrescreve `get_object` para adicionar verificação de permissão de objeto.
    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if hasattr(user, 'funcionario') or (hasattr(user, 'cliente') and user.cliente == obj):
            return obj
        self.permission_denied(self.request, message='Você não tem permissão para acessar este perfil de cliente.')

# View para listar e criar Motoboys.
# Apenas funcionários autenticados podem acessar.
class MotoboyListCreate(generics.ListCreateAPIView):
    queryset = Motoboy.objects.all()
    permission_classes = [IsAuthenticated, IsFuncionario]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MotoboyCreateSerializer
        return MotoboySerializer

# View para detalhar, atualizar e deletar Motoboys.
# Apenas funcionários autenticados podem acessar.
class MotoboyRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Motoboy.objects.all()
    serializer_class = MotoboySerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# View para listar e criar Pizzas.
# Qualquer um pode listar (GET). Apenas funcionários podem criar (POST).
class PizzaListCreate(generics.ListCreateAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsFuncionario()]
        return []

# View para detalhar, atualizar e deletar Pizzas.
# Qualquer um pode ver (GET). Apenas funcionários podem alterar (PUT/PATCH/DELETE).
class PizzaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsFuncionario()]
        return []

# View para listar e criar Bebidas.
# Qualquer um pode listar (GET). Apenas funcionários podem criar (POST).
class BebidaListCreate(generics.ListCreateAPIView):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsFuncionario()]
        return []

# View para detalhar, atualizar e deletar Bebidas.
# Qualquer um pode ver (GET). Apenas funcionários podem alterar (PUT/PATCH/DELETE).
class BebidaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsFuncionario()]
        return []

# View específica para aplicar um desconto a uma Pizza.
# Acessível apenas por funcionários via POST.
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
                # Usa o método `aplicar_desconto` do modelo, que contém a validação.
                pizza.aplicar_desconto(percentual)
                return Response(PizzaSerializer(pizza).data, status=status.HTTP_200_OK)
            except (ValueError, InvalidOperation) as ve:
                return Response({'erro': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Pizza.DoesNotExist:
            return Response({'erro': 'Pizza não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'erro': 'Ocorreu um erro interno.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==============================================================================
# VIEWSETS
# ==============================================================================

# ViewSet completo para gerenciar Pedidos.
# Utiliza `viewsets.ModelViewSet` para fornecer operações CRUD padrão,
# mas adiciona ações personalizadas e lógicas de permissão/query.
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('data_pedido')
    serializer_class = PedidoSerializer

    # Filtra os pedidos com base no tipo de usuário logado.
    # Funcionários veem todos (ou filtrados por status). Clientes veem apenas os seus.
    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if hasattr(user, 'funcionario'):
            status_filter = self.request.query_params.getlist('status')
            if status_filter:
                return queryset.filter(status__in=status_filter)
            return queryset
        elif hasattr(user, 'cliente'):
            return queryset.filter(cliente=user.cliente)

        return queryset.none() # Retorna vazio se não for nem funcionário nem cliente.

    # Define o cliente/funcionário responsável ao criar um pedido.
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
                except (Cliente.DoesNotExist, ValueError, TypeError):
                    raise serializers.ValidationError({"cliente": "Cliente especificado inválido ou não encontrado."})
            else:
                raise serializers.ValidationError({"cliente": "ID do Cliente é obrigatório para funcionário criar pedido."})
        else:
            raise serializers.ValidationError("Usuário não identificado como cliente ou funcionário.")
        # Passa o contexto da requisição para o serializer, se necessário.
        serializer.save(cliente=cliente_obj, funcionario_responsavel=funcionario_obj, context={'request': self.request})

    # Define as permissões dinamicamente com base na ação solicitada.
    def get_permissions(self):
        if self.action == 'cancelar':
            return [IsAuthenticated(), IsOwnerAndCanCancel()]
        elif self.action in ['update', 'partial_update', 'destroy', 'atualizar_status', 'atribuir_motoboy']:
            return [IsAuthenticated(), IsFuncionario()]
        else: # create, list, retrieve, validar_cupom_action
            return [IsAuthenticated()]

    # Ação personalizada para cancelar um pedido.
    # Usa a permissão `IsOwnerAndCanCancel`.
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        pedido = self.get_object() # `get_object` já aplica as permissões (`IsOwnerAndCanCancel`).
        pedido.status = 'Cancelado'
        pedido.save()
        return Response(self.get_serializer(pedido).data, status=status.HTTP_200_OK)

    # Ação personalizada para atualizar o status de um pedido.
    # Apenas funcionários podem usar.
    @action(detail=True, methods=['post'])
    def atualizar_status(self, request, pk=None):
        pedido = self.get_object()
        novo_status = request.data.get('status')
        if not novo_status:
            return Response({'error': 'Novo status não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        status_validos = [s[0] for s in Pedido.STATUS_CHOICES]
        if novo_status not in status_validos:
            return Response({'error': f'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Atualiza o status e as datas relevantes.
        pedido.status = novo_status
        now = timezone.now()
        if novo_status in ['Pronto para Entrega', 'Retirada']: pedido.data_pronto = now
        elif novo_status == 'Em Rota': pedido.data_saiu_para_entrega = now
        elif novo_status == 'Entregue': pedido.data_entregue_ou_retirado = now
        pedido.save()
        return Response(self.get_serializer(pedido).data)

    # Ação personalizada para atribuir um motoboy a um pedido.
    # Apenas funcionários podem usar.
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

    # Ação personalizada para validar um cupom e calcular seu desconto.
    # Não está associada a um pedido específico (`detail=False`).
    @action(detail=False, methods=['post'])
    def validar_cupom_action(self, request):
        codigo_cupom = request.data.get('codigo_cupom')
        subtotal_str = request.data.get('subtotal_itens')
        if not codigo_cupom or not subtotal_str:
            return Response({'error': 'Código do cupom e subtotal são necessários.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            subtotal = Decimal(subtotal_str)
            if subtotal < Decimal('0.00'): raise ValueError()
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

# ViewSet para gerenciar Cupons.
# Apenas funcionários podem acessar.
class CupomViewSet(viewsets.ModelViewSet):
    queryset = Cupom.objects.all().order_by('-data_validade')
    serializer_class = CupomSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# View para listar e criar Cupons (alternativa ao ViewSet, mais simples).
# Apenas funcionários podem acessar.
class CupomListCreate(generics.ListCreateAPIView):
    queryset = Cupom.objects.all()
    serializer_class = CupomSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# View para detalhar, atualizar e deletar Cupons (alternativa ao ViewSet).
# Apenas funcionários podem acessar.
class CupomRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cupom.objects.all()
    serializer_class = CupomSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

# ==============================================================================
# VIEWS DE API (CEP, ROTAS E FRETE)
# ==============================================================================

# View para buscar dados de um CEP usando a API ViaCEP.
# Requer autenticação.
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_cep_api(request):
    cep_str = request.GET.get('cep')
    if not cep_str:
        return JsonResponse({'erro': 'CEP não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
    cep_limpo = re.sub(r'\D', '', cep_str)
    if not re.match(r'^\d{8}$', cep_limpo):
        return JsonResponse({'erro': 'Formato de CEP inválido.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        response = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/')
        response.raise_for_status()
        data = response.json()
        if data.get('erro'):
            return JsonResponse({'erro': 'CEP não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        return JsonResponse(data)
    except requests.exceptions.RequestException as e:
        return JsonResponse({'erro': f'Erro ao buscar CEP: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View para calcular a distância de rota entre dois CEPs.
# Usa as funções auxiliares `_buscar_coordenadas` e `_calcular_distancia_rota`.
# Acessível apenas por funcionários.
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsFuncionario])
def calcular_rota(request):
    origem_cep_str = request.data.get('origem_cep')
    destino_cep_str = request.data.get('destino_cep')
    if not origem_cep_str or not destino_cep_str:
        return JsonResponse({'erro': 'CEP de origem e destino são necessários.'}, status=status.HTTP_400_BAD_REQUEST)

    origem_coord, erro_origem = _buscar_coordenadas(origem_cep_str)
    if erro_origem: return JsonResponse({'erro': f'Origem: {erro_origem}'}, status=status.HTTP_400_BAD_REQUEST)

    destino_coord, erro_destino = _buscar_coordenadas(destino_cep_str)
    if erro_destino: return JsonResponse({'erro': f'Destino: {erro_destino}'}, status=status.HTTP_400_BAD_REQUEST)

    distancia_km, erro_distancia = _calcular_distancia_rota(origem_coord, destino_coord)
    if erro_distancia: return JsonResponse({'erro': erro_distancia}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return JsonResponse({'distancia_km': distancia_km.quantize(Decimal('0.01'))})

# View para calcular o valor do frete com base no CEP de destino.
# Usa o CEP da pizzaria (definido em `settings.PIZZARIA_CEP`) como origem.
# Calcula a distância e, em seguida, usa `encontrar_frete_na_lista` para obter o valor.
# Requer autenticação.
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calcular_frete_view(request):
    destino_cep_str = request.data.get('destino_cep')
    origem_cep_str = getattr(settings, 'PIZZARIA_CEP', None)

    if not destino_cep_str:
        return JsonResponse({'erro': 'CEP de destino não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
    destino_cep_limpo = re.sub(r'\D', '', destino_cep_str)
    if not re.match(r'^\d{8}$', destino_cep_limpo):
        return JsonResponse({'erro': 'Formato de CEP inválido.'}, status=status.HTTP_400_BAD_REQUEST)
    if not origem_cep_str:
        return JsonResponse({'erro': 'Erro interno (origem não configurada).'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    origem_cep_limpo = re.sub(r'\D', '', origem_cep_str)
    if destino_cep_limpo == origem_cep_limpo:
        return JsonResponse({'valor_frete': Decimal('0.00'), 'distancia_km': Decimal('0.00'), 'mensagem': 'Retirada no local.'})

    origem_coord, erro_origem = _buscar_coordenadas(origem_cep_limpo)
    if erro_origem: return JsonResponse({'erro': 'Erro ao processar CEP de origem.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    destino_coord, erro_destino = _buscar_coordenadas(destino_cep_limpo)
    if erro_destino: return JsonResponse({'erro': f'CEP de destino: {erro_destino}'}, status=status.HTTP_400_BAD_REQUEST)

    distancia_km, erro_distancia = _calcular_distancia_rota(origem_coord, destino_coord)
    if erro_distancia: return JsonResponse({'erro': f'Cálculo de rota: {erro_distancia}'}, status=status.HTTP_400_BAD_REQUEST)
    if distancia_km is None: return JsonResponse({'erro': 'Não foi possível determinar a distância.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    taxa_aplicavel_info = encontrar_frete_na_lista(distancia_km)
    if taxa_aplicavel_info:
        return JsonResponse({
            'valor_frete': taxa_aplicavel_info['valor'].quantize(Decimal('0.01')),
            'distancia_km': distancia_km.quantize(Decimal('0.01')),
            'descricao_taxa': taxa_aplicavel_info['descricao']
        })
    else:
        return JsonResponse({
            'erro': 'Desculpe, não entregamos nesta localidade.',
            'distancia_km': distancia_km.quantize(Decimal('0.01'))
        }, status=status.HTTP_400_BAD_REQUEST)