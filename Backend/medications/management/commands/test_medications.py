from django.core.management.base import BaseCommand
from medications.models import Medication

class Command(BaseCommand):
    help = 'Test the medications API by checking model fields'
    
    def handle(self, *args, **options):
        # Check what fields are available in Medication model
        medication_fields = [f.name for f in Medication._meta.fields]
        self.stdout.write(f"Available Medication fields: {medication_fields}")
        
        # Try to query medications
        try:
            medications = Medication.objects.filter(approval_status=True)
            self.stdout.write(f"Found {medications.count()} approved medications")
            
            # Create a test medication if none exist
            if medications.count() == 0:
                test_med = Medication.objects.create(
                    name="Test Eye Drop",
                    generic_name="test_compound",
                    brand_names="TestBrand",
                    medication_type="eye_drop",
                    therapeutic_class="antibiotic",
                    strength="0.5%",
                    active_ingredients="Test ingredient",
                    description="Test medication for API testing",
                    indications="Test condition",
                    contraindications="None for testing",
                    side_effects="Minimal for testing",
                    standard_dosage="1 drop twice daily",
                    storage_temperature="Room temperature",
                    shelf_life_months=24,
                    manufacturer="Test Pharma",
                    approval_status=True,
                    current_stock=100,
                    minimum_stock_level=10,
                    unit_price=15.99
                )
                self.stdout.write(f"Created test medication: {test_med}")
            
        except Exception as e:
            self.stdout.write(f"Error: {e}")