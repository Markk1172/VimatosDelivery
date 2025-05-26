# pizzaria/serializers.py

import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from django.db import IntegrityError
from decimal import Decimal, InvalidOperation

# Importa os modelos definidos no aplicativo local.
from .models import (
    Funcionario, Cliente, Motoboy, Pizza, Bebida,
    Pedido, ItemPedido, Cupom
)

# Obtém o modelo de usuário ativo do Django.
User = get_user_model()

# --- Funções de Validação de Formato (Reutilizadas) ---

# Valida se uma string possui o formato básico de um endereço de e-mail.
def validar_email_formato(email):
    if not email: return False
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email))

# Valida se uma string contém 10 ou 11 dígitos, como um número de telefone brasileiro.
def validar_telefone(telefone):
    if not telefone: return False
    return bool(re.match(r'^\d{10,11}$', telefone))

# Valida se uma string contém exatamente 11 dígitos, como um CPF brasileiro.
def validar_cpf_formato(cpf):
    if not cpf: return False
    return bool(re.match(r'^\d{11}$', cpf))

# --- Serializers de Criação (Cliente, Funcionario, Motoboy) ---

# Serializer para criar um novo Cliente juntamente com seu User.
# Lida com a entrada de dados para um novo cliente, incluindo credenciais de login
# e informações pessoais. Inclui validações robustas para garantir a
# integridade e unicidade dos dados.
class ClienteCreateSerializer(serializers.ModelSerializer):
    # Campos 'write_only' são usados para entrada, mas não são incluídos na saída.
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)
    telefone = serializers.CharField(max_length=11, required=True)
    nome = serializers.CharField(required=True)
    data_nasc = serializers.DateField(required=True)

    class Meta:
        model = Cliente
        # Define os campos que serão utilizados pelo serializer.
        fields = ['username', 'password', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']

    # Valida se o nome de usuário fornecido já existe no sistema.
    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Nome de usuário é obrigatório.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    # Valida o formato do e-mail e verifica sua unicidade nos modelos User e Cliente.
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email é obrigatório.")
        if not validar_email_formato(value):
            raise serializers.ValidationError("Formato de email inválido.")
        if User.objects.filter(email__iexact=value).exists() or \
           Cliente.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    # Valida o formato do CPF e verifica sua unicidade no modelo Cliente.
    def validate_cpf(self, value):
        if not value:
            raise serializers.ValidationError("CPF é obrigatório.")
        if not validar_cpf_formato(value):
            raise serializers.ValidationError("CPF deve conter 11 dígitos numéricos.")
        if Cliente.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value

    # Valida o formato do telefone.
    def validate_telefone(self, value):
        if not value:
            raise serializers.ValidationError("Telefone é obrigatório.")
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone deve conter 10 ou 11 dígitos.")
        return value

    # Cria o User e o Cliente dentro de uma transação atômica.
    # Garante que ou ambos são criados com sucesso, ou nenhum é criado.
    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        try:
            # Cria o objeto User usando o manager `create_user` para lidar com a senha.
            user = User.objects.create_user(username=username, password=password, email=user_email)
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário. Verifique os dados."})
        # Cria o objeto Cliente, associando-o ao User recém-criado.
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente

# Serializer para criar um novo Funcionario juntamente com seu User.
# Similar ao ClienteCreateSerializer, mas para funcionários.
# Adicionalmente, marca o User como 'is_staff' para acesso ao admin (opcional).
class FuncionarioCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)

    class Meta:
        model = Funcionario
        fields = ['username', 'password', 'nome', 'cpf', 'telefone', 'email', 'cargo']

    # Valida a unicidade do nome de usuário.
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    # Valida a unicidade do e-mail para Funcionários e Users.
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists() or Funcionario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    # Valida a unicidade do CPF para Funcionários.
    def validate_cpf(self, value):
        if Funcionario.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value

    # Cria o User e o Funcionario atomicamente.
    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user_email = validated_data.get('email')
        try:
            user = User.objects.create_user(username=username, password=password, email=user_email)
            # Define o usuário como staff para permitir acesso a certas áreas (ex: admin).
            user.is_staff = True
            user.save()
        except IntegrityError:
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário para o funcionário."})
        funcionario = Funcionario.objects.create(user=user, **validated_data)
        return funcionario

# Serializer para criar um novo Motoboy juntamente com seu User.
# Segue o mesmo padrão dos outros 'CreateSerializers'.
class MotoboyCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)

    class Meta:
        model = Motoboy
        fields = ['username', 'password', 'nome', 'cpf', 'data_nasc', 'telefone', 'email', 'placa_moto', 'foto_cnh', 'doc_moto']

    # NOTA: Adicione validações de username, email e cpf aqui, similares às anteriores.

    # Cria o User e o Motoboy atomicamente.
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

# Serializer para visualizar e atualizar dados de Clientes existentes.
# Inclui o nome de usuário (apenas leitura) e define campos sensíveis como
# apenas leitura para evitar alterações indesejadas via API.
class ClienteSerializer(serializers.ModelSerializer):
    # Exibe o username do User associado (apenas leitura).
    user_username = serializers.CharField(source='user.username', read_only=True)
    # Permite que o email seja opcional na atualização.
    email = serializers.EmailField(required=False)

    class Meta:
        model = Cliente
        fields = ['id', 'user', 'user_username', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']
        # Protege campos que não devem ser alterados via este serializer.
        read_only_fields = ['user', 'user_username', 'cpf', 'data_nasc']

# Serializer para visualizar e atualizar dados de Funcionários existentes.
class FuncionarioSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Funcionario
        fields = ['id', 'user', 'user_username', 'nome', 'cpf', 'telefone', 'email', 'cargo']
        read_only_fields = ['user', 'user_username', 'cpf']

# Serializer para visualizar e atualizar dados de Motoboys existentes.
class MotoboySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Motoboy
        fields = ['id', 'user', 'user_username', 'nome', 'cpf', 'data_nasc', 'telefone', 'email', 'placa_moto', 'foto_cnh', 'doc_moto']
        read_only_fields = ['user', 'user_username', 'cpf']

# --- Serializers de Produtos e Cupom ---

# Serializer básico para o modelo Pizza. Lista todos os campos.
class PizzaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pizza
        fields = '__all__'

# Serializer básico para o modelo Bebida. Lista todos os campos.
class BebidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bebida
        fields = '__all__'

# Serializer para o modelo Cupom, com validações para criação e atualização.
class CupomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cupom
        fields = ['id', 'codigo', 'percentual_desconto', 'data_validade', 'ativo']

    # Valida a unicidade do código do cupom, ignorando a própria instância ao atualizar.
    def validate_codigo(self, value):
        if not value:
            raise serializers.ValidationError("Código do cupom é obrigatório.")
        query = Cupom.objects.filter(codigo__iexact=value)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Este código de cupom já está em uso.")
        return value

    # Valida que o percentual de desconto está dentro de um intervalo razoável (0.01 a 100).
    def validate_percentual_desconto(self, value):
        if value is None:
            raise serializers.ValidationError("Percentual de desconto é obrigatório.")
        if not (Decimal('0.01') <= value <= Decimal('100.00')):
            raise serializers.ValidationError("Percentual de desconto deve estar entre 0.01 e 100.00.")
        return value

    # Valida que a data de validade não seja uma data no passado.
    def validate_data_validade(self, value):
        if value is None:
            raise serializers.ValidationError("Data de validade é obrigatória.")
        if value < timezone.now().date():
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
        return value

# --- Serializers de Pedido ---

# Serializer para Itens de Pedido (Pizzas e Bebidas dentro de um Pedido).
# Usado tanto para exibir detalhes dos itens (com `read_only=True`) quanto para
# receber dados na criação/atualização de pedidos (com `write_only=True` no PedidoSerializer).
class ItemPedidoSerializer(serializers.ModelSerializer):
    # Serializers aninhados para exibir detalhes completos dos produtos (apenas leitura).
    pizza_detalhes = PizzaSerializer(source='pizza', read_only=True, required=False)
    bebida_detalhes = BebidaSerializer(source='bebida', read_only=True, required=False)
    # Campo para exibir o nome do produto (gerado pela propriedade no modelo).
    produto_nome = serializers.CharField(read_only=True)

    # Campos para receber os IDs dos produtos ao criar/atualizar um pedido.
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
        # Campos calculados ou definidos internamente são apenas para leitura.
        read_only_fields = ['pedido', 'subtotal_item', 'produto_nome', 'preco_unitario_momento']

    # Validação a nível de objeto: Garante que um item seja ou pizza ou bebida.
    def validate(self, data):
        if data.get('pizza') and data.get('bebida'):
            raise serializers.ValidationError("Um item não pode ser uma pizza e uma bebida ao mesmo tempo.")
        if not data.get('pizza') and not data.get('bebida'):
            raise serializers.ValidationError("Um item deve ser uma pizza ou uma bebida.")
        return data

# Serializer principal para Pedidos.
# Lida com a criação e atualização de pedidos, incluindo seus itens,
# aplicação de cupons e cálculo de totais.
class PedidoSerializer(serializers.ModelSerializer):
    # Exibe os itens do pedido com detalhes (apenas leitura).
    itens_pedido = ItemPedidoSerializer(many=True, read_only=True)
    # Recebe os dados dos itens ao criar/atualizar (apenas escrita).
    itens_data = ItemPedidoSerializer(many=True, write_only=True, required=True)

    # Campos de apenas leitura para exibir nomes de entidades relacionadas.
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True, allow_null=True)
    motoboy_nome = serializers.CharField(source='motoboy.nome', read_only=True, allow_null=True)
    funcionario_nome = serializers.CharField(source='funcionario_responsavel.nome', read_only=True, allow_null=True)
    cupom_aplicado_codigo = serializers.CharField(source='cupom_aplicado.codigo', read_only=True, allow_null=True)

    # Campo para receber o código do cupom (apenas escrita).
    codigo_cupom = serializers.CharField(max_length=50, write_only=True, required=False, allow_blank=True, allow_null=True)
    # Permite especificar o cliente (opcional, pode ser inferido do usuário).
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), required=False, allow_null=True)
    # Permite especificar a taxa de entrega (obrigatório se for 'Entrega').
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
        # Campos calculados, inferidos ou protegidos são apenas leitura.
        read_only_fields = [
            'data_pedido', 'subtotal_itens', 'total_pedido', 'valor_desconto_cupom',
            'cliente_nome', 'motoboy_nome', 'funcionario_nome', 'itens_pedido',
            'cupom_aplicado', 'cupom_aplicado_codigo'
        ]

    # Valida se a lista de itens não está vazia.
    def validate_itens_data(self, value):
        if not value:
            raise serializers.ValidationError("Pelo menos um item é necessário para criar o pedido.")
        return value

    # Validações a nível de objeto Pedido.
    # Verifica a lógica da taxa de entrega e valida/busca o cupom.
    def validate(self, data):
        tipo_entrega = data.get('tipo_entrega', self.instance.tipo_entrega if self.instance else None)
        taxa_enviada = data.get('taxa_entrega_aplicada')

        # Se for entrega, a taxa é obrigatória e não pode ser negativa.
        if tipo_entrega == 'Entrega':
            if taxa_enviada is None:
                raise serializers.ValidationError({"taxa_entrega_aplicada": "A taxa de entrega deve ser fornecida para pedidos do tipo 'Entrega'."})
            try:
                taxa_decimal = Decimal(str(taxa_enviada))
                if taxa_decimal < Decimal('0.00'):
                    raise serializers.ValidationError({"taxa_entrega_aplicada": "Taxa de entrega não pode ser negativa."})
                data['taxa_entrega_aplicada'] = taxa_decimal
            except (InvalidOperation, TypeError):
                raise serializers.ValidationError({"taxa_entrega_aplicada": "Valor inválido para taxa de entrega."})
        # Se for retirada, a taxa é zerada.
        elif tipo_entrega == 'Retirada':
            data['taxa_entrega_aplicada'] = Decimal('0.00')

        # Processa o código do cupom, se fornecido.
        codigo_cupom_str = data.get('codigo_cupom')
        data['cupom_a_aplicar'] = None # Garante que a chave existe.
        if codigo_cupom_str:
            try:
                cupom = Cupom.objects.get(codigo__iexact=codigo_cupom_str)
                if not cupom.is_valido():
                    raise serializers.ValidationError({"codigo_cupom": "Cupom inválido ou expirado."})
                data['cupom_a_aplicar'] = cupom # Armazena o objeto cupom para uso no create/update.
            except Cupom.DoesNotExist:
                raise serializers.ValidationError({"codigo_cupom": "Cupom não encontrado."})
        return data

    # Método auxiliar para processar e salvar/atualizar os itens do pedido.
    # Garante que os itens sejam criados com o preço correto e calcula o subtotal.
    def _processar_itens_e_salvar(self, pedido_instance, itens_data_list):
        if itens_data_list is not None:
            # Se for update, remove os itens antigos antes de adicionar os novos.
            if pedido_instance.pk:
                pedido_instance.itens_pedido.all().delete()

            current_subtotal_itens = Decimal('0.00')
            for item_data_dict in itens_data_list:
                item_data_dict.pop('pedido', None) # Remove 'pedido' se presente.

                is_pizza = 'pizza' in item_data_dict and item_data_dict.get('pizza') is not None
                is_bebida = 'bebida' in item_data_dict and item_data_dict.get('bebida') is not None

                produto = None
                if is_pizza: produto = item_data_dict.get('pizza')
                elif is_bebida: produto = item_data_dict.get('bebida')

                if not produto: continue # Pula se o item for inválido (já deve ser pego na validação).

                # Obtém o preço unitário correto (promocional se houver, senão original/bebida).
                preco_unitario_atual = None
                if isinstance(produto, Pizza):
                    preco_unitario_atual = produto.preco_promocional if produto.preco_promocional is not None else produto.preco_original
                elif isinstance(produto, Bebida):
                    preco_unitario_atual = produto.preco
                else:
                    raise serializers.ValidationError(f"Tipo de produto desconhecido: {type(produto)}")

                if preco_unitario_atual is None:
                    raise serializers.ValidationError(f"Não foi possível determinar o preço para o produto.")

                # Prepara os dados para criar o ItemPedido.
                dados_item_para_criar = item_data_dict.copy()
                if is_pizza: dados_item_para_criar.pop('bebida', None)
                elif is_bebida: dados_item_para_criar.pop('pizza', None)

                # Cria o ItemPedido, que calculará seu subtotal no seu próprio save.
                item_obj = ItemPedido.objects.create(
                    pedido=pedido_instance,
                    pizza=dados_item_para_criar.get('pizza'),
                    bebida=dados_item_para_criar.get('bebida'),
                    quantidade=dados_item_para_criar.get('quantidade'),
                    preco_unitario_momento=preco_unitario_atual
                )
                current_subtotal_itens += item_obj.subtotal_item
            # Atualiza o subtotal no objeto Pedido.
            pedido_instance.subtotal_itens = current_subtotal_itens

    # Orquestra a criação de um novo Pedido e seus itens.
    @transaction.atomic
    def create(self, validated_data):
        itens_data_list = validated_data.pop('itens_data')
        cupom_obj_para_aplicar = validated_data.pop('cupom_a_aplicar', None)
        validated_data.pop('codigo_cupom', None) # Remove campo write_only

        # Prepara dados para o modelo Pedido.
        dados_para_modelo = {
            k: v for k, v in validated_data.items()
            if hasattr(Pedido, k) and k not in [
                'subtotal_itens', 'valor_desconto_cupom', 'total_pedido', 'cupom_aplicado'
            ]
        }

        # Define o cliente e o funcionário a partir do contexto da requisição, se não fornecidos.
        request = self.context.get('request')
        if 'cliente' not in dados_para_modelo and request and hasattr(request.user, 'cliente'):
            dados_para_modelo['cliente'] = request.user.cliente
        elif 'cliente' not in dados_para_modelo and not (request and hasattr(request.user, 'funcionario')):
            raise serializers.ValidationError({"cliente": "Cliente é obrigatório para criar um pedido."})

        if 'funcionario_responsavel' not in dados_para_modelo and request and hasattr(request.user, 'funcionario'):
            dados_para_modelo['funcionario_responsavel'] = request.user.funcionario

        # Cria o Pedido inicial.
        pedido = Pedido.objects.create(**dados_para_modelo)

        # Aplica o cupom.
        if cupom_obj_para_aplicar:
            pedido.cupom_aplicado = cupom_obj_para_aplicar

        # Processa os itens e calcula o subtotal.
        self._processar_itens_e_salvar(pedido, itens_data_list)

        # Recalcula todos os totais (subtotal, desconto, taxa, total final).
        pedido.recalcular_totais()
        pedido.save() # Salva o pedido completo.

        return pedido

    # Orquestra a atualização de um Pedido existente.
    @transaction.atomic
    def update(self, instance, validated_data):
        itens_data_list = validated_data.pop('itens_data', None)
        cupom_obj_para_aplicar = validated_data.pop('cupom_a_aplicar', None)
        codigo_cupom_foi_enviado = 'codigo_cupom' in validated_data # Verifica se o campo foi enviado
        validated_data.pop('codigo_cupom', None)

        # Atualiza os campos simples do Pedido.
        for attr, value in validated_data.items():
            if hasattr(instance, attr) and attr not in [
                'cupom_aplicado', 'subtotal_itens', 'valor_desconto_cupom', 'total_pedido'
            ]:
                setattr(instance, attr, value)

        # Atualiza o cupom se um novo foi validado ou se foi explicitamente removido
        # (enviando 'codigo_cupom' como null ou blank).
        if codigo_cupom_foi_enviado:
             instance.cupom_aplicado = cupom_obj_para_aplicar

        # Se novos itens foram enviados, processa-os (isso deleta os antigos).
        if itens_data_list is not None:
            self._processar_itens_e_salvar(instance, itens_data_list)

        # Recalcula os totais após todas as alterações.
        instance.recalcular_totais()
        instance.save()
        return instance