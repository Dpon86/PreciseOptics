#!/usr/bin/env python
"""Quick test script to verify eye test API endpoints"""
import requests

endpoints = [
    'refraction-tests',
    'cataract-assessments', 
    'glaucoma-assessments',
    'visual-field-tests',
    'retinal-assessments',
    'visual-acuity-tests',
    'diabetic-retinopathy-screenings',
    'oct-scans'
]

print("Testing Eye Test API Endpoints:")
print("=" * 60)

for ep in endpoints:
    try:
        r = requests.get(f'http://127.0.0.1:8000/api/{ep}/')
        status = r.status_code
        
        if status == 200:
            data = r.json()
            count = data.get('count', 0)
            print(f"✓ {ep:40} Status: {status} (Count: {count})")
        elif status == 401:
            print(f"✓ {ep:40} Status: {status} (Auth required - API working)")
        else:
            print(f"✗ {ep:40} Status: {status}")
            print(f"  Error: {r.text[:200]}")
    except Exception as e:
        print(f"✗ {ep:40} Exception: {str(e)[:100]}")

print("=" * 60)
print("Test complete!")
