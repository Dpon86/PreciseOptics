"""
URL configuration for reports app
"""
from django.urls import path
from . import views
from . import comprehensive_api
from . import treatment_effectiveness_api
from .views.outcome_reports import condition_medication_outcomes



urlpatterns = [
    path('api/reports/drug-audit/', views.drug_audit_report, name='drug-audit-report'),
    path('api/reports/patient-visits/', views.patient_visits_report, name='patient-visits-report'),
    path('api/reports/eye-tests-summary/', views.eye_tests_summary_report, name='eye-tests-summary-report'),
    path('api/reports/patient-progress/<uuid:patient_id>/', views.patient_progress_dashboard, name='patient-progress-dashboard'),
    path('api/reports/medication-effectiveness/', views.medication_effectiveness_report, name='medication-effectiveness-report'),
    path('api/reports/disease-specific/', views.disease_specific_report, name='disease-specific-report'),
    
    # Treatment and Medication Effectiveness Timeline APIs
    path('api/reports/treatment-effectiveness-timeline/', treatment_effectiveness_api.treatment_effectiveness_timeline, name='treatment-effectiveness-timeline'),
    path('api/reports/medication-effectiveness-timeline/', treatment_effectiveness_api.medication_effectiveness_timeline, name='medication-effectiveness-timeline'),
    path('api/reports/compare-treatments/', treatment_effectiveness_api.compare_treatments, name='compare-treatments'),
    path('api/reports/compare-medications/', treatment_effectiveness_api.compare_medications, name='compare-medications'),
    
    path('api/reports/revenue-analysis/', views.revenue_analysis_report, name='revenue-analysis-report'),
    path('api/reports/batch-tracking/', views.batch_tracking_report, name='batch-tracking-report'),
    path('api/reports/followup-alerts/', views.followup_alerts, name='followup-alerts'),
    path('api/reports/medication-patients/', views.medication_patients_report, name='medication-patients-report'),

    # Condition → Medication → Outcome correlation (clinical + PROs)
    path('api/reports/condition-medication-outcomes/', condition_medication_outcomes, name='condition-medication-outcomes'),

    # Comprehensive data APIs
    path('api/data/all-models/', comprehensive_api.all_models_data, name='all-models-data'),
    path('api/data/model-counts/', comprehensive_api.model_counts, name='model-counts'),
]