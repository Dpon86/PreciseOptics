"""
Simple test to populate database step by step
"""
import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from patients.models import Patient, PatientVisit
from accounts.models import CustomUser
from django.utils import timezone
from datetime import timedelta
import random

# Get patients and staff
patients = list(Patient.objects.all())
all_staff = list(CustomUser.objects.filter(user_type__in=['doctor', 'nurse']))

print(f"Found {len(patients)} patients and {len(all_staff)} staff members")

if patients and all_staff:
    try:
        patient = patients[0]
        staff = all_staff[0]
        
        visit = PatientVisit.objects.create(
            patient=patient,
            scheduled_date=timezone.now(),
            visit_type='consultation',
            primary_doctor=staff,
            chief_complaint='Test complaint',
            status='scheduled'
        )
        print(f"Created visit: {visit}")
        
        # Check visits count
        print(f"Total visits: {PatientVisit.objects.count()}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No patients or staff found!")