from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .permissions import IsFuncionario
from .models import Funcionario, Motoboy, Pizza, Bebida, Cliente, TaxaEntrega
from .serializers import FuncionarioSerializer, MotoboySerializer, PizzaSerializer, BebidaSerializer, ClienteSerializer, TaxaEntregaSerializer
import requests
from django.http import JsonResponse

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
        pizza.aplicar_desconto(percentual)
        return Response({'mensagem': 'Desconto aplicado com sucesso!'}, status=status.HTTP_200_OK)

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