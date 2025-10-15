#!/usr/bin/env python
"""
Simple script to show eye test data samples
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from eye_tests.models import VisualAcuityTest, RefractionTest, CataractAssessment

def main():
    print("=== Eye Test Data Sample ===")
    
    # Visual Acuity Tests
    print("\nVisual Acuity Tests:")
    va_tests = VisualAcuityTest.objects.select_related('patient')[:3]
    for test in va_tests:
        print(f"  • Patient: {test.patient.first_name} {test.patient.last_name}")
        print(f"    Date: {test.test_date.strftime('%Y-%m-%d')}")
        print(f"    Right Eye: {test.right_eye_unaided} | Left Eye: {test.left_eye_unaided}")
        print()
    
    # Refraction Tests
    print("Refraction Tests:")
    ref_tests = RefractionTest.objects.select_related('patient')[:3]
    for test in ref_tests:
        print(f"  • Patient: {test.patient.first_name} {test.patient.last_name}")
        print(f"    Date: {test.test_date.strftime('%Y-%m-%d')}")
        print(f"    Right Sphere: {test.right_sphere} | Left Sphere: {test.left_sphere}")
        print()
    
    # Summary
    print("=== Summary ===")
    print(f"Visual Acuity Tests: {VisualAcuityTest.objects.count()}")
    print(f"Refraction Tests: {RefractionTest.objects.count()}")
    print(f"Cataract Assessments: {CataractAssessment.objects.count()}")
    
    total_tests = (VisualAcuityTest.objects.count() + 
                   RefractionTest.objects.count() + 
                   CataractAssessment.objects.count())
    print(f"Total Eye Tests: {total_tests}")

if __name__ == '__main__':
    main()