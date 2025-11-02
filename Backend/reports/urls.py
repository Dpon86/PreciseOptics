"""
URL configuration for reports app
"""
from django.urls import path
from . import views
from . import comprehensive_api
from . import treatment_effectiveness_api

app_name = 'reports'

urlpatterns = [
    path('api/reports/drug-audit/', views.drug_audit_report, name='drug-audit-report'),
    path('api/reports/patient-visits/', views.patient_visits_report, name='patient-visits-report'),
    path('api/reports/eye-tests-summary/', views.eye_tests_summary_report, name='eye-tests-summary-report'),
    path('api/reports/patient-progress/<uuid:patient_id>/', views.patient_progress_dashboard, name='patient-progress-dashboard'),
    path('api/reports/medication-effectiveness/', views.medication_effectiveness_report, name='medication-effectiveness-report'),
    
    # Treatment and Medication Effectiveness Timeline APIs
    path('api/reports/treatment-effectiveness-timeline/', treatment_effectiveness_api.treatment_effectiveness_timeline, name='treatment-effectiveness-timeline'),
    path('api/reports/medication-effectiveness-timeline/', treatment_effectiveness_api.medication_effectiveness_timeline, name='medication-effectiveness-timeline'),
    path('api/reports/compare-treatments/', treatment_effectiveness_api.compare_treatments, name='compare-treatments'),
    path('api/reports/compare-medications/', treatment_effectiveness_api.compare_medications, name='compare-medications'),
    
    # Comprehensive data APIs
    path('api/data/all-models/', comprehensive_api.all_models_data, name='all-models-data'),
    path('api/data/model-counts/', comprehensive_api.model_counts, name='model-counts'),
]