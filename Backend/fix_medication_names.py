"""
Script to remove batch numbers from medication names
"""
import os
import django
import re

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from medications.models import Medication

def fix_medication_names():
    """Remove batch numbers from medication names"""
    medications = Medication.objects.all()
    
    print(f"Found {medications.count()} medications")
    print("\nFixing medication names...\n")
    
    updated_count = 0
    
    for med in medications:
        old_name = med.name
        
        # Remove "(Batch X)" pattern from name
        new_name = re.sub(r'\s*\(Batch\s+\d+\)\s*', '', old_name)
        
        if new_name != old_name:
            med.name = new_name
            med.save()
            updated_count += 1
            print(f"✓ Updated: '{old_name}' → '{new_name}'")
        else:
            print(f"  Skipped: '{old_name}' (already clean)")
    
    print(f"\n✅ Fixed {updated_count} medication names")
    print(f"📊 Total medications: {medications.count()}")
    
    # Show sample of updated names
    print("\n📋 Sample of current medication names:")
    for med in Medication.objects.all()[:10]:
        print(f"  • {med.name} ({med.generic_name}) - {med.strength}")

if __name__ == '__main__':
    fix_medication_names()
