"""
Tests for conditions app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from patients.models import Patient
from .models import MedicalCondition, PatientCondition, ConditionProgress
from datetime import date

User = get_user_model()


class MedicalConditionModelTest(TestCase):
    """Test MedicalCondition model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.condition = MedicalCondition.objects.create(
            code='AMD',
            name='Age-Related Macular Degeneration',
            category='retinal',
            description='Degenerative eye condition.',
            symptoms='Blurred central vision.',
            risk_factors='Age, smoking.',
            typical_progression='Gradual loss of central vision.',
            standard_treatments='Anti-VEGF injections.',
            prognosis='Manageable with treatment.',
            created_by=self.user
        )

    def test_condition_creation(self):
        self.assertEqual(self.condition.code, 'AMD')
        self.assertEqual(self.condition.category, 'retinal')
        self.assertTrue(self.condition.is_active)

    def test_condition_str(self):
        self.assertIn('AMD', str(self.condition))


class PatientConditionModelTest(TestCase):
    """Test PatientCondition model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.patient = Patient.objects.create(
            first_name='Jane',
            last_name='Smith',
            date_of_birth=date(1950, 6, 15),
            patient_id='PAT002',
            created_by=self.user
        )
        self.condition = MedicalCondition.objects.create(
            code='GLAUCOMA',
            name='Glaucoma',
            category='glaucoma',
            description='Optic nerve damage.',
            symptoms='Peripheral vision loss.',
            risk_factors='High IOP, age.',
            typical_progression='Slow progressive vision loss.',
            standard_treatments='Eye drops, surgery.',
            prognosis='Manageable if caught early.',
            created_by=self.user
        )
        self.patient_condition = PatientCondition.objects.create(
            patient=self.patient,
            condition=self.condition,
            severity='moderate',
            eye_affected='both',
            current_status='active',
            diagnosis_date=date.today(),
            diagnosed_by=self.user,
            created_by=self.user
        )

    def test_patient_condition_creation(self):
        self.assertEqual(self.patient_condition.patient, self.patient)
        self.assertEqual(self.patient_condition.condition, self.condition)
        self.assertEqual(self.patient_condition.severity, 'moderate')
        self.assertTrue(self.patient_condition.is_active)

    def test_patient_condition_str(self):
        result = str(self.patient_condition)
        self.assertIn('Jane', result)


class ConditionAPITest(TestCase):
    """Test Conditions API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.condition = MedicalCondition.objects.create(
            code='RVO',
            name='Retinal Vein Occlusion',
            category='vascular',
            description='Blockage of retinal veins.',
            symptoms='Sudden vision loss.',
            risk_factors='High blood pressure.',
            typical_progression='Variable.',
            standard_treatments='Anti-VEGF, laser.',
            prognosis='Depends on severity.',
            created_by=self.user
        )

    def test_list_conditions(self):
        response = self.client.get('/api/conditions/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_condition_detail(self):
        response = self.client.get(f'/api/conditions/{self.condition.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'RVO')

    def test_condition_statistics(self):
        response = self.client.get('/api/conditions/statistics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_condition_prevalence(self):
        response = self.client.get('/api/conditions/prevalence/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
