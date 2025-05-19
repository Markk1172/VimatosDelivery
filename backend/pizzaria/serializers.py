import re
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Funcionario, Cliente, Motoboy, Pizza, Bebida, TaxaEntrega

# Funções de validação reutilizáveis
def validar_email(email):
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email))

def validar_telefone(telefone):
    return bool(re.match(r'^\d{10,11}$', telefone))

def validar_cpf(cpf):
    return bool(re.match(r'^\d{11}$', cpf))

def validar_cnpj(cnpj):
    return bool(re.match(r'^\d{14}$', cnpj))

# Serializer para Cliente com criação de User
class ClienteCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Cliente
        fields = ['username', 'password', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']

    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("E-mail inválido.")
        return value

    def validate_telefone(self, value):
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone inválido. Use apenas números com DDD (10 ou 11 dígitos).")
        return value

    def validate_cpf(self, value):
        if not validar_cpf(value):
            raise serializers.ValidationError("CPF inválido. Use apenas números (11 dígitos).")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value
    
    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("E-mail inválido.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=email)
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente

# Serializer para Funcionario com criação de User
class FuncionarioCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Funcionario
        fields = ['username', 'password', 'nome', 'cpf', 'telefone', 'email', 'cargo']

    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("E-mail inválido.")
        return value

    def validate_telefone(self, value):
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone inválido. Use apenas números com DDD (10 ou 11 dígitos).")
        return value

    def validate_cpf(self, value):
        if not validar_cpf(value):
            raise serializers.ValidationError("CPF inválido. Use apenas números (11 dígitos).")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=email)
        funcionario = Funcionario.objects.create(user=user, **validated_data)
        return funcionario

# Serializer para Motoboy com criação de User
class MotoboyCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Motoboy
        fields = ['username', 'password', 'nome', 'cpf', 'data_nasc', 'telefone', 'endereco', 'foto_cnh', 'email', 'doc_moto']

    def validate_email(self, value):
        if not validar_email(value):
            raise serializers.ValidationError("E-mail inválido.")
        return value

    def validate_telefone(self, value):
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone inválido. Use apenas números com DDD (10 ou 11 dígitos).")
        return value

    def validate_cpf(self, value):
        if not validar_cpf(value):
            raise serializers.ValidationError("CPF inválido. Use apenas números (11 dígitos).")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=email)
        motoboy = Motoboy.objects.create(user=user, **validated_data)
        return motoboy

# Serializers para leitura/listagem (sem criação de User)
class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class MotoboySerializer(serializers.ModelSerializer):
    class Meta:
        model = Motoboy
        fields = '__all__'

class PizzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pizza
        fields = '__all__'

class BebidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bebida
        fields = '__all__'

class TaxaEntregaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxaEntrega
        fields = '__all__'