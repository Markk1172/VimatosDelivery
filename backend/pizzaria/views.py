from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.http import JsonResponse

import requests

from .permissions import IsFuncionario
from .models import Funcionario, Motoboy, Pizza, Bebida, Cliente, TaxaEntrega
from .serializers import FuncionarioSerializer, MotoboySerializer, PizzaSerializer, BebidaSerializer, ClienteSerializer, TaxaEntregaSerializer

User = get_user_model()

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(username=User.objects.get(email=email).username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            'message': 'Login realizado com sucesso',
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh)
        }, status=200)
    else:
        return JsonResponse({'error': 'Credenciais inválidas'}, status=400)


@api_view(['POST'])
def register_view(request):
    try:
        username = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email já cadastrado'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return JsonResponse({'message': 'Usuário criado com sucesso'}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
