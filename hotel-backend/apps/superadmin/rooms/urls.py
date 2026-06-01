from django.urls import path
from .views import room_list_create, room_detail_update_delete

urlpatterns = [
    path('', room_list_create, name='room_list_create'),
    path('<str:room_number>/', room_detail_update_delete, name='room_detail_update_delete'),
]
