import os, sys, django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from django.db import transaction
from patients.models import Patient, PatientVisit
from medications.models import Medication, Prescription
from consultations.models import Consultation, VitalSigns
from eye_tests.models import VisualAcuityTest, GlaucomaAssessment, OCTScan, DiabeticRetinopathyScreening
from conditions.models import PatientCondition

print("Clearing test data...")

with transaction.atomic():
    # Delete in reverse order of dependencies
    print("Deleting eye tests...")
    VisualAcuityTest.objects.all().delete()
    GlaucomaAssessment.objects.all().delete()
    OCTScan.objects.all().delete()
    DiabeticRetinopathyScreening.objects.all().delete()
    
    print("Deleting consultations and vital signs...")
    VitalSigns.objects.all().delete()
    Consultation.objects.all().delete()
    
    print("Deleting prescriptions...")
    Prescription.objects.all().delete()
    
    print("Deleting visits...")
    PatientVisit.objects.all().delete()
    
    print("Deleting patient conditions...")
    PatientCondition.objects.all().delete()
    
    print("Deleting patients...")
    Patient.objects.all().delete()
    
    print("Deleting medications...")
    Medication.objects.all().delete()

print("✅ Test data cleared successfully!")
