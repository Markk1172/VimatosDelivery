import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction # Importar transaction
from django.utils import timezone
from django.db import IntegrityError
from decimal import Decimal
from .models import (
    Funcionario, Cliente, Motoboy, Pizza, Bebida, TaxaEntrega,
    Pedido, ItemPedido, Cupom
)

User = get_user_model()

# --- Funções de Validação de Formato (Reutilizadas) ---
def validar_email_formato(email):
    """Valida o formato básico de um email."""
    if not email: # Adicionado para tratar email vazio/nulo
        return False
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email))

def validar_telefone(telefone):
    """Valida se o telefone tem 10 ou 11 dígitos numéricos."""
    if not telefone: # Adicionado para tratar telefone vazio/nulo
        return False
    return bool(re.match(r'^\d{10,11}$', telefone))

def validar_cpf_formato(cpf):
    """Valida se o CPF tem 11 dígitos numéricos."""
    if not cpf: # Adicionado para tratar cpf vazio/nulo
        return False
    return bool(re.match(r'^\d{11}$', cpf))

# --- Serializers de Criação com Validações ---

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
        # 'endereco' é opcional (blank=True, null=True no model)

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Nome de usuário é obrigatório.")
        if User.objects.filter(username__iexact=value).exists(): # Case-insensitive
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email é obrigatório.")
        if not validar_email_formato(value):
            raise serializers.ValidationError("Formato de email inválido.")
        # Verifica se o email já existe em User ou em Cliente (excluindo a própria instância se for update)
        if User.objects.filter(email__iexact=value).exists() or \
           Cliente.objects.filter(email__iexact=value).exists():
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
        user_email = validated_data.get('email') # Email já está validado

        # Cria o User associado
        try:
            user = User.objects.create_user(username=username, password=password, email=user_email)
        except IntegrityError: # Segurança extra, embora as validações devam pegar
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário. Verifique os dados."})
        
        # Cria o Cliente associado ao User
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente

class FuncionarioCreateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=True)
    email = serializers.EmailField(required=True)
    cpf = serializers.CharField(max_length=11, required=True)
    telefone = serializers.CharField(max_length=11, required=True)
    nome = serializers.CharField(required=True)
    cargo = serializers.CharField(required=True)

    class Meta:
        model = Funcionario
        fields = ['username', 'password', 'nome', 'cpf', 'telefone', 'email', 'cargo']

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
           Funcionario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def validate_cpf(self, value):
        if not value:
            raise serializers.ValidationError("CPF é obrigatório.")
        if not validar_cpf_formato(value):
            raise serializers.ValidationError("CPF deve conter 11 dígitos numéricos.")
        if Funcionario.objects.filter(cpf=value).exists():
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
            # Funcionários geralmente devem ter acesso ao admin
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
    telefone = serializers.CharField(max_length=11, required=True)
    nome = serializers.CharField(required=True)
    data_nasc = serializers.DateField(required=True)
    placa_moto = serializers.CharField(required=True) # Tornando obrigatório, ajuste se necessário

    # foto_cnh e doc_moto são ImageField, a validação de existência é feita pelo 'required'
    # Se não forem obrigatórios, remova 'required=True' ou adicione 'allow_null=True, required=False'

    class Meta:
        model = Motoboy
        fields = [
            'username', 'password', 'nome', 'cpf', 'data_nasc', 'telefone', 
            'email', 'placa_moto', 'foto_cnh', 'doc_moto'
        ]

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
           Motoboy.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def validate_cpf(self, value):
        if not value:
            raise serializers.ValidationError("CPF é obrigatório.")
        if not validar_cpf_formato(value):
            raise serializers.ValidationError("CPF deve conter 11 dígitos numéricos.")
        if Motoboy.objects.filter(cpf=value).exists():
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
            raise serializers.ValidationError({"detail": "Não foi possível criar o usuário para o motoboy."})
        
        motoboy = Motoboy.objects.create(user=user, **validated_data)
        return motoboy

# --- Outros Serializers (mantidos como no seu código original, com pequenas melhorias se aplicável) ---

class ClienteSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    # Adicionando validações para update também, se necessário
    email = serializers.EmailField(required=False) # No update, pode não ser enviado

    class Meta:
        model = Cliente
        fields = ['id', 'user', 'user_username', 'nome', 'data_nasc', 'cpf', 'endereco', 'email', 'telefone']
        read_only_fields = ['user', 'user_username', 'cpf'] # CPF e data_nasc geralmente não mudam

    def validate_email(self, value):
        if not value: # Permite email vazio se não for obrigatório no update
            return value
        if not validar_email_formato(value):
            raise serializers.ValidationError("Formato de email inválido.")
        
        # Ao atualizar, exclui a própria instância da verificação de duplicidade de email
        # Verifica se o email já existe em User (excluindo o user da instância atual)
        # ou em Cliente (excluindo a instância atual)
        user_query = User.objects.filter(email__iexact=value)
        cliente_query = Cliente.objects.filter(email__iexact=value)

        if self.instance and self.instance.user: # Se estiver atualizando um cliente que tem user
            user_query = user_query.exclude(pk=self.instance.user.pk)
        if self.instance: # Se estiver atualizando um cliente
            cliente_query = cliente_query.exclude(pk=self.instance.pk)
        
        if user_query.exists() or cliente_query.exists():
            raise serializers.ValidationError("Este email já está em uso.")
        return value

    def validate_telefone(self, value):
        if not value: # Permite telefone vazio se não for obrigatório no update
            return value
        if not validar_telefone(value):
            raise serializers.ValidationError("Telefone deve conter 10 ou 11 dígitos.")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        # Atualiza o User associado se o email mudar
        if 'email' in validated_data and instance.user:
            new_email = validated_data.get('email')
            if instance.user.email != new_email:
                # A validação de duplicidade já foi feita no validate_email
                instance.user.email = new_email
                instance.user.save(update_fields=['email'])
        
        # Atualiza os campos do Cliente
        # O super().update lida com a atribuição dos campos
        return super().update(instance, validated_data)


class FuncionarioSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True) # Para exibir username

    class Meta:
        model = Funcionario
        fields = ['id', 'user', 'user_username', 'nome', 'cpf', 'telefone', 'email', 'cargo']
        read_only_fields = ['user', 'user_username', 'cpf'] # CPF geralmente não muda

class MotoboySerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True) # Para exibir username

    class Meta:
        model = Motoboy
        fields = [
            'id', 'user', 'user_username', 'nome', 'cpf', 'data_nasc', 'telefone', 
            'email', 'placa_moto', 'foto_cnh', 'doc_moto'
        ]
        read_only_fields = ['user', 'user_username', 'cpf'] # CPF geralmente não muda

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
        if not value:
            raise serializers.ValidationError("Código do cupom é obrigatório.")
        query = Cupom.objects.filter(codigo__iexact=value)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Este código de cupom já está em uso.")
        return value

    def validate_percentual_desconto(self, value):
        if value is None: # Adicionado para tratar valor nulo
            raise serializers.ValidationError("Percentual de desconto é obrigatório.")
        if not (Decimal('0.01') <= value <= Decimal('100.00')):
            raise serializers.ValidationError("Percentual de desconto deve estar entre 0.01 e 100.00.")
        return value

    def validate_data_validade(self, value):
        if value is None: # Adicionado para tratar valor nulo
            raise serializers.ValidationError("Data de validade é obrigatória.")
        if value < timezone.now().date(): # value já é um objeto date
            raise serializers.ValidationError("A data de validade não pode ser no passado.")
        return value

class ItemPedidoSerializer(serializers.ModelSerializer):
    pizza_detalhes = PizzaSerializer(source='pizza', read_only=True, required=False)
    bebida_detalhes = BebidaSerializer(source='bebida', read_only=True, required=False)
    produto_nome = serializers.CharField(read_only=True, source='get_produto_display_name') # Usando um método do model

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
        # A validação de quantidade mínima já é feita pelo IntegerField(min_value=1)
        return data

class PedidoSerializer(serializers.ModelSerializer):
    itens_pedido = ItemPedidoSerializer(many=True, read_only=True)
    itens_data = ItemPedidoSerializer(many=True, write_only=True, required=True)
    
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True, allow_null=True)
    motoboy_nome = serializers.CharField(source='motoboy.nome', read_only=True, allow_null=True)
    funcionario_nome = serializers.CharField(source='funcionario_responsavel.nome', read_only=True, allow_null=True)
    cupom_aplicado_codigo = serializers.CharField(source='cupom_aplicado.codigo', read_only=True, allow_null=True)

    codigo_cupom = serializers.CharField(max_length=50, write_only=True, required=False, allow_blank=True, allow_null=True)
    # Para garantir que o cliente seja enviado ou obtido do usuário logado
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all(), required=False, allow_null=True)


    class Meta:
        model = Pedido
        fields = [
            'id', 'cliente', 'cliente_nome', 'motoboy', 'motoboy_nome', 
            'funcionario_responsavel', 'funcionario_nome',
            'data_pedido', 'status', 'tipo_entrega', 'endereco_entrega_formatado',
            'subtotal_itens', 'taxa_entrega_aplicada', 
            'cupom_aplicado', 'cupom_aplicado_codigo', 'valor_desconto_cupom',
            'total_pedido',
            'forma_pagamento', 'troco_para', 'observacoes',
            'data_pronto', 'data_saiu_para_entrega', 'data_entregue_ou_retirado',
            'itens_pedido', 
            'itens_data',
            'codigo_cupom'
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

    def _processar_itens_e_calcular_subtotal(self, pedido_instance, itens_data_list):
        # Limpa itens antigos se for um update e novos itens forem fornecidos
        if pedido_instance.pk and itens_data_list: # Verifica se é update e se há novos itens
            pedido_instance.itens_pedido.all().delete()

        current_subtotal_itens = Decimal('0.00')
        for item_data in itens_data_list:
            item_data.pop('pedido', None) 
            produto = item_data.get('pizza') or item_data.get('bebida')
            if not produto: continue 
            
            # Usa o preço promocional se existir e for válido, senão o preço original
            preco_unitario = produto.preco_promocional if hasattr(produto, 'preco_promocional') and produto.preco_promocional is not None else produto.preco
            
            item_obj = ItemPedido.objects.create(
                pedido=pedido_instance, 
                **item_data, 
                preco_unitario_momento=preco_unitario # Salva o preço no momento da compra
            )
            current_subtotal_itens += item_obj.subtotal_item # subtotal_item é calculado no save do ItemPedido
        return current_subtotal_itens

    def _aplicar_cupom_e_taxas(self, pedido_instance, codigo_cupom_str):
        cupom_obj = None
        if codigo_cupom_str:
            try:
                cupom_obj = Cupom.objects.get(codigo__iexact=codigo_cupom_str) # Case-insensitive
                if not cupom_obj.is_valido():
                    # Você pode optar por lançar um erro aqui se um cupom inválido for explicitamente fornecido
                    # raise serializers.ValidationError({"codigo_cupom": "Cupom inválido ou expirado."})
                    cupom_obj = None # Ou simplesmente não aplicar
            except Cupom.DoesNotExist:
                # raise serializers.ValidationError({"codigo_cupom": "Cupom não encontrado."})
                cupom_obj = None # Ou simplesmente não aplicar
        
        pedido_instance.cupom_aplicado = cupom_obj
        
        if pedido_instance.tipo_entrega == 'Entrega':
            # Tenta buscar uma taxa de entrega. Se não existir, pode usar um padrão ou lançar erro.
            # Esta lógica precisa ser adaptada à sua regra de negócio para taxas.
            # Exemplo: buscar taxa pelo CEP/bairro do cliente ou uma taxa padrão.
            # Por agora, um valor fixo se não houver lógica mais complexa.
            taxa_padrao, _ = TaxaEntrega.objects.get_or_create(local="Padrao", defaults={'valor': Decimal('7.00')})
            pedido_instance.taxa_entrega_aplicada = taxa_padrao.valor
        else:
            pedido_instance.taxa_entrega_aplicada = Decimal('0.00')
        
        pedido_instance.recalcular_totais()

    @transaction.atomic
    def create(self, validated_data):
        itens_data_list = validated_data.pop('itens_data')
        codigo_cupom_str = validated_data.pop('codigo_cupom', None)
        
        # Determina o cliente
        request = self.context.get('request')
        cliente_obj = validated_data.pop('cliente', None) # Pega o cliente se foi enviado
        if not cliente_obj and request and hasattr(request.user, 'cliente'):
            cliente_obj = request.user.cliente
        elif not cliente_obj: # Se não foi enviado e o user não é cliente
            raise serializers.ValidationError({"cliente": "Cliente é obrigatório para criar um pedido."})
        
        # Determina o funcionário responsável (se logado como funcionário)
        funcionario_responsavel_obj = None
        if request and hasattr(request.user, 'funcionario'):
            funcionario_responsavel_obj = request.user.funcionario

        # Cria o pedido base
        pedido = Pedido.objects.create(
            cliente=cliente_obj, 
            funcionario_responsavel=funcionario_responsavel_obj,
            **validated_data
        )
        
        # Processa itens e calcula subtotal
        subtotal = self._processar_itens_e_calcular_subtotal(pedido, itens_data_list)
        pedido.subtotal_itens = subtotal

        # Aplica cupom, taxas e recalcula totais
        self._aplicar_cupom_e_taxas(pedido, codigo_cupom_str)
        
        pedido.save()
        return pedido

    @transaction.atomic
    def update(self, instance, validated_data):
        itens_data_list = validated_data.pop('itens_data', None) # Itens são opcionais no update
        codigo_cupom_str = validated_data.pop('codigo_cupom', None) # Permite mudar/remover cupom
        
        # Atualiza os campos simples do Pedido
        # instance.status = validated_data.get('status', instance.status)
        # ... outros campos ...
        # O super().update() pode lidar com isso, mas precisamos ter cuidado com a ordem
        # para recalcular_totais.

        # Atualiza campos diretos do pedido
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        # instance.save(update_fields=validated_data.keys() - {'itens_data', 'codigo_cupom'}) # Salva campos já validados

        if itens_data_list is not None: 
            # Se novos itens foram fornecidos, substitui os antigos
            subtotal = self._processar_itens_e_calcular_subtotal(instance, itens_data_list)
            instance.subtotal_itens = subtotal
        # Se itens_data_list for None, os itens existentes e o subtotal_itens permanecem.

        # Se um código de cupom foi explicitamente enviado (mesmo que vazio para remover),
        # ou se já existia um cupom, reprocessa.
        # Se codigo_cupom_str for None e não havia cupom, nada muda em relação ao cupom.
        cupom_mudou = False
        if codigo_cupom_str is not None: # Tentativa explícita de mudar o cupom
            cupom_mudou = True
        elif instance.cupom_aplicado and codigo_cupom_str is None: # Nenhuma informação de cupom no request, mas havia um
            # Mantém o cupom existente, mas precisa reprocessar caso o subtotal tenha mudado
            codigo_cupom_str = instance.cupom_aplicado.codigo
            cupom_mudou = True # Tecnicamente não mudou o cupom, mas o subtotal pode ter mudado

        if cupom_mudou or (itens_data_list is not None): # Se cupom mudou OU itens mudaram
             self._aplicar_cupom_e_taxas(instance, codigo_cupom_str)
        else: # Se nem cupom nem itens mudaram, mas outros campos do pedido sim (ex: taxa_entrega manualmente)
            instance.recalcular_totais() # Apenas recalcula com os valores atuais
            
        instance.save()
        return instance
