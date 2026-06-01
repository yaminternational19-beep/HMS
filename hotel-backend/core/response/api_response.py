from rest_framework.response import Response
from core.services.statuscodes import StatusCodes   

def success_response(message="", data=None, status_code=StatusCodes.OK):
    return Response({
        "success": True,
        "message": message,
        "data": data
    }, status=status_code)


def error_response(message="", errors=None, status_code=StatusCodes.BAD_REQUEST):
    return Response({
        "success": False,
        "message": message,
        "errors": errors
    }, status=status_code)
    




