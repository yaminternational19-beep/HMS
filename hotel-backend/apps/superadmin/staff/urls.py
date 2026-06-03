from django.urls import path
from .views import staff_list_create, staff_detail_update_delete, staff_logs_view

urlpatterns = [
    path('logs/', staff_logs_view, name='staff_logs_view'),
    path('', staff_list_create, name='staff_list_create'),
    path('<str:staff_id>/', staff_detail_update_delete, name='staff_detail_update_delete'),
]
