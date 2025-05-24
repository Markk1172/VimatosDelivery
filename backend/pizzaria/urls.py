from django.urls import path 
from . import views
from .views import (
    AplicarDescontoPizzaView,
    FuncionarioListCreate, ClienteListCreate, MotoboyListCreate,
    ClienteRetrieveUpdateDestroy,
    PizzaListCreate, BebidaListCreate, TaxaEntregaListCreate, 
    calcular_rota, buscar_cep_api,
)

urlpatterns = [
    path('funcionarios/', FuncionarioListCreate.as_view(), name='funcionario-list-create'),
    path('clientes/', ClienteListCreate.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroy.as_view(), name='cliente-detail-update-destroy'),
    path('motoboys/', MotoboyListCreate.as_view(), name='motoboy-list-create'),
    path('pizzas/', PizzaListCreate.as_view(), name='pizza-list-create'),
    path('bebidas/', BebidaListCreate.as_view(), name='bebida-list-create'),
    path('taxas-entrega/', TaxaEntregaListCreate.as_view(), name='taxa-entrega-list-create'),
    path('pizzas/<int:pk>/aplicar-desconto/', AplicarDescontoPizzaView.as_view(), name='aplicar-desconto-pizza'),
    path('buscar-cep/', buscar_cep_api, name='buscar_cep_api'),
    path('login/', views.login_view, name='login'), 
    path('register/', views.register_view, name='register'),
    path('calcular-rota/', calcular_rota, name='calcular_rota'), 
]
