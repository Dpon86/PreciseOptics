"""
URL configuration for referrals app
"""
from django.urls import path
from . import views

app_name = 'referrals'

urlpatterns = [
    # Referral Sources
    path('sources/', views.ReferralSourceListCreateView.as_view(), name='referral-source-list-create'),
    path('sources/<uuid:pk>/', views.ReferralSourceDetailView.as_view(), name='referral-source-detail'),
    path('sources/<uuid:source_id>/performance/', views.source_performance, name='source-performance'),
    
    # Referrals
    path('', views.ReferralListCreateView.as_view(), name='referral-list-create'),
    path('<uuid:pk>/', views.ReferralDetailView.as_view(), name='referral-detail'),
    path('<uuid:referral_id>/status/', views.update_referral_status, name='update-status'),
    path('<uuid:referral_id>/send/', views.send_referral, name='send-referral'),
    path('<uuid:referral_id>/cancel/', views.cancel_referral, name='cancel-referral'),
    
    # Patient-specific referrals
    path('patient/<uuid:patient_id>/', views.patient_referrals, name='patient-referrals'),
    
    # Documents
    path('documents/', views.ReferralDocumentListCreateView.as_view(), name='document-list-create'),
    path('documents/<uuid:pk>/', views.ReferralDocumentDetailView.as_view(), name='document-detail'),
    path('<uuid:referral_id>/documents/', views.referral_documents, name='referral-documents'),
    
    # Responses
    path('responses/', views.ReferralResponseListCreateView.as_view(), name='response-list-create'),
    path('responses/<uuid:pk>/', views.ReferralResponseDetailView.as_view(), name='response-detail'),
    path('<uuid:referral_id>/responses/', views.referral_responses, name='referral-responses'),
    
    # Statistics & Analytics
    path('statistics/', views.referral_statistics, name='statistics'),
    path('overdue/', views.overdue_referrals, name='overdue-referrals'),
]
