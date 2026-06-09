from django.urls import path
from . import views

urlpatterns = [
    path('', views.booking_list_create, name='booking_list_create'),
    path('upload/', views.upload_document, name='upload_document'),
    path('invoices/', views.invoice_list, name='invoice_list'),
    path('<str:booking_code>/', views.booking_detail_update, name='booking_detail_update'),
    path('<str:booking_code>/payslip/', views.generate_payslip, name='booking_payslip'),
]
