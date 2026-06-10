from django.db import models

class Shifts(models.Model):
    # Primary Key
    id = models.BigAutoField(primary_key=True)
    
    # Custom Shift Code matching format 'SHF-01', 'SHF-02', etc.
    shift_code = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Unique shift name
    name = models.CharField(max_length=150, unique=True, db_index=True)
    
    # Store shift time interval string (e.g. "07:00 AM - 03:00 PM")
    time = models.CharField(max_length=100)
    
    # Store UI icon visual accent type (e.g. "sun", "sunset", "moon", "briefcase", "clock")
    icon = models.CharField(max_length=50, default='clock')
    
    # Store UI visual theme accent color (e.g. "blue", "orange", "indigo", "purple", "rose", "emerald")
    color = models.CharField(max_length=50, default='purple')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Shifts'  # Explicitly sets the MySQL table name matching the class name

    def __str__(self):
        return f"{self.name} ({self.id})"
