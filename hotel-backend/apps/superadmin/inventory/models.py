from django.db import models

class InventoryCategory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class UnitMaster(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    gst_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class InventoryItemMaster(models.Model):
    item_code = models.CharField(max_length=100, unique=True, blank=True)
    name = models.CharField(max_length=255)
    category = models.ForeignKey(InventoryCategory, on_delete=models.SET_NULL, null=True, related_name='items')
    unit = models.ForeignKey(UnitMaster, on_delete=models.SET_NULL, null=True)
    current_stock = models.DecimalField(max_digits=15, decimal_places=3, default=0.000)
    min_stock_alert = models.DecimalField(max_digits=15, decimal_places=3, default=0.000)
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    selling_price = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    status = models.CharField(max_length=50, default='Active')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class InventoryPurchase(models.Model):
    purchase_number = models.CharField(max_length=100, unique=True, blank=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, related_name='purchases')
    purchase_date = models.DateField()
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class PurchaseItemDetail(models.Model):
    purchase = models.ForeignKey(InventoryPurchase, on_delete=models.CASCADE, related_name='details')
    item = models.ForeignKey(InventoryItemMaster, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2)
    total_amount = models.DecimalField(max_digits=15, decimal_places=2)

class StockTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('Purchase', 'Purchase'),
        ('Issue', 'Issue'),
        ('Return', 'Return'),
        ('Wastage', 'Wastage'),
        ('Adjustment', 'Adjustment'),
        ('Transfer', 'Transfer'),
    )
    transaction_number = models.CharField(max_length=100, unique=True, blank=True)
    item = models.ForeignKey(InventoryItemMaster, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    previous_stock = models.DecimalField(max_digits=15, decimal_places=3)
    updated_stock = models.DecimalField(max_digits=15, decimal_places=3)
    reference_type = models.CharField(max_length=100, blank=True, null=True) # e.g., 'Purchase', 'Issue'
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class InventoryIssue(models.Model):
    DEPARTMENTS = (
        ('Kitchen', 'Kitchen'),
        ('Housekeeping', 'Housekeeping'),
        ('Maintenance', 'Maintenance'),
        ('Front Office', 'Front Office'),
        ('Restaurant', 'Restaurant'),
    )
    issue_number = models.CharField(max_length=100, unique=True, blank=True)
    department = models.CharField(max_length=100, choices=DEPARTMENTS)
    issue_date = models.DateField()
    issued_by = models.CharField(max_length=255)
    received_by = models.CharField(max_length=255)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class IssueItemDetail(models.Model):
    issue = models.ForeignKey(InventoryIssue, on_delete=models.CASCADE, related_name='details')
    item = models.ForeignKey(InventoryItemMaster, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=15, decimal_places=3)

class WastageRecord(models.Model):
    wastage_number = models.CharField(max_length=100, unique=True, blank=True)
    item = models.ForeignKey(InventoryItemMaster, on_delete=models.CASCADE, related_name='wastage_records')
    quantity = models.DecimalField(max_digits=15, decimal_places=3)
    reason = models.CharField(max_length=255)
    recorded_by = models.CharField(max_length=255)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
