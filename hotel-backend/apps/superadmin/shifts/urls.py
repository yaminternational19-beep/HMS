from django.urls import path
from .views import shift_list_create, shift_detail_update_delete

urlpatterns = [
    path('', shift_list_create, name='shift_list_create'),
    path('<str:shift_id>/', shift_detail_update_delete, name='shift_detail_update_delete'),
]
