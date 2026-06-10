import os
import sys
import django
from pathlib import Path

# Setup Django environment so it can read settings and .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import cloudinary
from cloudinary.api import ping
from django.conf import settings

def test_cloudinary_connection():
    print("Testing Cloudinary Configuration...")
    print(f"Configured Cloud Name: {settings.CLOUDINARY_STORAGE.get('CLOUD_NAME')}")
    
    try:
        # Check basic connection to Cloudinary API
        response = ping()
        print("\n✅ Connection successful!")
        print(f"Response from Cloudinary: {response}")
        
    except Exception as e:
        print("\n❌ Cloudinary connection failed!")
        print(f"Error: {e}")
        print("\nPlease make sure you have replaced YOUR_CLOUD_NAME, YOUR_API_KEY, and YOUR_API_SECRET in the .env file with your actual Cloudinary credentials.")

if __name__ == '__main__':
    test_cloudinary_connection()
