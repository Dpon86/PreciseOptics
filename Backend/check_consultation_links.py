"""
Check consultation links for treatments and eye tests
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from treatments.models import Treatment
from eye_tests.models import (
    VisualAcuityTest, GlaucomaAssessment, RefractionTest,
    CataractAssessment, VisualFieldTest, OCTScan, DiabeticRetinopathyScreening
)
from consultations.models import Consultation

print("="*70)
print("TREATMENTS ANALYSIS")
print("="*70)

treatments = Treatment.objects.all()
print(f"\nTotal treatments: {treatments.count()}")

treatments_with_consultation = treatments.filter(consultation__isnull=False)
treatments_without_consultation = treatments.filter(consultation__isnull=True)

print(f"Treatments WITH consultation: {treatments_with_consultation.count()}")
print(f"Treatments WITHOUT consultation: {treatments_without_consultation.count()}")

if treatments_without_consultation.exists():
    print("\nTreatments missing consultations:")
    for t in treatments_without_consultation[:10]:
        print(f"  - ID: {t.id}")
        print(f"    Patient: {t.patient.first_name} {t.patient.last_name}")
        print(f"    Type: {t.treatment_type}")
        date = t.actual_start_time.date() if t.actual_start_time else t.scheduled_date
        print(f"    Date: {date}")
        print()

print("\n" + "="*70)
print("EYE TESTS ANALYSIS")
print("="*70)

test_models = [
    ('Visual Acuity', VisualAcuityTest),
    ('Glaucoma Assessment', GlaucomaAssessment),
    ('Refraction', RefractionTest),
    ('Cataract Assessment', CataractAssessment),
    ('Visual Field', VisualFieldTest),
    ('OCT Scan', OCTScan),
    ('Diabetic Retinopathy', DiabeticRetinopathyScreening),
]

total_tests = 0
total_with_consultation = 0
total_without_consultation = 0

for test_name, TestModel in test_models:
    tests = TestModel.objects.all()
    with_cons = tests.filter(consultation__isnull=False).count()
    without_cons = tests.filter(consultation__isnull=True).count()
    
    total_tests += tests.count()
    total_with_consultation += with_cons
    total_without_consultation += without_cons
    
    print(f"\n{test_name}:")
    print(f"  Total: {tests.count()}")
    print(f"  With consultation: {with_cons}")
    print(f"  Without consultation: {without_cons}")

print(f"\n{'='*70}")
print(f"SUMMARY - ALL EYE TESTS:")
print(f"  Total tests: {total_tests}")
print(f"  With consultation: {total_with_consultation}")
print(f"  Without consultation: {total_without_consultation}")

print(f"\n{'='*70}")
print("CONSULTATION SUMMARY")
print(f"{'='*70}")
consultations = Consultation.objects.all()
print(f"Total consultations in database: {consultations.count()}")

# Check date matching for a sample
print(f"\n{'='*70}")
print("SAMPLE DATE MATCHING CHECK")
print(f"{'='*70}")

sample_treatments = Treatment.objects.filter(consultation__isnull=False)[:5]
for t in sample_treatments:
    t_date = t.actual_start_time.date() if t.actual_start_time else t.scheduled_date
    c_date = t.consultation.scheduled_time.date() if t.consultation.scheduled_time else t.consultation.actual_start_time.date()
    match = "✓ MATCH" if t_date == c_date else "✗ MISMATCH"
    print(f"\nTreatment: {t.treatment_type}")
    print(f"  Treatment date: {t_date}")
    print(f"  Consultation date: {c_date}")
    print(f"  Patient: {t.patient.first_name} {t.patient.last_name}")
    print(f"  {match}")
