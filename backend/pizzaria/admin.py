from django.contrib import admin
from .models import Funcionario, Cliente, Motoboy, Pizza, Bebida, Pedido, ItemPedido

# Registra o modelo Funcionario para que apareça no admin
@admin.register(Funcionario)
class FuncionarioAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'cargo', 'email', 'telefone', 'cpf')
    search_fields = ('nome', 'user__username', 'email', 'cpf')
    list_filter = ('cargo',)
    raw_id_fields = ('user',) # Melhora a seleção do User se você tiver muitos usuários

# Registra o modelo Cliente
@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'email', 'telefone', 'cpf')
    search_fields = ('nome', 'user__username', 'email', 'cpf')
    raw_id_fields = ('user',)

# Registra o modelo Motoboy
@admin.register(Motoboy)
class MotoboyAdmin(admin.ModelAdmin):
    list_display = ('nome', 'user', 'email', 'telefone', 'cpf', 'doc_moto')
    search_fields = ('nome', 'user__username', 'email', 'cpf', 'doc_moto')
    raw_id_fields = ('user',)

# Registra o modelo Pizza
@admin.register(Pizza)
class PizzaAdmin(admin.ModelAdmin):
    list_display = ('sabor', 'tamanho', 'preco_original', 'preco_promocional')
    search_fields = ('sabor', 'ingredientes')
    list_filter = ('tamanho',)

# Registra o modelo Bebida
@admin.register(Bebida)
class BebidaAdmin(admin.ModelAdmin):
    list_display = ('sabor', 'tamanho', 'preco')
    search_fields = ('sabor',)
    list_filter = ('tamanho',)

class ItemPedidoInline(admin.TabularInline): 
    model = ItemPedido
    extra = 1 
    raw_id_fields = ('pizza', 'bebida') 

# Registra o modelo Pedido
@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_cliente_nome', 'data_pedido', 'status', 'tipo_entrega', 'total_pedido', 'get_motoboy_nome')
    search_fields = ('id', 'cliente__nome', 'cliente__user__username', 'motoboy__nome')
    list_filter = ('status', 'tipo_entrega', 'data_pedido')
    date_hierarchy = 'data_pedido' 
    inlines = [ItemPedidoInline] # Adiciona os itens inline
    raw_id_fields = ('cliente', 'motoboy') 

    @admin.display(description='Cliente')
    def get_cliente_nome(self, obj):
        if obj.cliente:
            return obj.cliente.nome
        return "N/A"

    @admin.display(description='Motoboy')
    def get_motoboy_nome(self, obj):
        if obj.motoboy:
            return obj.motoboy.nome
        return "N/A"


