"""
URL configuration for audit app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'audit-logs', views.AuditLogViewSet)
router.register(r'patient-access-logs', views.PatientAccessLogViewSet)
router.register(r'medication-audit', views.MedicationAuditViewSet)
router.register(r'security-events', views.SystemSecurityEventViewSet)
router.register(r'compliance-reports', views.ComplianceReportViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]