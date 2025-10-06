from django.core.management.base import BaseCommand
from django.test import Client
from django.urls import reverse
import json

class Command(BaseCommand):
    help = 'Test the medications API endpoint directly'
    
    def handle(self, *args, **options):
        client = Client()
        
        try:
            # Test the medications API endpoint
            response = client.get('/api/medications/')
            self.stdout.write(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                data = json.loads(response.content)
                self.stdout.write(f"Response: {data}")
            else:
                self.stdout.write(f"Error: {response.content}")
                
        except Exception as e:
            self.stdout.write(f"Exception: {e}")
            import traceback
            traceback.print_exc()