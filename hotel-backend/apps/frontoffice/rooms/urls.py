from django.urls import path
from . import views

urlpatterns = [
    path('', views.room_list_stats, name='room_list_stats'),
    path('<str:room_number>/status/', views.update_room_status_view, name='update_room_status'),
]
