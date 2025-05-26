from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from decimal import Decimal # Import Decimal for precision

class Funcionario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="funcionario")
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=11, unique=True)
    telefone = models.CharField(max_length=11)
    email = models.EmailField(unique=True)
    cargo = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

class Cliente(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="cliente")
    nome = models.CharField(max_length=100)
    data_nasc = models.DateField()
    cpf = models.CharField(max_length=11, unique=True)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=11)

    def __str__(self):
        return self.nome

class Motoboy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="motoboy") # Alterado related_name para minúsculo
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=11, unique=True)
    data_nasc = models.DateField()
    telefone = models.CharField(max_length=11)
    foto_cnh = models.ImageField(upload_to='cnhs/', blank=True, null=True)
    email = models.EmailField(unique=True)
    doc_moto = models.ImageField(upload_to='doc_motos/', blank=True, null=True) # Considerar ImageField se for um arquivo
    placa_moto = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.nome

class Pizza(models.Model):
    sabor = models.CharField(max_length=50)  
    TAMANHOS = [
        ('pequena', 'Pequena'),
        ('media', 'Média'),
        ('grande', 'Grande'),
    ]
    tamanho = models.CharField(max_length=20, choices=TAMANHOS) # Removido 'todas' daqui
    preco_original = models.DecimalField(max_digits=6, decimal_places=2)
    preco_promocional = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    data_desconto = models.DateTimeField(null=True, blank=True)
    ingredientes = models.TextField(blank=True, null=True)
    imagem = models.ImageField(upload_to='pizzas/', blank=True, null=True)
    
    def aplicar_desconto(self, percentual):
        if not (0 <= percentual <= 100):
            raise ValueError("Percentual de desconto deve estar entre 0 e 100.")
        valor_desconto = self.preco_original * (Decimal(percentual) / Decimal(100))
        self.preco_promocional = self.preco_original - valor_desconto
        self.data_desconto = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.sabor} ({self.get_tamanho_display()})" # Usar get_tamanho_display para o nome legível

class Bebida(models.Model):
    sabor = models.CharField(max_length=50)
    TAMANHOS = [
        ('latinha', 'Latinha (350ml)'),
        ('600ml', '600ML'),
        ('1l', '1L'),
        ('1.5l', '1.5L'),
        ('2l', '2L'),
    ]
    tamanho = models.CharField(max_length=20, choices=TAMANHOS) # Removido 'todas' daqui
    imagem = models.ImageField(upload_to='bebidas/', blank=True, null=True)
    preco = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.sabor} ({self.get_tamanho_display()})"
        
class Cupom(models.Model):
    codigo = models.CharField(max_length=50, unique=True, help_text="Código do cupom (ex: PROMO10)")
    percentual_desconto = models.DecimalField(max_digits=5, decimal_places=2, help_text="Desconto em porcentagem (ex: 10 para 10%)") 
    data_validade = models.DateField(help_text="Data em que o cupom expira")
    ativo = models.BooleanField(default=True, help_text="Cupom está ativo e pode ser usado?")

    def __str__(self):
        return f"{self.codigo} ({self.percentual_desconto}%) - Val: {self.data_validade.strftime('%d/%m/%Y')}"

    def is_valido(self):
        """Verifica se o cupom está ativo e dentro da data de validade."""
        # Compara a data de validade com a data atual (sem a hora)
        return self.ativo and self.data_validade >= timezone.now().date()

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
        ('Retirada', 'Retirada no Local'), # Alterado de 'Delivery' para 'Retirada' para consistência
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
    valor_desconto_cupom = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00')) # Valor monetário do desconto do cupom
    
    total_pedido = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    forma_pagamento = models.CharField(max_length=50, choices=FORMA_PAGAMENTO_CHOICES, blank=True, null=True)
    troco_para = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    observacoes = models.TextField(blank=True, null=True)

    data_pronto = models.DateTimeField(null=True, blank=True)
    data_saiu_para_entrega = models.DateTimeField(null=True, blank=True)
    data_entregue_ou_retirado = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        nome_cliente = self.cliente.nome if self.cliente else "Cliente Anônimo"
        return f"Pedido #{self.id} - {nome_cliente} - {self.data_pedido.strftime('%d/%m/%Y %H:%M')}"

    def recalcular_totais(self):
        subtotal_calc = sum(item.subtotal_item for item in self.itens_pedido.all()) if self.pk else Decimal('0.00')
        self.subtotal_itens = subtotal_calc
        
        desconto_final_cupom = Decimal('0.00')
        if self.cupom_aplicado and self.cupom_aplicado.is_valido():
            # Aplica desconto percentual sobre o subtotal dos itens
            desconto_final_cupom = self.subtotal_itens * (self.cupom_aplicado.percentual_desconto / Decimal('100.00'))
        self.valor_desconto_cupom = desconto_final_cupom.quantize(Decimal('0.01')) # Arredonda para 2 casas decimais

        # O campo 'desconto_aplicado' no seu modelo original parecia genérico.
        # Estou usando 'valor_desconto_cupom' para o cupom especificamente.
        # Se você tiver outros tipos de desconto, precisará de mais lógica.
        
        total_antes_taxa = self.subtotal_itens - self.valor_desconto_cupom
        
        taxa_entrega = self.taxa_entrega_aplicada if self.taxa_entrega_aplicada is not None else Decimal('0.00')
        if self.tipo_entrega != 'Entrega': # Se for retirada, não há taxa
            taxa_entrega = Decimal('0.00')
            self.taxa_entrega_aplicada = Decimal('0.00')

        self.total_pedido = (total_antes_taxa + taxa_entrega).quantize(Decimal('0.01'))
        # Não chame self.save() aqui para evitar recursão ou saves inesperados.
        # O save deve ser chamado externamente após o recálculo.

    class Meta:
        ordering = ['data_pedido']


class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="itens_pedido")
    pizza = models.ForeignKey(Pizza, on_delete=models.SET_NULL, null=True, blank=True)
    bebida = models.ForeignKey(Bebida, on_delete=models.SET_NULL, null=True, blank=True)
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario_momento = models.DecimalField(max_digits=6, decimal_places=2)
    subtotal_item = models.DecimalField(max_digits=10, decimal_places=2)

    def clean(self):
        if self.pizza and self.bebida:
            raise ValidationError("Um item do pedido não pode ser uma pizza e uma bebida ao mesmo tempo.")
        if not self.pizza and not self.bebida:
            raise ValidationError("Um item do pedido deve ser uma pizza ou uma bebida.")

    def save(self, *args, **kwargs):
        if self.quantidade <= 0:
            raise ValidationError("Quantidade deve ser maior que zero.")
        
        # Define o preço unitário no momento se não estiver definido
        if not self.preco_unitario_momento:
            produto = self.pizza or self.bebida
            if produto:
                self.preco_unitario_momento = produto.preco_promocional if hasattr(produto, 'preco_promocional') and produto.preco_promocional is not None else produto.preco
            else: # Isso não deveria acontecer devido ao clean()
                raise ValidationError("Produto não especificado para o item.")

        self.subtotal_item = self.preco_unitario_momento * self.quantidade
        super().save(*args, **kwargs)
        # A atualização do total do pedido deve ser feita na view/serializer do Pedido
        # após todos os itens serem adicionados/modificados.

    def __str__(self):
        if self.pizza:
            return f"{self.quantidade}x {self.pizza}" # Usa o __str__ da Pizza
        elif self.bebida:
            return f"{self.quantidade}x {self.bebida}" # Usa o __str__ da Bebida
        return f"Item do Pedido #{self.pedido.id} (Inválido)"

    @property
    def produto_nome(self):
        if self.pizza:
            return str(self.pizza)
        elif self.bebida:
            return str(self.bebida)
        return "Produto não especificado"
