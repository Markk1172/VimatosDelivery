from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from decimal import Decimal

# Modelo para armazenar dados dos funcionários da pizzaria.
# Cada funcionário está ligado a um usuário do sistema Django para autenticação e permissões.
# Contém informações pessoais e o cargo do funcionário.
class Funcionario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="funcionario")
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=11, unique=True)
    telefone = models.CharField(max_length=11)
    email = models.EmailField(unique=True)
    cargo = models.CharField(max_length=100)

    # Retorna o nome do funcionário como representação textual do objeto.
    # Facilita a identificação de funcionários em interfaces administrativas.
    def __str__(self):
        return self.nome

# Modelo para armazenar dados dos clientes.
# Cada cliente está ligado a um usuário do sistema, permitindo que façam login e acompanhem pedidos.
# Contém informações pessoais, de contato e endereço.
class Cliente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente")
    nome = models.CharField(max_length=100)
    data_nasc = models.DateField()
    cpf = models.CharField(max_length=11, unique=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=11)

    # Retorna o nome do cliente como representação textual.
    # Útil para listar clientes e associá-los a pedidos.
    def __str__(self):
        return self.nome

# Modelo para armazenar dados dos motoboys.
# Vinculado a um usuário para login e gerenciamento de entregas.
# Inclui informações pessoais, de contato e dados da CNH e da moto.
class Motoboy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="motoboy")
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=11, unique=True)
    data_nasc = models.DateField()
    telefone = models.CharField(max_length=11)
    foto_cnh = models.ImageField(upload_to='cnhs/', blank=True, null=True)
    email = models.EmailField(unique=True)
    doc_moto = models.ImageField(upload_to='doc_motos/', blank=True, null=True)
    placa_moto = models.CharField(max_length=10, blank=True, null=True)

    # Retorna o nome do motoboy como representação textual.
    # Ajuda a identificar o entregador responsável por cada pedido.
    def __str__(self):
        return self.nome

# Modelo para representar as pizzas oferecidas no cardápio.
# Define o sabor, tamanhos disponíveis, preços (original e promocional),
# ingredientes e uma imagem para exibição.
class Pizza(models.Model):
    sabor = models.CharField(max_length=50)
    TAMANHOS = [
        ('pequena', 'Pequena'),
        ('media', 'Média'),
        ('grande', 'Grande'),
    ]
    tamanho = models.CharField(max_length=20, choices=TAMANHOS)
    preco_original = models.DecimalField(max_digits=6, decimal_places=2)
    preco_promocional = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    data_desconto = models.DateTimeField(null=True, blank=True)
    ingredientes = models.TextField(blank=True, null=True)
    imagem = models.ImageField(upload_to='pizzas/', blank=True, null=True)

    # Calcula e aplica um novo preço promocional à pizza.
    # Recebe um percentual, calcula o desconto e atualiza o preço promocional e a data.
    # Levanta um erro se o percentual for inválido.
    def aplicar_desconto(self, percentual):
        if not (0 <= percentual <= 100):
            raise ValueError("Percentual de desconto deve estar entre 0 e 100.")
        valor_desconto = self.preco_original * (Decimal(percentual) / Decimal(100))
        self.preco_promocional = self.preco_original - valor_desconto
        self.data_desconto = timezone.now()
        self.save()

    # Retorna uma string descritiva da pizza, incluindo sabor e tamanho.
    # Usa `get_tamanho_display` para mostrar o nome legível do tamanho.
    def __str__(self):
        return f"{self.sabor} ({self.get_tamanho_display()})"

# Modelo para representar as bebidas oferecidas no cardápio.
# Define o sabor, os tamanhos disponíveis, o preço e uma imagem.
class Bebida(models.Model):
    sabor = models.CharField(max_length=50)
    TAMANHOS = [
        ('latinha', 'Latinha (350ml)'),
        ('600ml', '600ML'),
        ('1l', '1L'),
        ('1.5l', '1.5L'),
        ('2l', '2L'),
    ]
    tamanho = models.CharField(max_length=20, choices=TAMANHOS)
    imagem = models.ImageField(upload_to='bebidas/', blank=True, null=True)
    preco = models.DecimalField(max_digits=6, decimal_places=2)

    # Retorna uma string descritiva da bebida, incluindo sabor e tamanho.
    def __str__(self):
        return f"{self.sabor} ({self.get_tamanho_display()})"

# Modelo para gerenciar cupons de desconto.
# Armazena o código do cupom, o percentual de desconto, a data de validade
# e um indicador se o cupom está ativo ou não.
class Cupom(models.Model):
    codigo = models.CharField(max_length=50, unique=True, help_text="Código do cupom (ex: PROMO10)")
    percentual_desconto = models.DecimalField(max_digits=5, decimal_places=2, help_text="Desconto em porcentagem (ex: 10 para 10%)")
    data_validade = models.DateField(help_text="Data em que o cupom expira")
    ativo = models.BooleanField(default=True, help_text="Cupom está ativo e pode ser usado?")

    # Retorna uma representação textual do cupom, útil para visualização.
    # Mostra o código, o percentual e a data de validade formatada.
    def __str__(self):
        return f"{self.codigo} ({self.percentual_desconto}%) - Val: {self.data_validade.strftime('%d/%m/%Y')}"

    # Verifica se o cupom pode ser utilizado no momento.
    # Checa se está marcado como ativo e se a data atual é anterior ou igual à data de validade.
    def is_valido(self):
        return self.ativo and self.data_validade >= timezone.now().date()

# Modelo central que representa um pedido de um cliente.
# Agrega informações sobre o cliente, itens, entrega, pagamento, status,
# motoboy responsável e funcionário que o gerenciou.
class Pedido(models.Model):
    STATUS_CHOICES = [
        ('Pendente', 'Pendente de Pagamento'),
        ('Recebido', 'Pedido Recebido'),
        ('Em Preparo', 'Em Preparo'),
        ('Pronto para Entrega', 'Pronto para Entrega'),
        ('Em Rota', 'Em Rota de Entrega'),
        ('Entregue', 'Entregue'),
        ('Cancelado', 'Cancelado'),
        ('Retirada', 'Pronto para Retirada'),
    ]
    TIPO_ENTREGA_CHOICES = [
        ('Entrega', 'Entrega em Domicílio'),
        ('Retirada', 'Retirada no Local'),
    ]
    FORMA_PAGAMENTO_CHOICES = [
        ('Cartao Credito', 'Cartão de Crédito',),
        ('Cartao Debito', 'Cartão de Débito'),
        ('PIX', 'PIX'),
        ('Dinheiro', 'Dinheiro'),
    ]

    cliente = models.ForeignKey(Cliente, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos")
    motoboy = models.ForeignKey(Motoboy, on_delete=models.SET_NULL, null=True, blank=True, related_name="entregas")
    funcionario_responsavel = models.ForeignKey(Funcionario, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_gerenciados")

    data_pedido = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Recebido')
    tipo_entrega = models.CharField(max_length=50, choices=TIPO_ENTREGA_CHOICES, default='Entrega')
    endereco_entrega_formatado = models.TextField(blank=True, null=True)

    subtotal_itens = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    taxa_entrega_aplicada = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, default=Decimal('0.00'))

    cupom_aplicado = models.ForeignKey(Cupom, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_com_cupom")
    valor_desconto_cupom = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    total_pedido = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    forma_pagamento = models.CharField(max_length=50, choices=FORMA_PAGAMENTO_CHOICES, blank=True, null=True)
    troco_para = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    observacoes = models.TextField(blank=True, null=True)

    data_pronto = models.DateTimeField(null=True, blank=True)
    data_saiu_para_entrega = models.DateTimeField(null=True, blank=True)
    data_entregue_ou_retirado = models.DateTimeField(null=True, blank=True)

    # Retorna uma string sumarizada do pedido, ideal para listagens e logs.
    def __str__(self):
        nome_cliente = self.cliente.nome if self.cliente else "Cliente Anônimo"
        return f"Pedido #{self.id} - {nome_cliente} - {self.data_pedido.strftime('%d/%m/%Y %H:%M')}"

    # Calcula (ou recalcula) os valores totais do pedido.
    # Soma os subtotais dos itens, aplica o desconto do cupom (se válido),
    # adiciona a taxa de entrega (se não for retirada) e define o total final.
    # Deve ser chamado após qualquer alteração nos itens, cupom ou tipo de entrega.
    def recalcular_totais(self):
        subtotal_calc = sum(item.subtotal_item for item in self.itens_pedido.all()) if self.pk else Decimal('0.00')
        self.subtotal_itens = subtotal_calc

        desconto_final_cupom = Decimal('0.00')
        if self.cupom_aplicado and self.cupom_aplicado.is_valido():
            desconto_final_cupom = self.subtotal_itens * (self.cupom_aplicado.percentual_desconto / Decimal('100.00'))
        self.valor_desconto_cupom = desconto_final_cupom.quantize(Decimal('0.01'))

        total_antes_taxa = self.subtotal_itens - self.valor_desconto_cupom

        taxa_entrega = self.taxa_entrega_aplicada if self.taxa_entrega_aplicada is not None else Decimal('0.00')
        if self.tipo_entrega != 'Entrega':
            taxa_entrega = Decimal('0.00')
            self.taxa_entrega_aplicada = Decimal('0.00')

        self.total_pedido = (total_antes_taxa + taxa_entrega).quantize(Decimal('0.01'))

    class Meta:
        ordering = ['data_pedido']

# Modelo para representar cada item (pizza ou bebida) dentro de um Pedido.
# Liga um produto (Pizza ou Bebida) a um Pedido, especificando a quantidade
# e registrando o preço unitário no momento da compra para histórico.
class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="itens_pedido")
    pizza = models.ForeignKey(Pizza, on_delete=models.SET_NULL, null=True, blank=True)
    bebida = models.ForeignKey(Bebida, on_delete=models.SET_NULL, null=True, blank=True)
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario_momento = models.DecimalField(max_digits=6, decimal_places=2)
    subtotal_item = models.DecimalField(max_digits=10, decimal_places=2)

    # Garante a integridade dos dados antes de salvar.
    # Verifica se um item não é uma pizza E uma bebida ao mesmo tempo,
    # e também se ele é PELO MENOS um dos dois.
    def clean(self):
        if self.pizza and self.bebida:
            raise ValidationError("Um item do pedido não pode ser uma pizza e uma bebida ao mesmo tempo.")
        if not self.pizza and not self.bebida:
            raise ValidationError("Um item do pedido deve ser uma pizza ou uma bebida.")

    # Sobrescreve o método save para adicionar lógica customizada.
    # Valida a quantidade, define o preço unitário (considerando promoções da pizza)
    # se ainda não estiver definido, e calcula o subtotal do item antes de salvar.
    def save(self, *args, **kwargs):
        if self.quantidade <= 0:
            raise ValidationError("Quantidade deve ser maior que zero.")

        if not self.preco_unitario_momento:
            produto = self.pizza or self.bebida
            if produto:
                if isinstance(produto, Pizza) and produto.preco_promocional is not None:
                     self.preco_unitario_momento = produto.preco_promocional
                elif isinstance(produto, Pizza):
                     self.preco_unitario_momento = produto.preco_original
                else: # É uma bebida
                     self.preco_unitario_momento = produto.preco
            else:
                raise ValidationError("Produto não especificado para o item.")

        self.subtotal_item = self.preco_unitario_momento * self.quantidade
        super().save(*args, **kwargs)

    # Retorna uma string que descreve o item do pedido, mostrando quantidade e produto.
    def __str__(self):
        if self.pizza:
            return f"{self.quantidade}x {self.pizza}"
        elif self.bebida:
            return f"{self.quantidade}x {self.bebida}"
        return f"Item do Pedido #{self.pedido.id} (Inválido)"

    # Propriedade para obter facilmente o nome do produto (pizza ou bebida) do item.
    # Útil em templates e serializadores para exibir o nome do produto.
    @property
    def produto_nome(self):
        if self.pizza:
            return str(self.pizza)
        elif self.bebida:
            return str(self.bebida)
        return "Produto não especificado"