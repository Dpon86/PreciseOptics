"""
URL configuration for patients app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'patients', views.PatientViewSet)
router.register(r'visits', views.PatientVisitViewSet)
router.register(r'alerts', views.AppointmentAlertViewSet, basename='alert')
router.register(r'alert-config', views.AlertConfigurationViewSet, basename='alert-config')

urlpatterns = [
    path('api/', include(router.urls)),
]