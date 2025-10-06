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
]