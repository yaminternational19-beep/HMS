from django.shortcuts import render
from rest_framework.decorators import api_view
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