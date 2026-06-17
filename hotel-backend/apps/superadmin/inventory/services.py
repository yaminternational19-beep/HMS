import uuid
from django.db import transaction
from django.db.models import Sum, F
from datetime import datetime
from .models import (
    InventoryCategory, UnitMaster, Vendor, InventoryItemMaster,
    InventoryPurchase, PurchaseItemDetail, StockTransaction,
    InventoryIssue, IssueItemDetail, WastageRecord
)

class InventoryService:

    # --- CATEGORY ---
    @staticmethod
    def serialize_category(category: InventoryCategory) -> dict:
        return {
            "id": category.id,
            "name": category.name,
            "description": category.description,
            "status": category.status,
        }

    @classmethod
    def get_categories(cls):
        return [cls.serialize_category(c) for c in InventoryCategory.objects.all()]

    @classmethod
    def create_category(cls, data):
        c = InventoryCategory.objects.create(
            name=data.get('name'),
            description=data.get('description', ''),
            status=data.get('status', 'Active')
        )
        return cls.serialize_category(c)

    # --- UNIT ---
    @staticmethod
    def serialize_unit(unit: UnitMaster) -> dict:
        return {
            "id": unit.id,
            "name": unit.name,
            "shortName": unit.short_name,
            "status": unit.status,
        }

    @classmethod
    def get_units(cls):
        return [cls.serialize_unit(u) for u in UnitMaster.objects.all()]

    @classmethod
    def create_unit(cls, data):
        u = UnitMaster.objects.create(
            name=data.get('name'),
            short_name=data.get('shortName'),
            status=data.get('status', 'Active')
        )
        return cls.serialize_unit(u)

    # --- VENDOR ---
    @staticmethod
    def serialize_vendor(vendor: Vendor) -> dict:
        return {
            "id": vendor.id,
            "name": vendor.name,
            "contactPerson": vendor.contact_person,
            "phoneNumber": vendor.phone_number,
            "email": vendor.email,
            "address": vendor.address,
            "gstNumber": vendor.gst_number,
            "status": vendor.status,
        }

    @classmethod
    def get_vendors(cls):
        return [cls.serialize_vendor(v) for v in Vendor.objects.all()]

    @classmethod
    def create_vendor(cls, data):
        v = Vendor.objects.create(
            name=data.get('name'),
            contact_person=data.get('contactPerson', ''),
            phone_number=data.get('phoneNumber', ''),
            email=data.get('email', ''),
            address=data.get('address', ''),
            gst_number=data.get('gstNumber', ''),
            status=data.get('status', 'Active')
        )
        return cls.serialize_vendor(v)

    # --- ITEMS ---
    @staticmethod
    def serialize_item(item: InventoryItemMaster) -> dict:
        return {
            "id": item.id,
            "itemCode": item.item_code,
            "name": item.name,
            "categoryId": item.category_id,
            "categoryName": item.category.name if item.category else None,
            "unitId": item.unit_id,
            "unitName": item.unit.name if item.unit else None,
            "currentStock": float(item.current_stock),
            "minStockAlert": float(item.min_stock_alert),
            "purchasePrice": float(item.purchase_price),
            "sellingPrice": float(item.selling_price),
            "status": item.status,
            "description": item.description,
        }

    @classmethod
    def get_items(cls):
        return [cls.serialize_item(i) for i in InventoryItemMaster.objects.select_related('category', 'unit').all()]

    @classmethod
    def create_item(cls, data):
        code = f"ITM-{uuid.uuid4().hex[:6].upper()}"
        item = InventoryItemMaster.objects.create(
            item_code=code,
            name=data.get('name'),
            category_id=data.get('categoryId'),
            unit_id=data.get('unitId'),
            current_stock=data.get('currentStock', 0),
            min_stock_alert=data.get('minStockAlert', 0),
            purchase_price=data.get('purchasePrice', 0),
            selling_price=data.get('sellingPrice', 0),
            status=data.get('status', 'Active'),
            description=data.get('description', '')
        )
        # Create initial stock adjustment if stock > 0
        if item.current_stock > 0:
            cls.record_transaction(item, 'Adjustment', item.current_stock, 0, item.current_stock, 'InitialStock', item.id, 'Initial Stock Creation')
        return cls.serialize_item(item)

    # --- TRANSACTIONS CORE LOGIC ---
    @staticmethod
    def record_transaction(item: InventoryItemMaster, t_type: str, qty: float, prev_stock: float, new_stock: float, ref_type: str, ref_id: str, remarks: str):
        txn_num = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        StockTransaction.objects.create(
            transaction_number=txn_num,
            item=item,
            transaction_type=t_type,
            quantity=qty,
            previous_stock=prev_stock,
            updated_stock=new_stock,
            reference_type=ref_type,
            reference_id=ref_id,
            remarks=remarks
        )

    # --- PURCHASE ---
    @classmethod
    @transaction.atomic
    def record_purchase(cls, data):
        p_num = f"PUR-{uuid.uuid4().hex[:8].upper()}"
        purchase = InventoryPurchase.objects.create(
            purchase_number=p_num,
            invoice_number=data.get('invoiceNumber', ''),
            vendor_id=data.get('vendorId'),
            purchase_date=data.get('purchaseDate', datetime.today().date()),
            total_amount=data.get('totalAmount', 0),
            notes=data.get('notes', '')
        )
        
        items_data = data.get('items', [])
        for i_data in items_data:
            item = InventoryItemMaster.objects.select_for_update().get(id=i_data['itemId'])
            qty = float(i_data['quantity'])
            
            PurchaseItemDetail.objects.create(
                purchase=purchase,
                item=item,
                quantity=qty,
                unit_price=i_data.get('unitPrice', 0),
                total_amount=i_data.get('totalAmount', 0)
            )
            
            prev_stock = float(item.current_stock)
            new_stock = prev_stock + qty
            item.current_stock = new_stock
            item.save()
            
            cls.record_transaction(item, 'Purchase', qty, prev_stock, new_stock, 'Purchase', purchase.id, purchase.notes)
            
        return {"id": purchase.id, "purchaseNumber": purchase.purchase_number}

    # --- ISSUE ---
    @classmethod
    @transaction.atomic
    def record_issue(cls, data):
        i_num = f"ISS-{uuid.uuid4().hex[:8].upper()}"
        issue = InventoryIssue.objects.create(
            issue_number=i_num,
            department=data.get('department'),
            issue_date=data.get('issueDate', datetime.today().date()),
            issued_by=data.get('issuedBy', ''),
            received_by=data.get('receivedBy', ''),
            remarks=data.get('remarks', '')
        )
        
        items_data = data.get('items', [])
        for i_data in items_data:
            item = InventoryItemMaster.objects.select_for_update().get(id=i_data['itemId'])
            qty = float(i_data['quantity'])
            
            IssueItemDetail.objects.create(
                issue=issue,
                item=item,
                quantity=qty
            )
            
            prev_stock = float(item.current_stock)
            new_stock = prev_stock - qty
            item.current_stock = new_stock
            item.save()
            
            cls.record_transaction(item, 'Issue', qty, prev_stock, new_stock, 'Issue', issue.id, issue.remarks)
            
        return {"id": issue.id, "issueNumber": issue.issue_number}

    # --- WASTAGE ---
    @classmethod
    @transaction.atomic
    def record_wastage(cls, data):
        w_num = f"WST-{uuid.uuid4().hex[:8].upper()}"
        item = InventoryItemMaster.objects.select_for_update().get(id=data['itemId'])
        qty = float(data['quantity'])
        
        wastage = WastageRecord.objects.create(
            wastage_number=w_num,
            item=item,
            quantity=qty,
            reason=data.get('reason', ''),
            recorded_by=data.get('recordedBy', ''),
            date=data.get('date', datetime.today().date())
        )
        
        prev_stock = float(item.current_stock)
        new_stock = prev_stock - qty
        item.current_stock = new_stock
        item.save()
        
        cls.record_transaction(item, 'Wastage', qty, prev_stock, new_stock, 'Wastage', wastage.id, wastage.reason)
        return {"id": wastage.id, "wastageNumber": wastage.wastage_number}

    # --- DASHBOARD ---
    @classmethod
    def get_dashboard_stats(cls):
        return {
            "totalItems": InventoryItemMaster.objects.count(),
            "totalCategories": InventoryCategory.objects.count(),
            "totalVendors": Vendor.objects.count(),
            "lowStockItems": InventoryItemMaster.objects.filter(current_stock__lte=F('min_stock_alert')).count(),
        }
