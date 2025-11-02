"""
URL configuration for protocols app
"""
from django.urls import path
from . import views

app_name = 'protocols'

urlpatterns = [
    # Treatment Protocol endpoints
    path('', views.TreatmentProtocolListCreateView.as_view(), name='protocol-list'),
    path('<uuid:pk>/', views.TreatmentProtocolDetailView.as_view(), name='protocol-detail'),
    path('code/<str:code>/', views.protocol_by_code, name='protocol-by-code'),
    path('<uuid:protocol_id>/steps/', views.ProtocolStepsView.as_view(), name='protocol-steps'),
    path('statistics/', views.protocol_statistics, name='protocol-statistics'),
    path('adherence-report/', views.protocol_adherence_report, name='protocol-adherence-report'),
    
    # Protocol Step endpoints
    path('steps/', views.ProtocolStepListCreateView.as_view(), name='protocol-step-list'),
    path('steps/<uuid:pk>/', views.ProtocolStepDetailView.as_view(), name='protocol-step-detail'),
    
    # Patient Protocol endpoints
    path('patient-protocols/', views.PatientProtocolListCreateView.as_view(), name='patient-protocol-list'),
    path('patient-protocols/<uuid:pk>/', views.PatientProtocolDetailView.as_view(), name='patient-protocol-detail'),
    path('patient-protocols/<uuid:patient_protocol_id>/schedule/', views.PatientProtocolScheduleView.as_view(), name='patient-protocol-schedule'),
    path('patient-protocols/<uuid:patient_protocol_id>/discontinue/', views.discontinue_patient_protocol, name='patient-protocol-discontinue'),
    path('patient-protocols/<uuid:patient_protocol_id>/complete-step/<uuid:step_id>/', views.complete_protocol_step, name='complete-protocol-step'),
    path('patient/<uuid:patient_id>/protocols/', views.PatientProtocolsView.as_view(), name='patient-protocols'),
    
    # Protocol Step Completion endpoints
    path('completions/', views.ProtocolStepCompletionListCreateView.as_view(), name='step-completion-list'),
    path('completions/<uuid:pk>/', views.ProtocolStepCompletionDetailView.as_view(), name='step-completion-detail'),
    path('completions/<uuid:step_completion_id>/reschedule/', views.reschedule_protocol_step, name='reschedule-step'),
    path('completions/bulk-reschedule/', views.bulk_reschedule_steps, name='bulk-reschedule-steps'),
    path('completions/upcoming/', views.upcoming_protocol_steps, name='upcoming-steps'),
    path('completions/overdue/', views.overdue_protocol_steps, name='overdue-steps'),
    path('completions/adverse-events/', views.adverse_events_report, name='adverse-events-report'),
    
    # Consent Form endpoints
    path('consent-forms/', views.ConsentFormListCreateView.as_view(), name='consent-form-list'),
    path('consent-forms/<uuid:pk>/', views.ConsentFormDetailView.as_view(), name='consent-form-detail'),
    path('consent-forms/<uuid:consent_id>/withdraw/', views.withdraw_consent, name='withdraw-consent'),
    path('patient/<uuid:patient_id>/consent-forms/', views.PatientConsentFormsView.as_view(), name='patient-consent-forms'),
    
    # Protocol Step Details endpoints (medications, treatments, tests)
    path('step-medications/', views.ProtocolStepMedicationListCreateView.as_view(), name='step-medication-list'),
    path('step-medications/<uuid:pk>/', views.ProtocolStepMedicationDetailView.as_view(), name='step-medication-detail'),
    path('step-treatments/', views.ProtocolStepTreatmentListCreateView.as_view(), name='step-treatment-list'),
    path('step-treatments/<uuid:pk>/', views.ProtocolStepTreatmentDetailView.as_view(), name='step-treatment-detail'),
    path('step-tests/', views.ProtocolStepTestListCreateView.as_view(), name='step-test-list'),
    path('step-tests/<uuid:pk>/', views.ProtocolStepTestDetailView.as_view(), name='step-test-detail'),
    
    # Patient assignment
    path('assign-to-patient/', views.assign_protocol_to_patient, name='assign-to-patient'),
]
