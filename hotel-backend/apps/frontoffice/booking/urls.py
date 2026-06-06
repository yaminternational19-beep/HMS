from django.urls import path
from . import views

urlpatterns = [
    path('', views.booking_list_create, name='booking_list_create'),
    path('<str:booking_code>/', views.booking_detail_update, name='booking_detail_update'),
]
