import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from decimal import Decimal # Import Decimal
from .models import (
    Funcionario, Cliente, Motoboy, Pizza, Bebida, TaxaEntrega,
    Pedido, ItemPedido, Cupom # Adicionado Cupom
)

User = get_user_model()

def validar_email_formato(email):
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email))

def validar_telefone(telefone):
    return bool(re.match(r'^\d{10,11}$', telefone))

def validar_cpf_formato(cpf):
    return bool(re.match(r'^\d{11}$', cpf))

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
            raise serializers.ValidationError("Formato de email inválido.")
        if Cliente.objects.filter(email=value).exists() or User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value
    
    def validate_cpf(self, value):
        if not validar_cpf_formato(value):
            raise serializers.ValidationError("CPF deve conter 11 dígitos numéricos.")
        if Cliente.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value

    def validate_telefone(self, value):
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone deve conter 10 ou 11 dígitos.")
        return value

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=user_email)
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente

class ClienteSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Cliente
        fields = ['id', 'user', 'user_username', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']
        read_only_fields = ['user', 'data_nasc', 'cpf']

    def update(self, instance, validated_data):
        instance.nome = validated_data.get('nome', instance.nome)
        instance.endereco = validated_data.get('endereco', instance.endereco)
        instance.email = validated_data.get('email', instance.email)
        instance.telefone = validated_data.get('telefone', instance.telefone)
        
        if 'email' in validated_data and instance.user:
            if instance.user.email != validated_data['email']:
                if User.objects.filter(email=validated_data['email']).exclude(pk=instance.user.pk).exists():
                    raise serializers.ValidationError({'email': 'Este email já está em uso por outro usuário.'})
                instance.user.email = validated_data['email']
                instance.user.save()
        instance.save()
        return instance

class FuncionarioCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    class Meta:
        model = Funcionario
        fields = ['username', 'password', 'nome', 'cpf', 'telefone', 'email', 'cargo']
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=user_email)
        funcionario = Funcionario.objects.create(user=user, **validated_data)
        return funcionario

class FuncionarioSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Funcionario
        fields = '__all__'

class MotoboyCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    class Meta:
        model = Motoboy
        fields = ['username', 'password', 'nome', 'cpf', 'data_nasc', 'telefone', 'foto_cnh', 'email', 'doc_moto', 'placa_moto']
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        user = User.objects.create_user(username=username, password=password, email=user_email)
        motoboy = Motoboy.objects.create(user=user, **validated_data)
        return motoboy

class MotoboySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
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

class CupomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cupom
        fields = ['id', 'codigo', 'percentual_desconto', 'data_validade', 'ativo']

    def validate_codigo(self, value):
        query = Cupom.objects.filter(codigo__iexact=value) # Case-insensitive check
        if self.instance: # Se estiver atualizando, exclui a própria instância da verificação
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Este código de cupom já está em uso.")
        return value

    def validate_percentual_desconto(self, value):
        if not (Decimal('0.01') <= value <= Decimal('100.00')):
            raise serializers.ValidationError("Percentual de desconto deve estar entre 0.01 e 100.00.")
        return value

    def validate_data_validade(self, value): # value é um objeto date
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
        return value

class ItemPedidoSerializer(serializers.ModelSerializer):
    pizza_detalhes = PizzaSerializer(source='pizza', read_only=True)
    bebida_detalhes = BebidaSerializer(source='bebida', read_only=True)
    produto_nome = serializers.CharField(read_only=True) 

    pizza = serializers.PrimaryKeyRelatedField(queryset=Pizza.objects.all(), allow_null=True, required=False)
    bebida = serializers.PrimaryKeyRelatedField(queryset=Bebida.objects.all(), allow_null=True, required=False)

    class Meta:
        model = ItemPedido
        fields = [
            'id', 'pedido', 'pizza', 'bebida', 'quantidade', 
            'preco_unitario_momento', 'subtotal_item',
            'pizza_detalhes', 'bebida_detalhes', 'produto_nome'
        ]
        read_only_fields = ['pedido', 'subtotal_item', 'produto_nome', 'preco_unitario_momento']

    def validate(self, data):
        if data.get('pizza') and data.get('bebida'):
            raise serializers.ValidationError("Um item não pode ser uma pizza e uma bebida ao mesmo tempo.")
        if not data.get('pizza') and not data.get('bebida'):
            raise serializers.ValidationError("Um item deve ser uma pizza ou uma bebida.")
        if data.get('quantidade', 0) <= 0:
            raise serializers.ValidationError({"quantidade": "Quantidade deve ser maior que zero."})
        return data

class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True, read_only=True) 
    itens_data = ItemPedidoSerializer(many=True, write_only=True, required=True)
    
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True, allow_null=True)
    motoboy_nome = serializers.CharField(source='motoboy.nome', read_only=True, allow_null=True)
    funcionario_nome = serializers.CharField(source='funcionario_responsavel.nome', read_only=True, allow_null=True)
    cupom_aplicado_codigo = serializers.CharField(source='cupom_aplicado.codigo', read_only=True, allow_null=True)

    # Campo para receber o código do cupom na criação/atualização
    codigo_cupom = serializers.CharField(max_length=50, write_only=True, required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente', 'cliente_nome', 'motoboy', 'motoboy_nome', 
            'funcionario_responsavel', 'funcionario_nome',
            'data_pedido', 'status', 'tipo_entrega', 'endereco_entrega_formatado',
            'subtotal_itens', 'taxa_entrega_aplicada', 
            'cupom_aplicado', 'cupom_aplicado_codigo', 'valor_desconto_cupom', # Adicionado cupom_aplicado_codigo
            'total_pedido',
            'forma_pagamento', 'troco_para', 'observacoes',
            'data_pronto', 'data_saiu_para_entrega', 'data_entregue_ou_retirado',
            'itens_pedido', 
            'itens_data',
            'codigo_cupom' # Para escrita
        ]
        read_only_fields = [
            'data_pedido', 'subtotal_itens', 'total_pedido', 'valor_desconto_cupom',
            'cliente_nome', 'motoboy_nome', 'funcionario_nome', 'itens_pedido',
            'cupom_aplicado', 'cupom_aplicado_codigo'
        ]

    def _processar_itens_e_calcular_subtotal(self, pedido_instance, itens_data_list):
        current_subtotal_itens = Decimal('0.00')
        for item_data in itens_data_list:
            item_data.pop('pedido', None) 
            produto = item_data.get('pizza') or item_data.get('bebida')
            if not produto: continue 
            
            preco_unitario = produto.preco_promocional if hasattr(produto, 'preco_promocional') and produto.preco_promocional is not None else produto.preco
            
            item_obj = ItemPedido.objects.create(
                pedido=pedido_instance, 
                **item_data, 
                preco_unitario_momento=preco_unitario
            )
            current_subtotal_itens += item_obj.subtotal_item
        return current_subtotal_itens

    def _aplicar_cupom_e_taxas(self, pedido_instance, codigo_cupom_str):
        # Aplicar cupom
        cupom = None
        if codigo_cupom_str:
            try:
                cupom = Cupom.objects.get(codigo=codigo_cupom_str)
                if not cupom.is_valido():
                    # Não lançar erro aqui, apenas não aplicar o cupom se inválido
                    # Ou você pode optar por lançar um serializers.ValidationError
                    print(f"Cupom {codigo_cupom_str} inválido ou expirado.")
                    cupom = None 
            except Cupom.DoesNotExist:
                # Não lançar erro aqui, apenas não aplicar o cupom se não existir
                print(f"Cupom {codigo_cupom_str} não encontrado.")
                cupom = None
        
        pedido_instance.cupom_aplicado = cupom
        
        # Lógica para taxa de entrega (exemplo simplificado)
        if pedido_instance.tipo_entrega == 'Entrega':
            taxa_obj, _ = TaxaEntrega.objects.get_or_create(local="Padrao", defaults={'valor': Decimal('5.00')})
            pedido_instance.taxa_entrega_aplicada = taxa_obj.valor
        else:
            pedido_instance.taxa_entrega_aplicada = Decimal('0.00')
        
        pedido_instance.recalcular_totais() # Modelo recalcula com base no cupom e subtotal

    @transaction.atomic
    def create(self, validated_data):
        itens_data_list = validated_data.pop('itens_data')
        codigo_cupom_str = validated_data.pop('codigo_cupom', None)
        
        request = self.context.get('request')
        if not validated_data.get('cliente') and request and hasattr(request.user, 'cliente'):
            validated_data['cliente'] = request.user.cliente
        elif not validated_data.get('cliente'):
            raise serializers.ValidationError({"cliente": "Cliente é obrigatório para criar um pedido."})

        pedido = Pedido.objects.create(**validated_data)
        
        subtotal = self._processar_itens_e_calcular_subtotal(pedido, itens_data_list)
        pedido.subtotal_itens = subtotal # Define o subtotal antes de aplicar cupom e taxas

        self._aplicar_cupom_e_taxas(pedido, codigo_cupom_str)
        
        pedido.save() # Salva o pedido com os totais recalculados
        return pedido

    @transaction.atomic
    def update(self, instance, validated_data):
        itens_data_list = validated_data.pop('itens_data', None)
        codigo_cupom_str = validated_data.pop('codigo_cupom', None) # Permite mudar o cupom na atualização
        
        # Atualiza os campos simples do Pedido
        instance = super().update(instance, validated_data)

        if itens_data_list is not None: 
            instance.itens_pedido.all().delete() 
            subtotal = self._processar_itens_e_calcular_subtotal(instance, itens_data_list)
            instance.subtotal_itens = subtotal
        else:
            # Se itens_data não foi fornecido, o subtotal_itens permanece o mesmo
            # ou você pode optar por não permitir atualização sem reenviar os itens.
            pass

        # Se um código de cupom foi enviado (mesmo que vazio para remover), processa-o
        # Se não foi enviado, mantém o cupom existente (ou nenhum) e recalcula
        if codigo_cupom_str is not None or instance.cupom_aplicado:
             self._aplicar_cupom_e_taxas(instance, codigo_cupom_str if codigo_cupom_str is not None else instance.cupom_aplicado.codigo if instance.cupom_aplicado else None)
        else: # Apenas recalcula se não houver mudança de cupom
            instance.recalcular_totais()
            
        instance.save()
        return instance
