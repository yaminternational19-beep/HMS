import os
import sys
import django

# Setup Django environment
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.hashers import make_password

if __name__ == "__main__":
    raw_password = input("Enter password to hash: ")
    hashed = make_password(raw_password)
    print("\n--- Hashed Password ---")
    print(hashed)
    print("-----------------------\n")
