from rest_framework.views import APIView
from core.response.api_response import success_response, error_response
from .services import InventoryService
import logging

logger = logging.getLogger(__name__)

class CategoryListView(APIView):
    def get(self, request):
        try:
            return success_response("Categories fetched", data=InventoryService.get_categories())
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to fetch categories")

    def post(self, request):
        try:
            return success_response("Category created", data=InventoryService.create_category(request.data), status_code=201)
        except Exception as e:
            return error_response(str(e))

class UnitListView(APIView):
    def get(self, request):
        try:
            return success_response("Units fetched", data=InventoryService.get_units())
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to fetch units")

    def post(self, request):
        try:
            return success_response("Unit created", data=InventoryService.create_unit(request.data), status_code=201)
        except Exception as e:
            return error_response(str(e))

class VendorListView(APIView):
    def get(self, request):
        try:
            return success_response("Vendors fetched", data=InventoryService.get_vendors())
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to fetch vendors")

    def post(self, request):
        try:
            return success_response("Vendor created", data=InventoryService.create_vendor(request.data), status_code=201)
        except Exception as e:
            return error_response(str(e))

class ItemListView(APIView):
    def get(self, request):
        try:
            return success_response("Items fetched", data=InventoryService.get_items())
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to fetch items")

    def post(self, request):
        try:
            return success_response("Item created", data=InventoryService.create_item(request.data), status_code=201)
        except Exception as e:
            return error_response(str(e))

class PurchaseView(APIView):
    def post(self, request):
        try:
            return success_response("Purchase recorded", data=InventoryService.record_purchase(request.data), status_code=201)
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to record purchase")

class IssueView(APIView):
    def post(self, request):
        try:
            return success_response("Issue recorded", data=InventoryService.record_issue(request.data), status_code=201)
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to record issue")

class WastageView(APIView):
    def post(self, request):
        try:
            return success_response("Wastage recorded", data=InventoryService.record_wastage(request.data), status_code=201)
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to record wastage")

class DashboardStatsView(APIView):
    def get(self, request):
        try:
            return success_response("Stats fetched", data=InventoryService.get_dashboard_stats())
        except Exception as e:
            logger.error(str(e))
            return error_response("Failed to fetch stats")
