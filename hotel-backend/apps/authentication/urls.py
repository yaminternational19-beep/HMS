from django.urls import path
from .views import superadmin_login

urlpatterns = [
    path('login/', superadmin_login, name='superadmin_login'),
]
