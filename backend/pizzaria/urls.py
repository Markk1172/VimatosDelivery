from django.urls import path 
from . import views
from .views import (
    AplicarDescontoPizzaView,
    FuncionarioListCreate, ClienteListCreate, MotoboyListCreate,
    PizzaListCreate, BebidaListCreate, TaxaEntregaListCreate,
    buscar_cep_api # buscar_cep_api é acessível diretamente porque foi importado aqui
)

urlpatterns = [
    path('funcionarios/', FuncionarioListCreate.as_view(), name='funcionario-list-create'),
    path('clientes/', ClienteListCreate.as_view(), name='cliente-list-create'),
    path('motoboys/', MotoboyListCreate.as_view(), name='motoboy-list-create'),
    path('pizzas/', PizzaListCreate.as_view(), name='pizza-list-create'),
    path('bebidas/', BebidaListCreate.as_view(), name='bebida-list-create'),
    path('taxas-entrega/', TaxaEntregaListCreate.as_view(), name='taxa-entrega-list-create'),
    path('pizzas/<int:pk>/aplicar-desconto/', AplicarDescontoPizzaView.as_view(), name='aplicar-desconto-pizza'),
    path('buscar-cep/', buscar_cep_api, name='buscar_cep_api'),
    path('login/', views.login_view, name='login'), 
    path('register/', views.register_view, name='register'), 
]
