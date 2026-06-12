from django.db import models

class InventoryCategory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class InventoryItem(models.Model):
    category = models.ForeignKey(InventoryCategory, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unit = models.CharField(max_length=50) # e.g., Kg, Litre, Piece
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
