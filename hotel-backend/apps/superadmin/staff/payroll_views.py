from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Payroll, SalarySlip
from .serializers import PayrollSerializer, SalarySlipSerializer
from .payroll_service import PayrollService
from core.response.api_response import success_response, error_response

class PayrollConfigView(APIView):
    def get(self, request):
        payrolls = Payroll.objects.all()
        serializer = PayrollSerializer(payrolls, many=True)
        return success_response(data=serializer.data, message="Payroll configs retrieved successfully.")

    def post(self, request):
        staff_id = request.data.get('staff_id')
        basic_salary = request.data.get('basic_salary', 0)
        allowances = request.data.get('allowances', 0)
        deductions = request.data.get('deductions', 0)
        overtime_rate = request.data.get('overtime_rate', 0)

        if not staff_id:
            return error_response(message="staff_id is required", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            payroll = PayrollService.setup_payroll(
                staff_id=staff_id,
                basic_salary=basic_salary,
                allowances=allowances,
                deductions=deductions,
                overtime_rate=overtime_rate
            )
            serializer = PayrollSerializer(payroll)
            return success_response(data=serializer.data, message="Payroll config saved successfully.")
        except Exception as e:
            return error_response(message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SalarySlipView(APIView):
    def get(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        
        slips = SalarySlip.objects.all()
        if month:
            slips = slips.filter(month=month)
        if year:
            slips = slips.filter(year=year)
            
        serializer = SalarySlipSerializer(slips, many=True)
        return success_response(data=serializer.data, message="Salary slips retrieved successfully.")

    def post(self, request):
        # Generate bulk or single salary slip
        month = request.data.get('month')
        year = request.data.get('year')
        staff_id = request.data.get('staff_id') # Optional for single

        if not month or not year:
            return error_response(message="month and year are required", status_code=status.HTTP_400_BAD_REQUEST)

        try:
            if staff_id:
                slip = PayrollService.generate_salary_slip(staff_id, month, year)
                serializer = SalarySlipSerializer(slip)
                return success_response(data=serializer.data, message="Salary slip generated successfully.")
            else:
                slips = PayrollService.process_bulk_payroll(month, year)
                serializer = SalarySlipSerializer(slips, many=True)
                return success_response(data=serializer.data, message="Bulk salary slips generated successfully.")
        except Exception as e:
            return error_response(message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, slip_id):
        try:
            slip = SalarySlip.objects.get(id=slip_id)
            status_val = request.data.get('status')
            if status_val:
                slip.status = status_val
                slip.save()
            serializer = SalarySlipSerializer(slip)
            return success_response(data=serializer.data, message="Salary slip updated successfully.")
        except SalarySlip.DoesNotExist:
            return error_response(message="Salary slip not found", status_code=status.HTTP_404_NOT_FOUND)
