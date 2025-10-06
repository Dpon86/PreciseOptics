"""
URL configuration for medications app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'medications', views.MedicationViewSet)
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'prescription-items', views.PrescriptionItemViewSet)
router.register(r'medication-administration', views.MedicationAdministrationViewSet)
router.register(r'drug-allergies', views.DrugAllergyViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]