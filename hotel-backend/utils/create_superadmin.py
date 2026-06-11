import os
import sys
import django

# Setup Django environment
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.authentication.models import SuperAdmin

# ==========================================
# EDIT THESE CREDENTIALS BEFORE RUNNING
# ==========================================
SUPERADMIN_NAME = "Super Admin"
SUPERADMIN_EMAIL = "praveenreddy@blackcube.ae"
SUPERADMIN_PASSWORD = "admin123"
# ==========================================

def create_superadmin():
    print(f"Checking if SuperAdmin with email '{SUPERADMIN_EMAIL}' exists...")
    
    if SuperAdmin.objects.filter(email=SUPERADMIN_EMAIL).exists():
        print(f"[-] SuperAdmin with email '{SUPERADMIN_EMAIL}' already exists!")
        return

    print(f"[+] Creating new SuperAdmin: {SUPERADMIN_NAME}")
    try:
        admin = SuperAdmin(
            name=SUPERADMIN_NAME,
            email=SUPERADMIN_EMAIL,
            role="super_admin",
            is_active=True
        )
        # set_password automatically hashes the raw password
        admin.set_password(SUPERADMIN_PASSWORD)
        admin.save()
        print(f"[SUCCESS] SuperAdmin '{SUPERADMIN_EMAIL}' created successfully!")
        
    except Exception as e:
        print(f"[ERROR] Failed to create SuperAdmin: {e}")

if __name__ == "__main__":
    create_superadmin()
