from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views # Boa prática importar o módulo e depois acessar views específicas
from .views import (
    AplicarDescontoPizzaView,
    FuncionarioListCreate, ClienteListCreate, MotoboyListCreate,
    ClienteRetrieveUpdateDestroy,
    PizzaListCreate, BebidaListCreate, TaxaEntregaListCreate,
    PedidoViewSet,
    CupomViewSet, # <<< ADICIONADO CupomViewSet AQUI
    calcular_rota, buscar_cep_api
    # login_view e register_view são acessados via views.login_view etc.
)

# Criação do Router para os ViewSets
router = DefaultRouter()
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'cupons', CupomViewSet, basename='cupom') # Agora CupomViewSet está definido

urlpatterns = [
    # URLs para ViewSets (como PedidoViewSet e CupomViewSet)
    path('', include(router.urls)),

    # URLs para views baseadas em classes genéricas
    path('funcionarios/', FuncionarioListCreate.as_view(), name='funcionario-list-create'),
    path('funcionarios/<int:pk>/', views.FuncionarioRetrieveUpdateDestroy.as_view(), name='funcionario-detail-update-destroy'),
    path('clientes/', ClienteListCreate.as_view(), name='cliente-list-create'),
    path('clientes/<int:pk>/', ClienteRetrieveUpdateDestroy.as_view(), name='cliente-detail-update-destroy'),
    path('motoboys/', MotoboyListCreate.as_view(), name='motoboy-list-create'),
    path('motoboys/<int:pk>/', views.MotoboyRetrieveUpdateDestroy.as_view(), name='motoboy-detail-update-destroy'),
    path('pizzas/', PizzaListCreate.as_view(), name='pizza-list-create'),
    path('pizzas/<int:pk>/', views.PizzaRetrieveUpdateDestroy.as_view(), name='pizza-detail-update-destroy'),
    path('bebidas/', BebidaListCreate.as_view(), name='bebida-list-create'),
    path('bebidas/<int:pk>/', views.BebidaRetrieveUpdateDestroy.as_view(), name='bebida-detail-update-destroy'),
    path('taxas-entrega/', TaxaEntregaListCreate.as_view(), name='taxa-entrega-list-create'),
    path('cupons/', views.CupomListCreate.as_view(), name='cupom-list-create'),
    path('cupons/<int:pk>/', views.CupomRetrieveUpdateDestroy.as_view(), name='cupom-detail-update-destroy'),
    
    # URLs para views baseadas em APIView ou funções decoradas
    path('pizzas/<int:pk>/aplicar-desconto/', AplicarDescontoPizzaView.as_view(), name='aplicar-desconto-pizza'),
    path('buscar-cep/', views.buscar_cep_api, name='buscar_cep_api'), # Usar views.buscar_cep_api
    path('login/', views.login_view, name='login'), 
    path('register/', views.register_view, name='register'),
    path('calcular-rota/', views.calcular_rota, name='calcular_rota'), # Usar views.calcular_rota
]
