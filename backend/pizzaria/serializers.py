import re
from rest_framework import serializers
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

# Serializer para Funcionario
class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
        fields = '__all__'

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

# Serializer para Cliente
class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

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

# Serializer para Motoboy
class MotoboySerializer(serializers.ModelSerializer):
    class Meta:
        model = Motoboy
        fields = '__all__'

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

# Serializers para Pizza, Bebida e TaxaEntrega não precisam dessas validações,
# já que não têm e-mail, telefone, cpf ou cnpj.

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