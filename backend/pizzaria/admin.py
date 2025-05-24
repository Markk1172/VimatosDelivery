from django.contrib import admin
from .models import Funcionario, Cliente, Motoboy, Pizza, Bebida, TaxaEntrega, Pedido, ItemPedido

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

# Registra o modelo TaxaEntrega
@admin.register(TaxaEntrega)
class TaxaEntregaAdmin(admin.ModelAdmin):
    list_display = ('local', 'valor')
    search_fields = ('local',)

# Permite adicionar Itens de Pedido diretamente na tela de Pedido
class ItemPedidoInline(admin.TabularInline): 
    model = ItemPedido
    extra = 1 # Quantos formulários de item em branco mostrar
    raw_id_fields = ('pizza', 'bebida') # Facilita a seleção de produtos se houver muitos

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

# Você também pode registrar ItemPedido separadamente se quiser gerenciá-los individualmente,
# mas com o inline no PedidoAdmin geralmente é suficiente.
# @admin.register(ItemPedido)
# class ItemPedidoAdmin(admin.ModelAdmin):
#     list_display = ('get_pedido_id', 'get_produto_nome', 'quantidade', 'subtotal_item')
#     raw_id_fields = ('pedido', 'pizza', 'bebida')

#     @admin.display(description='Pedido ID')
#     def get_pedido_id(self, obj):
#         return obj.pedido.id

#     @admin.display(description='Produto')
#     def get_produto_nome(self, obj):
#         return obj.produto_nome
