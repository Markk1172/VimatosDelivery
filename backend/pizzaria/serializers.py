import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Funcionario, Cliente, Motoboy, Pizza, Bebida, TaxaEntrega

User = get_user_model()

# Funções de validação reutilizáveis (mantidas como você as tinha)
def validar_email_formato(email):
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email))

def validar_telefone(telefone):
    return bool(re.match(r'^\d{10,11}$', telefone))

def validar_cpf_formato(cpf):
    return bool(re.match(r'^\d{11}$', cpf))

# (Removida validar_cnpj se não estiver sendo usada ou movida para onde for relevante)

class ClienteCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Cliente
        fields = ['username', 'password', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def validate_email(self, value):
        if not validar_email_formato(value):
            raise serializers.ValidationError("Formato de e-mail inválido.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail de usuário já está em uso.")
        # Como Cliente.email também é unique e será o mesmo do User na criação,
        # a verificação acima para User.email é suficiente para a criação.
        return value

    def validate_telefone(self, value):
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone inválido. Use apenas números com DDD (10 ou 11 dígitos).")
        return value

    def validate_cpf(self, value):
        if not validar_cpf_formato(value):
            raise serializers.ValidationError("CPF inválido. Use apenas números (11 dígitos).")
        if Cliente.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está em uso.")
        return value
    
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        
        # O email para o User será o mesmo email fornecido para o Cliente
        user_email = validated_data.get('email') 
        
        # Garante que o username do User seja único; se o email for usado como username, 
        # a validação de email já cuidou da unicidade.
        # Se username for diferente do email, validate_username já fez a checagem.
        user = User.objects.create_user(username=username, password=password, email=user_email)
        
        # validated_data agora contém os campos restantes para o Cliente
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente

class ClienteSerializer(serializers.ModelSerializer):
    # Para exibir informações do usuário relacionado, se desejado (opcional)
    # user_username = serializers.CharField(source='user.username', read_only=True)
    # user_email = serializers.CharField(source='user.email', read_only=True) # Cuidado se for editar email

    class Meta:
        model = Cliente
        fields = ['id', 'user', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']
        read_only_fields = ('user', 'cpf', 'data_nasc') # Não permitir alteração de 'user' ou 'cpf' via este serializer

    def validate_email(self, value):
        if not validar_email_formato(value):
            raise serializers.ValidationError("Formato de e-mail inválido.")
        
        instance = self.instance # Cliente sendo atualizado
        if instance:
            # Se o email não mudou, é válido.
            if instance.email == value:
                return value
            
            # Se o email mudou, verificar se o novo email já existe em outro Cliente
            if Cliente.objects.filter(email=value).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError("Este e-mail já está em uso por outro cliente.")
            
            # Para o User associado, a lógica de atualização do email do User está no método update()
        else: # Caso de criação (este serializer não é ideal para criação direta sem User)
            if Cliente.objects.filter(email=value).exists():
                raise serializers.ValidationError("Este e-mail de cliente já está em uso.")
            if User.objects.filter(email=value).exists(): # Também checa User para consistência
                raise serializers.ValidationError("Este e-mail de usuário já está em uso.")
        return value

    def validate_telefone(self, value):
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone inválido. Use apenas números com DDD (10 ou 11 dígitos).")
        return value

    def update(self, instance, validated_data):
        # instance é o objeto Cliente existente
        user = instance.user

        # Se o email do Cliente está sendo atualizado
        new_email = validated_data.get('email', instance.email)
        if instance.email != new_email:
            # Verificar se o novo email já está em uso por OUTRO User
            if User.objects.filter(email=new_email).exclude(pk=user.pk).exists():
                raise serializers.ValidationError({'email': "Este e-mail já está em uso por outro usuário."})
            
            user.email = new_email
            # Se o username do User é baseado no email, atualize-o também.
            # Se o seu sistema permite que User.username seja diferente do email,
            # você pode precisar de uma lógica diferente ou de um campo 'username' no payload.
            # Por segurança e consistência, se o email muda, o username (se for o email) também muda.
            if user.username == instance.email: # Se o username antigo era o email antigo
                 user.username = new_email 
            user.save()

        # Atualizar os campos do Cliente
        instance.nome = validated_data.get('nome', instance.nome)
        instance.data_nasc = validated_data.get('data_nasc', instance.data_nasc)
        instance.endereco = validated_data.get('endereco', instance.endereco)
        instance.email = new_email # Atualiza o email do cliente
        instance.telefone = validated_data.get('telefone', instance.telefone)
        instance.save()

        return instance

# --- Outros Serializers (mantidos como você os tinha, mas adicione validações se necessário) ---

class FuncionarioCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Funcionario
        fields = ['username', 'password', 'nome', 'cpf', 'telefone', 'email', 'cargo']

    # Adicione validações semelhantes ao ClienteCreateSerializer se necessário
    # (username, email, cpf unique, formato de telefone, etc.)

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=user_email)
        funcionario = Funcionario.objects.create(user=user, **validated_data)
        return funcionario

class MotoboyCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = Motoboy
        # Adicione 'endereco' se ele for um campo do Motoboy e deve ser criado aqui
        fields = ['username', 'password', 'nome', 'cpf', 'data_nasc', 'telefone', 'foto_cnh', 'email', 'doc_moto', 'endereco'] 

    # Adicione validações semelhantes

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=user_email)
        motoboy = Motoboy.objects.create(user=user, **validated_data)
        return motoboy

class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
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
