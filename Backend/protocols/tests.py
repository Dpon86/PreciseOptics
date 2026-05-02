"""
Tests for protocols app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from conditions.models import MedicalCondition
from .models import TreatmentProtocol
from datetime import date

User = get_user_model()


def create_test_condition(user):
    """Helper to create a test medical condition."""
    return MedicalCondition.objects.create(
        code='AMD_TEST',
        name='AMD (Test)',
        category='retinal',
        description='Test condition.',
        symptoms='Vision loss.',
        risk_factors='Age.',
        typical_progression='Gradual.',
        standard_treatments='Injections.',
        prognosis='Manageable.',
        created_by=user
    )


class TreatmentProtocolModelTest(TestCase):
    """Test TreatmentProtocol model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.condition = create_test_condition(self.user)
        self.protocol = TreatmentProtocol.objects.create(
            name='AMD Loading Dose',
            code='AMD-LD-001',
            protocol_type='loading_dose',
            condition=self.condition,
            description='Standard AMD loading dose protocol.',
            indications='New AMD diagnosis.',
            requires_consent=True,
            created_by=self.user
        )

    def test_protocol_creation(self):
        self.assertEqual(self.protocol.name, 'AMD Loading Dose')
        self.assertEqual(self.protocol.protocol_type, 'loading_dose')
        self.assertTrue(self.protocol.is_active)
        self.assertTrue(self.protocol.requires_consent)

    def test_protocol_str(self):
        result = str(self.protocol)
        self.assertIn('AMD Loading Dose', result)

    def test_protocol_linked_to_condition(self):
        self.assertEqual(self.protocol.condition, self.condition)


class ProtocolAPITest(TestCase):
    """Test Protocol API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.condition = create_test_condition(self.user)
        self.protocol = TreatmentProtocol.objects.create(
            name='Test Protocol',
            code='TEST-001',
            protocol_type='maintenance',
            condition=self.condition,
            description='Test maintenance protocol.',
            indications='Stable AMD.',
            requires_consent=False,
            created_by=self.user
        )

    def test_list_protocols(self):
        response = self.client.get('/api/protocols/protocols/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_protocol_detail(self):
        response = self.client.get(f'/api/protocols/protocols/{self.protocol.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Protocol')

    def test_create_protocol(self):
        payload = {
            'name': 'New Protocol',
            'code': 'NEW-001',
            'protocol_type': 'prn',
            'condition': str(self.condition.pk),
            'description': 'A PRN protocol.',
            'indications': 'PRN use.',
            'requires_consent': True,
        }
        response = self.client.post('/api/protocols/protocols/', payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
