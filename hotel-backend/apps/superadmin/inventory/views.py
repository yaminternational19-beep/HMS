from rest_framework.views import APIView
from core.response.api_response import success_response, error_response
from .services import InventoryService
from .validator import validate_inventory_item
import logging

logger = logging.getLogger(__name__)

class CategoryListView(APIView):
    def get(self, request):
        try:
            categories = InventoryService.get_all_categories()
            return success_response("Categories fetched successfully", data=categories)
        except Exception as e:
            logger.error(f"Error fetching categories: {str(e)}")
            return error_response("Failed to fetch categories")

    def post(self, request):
        try:
            data = request.data
            if not data.get('name'):
                return error_response("Category name is required")
            
            category = InventoryService.create_category(data)
            return success_response("Category created successfully", data=category, status_code=201)
        except Exception as e:
            logger.error(f"Error creating category: {str(e)}")
            return error_response(str(e))

class ItemListView(APIView):
    def get(self, request):
        try:
            search_query = request.query_params.get('search')
            items = InventoryService.get_all_items(search_query)
            return success_response("Items fetched successfully", data=items)
        except Exception as e:
            logger.error(f"Error fetching items: {str(e)}")
            return error_response("Failed to fetch items")

    def post(self, request):
        try:
            data = request.data
            if not data.get('name') or not data.get('categoryId') or not data.get('unit'):
                return error_response("Name, categoryId, and unit are required fields")
                
            validate_inventory_item(data)
            item = InventoryService.create_item(data)
            return success_response("Item created successfully", data=item, status_code=201)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            logger.error(f"Error creating item: {str(e)}")
            return error_response("Failed to create item")

class ItemDetailView(APIView):
    def put(self, request, item_id):
        try:
            data = request.data
            validate_inventory_item(data)
            item = InventoryService.update_item(item_id, data)
            return success_response("Item updated successfully", data=item)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            logger.error(f"Error updating item: {str(e)}")
            return error_response("Failed to update item")

    def delete(self, request, item_id):
        try:
            InventoryService.delete_item(item_id)
            return success_response("Item deleted successfully")
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            logger.error(f"Error deleting item: {str(e)}")
            return error_response("Failed to delete item")
