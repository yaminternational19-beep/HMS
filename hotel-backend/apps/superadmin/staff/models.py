from django.db import models
from apps.superadmin.shifts.models import Shifts

class Staff(models.Model):
    # Primary Key matching format 'STF-01', 'STF-02', etc.
    id = models.CharField(primary_key=True, max_length=100, unique=True, db_index=True)
    
    # 8-digit unique code generated dynamically (e.g. '29384756')
    uniqueCode = models.CharField(max_length=50, unique=True, db_index=True)
    
    # Staff Personal Details
    name = models.CharField(max_length=255)
    dept = models.CharField(max_length=150, db_index=True)  # Roster Title Role
    password = models.CharField(max_length=255, null=True, blank=True)  # Required conditionally for Front Office/Maintenance
    email = models.CharField(max_length=255, null=True, blank=True)
    
    # Contact and emergency details with country codes
    phoneCountry = models.CharField(max_length=10)
    phoneNo = models.CharField(max_length=50)
    emergencyCountry = models.CharField(max_length=10)
    emergencyNo = models.CharField(max_length=50)
    
    # Roster Shift relation
    shift = models.ForeignKey(Shifts, on_delete=models.PROTECT, related_name='staff_members')
    
    # System Status & Verification
    status = models.CharField(max_length=50, default='active', db_index=True)  # active, on-leave
    isCheckedIn = models.BooleanField(default=False)
    address = models.TextField()
    
    # Government Verification scans
    govtProofType = models.CharField(max_length=100)
    govtProofId = models.CharField(max_length=100)
    govtProofFileName = models.CharField(max_length=255, null=True, blank=True)
    govtProofFileUrl = models.TextField(null=True, blank=True)
    
    # User Profile Avatar upload
    profileFileName = models.CharField(max_length=255, null=True, blank=True)
    profileFileUrl = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Staff'

    def __str__(self):
        return f"{self.name} ({self.id}) - {self.dept}"
