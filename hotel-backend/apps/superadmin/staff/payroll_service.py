from decimal import Decimal
from .models import Staff, Payroll, SalarySlip

class PayrollService:
    @staticmethod
    def setup_payroll(staff_id, basic_salary, allowances=0, deductions=0, overtime_rate=0):
        staff = Staff.objects.get(id=staff_id)
        payroll, created = Payroll.objects.update_or_create(
            staff=staff,
            defaults={
                'basic_salary': basic_salary,
                'allowances': allowances,
                'deductions': deductions,
                'overtime_rate': overtime_rate
            }
        )
        return payroll

    @staticmethod
    def generate_salary_slip(staff_id, month, year, overtime_hours=0):
        payroll = Payroll.objects.get(staff_id=staff_id)
        
        # Calculate total pay
        base_pay = payroll.basic_salary + payroll.allowances - payroll.deductions
        overtime_pay = Decimal(str(overtime_hours)) * payroll.overtime_rate
        total_paid = base_pay + overtime_pay

        # Create or update salary slip
        slip, created = SalarySlip.objects.update_or_create(
            staff_id=staff_id,
            month=month,
            year=year,
            defaults={
                'total_paid': total_paid,
                'status': 'Pending'
            }
        )
        return slip

    @staticmethod
    def process_bulk_payroll(month, year):
        # Generate default salary slips for all staff with configured payroll
        payrolls = Payroll.objects.all()
        slips = []
        for p in payrolls:
            slip = PayrollService.generate_salary_slip(p.staff_id, month, year)
            slips.append(slip)
        return slips
