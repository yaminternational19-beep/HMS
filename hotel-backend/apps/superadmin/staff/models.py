from django.db import models
from apps.superadmin.shifts.models import Shifts

class Staff(models.Model):
    # Primary Key
    id = models.BigAutoField(primary_key=True)
    
    # Primary Key matching format 'STF-01', 'STF-02', etc.
    staff_code = models.CharField(max_length=100, unique=True, db_index=True)
    
    # 8-digit unique code generated dynamically (e.g. '29384756')
    unique_code = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Staff Personal Details
    name = models.CharField(max_length=255)
    dept = models.CharField(max_length=150, db_index=True)  # Roster Title Role
    password = models.CharField(max_length=255, null=True, blank=True)  # Required conditionally for Front Office/Maintenance
    email = models.CharField(max_length=255, null=True, blank=True)
    
    # Contact and emergency details with country codes
    phone_country = models.CharField(max_length=10)
    phone_no = models.CharField(max_length=50)
    emergency_country = models.CharField(max_length=10)
    emergency_no = models.CharField(max_length=50)
    
    # Roster Shift relation
    shift = models.ForeignKey(Shifts, on_delete=models.PROTECT, related_name='staff_members')
    
    # System Status & Verification
    status = models.CharField(max_length=50, default='active', db_index=True)  # active, on-leave
    is_checked_in = models.BooleanField(default=False)
    address = models.TextField()
    
    # Government Verification scans
    govt_proof_type = models.CharField(max_length=100)
    govt_proof_id = models.CharField(max_length=100)
    govt_proof_file_name = models.CharField(max_length=255, null=True, blank=True)
    govt_proof_file_url = models.TextField(null=True, blank=True)
    
    # User Profile Avatar upload
    profile_file_name = models.CharField(max_length=255, null=True, blank=True)
    profile_file_url = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Staff'

    def __str__(self):
        return f"{self.name} ({self.staff_code}) - {self.dept}"


class StaffLog(models.Model):
    id = models.AutoField(primary_key=True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=50) # 'login' or 'logout'
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'StaffLog'

    def __str__(self):
        return f"{self.staff.name} - {self.action} @ {self.timestamp}"
