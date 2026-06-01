from django.db import models

# Create your models here.

class Rooms(models.Model):
    # Explicit Big Auto-increment Primary Key field for database optimization
    id = models.BigAutoField(primary_key=True)
    
    # Globally unique Room Number with indexing ensures Room numbers cannot be duplicated across any floor
    room_number = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Indexing frequent search/filter fields for highly optimal query retrieval times
    floor = models.CharField(max_length=100, db_index=True)
    room_type = models.CharField(max_length=150, db_index=True)
    bed_type = models.CharField(max_length=100)
    
    capacity = models.IntegerField(default=2)
    price = models.FloatField(default=0.0)
    status = models.CharField(max_length=100, default='available', db_index=True)
    
    # JSON fields for native arrays of strings (matching React arrays 100%)
    amenities = models.JSONField(default=list)
    images = models.JSONField(default=list)  # Renamed from media_assets to match React's 'images' field name perfectly
    
    description = models.TextField(blank=True, default='')  # Renamed from promotional_description to match React's 'description' field name
    last_cleaned = models.CharField(max_length=100, default='Just registered', blank=True, null=True)  # Missing field added to track housekeeping status
    
    # Tracking fields: Who updated the room status last (role and unique ID)
    status_updated_by_role = models.CharField(max_length=50, blank=True, null=True)
    status_updated_by_id = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'Rooms'  # Sets the database table name exactly as the class name, avoiding folder prefixes
        
    def __str__(self):
        return f"Room {self.room_number} - {self.room_type}"