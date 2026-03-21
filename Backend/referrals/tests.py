"""
Tests for referrals app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from patients.models import Patient
from .models import ReferralSource, Referral, ReferralDocument, ReferralResponse
from datetime import date

User = get_user_model()


class ReferralSourceModelTest(TestCase):
    """Test ReferralSource model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.source = ReferralSource.objects.create(
            name='St. Mary\'s Eye Hospital',
            source_type='hospital',
            email='contact@stmarys.com',
            phone='+441234567890',
            created_by=self.user
        )
    
    def test_source_creation(self):
        """Test that referral source is created correctly"""
        self.assertEqual(self.source.name, 'St. Mary\'s Eye Hospital')
        self.assertEqual(self.source.source_type, 'hospital')
        self.assertTrue(self.source.is_active)
        self.assertFalse(self.source.is_preferred)
    
    def test_source_str(self):
        """Test string representation"""
        self.assertEqual(str(self.source), "St. Mary's Eye Hospital (Hospital)")


class ReferralModelTest(TestCase):
    """Test Referral model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.patient = Patient.objects.create(
            first_name='John',
            last_name='Doe',
            date_of_birth=date(1960, 1, 1),
            patient_id='PAT001',
            created_by=self.user
        )
        
        self.source = ReferralSource.objects.create(
            name='Specialist Clinic',
            source_type='clinic',
            created_by=self.user
        )
        
        self.referral = Referral.objects.create(
            patient=self.patient,
            referral_source=self.source,
            direction='outgoing',
            reason='specialist_opinion',
            urgency='routine',
            clinical_summary='Patient requires specialist opinion',
            referral_date=date.today(),
            referred_by=self.user,
            created_by=self.user
        )
    
    def test_referral_creation(self):
        """Test that referral is created correctly"""
        self.assertEqual(self.referral.patient, self.patient)
        self.assertEqual(self.referral.referral_source, self.source)
        self.assertEqual(self.referral.direction, 'outgoing')
        self.assertEqual(self.referral.current_status, 'draft')
        self.assertTrue(self.referral.is_active)
    
    def test_referral_number_auto_generation(self):
        """Test that referral number is auto-generated"""
        self.assertIsNotNone(self.referral.referral_number)
        self.assertTrue(self.referral.referral_number.startswith('REF-'))
    
    def test_referral_str(self):
        """Test string representation"""
        self.assertIn(self.referral.referral_number, str(self.referral))


# Add more tests for ReferralDocument and ReferralResponse as needed
