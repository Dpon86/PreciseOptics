#!/usr/bin/env python
import os
import sys
import django
from django.core.management import call_command

# Setup Django with MySQL settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

def import_data():
    print("Importing data into MySQL database...")
    
    # Run migrations first
    print("Running migrations...")
    call_command('migrate')
    
    # Import data in correct order
    apps_to_import = [
        'accounts',
        'patients',
        'consultations', 
        'medications',
        'eye_tests',
        'audit'
    ]
    
    for app in apps_to_import:
        fixture_file = f'fixtures/{app}_data.json'
        if os.path.exists(fixture_file):
            print(f"Loading {app} data...")
            call_command('loaddata', fixture_file)
        else:
            print(f"Fixture file {fixture_file} not found, skipping...")
    
    print("Import completed!")

if __name__ == '__main__':
    import_data()
