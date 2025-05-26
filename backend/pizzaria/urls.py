# pizzaria/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views # Boa prática

# Importe explicitamente as views que você vai usar nas rotas path()
from .views import (
    AplicarDescontoPizzaView,
    FuncionarioListCreate, 
    ClienteListCreate, 
    MotoboyListCreate,
    ClienteRetrieveUpdateDestroy,
    PizzaListCreate, 
    BebidaListCreate, 
    calcular_rota, 
    buscar_cep_api,
    login_view,
    register_view,
    calcular_frete_view,
    
    FuncionarioRetrieveUpdateDestroy,
    MotoboyRetrieveUpdateDestroy,
    PizzaRetrieveUpdateDestroy,
    BebidaRetrieveUpdateDestroy,
    CupomRetrieveUpdateDestroy,
    CupomListCreate,
    PedidoViewSet,  # <--- Adicionado para clareza, já que é usado no router
    CupomViewSet    # <--- Adicionado para clareza, já que é usado no router
)

# Criação do Router para os ViewSets
router = DefaultRouter()
router.register(r'pedidos', views.PedidoViewSet, basename='pedido') 
router.register(r'cupons', views.CupomViewSet, basename='cupom')   

urlpatterns = [
    # URLs para ViewSets (como PedidoViewSet e CupomViewSet)
    path('', include(router.urls)),

    # URLs para views baseadas em classes genéricas
    path('funcionarios/', FuncionarioListCreate.as_view(), name='funcionario-list-create'),
    path('funcionarios/<int:pk>/', FuncionarioRetrieveUpdateDestroy.as_view(), name='funcionario-detail'),
    path('clientes/', ClienteListCreate.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroy.as_view(), name='cliente-detail'),
    path('motoboys/', MotoboyListCreate.as_view(), name='motoboy-list-create'),
    path('motoboys/<int:pk>/', MotoboyRetrieveUpdateDestroy.as_view(), name='motoboy-detail'),
    path('pizzas/', PizzaListCreate.as_view(), name='pizza-list-create'),
    path('pizzas/<int:pk>/', PizzaRetrieveUpdateDestroy.as_view(), name='pizza-detail'),
    path('bebidas/', BebidaListCreate.as_view(), name='bebida-list-create'),
    path('bebidas/<int:pk>/', BebidaRetrieveUpdateDestroy.as_view(), name='bebida-detail'),
    
    path('cupons-list/', CupomListCreate.as_view(), name='cupom-list-create-alt'), 
    path('cupons-detail/<int:pk>/', CupomRetrieveUpdateDestroy.as_view(), name='cupom-detail-alt'),
    
    # URLs para views baseadas em APIView ou funções decoradas
    path('pizzas/<int:pk>/aplicar-desconto/', AplicarDescontoPizzaView.as_view(), name='aplicar-desconto-pizza'),
    path('buscar-cep/', views.buscar_cep_api, name='buscar-cep-api'), 
    path('login/', views.login_view, name='login'), 
    path('register/', views.register_view, name='register'),
    path('calcular-rota/', views.calcular_rota, name='calcular-rota'),
    
    path('calcular-frete/', views.calcular_frete_view, name='calcular-frete'),
]