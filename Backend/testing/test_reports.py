#!/usr/bin/env python3
"""
Simple test script to verify report endpoints are working
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.insert(0, '/c/Users/user/Documents/GitHub/PreciseOptics/Backend')

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

# Now we can import Django models and test
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from reports.views import drug_audit_report
from accounts.models import CustomUser

def test_drug_audit_report():
    """Test the drug audit report endpoint"""
    try:
        # Create a mock request
        factory = RequestFactory()
        request = factory.get('/api/reports/drug-audit/')
        
        # Create or get a test user
        try:
            user = CustomUser.objects.filter(is_superuser=True).first()
            if not user:
                user = CustomUser.objects.create_user(
                    username='testuser',
                    email='test@example.com',
                    password='testpass123',
                    is_superuser=True
                )
        except Exception as e:
            print(f"Error creating/getting user: {e}")
            return False
            
        request.user = user
        
        # Call the view
        response = drug_audit_report(request)
        
        print(f"Drug Audit Report Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Drug audit report endpoint working!")
            return True
        else:
            print(f"❌ Drug audit report failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing drug audit report: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("Testing Report Endpoints...")
    print("=" * 50)
    
    success = test_drug_audit_report()
    
    if success:
        print("\n✅ All tests passed! Report endpoints are working.")
    else:
        print("\n❌ Some tests failed. Check the errors above.")