# pizzaria/serializers.py

import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.db import IntegrityError # Mantido para create_user se necessário
from decimal import Decimal, InvalidOperation # Importar InvalidOperation

from .models import (
    Funcionario, Cliente, Motoboy, Pizza, Bebida,
    Pedido, ItemPedido, Cupom
    # TaxaEntrega foi removida dos modelos
)

User = get_user_model()

# --- Funções de Validação de Formato (Reutilizadas) ---
def validar_email_formato(email):
    if not email: return False
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email))

def validar_telefone(telefone):
    if not telefone: return False
    return bool(re.match(r'^\d{10,11}$', telefone))

def validar_cpf_formato(cpf):
    if not cpf: return False
    return bool(re.match(r'^\d{11}$', cpf))

# --- Serializers de Criação (Cliente, Funcionario, Motoboy) ---
# (Seu ClienteCreateSerializer, FuncionarioCreateSerializer, MotoboyCreateSerializer permanecem como você os definiu,
# com suas validações de username, email, cpf, etc. Vou omiti-los aqui para focar no PedidoSerializer,
# mas eles devem estar presentes no seu arquivo)

class ClienteCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)
    telefone = serializers.CharField(max_length=11, required=True)
    nome = serializers.CharField(required=True)
    data_nasc = serializers.DateField(required=True)

    class Meta:
        model = Cliente
        fields = ['username', 'password', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Nome de usuário é obrigatório.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email é obrigatório.")
        if not validar_email_formato(value):
            raise serializers.ValidationError("Formato de email inválido.")
        if User.objects.filter(email__iexact=value).exists() or \
           Cliente.objects.filter(email__iexact=value).exists(): # Verifica em User e Cliente
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def validate_cpf(self, value):
        if not value:
            raise serializers.ValidationError("CPF é obrigatório.")
        if not validar_cpf_formato(value):
            raise serializers.ValidationError("CPF deve conter 11 dígitos numéricos.")
        if Cliente.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value

    def validate_telefone(self, value):
        if not value:
            raise serializers.ValidationError("Telefone é obrigatório.")
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone deve conter 10 ou 11 dígitos.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        try:
            user = User.objects.create_user(username=username, password=password, email=user_email)
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário. Verifique os dados."})
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente

class FuncionarioCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)
    # Adicione outros campos e validações conforme necessário
    class Meta:
        model = Funcionario
        fields = ['username', 'password', 'nome', 'cpf', 'telefone', 'email', 'cargo']

    def validate_username(self, value): # Exemplo
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value
    
    def validate_email(self, value): # Exemplo
        if User.objects.filter(email__iexact=value).exists() or Funcionario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def validate_cpf(self, value): # Exemplo
        if Funcionario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        try:
            user = User.objects.create_user(username=username, password=password, email=user_email)
            user.is_staff = True 
            user.save()
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário para o funcionário."})
        funcionario = Funcionario.objects.create(user=user, **validated_data)
        return funcionario

class MotoboyCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)
    # Adicione outros campos e validações
    class Meta:
        model = Motoboy
        fields = ['username', 'password', 'nome', 'cpf', 'data_nasc', 'telefone', 'email', 'placa_moto', 'foto_cnh', 'doc_moto']

    # Adicione validate_username, validate_email, validate_cpf aqui, similar aos outros CreateSerializers

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        try:
            user = User.objects.create_user(username=username, password=password, email=user_email)
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário para o motoboy."})
        motoboy = Motoboy.objects.create(user=user, **validated_data)
        return motoboy

# --- Serializers de Leitura/Update (Cliente, Funcionario, Motoboy) ---
class ClienteSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(required=False) 
    class Meta:
        model = Cliente
        fields = ['id', 'user', 'user_username', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']
        read_only_fields = ['user', 'user_username', 'cpf', 'data_nasc'] 
    
    # Adicione validações para update se necessário (ex: validate_email para update)

class FuncionarioSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Funcionario
        fields = ['id', 'user', 'user_username', 'nome', 'cpf', 'telefone', 'email', 'cargo']
        read_only_fields = ['user', 'user_username', 'cpf']

class MotoboySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Motoboy
        fields = ['id', 'user', 'user_username', 'nome', 'cpf', 'data_nasc', 'telefone', 'email', 'placa_moto', 'foto_cnh', 'doc_moto']
        read_only_fields = ['user', 'user_username', 'cpf']

# --- Serializers de Produtos e Cupom ---
class PizzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pizza
        fields = '__all__'

class BebidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bebida
        fields = '__all__'

class CupomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cupom
        fields = ['id', 'codigo', 'percentual_desconto', 'data_validade', 'ativo']

    def validate_codigo(self, value):
        if not value:
            raise serializers.ValidationError("Código do cupom é obrigatório.")
        query = Cupom.objects.filter(codigo__iexact=value)
        if self.instance: # Se estiver atualizando
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Este código de cupom já está em uso.")
        return value

    def validate_percentual_desconto(self, value):
        if value is None:
            raise serializers.ValidationError("Percentual de desconto é obrigatório.")
        if not (Decimal('0.01') <= value <= Decimal('100.00')):
            raise serializers.ValidationError("Percentual de desconto deve estar entre 0.01 e 100.00.")
        return value

    def validate_data_validade(self, value):
        if value is None:
            raise serializers.ValidationError("Data de validade é obrigatória.")
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
        return value

# --- Serializers de Pedido ---
class ItemPedidoSerializer(serializers.ModelSerializer):
    pizza_detalhes = PizzaSerializer(source='pizza', read_only=True, required=False)
    bebida_detalhes = BebidaSerializer(source='bebida', read_only=True, required=False)
    produto_nome = serializers.CharField(read_only=True) # Removido source='produto_nome' que era redundante

    pizza = serializers.PrimaryKeyRelatedField(queryset=Pizza.objects.all(), allow_null=True, required=False)
    bebida = serializers.PrimaryKeyRelatedField(queryset=Bebida.objects.all(), allow_null=True, required=False)
    quantidade = serializers.IntegerField(min_value=1)

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
        return data

class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True, read_only=True)
    itens_data = ItemPedidoSerializer(many=True, write_only=True, required=True)
    
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True, allow_null=True)
    motoboy_nome = serializers.CharField(source='motoboy.nome', read_only=True, allow_null=True)
    funcionario_nome = serializers.CharField(source='funcionario_responsavel.nome', read_only=True, allow_null=True)
    cupom_aplicado_codigo = serializers.CharField(source='cupom_aplicado.codigo', read_only=True, allow_null=True)

    codigo_cupom = serializers.CharField(max_length=50, write_only=True, required=False, allow_blank=True, allow_null=True)
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), required=False, allow_null=True)
    taxa_entrega_aplicada = serializers.DecimalField(max_digits=6, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente', 'cliente_nome', 'motoboy', 'motoboy_nome', 
            'funcionario_responsavel', 'funcionario_nome',
            'data_pedido', 'status', 'tipo_entrega', 'endereco_entrega_formatado',
            'subtotal_itens', 'taxa_entrega_aplicada', 
            'cupom_aplicado', 'cupom_aplicado_codigo', 'valor_desconto_cupom',
            'total_pedido', 'forma_pagamento', 'troco_para', 'observacoes',
            'data_pronto', 'data_saiu_para_entrega', 'data_entregue_ou_retirado',
            'itens_pedido', 'itens_data', 'codigo_cupom'
        ]
        read_only_fields = [
            'data_pedido', 'subtotal_itens', 'total_pedido', 'valor_desconto_cupom',
            'cliente_nome', 'motoboy_nome', 'funcionario_nome', 'itens_pedido',
            'cupom_aplicado', 'cupom_aplicado_codigo'
        ]

    def validate_itens_data(self, value):
        if not value:
            raise serializers.ValidationError("Pelo menos um item é necessário para criar o pedido.")
        return value

    def validate(self, data):
        tipo_entrega = data.get('tipo_entrega', self.instance.tipo_entrega if self.instance else None)
        taxa_enviada = data.get('taxa_entrega_aplicada')

        if tipo_entrega == 'Entrega':
            if taxa_enviada is None:
                raise serializers.ValidationError({"taxa_entrega_aplicada": "A taxa de entrega deve ser fornecida para pedidos do tipo 'Entrega'."})
            try:
                taxa_decimal = Decimal(str(taxa_enviada)) # Tenta converter para Decimal
                if taxa_decimal < Decimal('0.00'):
                    raise serializers.ValidationError({"taxa_entrega_aplicada": "Taxa de entrega não pode ser negativa."})
                data['taxa_entrega_aplicada'] = taxa_decimal # Garante que está como Decimal
            except (InvalidOperation, TypeError):
                raise serializers.ValidationError({"taxa_entrega_aplicada": "Valor inválido para taxa de entrega."})
        elif tipo_entrega == 'Retirada':
            data['taxa_entrega_aplicada'] = Decimal('0.00')
        
        codigo_cupom_str = data.get('codigo_cupom')
        data['cupom_a_aplicar'] = None # Inicializa para garantir que existe
        if codigo_cupom_str:
            try:
                cupom = Cupom.objects.get(codigo__iexact=codigo_cupom_str)
                if not cupom.is_valido():
                    raise serializers.ValidationError({"codigo_cupom": "Cupom inválido ou expirado."})
                data['cupom_a_aplicar'] = cupom
            except Cupom.DoesNotExist:
                raise serializers.ValidationError({"codigo_cupom": "Cupom não encontrado."})
        return data

    def _processar_itens_e_salvar(self, pedido_instance, itens_data_list):
        if itens_data_list is not None: # Adicionado para segurança, embora itens_data seja required
            if pedido_instance.pk: # Se for update e novos itens forem fornecidos
                pedido_instance.itens_pedido.all().delete()

            current_subtotal_itens = Decimal('0.00')
            for item_data_dict in itens_data_list:
                item_data_dict.pop('pedido', None) 
                
                is_pizza = 'pizza' in item_data_dict and item_data_dict.get('pizza') is not None
                is_bebida = 'bebida' in item_data_dict and item_data_dict.get('bebida') is not None
                
                produto = None
                if is_pizza:
                    produto = item_data_dict.get('pizza')
                elif is_bebida:
                    produto = item_data_dict.get('bebida')

                if not produto: 
                    # Isso não deveria acontecer se a validação do ItemPedidoSerializer estiver correta
                    print(f"ALERTA: Produto não encontrado em item_data_dict: {item_data_dict}")
                    continue 
                
                # --- LÓGICA DE PREÇO CORRIGIDA ---
                preco_unitario_atual = None
                if isinstance(produto, Pizza): # Verifica se o objeto 'produto' é uma Pizza
                    preco_unitario_atual = produto.preco_promocional if produto.preco_promocional is not None else produto.preco_original
                elif isinstance(produto, Bebida): # Verifica se o objeto 'produto' é uma Bebida
                    preco_unitario_atual = produto.preco
                else:
                    # Fallback ou erro se o tipo de produto não for reconhecido
                    # Isso não deveria acontecer se os dados estiverem corretos
                    print(f"ALERTA: Tipo de produto desconhecido para obter preço: {produto}")
                    # Você pode querer levantar um serializers.ValidationError aqui ou usar um preço padrão
                    raise serializers.ValidationError(f"Tipo de produto desconhecido no item do pedido: {type(produto)}")

                if preco_unitario_atual is None: # Segurança extra
                     raise serializers.ValidationError(f"Não foi possível determinar o preço para o produto: {produto.id if hasattr(produto, 'id') else 'ID desconhecido'}")

                # --- FIM DA CORREÇÃO ---
                
                # Remove os campos que não são do ItemPedido antes de criar
                # (pizza e bebida são ForeignKeys, já estão como objetos 'produto')
                dados_item_para_criar = item_data_dict.copy()
                if 'pizza' in dados_item_para_criar: dados_item_para_criar['pizza'] = produto if is_pizza else None
                if 'bebida' in dados_item_para_criar: dados_item_para_criar['bebida'] = produto if is_bebida else None
                
                # Garantir que apenas um dos dois (pizza ou bebida) seja passado para o create
                if is_pizza:
                    dados_item_para_criar.pop('bebida', None)
                elif is_bebida:
                    dados_item_para_criar.pop('pizza', None)


                item_obj = ItemPedido.objects.create(
                    pedido=pedido_instance, 
                    # **item_data_dict, # << Cuidado aqui, item_data_dict ainda tem os PKs
                    pizza=dados_item_para_criar.get('pizza'),
                    bebida=dados_item_para_criar.get('bebida'),
                    quantidade=dados_item_para_criar.get('quantidade'),
                    preco_unitario_momento=preco_unitario_atual
                )
                current_subtotal_itens += item_obj.subtotal_item # subtotal_item é calculado no save do ItemPedido
            pedido_instance.subtotal_itens = current_subtotal_itens

    @transaction.atomic
    def create(self, validated_data):
        itens_data_list = validated_data.pop('itens_data')
        cupom_obj_para_aplicar = validated_data.pop('cupom_a_aplicar', None)
        
        # Remove campos que não são do modelo Pedido ou que são kwargs do save() do serializer
        # O 'context' é passado para serializer.save(), mas não deve ir para Pedido.objects.create()
        # 'codigo_cupom' é write_only e já foi usado para obter cupom_obj_para_aplicar
        # Os kwargs 'cliente' e 'funcionario_responsavel' passados para serializer.save()
        # já estão em validated_data aqui, mas devem ser objetos Cliente e Funcionario.
        
        dados_para_modelo = {}
        campos_permitidos_modelo_pedido = [
            'cliente', 'motoboy', 'funcionario_responsavel', 'status', 
            'tipo_entrega', 'endereco_entrega_formatado', 'taxa_entrega_aplicada',
            'forma_pagamento', 'troco_para', 'observacoes',
            # Não inclua campos calculados como subtotal_itens, valor_desconto_cupom, total_pedido
            # Não inclua cupom_aplicado (ForeignKey), será definido depois
        ]
        
        for campo in campos_permitidos_modelo_pedido:
            if campo in validated_data:
                dados_para_modelo[campo] = validated_data[campo]
        
        # Garante que cliente e funcionario_responsavel são objetos ou None
        request = self.context.get('request')
        if 'cliente' not in dados_para_modelo and request and hasattr(request.user, 'cliente'):
            dados_para_modelo['cliente'] = request.user.cliente
        elif 'cliente' not in dados_para_modelo and not (request and hasattr(request.user, 'funcionario')):
             raise serializers.ValidationError({"cliente": "Cliente é obrigatório para criar um pedido."})

        if 'funcionario_responsavel' not in dados_para_modelo and request and hasattr(request.user, 'funcionario'):
            dados_para_modelo['funcionario_responsavel'] = request.user.funcionario

        # Cria o pedido base
        pedido = Pedido.objects.create(**dados_para_modelo)
        
        # Atribui o cupom ANTES de processar itens e recalcular totais
        if cupom_obj_para_aplicar:
            pedido.cupom_aplicado = cupom_obj_para_aplicar
            # Não precisa de save() aqui ainda

        # Processa itens e define o subtotal_itens no pedido
        self._processar_itens_e_salvar(pedido, itens_data_list)
        
        # Recalcula todos os totais (usará subtotal_itens, taxa_entrega_aplicada e cupom_aplicado da instância)
        pedido.recalcular_totais() 
        pedido.save() # Salva o pedido final com totais e itens
        
        return pedido

    @transaction.atomic
    def update(self, instance, validated_data):
        itens_data_list = validated_data.pop('itens_data', None)
        cupom_obj_para_aplicar = validated_data.pop('cupom_a_aplicar', None)
        validated_data.pop('codigo_cupom', None) # Remove se ainda estiver presente
        validated_data.pop('context', None)      # Remove se ainda estiver presente

        # Atualiza campos diretos do Pedido
        for attr, value in validated_data.items():
            # Apenas atualiza campos que são do modelo e não são os que gerenciamos separadamente
            if hasattr(instance, attr) and attr not in ['cupom_aplicado', 'subtotal_itens', 'valor_desconto_cupom', 'total_pedido']:
                setattr(instance, attr, value)
        
        # Lógica para atualizar cupom_aplicado (se um novo foi validado ou se foi pedido para remover)
        if 'cupom_a_aplicar' in validated_data or (self.fields['codigo_cupom'].write_only and validated_data.get(self.fields['codigo_cupom'].source) is None and self.fields['codigo_cupom'].allow_null):
             instance.cupom_aplicado = cupom_obj_para_aplicar

        if itens_data_list is not None: 
            self._processar_itens_e_salvar(instance, itens_data_list)
        
        instance.recalcular_totais()
        instance.save()
        return instance