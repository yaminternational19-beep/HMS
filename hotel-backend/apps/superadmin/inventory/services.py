from .models import InventoryCategory, InventoryItem
from django.db.models import Q

class InventoryService:
    @staticmethod
    def serialize_category(category: InventoryCategory) -> dict:
        if not category:
            return {}
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "createdAt": category.created_at.isoformat() if category.created_at else None,
            "updatedAt": category.updated_at.isoformat() if category.updated_at else None,
        }

    @staticmethod
    def serialize_item(item: InventoryItem) -> dict:
        if not item:
            return {}
        return {
            "id": item.id,
            "categoryId": item.category.id if item.category else None,
            "categoryName": item.category.name if item.category else None,
            "name": item.name,
            "sku": item.sku,
            "quantity": float(item.quantity),
            "unit": item.unit,
            "minStockLevel": float(item.min_stock_level),
            "price": float(item.price),
            "createdAt": item.created_at.isoformat() if item.created_at else None,
            "updatedAt": item.updated_at.isoformat() if item.updated_at else None,
        }

    @classmethod
    def get_all_categories(cls):
        categories = InventoryCategory.objects.all().order_by('-id')
        return [cls.serialize_category(cat) for cat in categories]

    @classmethod
    def get_all_items(cls, search_query=None):
        items = InventoryItem.objects.select_related('category').all().order_by('-id')
        if search_query:
            items = items.filter(
                Q(name__icontains=search_query) |
                Q(sku__icontains=search_query)
            )
        return [cls.serialize_item(item) for item in items]

    @classmethod
    def create_category(cls, data):
        category = InventoryCategory.objects.create(
            name=data.get('name'),
            description=data.get('description', '')
        )
        return cls.serialize_category(category)

    @classmethod
    def create_item(cls, data):
        category_id = data.get('categoryId')
        category = InventoryCategory.objects.filter(id=category_id).first()
        if not category:
            raise ValueError("Invalid category ID")

        item = InventoryItem.objects.create(
            category=category,
            name=data.get('name'),
            sku=data.get('sku'),
            quantity=data.get('quantity', 0),
            unit=data.get('unit'),
            min_stock_level=data.get('minStockLevel', 0),
            price=data.get('price', 0)
        )
        return cls.serialize_item(item)

    @classmethod
    def update_item(cls, item_id, data):
        item = InventoryItem.objects.filter(id=item_id).first()
        if not item:
            raise ValueError("Item not found")

        if 'categoryId' in data:
            category = InventoryCategory.objects.filter(id=data['categoryId']).first()
            if category:
                item.category = category
        if 'name' in data:
            item.name = data['name']
        if 'sku' in data:
            item.sku = data['sku']
        if 'quantity' in data:
            item.quantity = data['quantity']
        if 'unit' in data:
            item.unit = data['unit']
        if 'minStockLevel' in data:
            item.min_stock_level = data['minStockLevel']
        if 'price' in data:
            item.price = data['price']
        
        item.save()
        return cls.serialize_item(item)

    @classmethod
    def delete_item(cls, item_id):
        item = InventoryItem.objects.filter(id=item_id).first()
        if not item:
            raise ValueError("Item not found")
        item.delete()
        return True
