"""
URL configuration for reports app
"""
from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('api/reports/drug-audit/', views.drug_audit_report, name='drug-audit-report'),
    path('api/reports/patient-visits/', views.patient_visits_report, name='patient-visits-report'),
    path('api/reports/eye-tests-summary/', views.eye_tests_summary_report, name='eye-tests-summary-report'),
    path('api/reports/patient-progress/<uuid:patient_id>/', views.patient_progress_dashboard, name='patient-progress-dashboard'),
]