"""
URL configuration for accounts app
"""
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    # Authentication
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Staff Management
    path('staff/', views.StaffListCreateView.as_view(), name='staff-list-create'),
    path('staff/<int:pk>/', views.StaffDetailView.as_view(), name='staff-detail'),
    path('staff/statistics/', views.staff_statistics, name='staff-statistics'),
    
    # User Management
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Lookups
    path('departments/', views.get_departments, name='departments'),
    path('specializations/', views.get_specializations, name='specializations'),
    path('user-types/', views.get_user_types, name='user-types'),
    
    # Specialization Management
    path('specializations/', views.create_specialization, name='create-specialization'),
    path('specializations/<int:spec_id>/', views.delete_specialization, name='delete-specialization'),
    
    # Password Reset
    path('password-reset/', views.request_password_reset, name='password-reset-request'),
    path('password-reset/confirm/', views.confirm_password_reset, name='password-reset-confirm'),
    
    # Two-Factor Authentication
    path('2fa/setup/', views.setup_2fa, name='2fa-setup'),
    path('2fa/verify-setup/', views.verify_2fa_setup, name='2fa-verify-setup'),
    path('2fa/verify-login/', views.verify_2fa_login, name='2fa-verify-login'),
    path('2fa/disable/', views.disable_2fa, name='2fa-disable'),
    path('2fa/status/', views.get_2fa_status, name='2fa-status'),
]