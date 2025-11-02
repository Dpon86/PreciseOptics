"""
URL configuration for conditions app
"""
from django.urls import path
from . import views

app_name = 'conditions'

urlpatterns = [
    # Medical Condition endpoints
    path('', views.MedicalConditionListCreateView.as_view(), name='condition-list'),
    path('<int:pk>/', views.MedicalConditionDetailView.as_view(), name='condition-detail'),
    path('code/<str:code>/', views.condition_by_code, name='condition-by-code'),
    path('prevalence/', views.condition_prevalence, name='condition-prevalence'),
    path('statistics/', views.condition_statistics, name='condition-statistics'),
    
    # Patient Condition endpoints
    path('patient-conditions/', views.PatientConditionListCreateView.as_view(), name='patient-condition-list'),
    path('patient-conditions/<int:pk>/', views.PatientConditionDetailView.as_view(), name='patient-condition-detail'),
    path('patient-conditions/<int:patient_condition_id>/resolve/', views.resolve_patient_condition, name='patient-condition-resolve'),
    path('patient-conditions/<int:patient_condition_id>/timeline/', views.patient_condition_timeline, name='patient-condition-timeline'),
    path('patient-conditions/overdue/', views.overdue_assessments, name='overdue-assessments'),
    path('patient-conditions/upcoming/', views.upcoming_assessments, name='upcoming-assessments'),
    path('patient-conditions/bulk-update/', views.bulk_update_status, name='bulk-update-status'),
    path('patient/<int:patient_id>/conditions/', views.PatientConditionsView.as_view(), name='patient-conditions'),
    
    # Condition Progress endpoints
    path('progress/', views.ConditionProgressListCreateView.as_view(), name='progress-list'),
    path('progress/<int:pk>/', views.ConditionProgressDetailView.as_view(), name='progress-detail'),
    path('patient-conditions/<int:patient_condition_id>/progress/', views.PatientConditionProgressView.as_view(), name='patient-condition-progress'),
    
    # Condition Document endpoints
    path('documents/', views.ConditionDocumentListCreateView.as_view(), name='document-list'),
    path('documents/<int:pk>/', views.ConditionDocumentDetailView.as_view(), name='document-detail'),
    path('patient-conditions/<int:patient_condition_id>/documents/', views.PatientConditionDocumentsView.as_view(), name='patient-condition-documents'),
]
