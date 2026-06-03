from django.urls import path
from .views import superadmin_login, staff_login, staff_logout

urlpatterns = [
    path('login/', superadmin_login, name='superadmin_login'),
    path('staff/login/', staff_login, name='staff_login'),
    path('staff/logout/', staff_logout, name='staff_logout'),
]
