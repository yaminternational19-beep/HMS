from django.urls import path
from .views import staff_list_create, staff_detail_update_delete, staff_logs_view
from .payroll_views import PayrollConfigView, SalarySlipView

urlpatterns = [
    path('logs/', staff_logs_view, name='staff_logs_view'),
    path('', staff_list_create, name='staff_list_create'),
    path('<str:staff_id>/', staff_detail_update_delete, name='staff_detail_update_delete'),
    
    # Payroll APIs
    path('payroll/config/', PayrollConfigView.as_view(), name='payroll-config'),
    path('payroll/slips/', SalarySlipView.as_view(), name='salary-slips'),
    path('payroll/slips/<int:slip_id>/', SalarySlipView.as_view(), name='salary-slip-update'),
]
