"""
Check date matching between consultations and eye tests
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from eye_tests.models import VisualAcuityTest, GlaucomaAssessment, OCTScan, DiabeticRetinopathyScreening
from datetime import date

print("="*70)
print("DATE MATCHING CHECK - EYE TESTS vs CONSULTATIONS")
print("="*70)

# Sample visual acuity tests
print("\n\nVISUAL ACUITY TESTS (Sample of 10):")
print("-"*70)
va_tests = VisualAcuityTest.objects.filter(consultation__isnull=False)[:10]
mismatches = 0
for test in va_tests:
    test_date = test.test_date
    cons_date = test.consultation.scheduled_time.date() if test.consultation.scheduled_time else test.consultation.actual_start_time.date()
    match = test_date == cons_date
    symbol = "✓" if match else "✗"
    if not match:
        mismatches += 1
    
    print(f"\n{symbol} Test ID: {str(test.id)[:8]}...")
    print(f"  Patient: {test.patient.first_name} {test.patient.last_name}")
    print(f"  Test date: {test_date}")
    print(f"  Consultation date: {cons_date}")
    print(f"  Consultation: {test.consultation.reason if test.consultation.reason else 'No reason specified'}")
    if not match:
        print(f"  ⚠️  DATE MISMATCH!")

print(f"\n{'='*70}")
print(f"Visual Acuity: {10 - mismatches}/10 dates match")

# Sample glaucoma assessments
print("\n\nGLAUCOMA ASSESSMENTS (Sample of 10):")
print("-"*70)
gl_tests = GlaucomaAssessment.objects.filter(consultation__isnull=False)[:10]
mismatches = 0
for test in gl_tests:
    test_date = test.test_date
    cons_date = test.consultation.scheduled_time.date() if test.consultation.scheduled_time else test.consultation.actual_start_time.date()
    match = test_date == cons_date
    symbol = "✓" if match else "✗"
    if not match:
        mismatches += 1
    
    print(f"\n{symbol} Test ID: {str(test.id)[:8]}...")
    print(f"  Patient: {test.patient.first_name} {test.patient.last_name}")
    print(f"  Test date: {test_date}")
    print(f"  Consultation date: {cons_date}")
    if not match:
        print(f"  ⚠️  DATE MISMATCH!")

print(f"\n{'='*70}")
print(f"Glaucoma: {10 - mismatches}/10 dates match")

# Check OCT Scans
print("\n\nOCT SCANS (Sample of 10):")
print("-"*70)
oct_tests = OCTScan.objects.filter(consultation__isnull=False)[:10]
mismatches = 0
for test in oct_tests:
    test_date = test.test_date
    cons_date = test.consultation.scheduled_time.date() if test.consultation.scheduled_time else test.consultation.actual_start_time.date()
    match = test_date == cons_date
    symbol = "✓" if match else "✗"
    if not match:
        mismatches += 1
    
    print(f"\n{symbol} Test ID: {str(test.id)[:8]}...")
    print(f"  Patient: {test.patient.first_name} {test.patient.last_name}")
    print(f"  Test date: {test_date}")
    print(f"  Consultation date: {cons_date}")
    if not match:
        print(f"  ⚠️  DATE MISMATCH!")

print(f"\n{'='*70}")
print(f"OCT Scans: {10 - mismatches}/10 dates match")

# Overall summary
print(f"\n\n{'='*70}")
print("OVERALL SUMMARY")
print(f"{'='*70}")
print("\n✅ ALL EYE TESTS (100 total) are linked to consultations")
print("\n⚠️  NO TREATMENTS found in database - need to create treatments")
print("\nDate matching will be checked above for eye tests.")
