from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse

import requests
from django.conf import settings
from django.db import IntegrityError
from .permissions import IsFuncionario
from .models import Funcionario, Motoboy, Pizza, Bebida, Cliente, TaxaEntrega
from .serializers import FuncionarioSerializer, MotoboySerializer, PizzaSerializer, BebidaSerializer, ClienteSerializer, TaxaEntregaSerializer

User = get_user_model()

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        # Tenta obter o usuário pelo email primeiro
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuário não encontrado'}, status=404)

    # Autentica o usuário usando o username (que pode ser o email ou um campo username real)
    # Se o seu User model usa email como username, então user_obj.username será o email.
    user = authenticate(username=user_obj.username, password=password)

    if user:
        # Se a autenticação for bem-sucedida, gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Obter o nome do cliente associado, se existir
        cliente_nome = None
        try:
            cliente_nome = user.cliente.nome # Acede ao nome do cliente através da relação OneToOneField
        except Cliente.DoesNotExist:
            # Se não for um cliente, pode ser um funcionário ou apenas um usuário genérico
            # Pode adicionar lógica para Funcionario aqui se necessário
            pass 

        return JsonResponse({
            'message': 'Login realizado com sucesso',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user_name': cliente_nome if cliente_nome else user.username, # Retorna o nome do cliente ou o username do Django
            'user_email': user.email # Retorna o email do usuário
        }, status=200)
    else:
        # Se a autenticação falhar (senha incorreta)
        return JsonResponse({'error': 'Credenciais inválidas'}, status=400)


@api_view(['POST'])
def register_view(request):
    try:
        username = request.data.get('name') # Nome completo do formulário
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone')
        birthdate = request.data.get('birthdate') # Data de nascimento
        cpf = request.data.get('cpf')
        address = request.data.get('address')
        cep = request.data.get('cep') # CEP, se você quiser armazená-lo no Cliente

        # Verificação se o email já está cadastrado no modelo User
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email já cadastrado'}, status=400)
        
        # Verificação se o CPF já está cadastrado no modelo Cliente
        if Cliente.objects.filter(cpf=cpf).exists():
            return JsonResponse({'error': 'CPF já cadastrado'}, status=400)
        
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        # 2. Criar o objeto Cliente e associá-lo ao User
        cliente = Cliente.objects.create(
            user=user, # Associa o User recém-criado
            nome=username,
            data_nasc=birthdate,
            cpf=cpf,
            endereco=address,
            email=email,
            telefone=phone
        )
        cliente.save()

        return JsonResponse({'message': 'Usuário e Cliente criados com sucesso'}, status=201)
    except IntegrityError as e:
        # Captura erros de integridade (ex: username/email/cpf duplicado)
        return JsonResponse({'error': f'Erro de integridade: {e}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Ocorreu um erro inesperado: {str(e)}'}, status=500)

class FuncionarioListCreate(generics.ListCreateAPIView):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class ClienteListCreate(generics.ListCreateAPIView):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class MotoboyListCreate(generics.ListCreateAPIView):
    queryset = Motoboy.objects.all()
    serializer_class = MotoboySerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class PizzaListCreate(generics.ListCreateAPIView):
    queryset = Pizza.objects.all()
    serializer_class = PizzaSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class BebidaListCreate(generics.ListCreateAPIView):
    queryset = Bebida.objects.all()
    serializer_class = BebidaSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class TaxaEntregaListCreate(generics.ListCreateAPIView):
    queryset = TaxaEntrega.objects.all()
    serializer_class = TaxaEntregaSerializer
    permission_classes = [IsAuthenticated, IsFuncionario]

class AplicarDescontoPizzaView(APIView):
    permission_classes = [IsAuthenticated, IsFuncionario]

    def post(self, request, pk):
        try:
            pizza = Pizza.objects.get(pk=pk)
        except Pizza.DoesNotExist:
            return Response({'erro': 'Pizza não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        percentual = request.data.get('percentual')

        if percentual is None:
            return Response({'erro': 'Percentual não informado.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            percentual = float(percentual)
        except ValueError:
            return Response({'erro': 'Percentual inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (0 < percentual < 100):
            return Response({'erro': 'O percentual deve estar entre 0 e 100.'}, status=status.HTTP_400_BAD_REQUEST)

        pizza.aplicar_desconto(percentual)

        serializer = PizzaSerializer(pizza)

        return Response({
            'mensagem': 'Desconto aplicado com sucesso!',
            'pizza_atualizada': serializer.data
        }, status=status.HTTP_200_OK)


def buscar_cep_api(request):
    cep = request.GET.get('cep', '').replace('-', '').strip()

    if len(cep) != 8 or not cep.isdigit():
        return JsonResponse({'erro': 'CEP inválido. Use apenas 8 números.'}, status=400)

    resposta = requests.get(f'https://viacep.com.br/ws/{cep}/json/')

    if resposta.status_code == 200:
        dados = resposta.json()
        if 'erro' in dados:
            return JsonResponse({'erro': 'CEP não encontrado.'}, status=404)
        return JsonResponse(dados)
    else:
        return JsonResponse({'erro': 'Erro ao buscar o CEP.'}, status=500)

def calcular_rota(request):
    origem_cep = request.GET.get('origem', '').replace('-', '').strip()
    destino_cep = request.GET.get('destino', '').replace('-', '').strip()

    if not (origem_cep and destino_cep):
        return JsonResponse({'erro': 'Informe os CEPs de origem e destino.'}, status=400)

    #Função para buscar o endereço no ViaCEP
    def buscar_coordenadas(cep):
        resposta = requests.get(f'https://viacep.com.br/ws/{cep}/json/')
        if resposta.status_code != 200:
            return None
        dados = resposta.json()
        if 'erro' in dados:
            return None

        endereco = f"{dados['logradouro']}, {dados['localidade']}, {dados['uf']}, Brasil"
        
        # Usando OpenRouteService pra geocodificar o endereço
        ORS_API_KEY = settings.ORS_API_KEY
        geocode_url = 'https://api.openrouteservice.org/geocode/search'

        params = {
            'api_key': ORS_API_KEY,
            'text': endereco,
            'boundary.country': 'BR'
        }

        resposta_geo = requests.get(geocode_url, params=params)
        if resposta_geo.status_code != 200:
            return None

        geo_data = resposta_geo.json()
        try:
            coordinates = geo_data['features'][0]['geometry']['coordinates']  # [long, lat]
            return coordinates
        except (IndexError, KeyError):
            return None

    #Pegando as coordenadas
    origem_coord = buscar_coordenadas(origem_cep)
    destino_coord = buscar_coordenadas(destino_cep)

    if not origem_coord or not destino_coord:
        return JsonResponse({'erro': 'Não foi possível obter as coordenadas de um ou ambos os CEPs.'}, status=400)

    #Calculando rota
    rota_url = 'https://api.openrouteservice.org/v2/directions/motorcycle'
    headers = {'Authorization': settings.ORS_API_KEY}

    rota_body = {
        'coordinates': [origem_coord, destino_coord]
    }

    rota_resposta = requests.post(rota_url, json=rota_body, headers=headers)

    if rota_resposta.status_code != 200:
        return JsonResponse({'erro': 'Erro ao calcular a rota.'}, status=500)

    rota_dados = rota_resposta.json()
    try:
        distancia_metros = rota_dados['features'][0]['properties']['segments'][0]['distance']
        duracao_segundos = rota_dados['features'][0]['properties']['segments'][0]['duration']

        return JsonResponse({
            'distancia_km': round(distancia_metros / 1000, 2),
            'duracao_minutos': round(duracao_segundos / 60, 2),
            'origem': origem_cep,
            'destino': destino_cep
        })
    except (IndexError, KeyError):
        return JsonResponse({'erro': 'Erro ao processar dados da rota.'}, status=500)