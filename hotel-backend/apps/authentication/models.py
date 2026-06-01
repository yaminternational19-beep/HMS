from django.db import models
from core.utils.generate_id import generate_uuid
from django.contrib.auth.hashers import make_password, check_password

class SuperAdmin(models.Model):
    id = models.CharField(primary_key=True, max_length=100, default=generate_uuid, editable=False)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True, max_length=255)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50, default='super_admin')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.name} ({self.email})"
