"""
Script to consolidate medications by removing batch duplicates
Keep only one medication per drug (without batch numbers)
"""
import os
import django
import re

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from medications.models import Medication
from collections import defaultdict

def consolidate_medications():
    """Remove duplicate batches and keep one clean medication per drug"""
    medications = Medication.objects.all()
    
    print(f"Found {medications.count()} medications")
    print("\nConsolidating medications...\n")
    
    # Group medications by base name (without batch number)
    medication_groups = defaultdict(list)
    
    for med in medications:
        # Extract base name (remove batch number)
        base_name = re.sub(r'\s*\(Batch\s+\d+\)\s*', '', med.name)
        medication_groups[base_name].append(med)
    
    print(f"Found {len(medication_groups)} unique medications\n")
    
    kept_count = 0
    deleted_count = 0
    
    for base_name, meds in medication_groups.items():
        if len(meds) == 1:
            # Only one medication, just clean the name
            med = meds[0]
            if '(Batch' in med.name:
                old_name = med.name
                med.name = base_name
                med.save()
                print(f"✓ Cleaned: '{old_name}' → '{base_name}'")
            else:
                print(f"  Kept: '{med.name}' (already clean)")
            kept_count += 1
        else:
            # Multiple batches - keep the first one, delete the rest
            # Keep the one with lowest batch number
            meds.sort(key=lambda m: m.name)
            
            keeper = meds[0]
            keeper.name = base_name
            # Combine stock levels
            total_stock = sum(m.current_stock for m in meds)
            keeper.current_stock = total_stock
            keeper.save()
            
            print(f"✓ Kept: '{base_name}' (stock: {total_stock})")
            kept_count += 1
            
            # Delete duplicates
            for med in meds[1:]:
                print(f"  × Deleted: '{med.name}' (ID: {med.id})")
                med.delete()
                deleted_count += 1
    
    print(f"\n{'='*60}")
    print(f"✅ Consolidation complete!")
    print(f"📊 Medications kept: {kept_count}")
    print(f"🗑️  Duplicate batches deleted: {deleted_count}")
    print(f"📋 Total medications now: {Medication.objects.count()}")
    
    # Show final list
    print(f"\n{'='*60}")
    print("📋 Final Medication List:")
    print(f"{'='*60}\n")
    for med in Medication.objects.all().order_by('name'):
        print(f"  • {med.name}")
        print(f"    Generic: {med.generic_name}")
        print(f"    Strength: {med.strength}")
        print(f"    Stock: {med.current_stock} units")
        print(f"    Price: £{med.unit_price}")
        print()

if __name__ == '__main__':
    consolidate_medications()
