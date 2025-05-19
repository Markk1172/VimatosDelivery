from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

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
    endereco = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=11)

    def __str__(self):
        return self.nome

class Motoboy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="Motoboy")
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=11, unique=True)
    data_nasc = models.DateField()
    telefone = models.CharField(max_length=11)
    endereco = models.CharField(max_length=255)
    foto_cnh = models.ImageField(upload_to='cnhs/', blank=True, null=True)
    email = models.EmailField(unique=True)
    doc_moto = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

class Pizza(models.Model):
    sabor = models.CharField(max_length=50)  # Valor livre, como você pediu
    TAMANHOS = [
        ('pequena', 'Pequena'),
        ('media', 'Média'),
        ('grande', 'Grande'),
        ('todas', 'Todas as opções'),
    ]
    tamanho = models.CharField(max_length=20, choices=TAMANHOS)
    preco_original = models.DecimalField(max_digits=6, decimal_places=2)
    preco_promocional = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    data_desconto = models.DateTimeField(null=True, blank=True)
    
    def aplicar_desconto(self, percentual):
        valor_desconto = self.preco_original * (percentual / 100)
        self.preco_promocional = self.preco_original - valor_desconto
        self.data_desconto = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.sabor} ({self.tamanho})"

class Bebida(models.Model):
    sabor = models.CharField(max_length=50)
    TAMANHOS = [
        ('latinha', 'Latinha'),
        ('600ml', '600ML'),
        ('1l', '1L'),
        ('2l', '2L'),
        ('todas', 'Todas as opções'),
    ]
    tamanho = models.CharField(max_length=20, choices=TAMANHOS)
    preco = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.sabor} ({self.tamanho})"

class TaxaEntrega(models.Model):
    local = models.CharField(max_length=100, unique=True)
    valor = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"A taxa de entrega para {self.local} é de R$ {self.valor}"
    
