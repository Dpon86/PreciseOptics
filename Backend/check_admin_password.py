#!/usr/bin/env python
"""Check admin user password"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from accounts.models import CustomUser

print("=== Checking Admin User ===")
try:
    admin = CustomUser.objects.get(username='admin')
    print(f"✓ Admin user found: {admin.username}")
    print(f"  Email: {admin.email}")
    print(f"  Staff: {admin.is_staff}")
    print(f"  Superuser: {admin.is_superuser}")
    print(f"  Active: {admin.is_active}")
    
    print("\n=== Testing Passwords ===")
    passwords = ['admin123', 'password123', 'admin', 'Admin123', 'Password123']
    for pwd in passwords:
        result = admin.check_password(pwd)
        print(f"  {pwd}: {'✓ CORRECT' if result else '✗ wrong'}")
    
    # Check if password is set
    print(f"\n=== Password Hash ===")
    print(f"  Has password set: {bool(admin.password)}")
    print(f"  Password hash starts with: {admin.password[:20]}...")
    
except CustomUser.DoesNotExist:
    print("✗ Admin user NOT found")
    print("\nAvailable users:")
    for user in CustomUser.objects.all()[:10]:
        print(f"  - {user.username}")
