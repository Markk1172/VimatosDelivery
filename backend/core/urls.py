# D:\VimatosDelivery\backend\core\urls.py (Exemplo)

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('pizzaria.urls')), # Esta linha está correta e adiciona o prefixo 'api/'
]