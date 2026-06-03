from rest_framework.decorators import api_view
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from .services import SuperAdminAuthService, StaffAuthService
from core.middleware.jwt_auth import employee_required

# =====================================================================
# THE SINGLE CONTROLLER: Super Admin Login View (Calling Service Layer)
# =====================================================================
@api_view(['POST'])
def superadmin_login(request):
    """
    Controller that receives login credentials and defers core authentication,
    auto-seeding, and token generation logic to the SuperAdminAuthService.
    """
    try:
        data = request.data
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return error_response(
                message="Please provide both email and password.",
                errors={"validation": "Email and password are required"},
                status_code=StatusCodes.BAD_REQUEST
            )

        # Delegate login business logic to the Service Layer
        auth_data, error_msg = SuperAdminAuthService.authenticate_superadmin(email, password)
        
        if error_msg:
            return error_response(
                message=error_msg,
                errors={"auth": error_msg},
                status_code=StatusCodes.UNAUTHORIZED
            )

        return success_response(
            message="Super Admin login successful",
            data=auth_data,
            status_code=StatusCodes.OK
        )

    except Exception as e:
        return error_response(
            message="Internal server error occurred",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def staff_login(request):
    """
    Controller that receives staff credentials (staffCode and password)
    and validates them to return a separate JWT token.
    """
    try:
        data = request.data
        staff_code = data.get('staffCode')
        password = data.get('password')

        if not staff_code or not password:
            return error_response(
                message="Please provide both staff code and password.",
                errors={"validation": "Staff code and password are required"},
                status_code=StatusCodes.BAD_REQUEST
            )

        auth_data, error_msg = StaffAuthService.authenticate_staff(staff_code, password)
        
        if error_msg:
            return error_response(
                message=error_msg,
                errors={"auth": error_msg},
                status_code=StatusCodes.UNAUTHORIZED
            )

        return success_response(
            message="Staff login successful",
            data=auth_data,
            status_code=StatusCodes.OK
        )

    except Exception as e:
        return error_response(
            message="Internal server error occurred",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@employee_required
def staff_logout(request):
    """
    Controller that logs a logout event for the authenticated staff employee.
    """
    try:
        employee = request.employee
        from apps.superadmin.staff.models import StaffLog
        StaffLog.objects.create(staff=employee, action='logout')
        
        return success_response(
            message="Staff logged out successfully",
            data={},
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Internal server error occurred",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )
