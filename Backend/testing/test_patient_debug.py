#!/usr/bin/env python
"""
Test script to debug patient creation issues
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from patients.serializers import PatientCreateSerializer
from patients.models import Patient

def test_patient_creation():
    """Test patient serializer with minimal valid data"""
    
    # Test data with all required fields
    test_data = {
        'first_name': 'John',
        'last_name': 'Doe',
        'date_of_birth': '1990-01-15',
        'gender': 'M',
        'phone_number': '+1234567890',
        'address_line_1': '123 Main St',
        'city': 'London',
        'state': 'England', 
        'postal_code': 'SW1A 1AA',
        'country': 'UK',
        'emergency_contact_name': 'Jane Doe',
        'emergency_contact_relationship': 'Spouse',
        'emergency_contact_phone': '+1234567891'
    }
    
    print("Testing PatientCreateSerializer...")
    print("Test data:", test_data)
    
    serializer = PatientCreateSerializer(data=test_data)
    
    if serializer.is_valid():
        print("✅ Serializer is valid!")
        try:
            patient = serializer.save()
            print(f"✅ Patient created successfully: {patient}")
            return True
        except Exception as e:
            print(f"❌ Error saving patient: {e}")
            return False
    else:
        print("❌ Serializer validation failed!")
        print("Errors:", serializer.errors)
        return False

def check_model_fields():
    """Check what fields actually exist on the Patient model"""
    print("\nChecking Patient model fields...")
    patient_fields = [f.name for f in Patient._meta.get_fields()]
    print("Available fields:", sorted(patient_fields))
    
    # Check for address fields specifically
    address_fields = [f for f in patient_fields if 'address' in f.lower()]
    print("Address-related fields:", address_fields)

if __name__ == "__main__":
    print("=== Patient Creation Debug Test ===")
    check_model_fields()
    print("\n" + "="*50)
    test_patient_creation()