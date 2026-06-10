from django.shortcuts import render
from rest_framework.decorators import api_view, throttle_classes
from core.response.api_response import success_response,error_response
from django.db import connection

# Create your views here.


@api_view(['GET'])
def health_check(request):
    return success_response(
        message="Success",
        data={}
    )

@api_view(['GET'])
def test_check(request):
    return success_response(
        message="api testing",
        data={ "project": "HMS","number":3}
    )


@api_view(['GET'])
def mysql_check(request):

    try:

        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return success_response(
            message="MySQL connection successful",
            data={}
        )

    except Exception as e:

        return error_response(
            message=str(e),
            data={}
        )


@api_view(['GET'])
def custom_limit_check(request):
    return success_response(
        message="custom limit testing",
        data={}
    )
custom_limit_check.throttle_scope = 'hms_custom'


@api_view(['GET'])
@throttle_classes([])
def exempt_check(request):
    return success_response(
        message="exempt testing",
        data={}
    )

import cloudinary
from cloudinary.api import ping

@api_view(['GET'])
def cloudinary_check(request):
    try:
        response = ping()
        return success_response(
            message="Cloudinary connection successful",
            data={"response": response}
        )
    except Exception as e:
        return error_response(
            message=f"Cloudinary connection failed: {str(e)}",
            data={}
        )
