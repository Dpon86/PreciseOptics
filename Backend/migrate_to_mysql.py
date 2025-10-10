#!/usr/bin/env python
"""
Script to migrate data from SQLite to MySQL
This script will export data from SQLite and prepare it for MySQL import
"""
import os
import sys
import django
import json
from django.core.management import call_command
from django.db import connections
from django.conf import settings

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

def export_sqlite_data():
    """Export all data from SQLite database to fixtures"""
    print("Exporting SQLite data to fixtures...")
    
    # Create fixtures directory
    fixtures_dir = os.path.join(os.path.dirname(__file__), 'fixtures')
    os.makedirs(fixtures_dir, exist_ok=True)
    
    # Apps to export (in order to maintain relationships)
    apps_to_export = [
        'accounts',
        'patients', 
        'consultations',
        'medications',
        'eye_tests',
        'audit'
    ]
    
    for app in apps_to_export:
        fixture_file = os.path.join(fixtures_dir, f'{app}_data.json')
        print(f"Exporting {app} data...")
        
        with open(fixture_file, 'w') as f:
            call_command('dumpdata', app, format='json', indent=2, stdout=f)
        
        print(f"  Saved to {fixture_file}")
    
    print("Export completed!")

def create_mysql_import_script():
    """Create a script to import data into MySQL"""
    script_content = """#!/usr/bin/env python
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
"""
    
    with open('import_to_mysql.py', 'w') as f:
        f.write(script_content)
    
    print("Created import_to_mysql.py script")

def main():
    print("=== SQLite to MySQL Migration Tool ===")
    print("This script will help you migrate your data from SQLite to MySQL")
    print()
    
    # Check current database
    db_engine = settings.DATABASES['default']['ENGINE']
    print(f"Current database engine: {db_engine}")
    
    if 'sqlite' not in db_engine:
        print("Warning: Current database is not SQLite")
        return
    
    # Export data
    export_sqlite_data()
    
    # Create import script
    create_mysql_import_script()
    
    print()
    print("=== Next Steps ===")
    print("1. Install and configure MySQL Server")
    print("2. Create a database called 'precise_optics_db'")
    print("3. Update your environment variables for MySQL connection")
    print("4. Run: python import_to_mysql.py")
    print("5. Connect MySQL Workbench using the credentials")

if __name__ == '__main__':
    main()