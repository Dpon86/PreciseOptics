"""
Tests for the patients app — appointment alerts and alert configuration.

Covers Module 4 of the feature checklist (AppointmentAlert and
AlertConfiguration) including their REST API endpoints:

    /api/alerts/          — AppointmentAlertViewSet
    /api/alert-config/    — AlertConfigurationViewSet
"""
from datetime import date, timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from patients.models import AlertConfiguration, AppointmentAlert, Patient

User = get_user_model()


def make_patient(user, patient_id="PAT001", first_name="John", last_name="Doe"):
    """Create a fully-populated Patient with every required field."""
    return Patient.objects.create(
        patient_id=patient_id,
        first_name=first_name,
        last_name=last_name,
        date_of_birth=date(1960, 1, 1),
        gender="M",
        phone_number="+447700900123",
        address_line_1="1 Test Street",
        city="London",
        state="Greater London",
        postal_code="SW1A 1AA",
        country="UK",
        emergency_contact_name="Jane Doe",
        emergency_contact_phone="+447700900456",
        emergency_contact_relationship="Spouse",
        registered_by=user,
    )


class AppointmentAlertModelTest(TestCase):
    """Model-level tests for AppointmentAlert."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="doctor",
            email="doctor@test.com",
            password="testpass123",
        )
        self.patient = make_patient(self.user)
        self.alert = AppointmentAlert.objects.create(
            patient=self.patient,
            alert_type="missed",
            severity="high",
            title="Missed Appointment",
            message="Patient did not attend their appointment.",
            trigger_time=timezone.now(),
        )

    def test_alert_creation_defaults(self):
        self.assertEqual(self.alert.alert_type, "missed")
        self.assertEqual(self.alert.severity, "high")
        self.assertEqual(self.alert.status, "active")

    def test_alert_str(self):
        self.assertIn("Missed Appointment", str(self.alert))
        self.assertIn("John Doe", str(self.alert))

    def test_alert_uses_uuid_primary_key(self):
        self.assertIsNotNone(self.alert.id)


class AlertConfigurationModelTest(TestCase):
    """Model-level tests for AlertConfiguration."""

    def test_defaults(self):
        config = AlertConfiguration.objects.create()
        self.assertEqual(config.late_threshold_minutes, 15)
        self.assertEqual(config.missed_threshold_minutes, 60)
        self.assertEqual(config.upcoming_reminder_minutes, 60)
        self.assertTrue(config.is_active)

    def test_get_active_config_creates_default(self):
        self.assertEqual(AlertConfiguration.objects.count(), 0)
        config = AlertConfiguration.get_active_config()
        self.assertIsNotNone(config)
        self.assertTrue(config.is_active)
        self.assertEqual(AlertConfiguration.objects.count(), 1)

    def test_str(self):
        config = AlertConfiguration.objects.create()
        self.assertIn("Alert Configuration", str(config))


class AppointmentAlertAPITest(TestCase):
    """API tests for the /api/alerts/ endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="doctor",
            email="doctor@test.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)
        self.patient = make_patient(self.user)
        self.alert = AppointmentAlert.objects.create(
            patient=self.patient,
            alert_type="late",
            severity="medium",
            title="Late Arrival",
            message="Patient arrived late.",
            trigger_time=timezone.now() - timedelta(minutes=30),
        )

    def test_list_alerts(self):
        response = self.client.get("/api/alerts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)

    def test_list_alerts_requires_auth(self):
        anon = APIClient()
        response = anon.get("/api/alerts/")
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )

    def test_alert_detail(self):
        response = self.client.get(f"/api/alerts/{self.alert.pk}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["alert_type"], "late")
        self.assertEqual(response.data["status"], "active")

    def test_filter_by_status(self):
        AppointmentAlert.objects.create(
            patient=self.patient,
            alert_type="missed",
            title="Resolved Alert",
            message="Done.",
            status="resolved",
            trigger_time=timezone.now(),
        )
        response = self.client.get("/api/alerts/?status=resolved")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["status"], "resolved")

    def test_filter_by_alert_type(self):
        response = self.client.get("/api/alerts/?alert_type=late")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["alert_type"], "late")

    def test_create_alert(self):
        payload = {
            "patient": str(self.patient.pk),
            "alert_type": "missed",
            "severity": "high",
            "title": "New Missed Appointment",
            "message": "Patient did not attend.",
            "trigger_time": timezone.now().isoformat(),
        }
        response = self.client.post("/api/alerts/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["alert_type"], "missed")
        self.assertEqual(response.data["title"], "New Missed Appointment")

        # The create serializer does not expose status/id; verify persistence.
        created = AppointmentAlert.objects.get(
            patient=self.patient, title="New Missed Appointment"
        )
        self.assertEqual(created.status, "active")
        self.assertEqual(created.severity, "high")

    def test_acknowledge_alert(self):
        response = self.client.post(f"/api/alerts/{self.alert.pk}/acknowledge/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertEqual(self.alert.status, "acknowledged")
        self.assertEqual(self.alert.acknowledged_by, self.user)

    def test_resolve_alert(self):
        response = self.client.post(
            f"/api/alerts/{self.alert.pk}/resolve/",
            {"action_taken": "Called patient", "notes": "Will reschedule"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertEqual(self.alert.status, "resolved")
        self.assertEqual(self.alert.action_taken, "Called patient")

    def test_dismiss_alert(self):
        response = self.client.post(
            f"/api/alerts/{self.alert.pk}/dismiss/",
            {"reason": "Duplicate entry"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.alert.refresh_from_db()
        self.assertEqual(self.alert.status, "dismissed")

    def test_alert_statistics(self):
        response = self.client.get("/api/alerts/statistics/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_active", response.data)


class AlertConfigurationAPITest(TestCase):
    """API tests for the /api/alert-config/ endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="doctor",
            email="doctor@test.com",
            password="testpass123",
        )
        self.client.force_authenticate(user=self.user)

    def test_list_configs(self):
        response = self.client.get("/api/alert-config/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)

    def test_create_config(self):
        payload = {
            "late_threshold_minutes": 10,
            "missed_threshold_minutes": 45,
            "upcoming_reminder_minutes": 30,
            "overdue_followup_days": 14,
            "is_active": True,
        }
        response = self.client.post("/api/alert-config/", payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["late_threshold_minutes"], 10)
        self.assertEqual(response.data["missed_threshold_minutes"], 45)
        self.assertEqual(response.data["created_by"], self.user.pk)

    def test_active_config_endpoint(self):
        response = self.client.get("/api/alert-config/active/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_active"])

    def test_activate_config(self):
        config_a = AlertConfiguration.objects.create(is_active=True)
        config_b = AlertConfiguration.objects.create(is_active=False)
        response = self.client.post(f"/api/alert-config/{config_b.pk}/activate/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        config_a.refresh_from_db()
        config_b.refresh_from_db()
        self.assertTrue(config_b.is_active)
        self.assertFalse(config_a.is_active)
