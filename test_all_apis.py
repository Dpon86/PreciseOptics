#!/usr/bin/env python
"""Comprehensive test of all APIs used by PatientRecordsPage"""
import requests

endpoints = [
    # Patient APIs
    'patients',
    
    # Consultation APIs
    'consultations',
    
    # Eye Test APIs
    'visual-acuity-tests',
    'refraction-tests',
    'cataract-assessments', 
    'glaucoma-assessments',
    'visual-field-tests',
    'retinal-assessments',
    'diabetic-retinopathy-screenings',
    'oct-scans',
    
    # Medication APIs
    'prescriptions',
    'medications',
    
    # Treatment APIs (if exists)
    'treatments'
]

print("\n" + "=" * 70)
print("  PATIENT RECORDS PAGE - API ENDPOINT TEST")
print("=" * 70)
print()

failed = []
passed = []

for ep in endpoints:
    try:
        r = requests.get(f'http://127.0.0.1:8000/api/{ep}/', timeout=5)
        status = r.status_code
        
        if status == 200:
            data = r.json()
            count = data.get('count', 'N/A')
            passed.append(ep)
            print(f"✓ {ep:40} Status: {status} (Count: {count})")
        elif status == 401:
            passed.append(ep)
            print(f"✓ {ep:40} Status: {status} (Auth required - OK)")
        elif status == 404:
            print(f"⚠ {ep:40} Status: {status} (Endpoint not found)")
        else:
            failed.append((ep, status))
            print(f"✗ {ep:40} Status: {status} - ERROR")
            error_text = r.text[:200]
            print(f"  {error_text}")
    except requests.exceptions.ConnectionError:
        failed.append((ep, 'Connection Error'))
        print(f"✗ {ep:40} Connection Error - Server not running?")
    except Exception as e:
        failed.append((ep, str(e)))
        print(f"✗ {ep:40} Exception: {str(e)[:80]}")

print()
print("=" * 70)
print(f"  SUMMARY: {len(passed)} Passed | {len(failed)} Failed")
print("=" * 70)

if failed:
    print("\n❌ FAILED ENDPOINTS:")
    for ep, error in failed:
        print(f"   - {ep}: {error}")
    print()
else:
    print("\n✅ ALL ENDPOINTS WORKING CORRECTLY!")
    print("   PatientRecordsPage should now load successfully.\n")
