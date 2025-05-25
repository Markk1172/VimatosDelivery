# backend/pizzaria/views.py

from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import serializers 
from decimal import Decimal
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse
import requests
from django.conf import settings
from django.db import IntegrityError # Usado em register_view
from django.utils import timezone
from .permissions import IsFuncionario
from .models import (
    Funcionario, Motoboy, Pizza, Bebida, Cliente, TaxaEntrega,
    Pedido, ItemPedido, Cupom
)
from .serializers import (
    FuncionarioSerializer, MotoboySerializer, PizzaSerializer,
    BebidaSerializer, ClienteSerializer, TaxaEntregaSerializer,
    ClienteCreateSerializer,
    PedidoSerializer, ItemPedidoSerializer, # ItemPedidoSerializer é usado por PedidoSerializer
    FuncionarioCreateSerializer, MotoboyCreateSerializer,
    CupomSerializer
)

User = get_user_model()

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user_obj_for_auth = None # Definir antes do try para ter escopo mais amplo
    try:
        user_obj_for_auth = User.objects.get(email=email)
        username_for_auth = user_obj_for_auth.username
    except User.DoesNotExist:
        username_or_email = request.data.get('username', email) 
        try:
            user_obj_for_auth = User.objects.get(username=username_or_email)
            username_for_auth = user_obj_for_auth.username
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado.'}, status=404)

    user = authenticate(username=username_for_auth, password=password)
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
        return JsonResponse({'error': 'Credenciais inválidas (email ou senha incorretos).'}, status=401)

@api_view(['POST'])
def register_view(request):
    serializer = ClienteCreateSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return JsonResponse({'message': 'Cliente registrado com sucesso!'}, status=201)
        except IntegrityError as e: # IntegrityError é usado aqui
            error_message = 'Erro de integridade ao registrar.'
            if 'UNIQUE constraint' in str(e).upper():
                if 'username' in str(e): error_message = 'Este nome de usuário já existe.'
                elif 'email' in str(e): error_message = 'Este email já está cadastrado.'
                elif 'cpf' in str(e): error_message = 'Este CPF já está cadastrado.'
            return JsonResponse({'error': error_message}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Erro ao registrar: {e}'}, status=400)
    return JsonResponse(serializer.errors, status=400)

class FuncionarioListCreate(generics.ListCreateAPIView):
    queryset = Funcionario.objects.all()
    permission_classes = [IsAuthenticated, IsFuncionario]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FuncionarioCreateSerializer
        return FuncionarioSerializer

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
        self.permission_denied(
            self.request,
            message='Você não tem permissão para acessar ou modificar este perfil de cliente.'
        )


class MotoboyListCreate(generics.ListCreateAPIView):
    queryset = Motoboy.objects.all()
    permission_classes = [IsAuthenticated, IsFuncionario]
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MotoboyCreateSerializer
        return MotoboySerializer

class PizzaListCreate(generics.ListCreateAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsFuncionario()]
        return [] 

class BebidaListCreate(generics.ListCreateAPIView):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsFuncionario()]
        return []

class TaxaEntregaListCreate(generics.ListCreateAPIView):
    queryset = TaxaEntrega.objects.all()
    serializer_class = TaxaEntregaSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

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
            except ValueError as ve: 
                 return Response({'erro': f'Percentual inválido: {ve}'}, status=status.HTTP_400_BAD_REQUEST)
            pizza.aplicar_desconto(percentual) 
            return Response(PizzaSerializer(pizza).data, status=status.HTTP_200_OK)
        except Pizza.DoesNotExist:
            return Response({'erro': 'Pizza não encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as ve: 
            return Response({'erro': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erro inesperado em AplicarDescontoPizzaView: {e}")
            return Response({'erro': 'Ocorreu um erro interno ao aplicar o desconto.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all().order_by('data_pedido')
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'funcionario'):
            status_filter = self.request.query_params.get('status')
            if status_filter:
                status_list = self.request.query_params.getlist('status')
                return Pedido.objects.filter(status__in=status_list).order_by('data_pedido')
            return Pedido.objects.all().order_by('data_pedido')
        elif hasattr(user, 'cliente'):
            return Pedido.objects.filter(cliente=user.cliente).order_by('-data_pedido')
        return Pedido.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        cliente_obj = None
        funcionario_obj = None

        if hasattr(user, 'cliente'):
            cliente_obj = user.cliente
        elif hasattr(user, 'funcionario'):
            funcionario_obj = user.funcionario
            cliente_id = self.request.data.get('cliente') 
            if not cliente_id:
                 # A validação de cliente para funcionário deve ocorrer no serializer se 'cliente' for obrigatório.
                 # Se o serializer permitir 'cliente' como None/blank para funcionário, então esta lógica é ok.
                 pass
            try:
                if cliente_id: # Só busca se cliente_id for fornecido
                    cliente_obj = Cliente.objects.get(id=cliente_id)
            except Cliente.DoesNotExist:
                raise serializers.ValidationError({"cliente": "Cliente especificado não encontrado."})
            except ValueError: 
                raise serializers.ValidationError({"cliente": "ID de cliente inválido."})
        else:
            # Isso não deveria ser alcançado se IsAuthenticated estiver funcionando
            # e o usuário não for nem cliente nem funcionário.
            raise serializers.ValidationError("Usuário não autorizado a criar pedido.")
        
        serializer.save(
            cliente=cliente_obj, 
            funcionario_responsavel=funcionario_obj, 
            context={'request': self.request} # Passa o contexto para o serializer
        )

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy', 'atualizar_status', 'atribuir_motoboy']:
            return [IsAuthenticated(), IsFuncionario()]
        elif self.action == 'validar_cupom_action':
            return [IsAuthenticated()]
        return [IsAuthenticated()] # Para list e retrieve (filtrado no get_queryset)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsFuncionario])
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsFuncionario])
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

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def validar_cupom_action(self, request):
        codigo_cupom = request.data.get('codigo_cupom')
        subtotal_str = request.data.get('subtotal_itens') 
        if not codigo_cupom:
            return Response({'error': 'Código do cupom não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        if not subtotal_str:
            return Response({'error': 'Subtotal dos itens não fornecido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            subtotal = Decimal(subtotal_str)
            if subtotal < 0:
                 raise ValueError("Subtotal não pode ser negativo.")
        except (TypeError, ValueError):
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buscar_cep_api(request):
    cep = request.GET.get('cep')
    if not cep: return JsonResponse({'erro': 'CEP não fornecido'}, status=400)
    try:
        response = requests.get(f'https://viacep.com.br/ws/{cep}/json/')
        response.raise_for_status()
        data = response.json()
        if data.get('erro'):
            return JsonResponse({'erro': 'CEP não encontrado ou inválido.'}, status=404)
        return JsonResponse(data)
    except requests.exceptions.HTTPError as e:
        return JsonResponse({'erro': f'Erro ao buscar CEP (serviço indisponível ou CEP inválido): {e.response.status_code}'}, status=e.response.status_code)
    except requests.exceptions.RequestException as e:
        return JsonResponse({'erro': f'Erro de rede ao buscar CEP: {e}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsFuncionario])
def calcular_rota(request):
    origem_cep = request.data.get('origem_cep')
    destino_cep = request.data.get('destino_cep')
    if not origem_cep or not destino_cep:
        return JsonResponse({'erro': 'CEP de origem e destino são necessários.'}, status=400)

    def buscar_coordenadas(cep_str):
        try:
            r_via_cep = requests.get(f'https://viacep.com.br/ws/{cep_str}/json/', timeout=5)
            r_via_cep.raise_for_status()
            dados_cep = r_via_cep.json()
            if dados_cep.get('erro'): 
                print(f"ViaCEP retornou erro para CEP: {cep_str}")
                return None
            
            parts = [ dados_cep.get('logradouro'), dados_cep.get('bairro'), dados_cep.get('localidade'), dados_cep.get('uf') ]
            endereco = ", ".join(filter(None, parts)) 
            if not endereco.strip():
                 print(f"Endereço resultante vazio para CEP: {cep_str}")
                 return None

            params_geo = {'text': endereco, 'apiKey': settings.GEOAPIFY_API_KEY, 'limit': 1}
            r_geo = requests.get('https://api.geoapify.com/v1/geocode/search', params=params_geo, timeout=10)
            r_geo.raise_for_status()
            geo_data = r_geo.json()
            
            if geo_data.get('features') and len(geo_data['features']) > 0:
                return geo_data['features'][0]['geometry']['coordinates']
            else:
                print(f"Geoapify não encontrou coordenadas para endereço: {endereco} (CEP: {cep_str})")
                return None
        except requests.exceptions.Timeout:
            print(f"Timeout ao buscar coordenadas para CEP: {cep_str}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Erro na requisição de coordenadas para CEP {cep_str}: {e}")
            return None
        except (IndexError, KeyError) as e:
            print(f"Erro ao processar dados de geocodificação para CEP {cep_str}: {e}")
            return None
            
    origem_coord = buscar_coordenadas(origem_cep)
    destino_coord = buscar_coordenadas(destino_cep)

    if not origem_coord or not destino_coord:
        return JsonResponse({'erro': 'Não foi possível obter coordenadas para um ou ambos os CEPs. Verifique os CEPs ou tente um endereço mais específico.'}, status=400)
    
    rota_url = 'https://api.openrouteservice.org/v2/directions/driving-car' 
    headers = {'Authorization': settings.ORS_API_KEY, 'Content-Type': 'application/json; charset=utf-8'}
    rota_body = {'coordinates': [origem_coord, destino_coord], "instructions": "false"} 
    
    try:
        rota_resposta = requests.post(rota_url, json=rota_body, headers=headers, timeout=15)
        rota_resposta.raise_for_status() 
        rota_dados = rota_resposta.json()

        if not rota_dados.get('features') or \
           not rota_dados['features'][0].get('properties') or \
           not rota_dados['features'][0]['properties'].get('summary'): 
            print(f"Resposta inesperada da API de rotas (OpenRouteService): {rota_dados}")
            return JsonResponse({'erro': 'Resposta inesperada da API de rotas ao extrair dados.'}, status=500)

        summary = rota_dados['features'][0]['properties']['summary']
        distancia_metros = summary.get('distance')
        duracao_segundos = summary.get('duration')

        if distancia_metros is None or duracao_segundos is None:
            print(f"Distância ou duração ausentes na resposta da API de rotas: {summary}")
            return JsonResponse({'erro': 'Dados de distância ou duração ausentes na resposta da API de rotas.'}, status=500)

        return JsonResponse({
            'distancia_km': round(distancia_metros / 1000, 2),
            'duracao_minutos': round(duracao_segundos / 60, 2)
        })
    except requests.exceptions.Timeout:
        return JsonResponse({'erro': 'Timeout ao calcular a rota com OpenRouteService.'}, status=504) 
    except requests.exceptions.RequestException as e:
         return JsonResponse({'erro': f'Erro de comunicação ao calcular a rota: {str(e)}'}, status=502) 
    except (IndexError, KeyError, TypeError) as e: 
        print(f"Erro ao processar resposta da API de rotas (OpenRouteService): {rota_dados if 'rota_dados' in locals() else 'Resposta não disponível'}, Erro: {e}")
        return JsonResponse({'erro': 'Erro ao processar a resposta da API de rotas.'}, status=500)

class PizzaRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

