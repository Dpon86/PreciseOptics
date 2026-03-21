#!/usr/bin/env python
"""Quick test script to verify referrals API endpoints"""
import requests

endpoints = [
    # Source endpoints
    ('GET', 'api/referrals/sources/', 'List Referral Sources'),
    
    # Referral endpoints
    ('GET', 'api/referrals/', 'List Referrals'),
    ('GET', 'api/referrals/statistics/', 'Referral Statistics'),
    ('GET', 'api/referrals/overdue/', 'Overdue Referrals'),
    
    # Document endpoints
    ('GET', 'api/referrals/documents/', 'List Referral Documents'),
    
    # Response endpoints
    ('GET', 'api/referrals/responses/', 'List Referral Responses'),
]

print("Testing Referrals API Endpoints:")
print("=" * 80)

for method, endpoint, description in endpoints:
    try:
        url = f'http://127.0.0.1:8000/{endpoint}'
        
        if method == 'GET':
            r = requests.get(url)
        elif method == 'POST':
            r = requests.post(url, json={})
            
        status = r.status_code
        
        if status == 200:
            data = r.json()
            if isinstance(data, dict):
                if 'count' in data:
                    count = data.get('count', 0)
                    print(f"✓ {description:40} Status: {status} (Count: {count})")
                else:
                    # Statistics endpoint returns dict without count
                    print(f"✓ {description:40} Status: {status} (Data: {len(data)} fields)")
            elif isinstance(data, list):
                print(f"✓ {description:40} Status: {status} (Items: {len(data)})")
            else:
                print(f"✓ {description:40} Status: {status}")
        elif status == 401:
            print(f"✓ {description:40} Status: {status} (Auth required - API working)")
        elif status == 404:
            print(f"✗ {description:40} Status: {status} (Not Found - Check URL)")
            print(f"  URL: {url}")
        else:
            print(f"✗ {description:40} Status: {status}")
            print(f"  Error: {r.text[:200]}")
    except requests.exceptions.ConnectionError:
        print(f"✗ {description:40} Connection Error - Is server running?")
    except Exception as e:
        print(f"✗ {description:40} Exception: {str(e)[:100]}")

print("=" * 80)
print("Test complete!")
print("\nNote: If you see 401 (Auth required), the API is working correctly.")
print("      Referrals API requires authentication for most endpoints.")
