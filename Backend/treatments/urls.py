"""
URL configuration for Treatments app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TreatmentCategoryViewSet, TreatmentTypeViewSet, TreatmentViewSet,
    TreatmentMedicationViewSet, TreatmentDocumentViewSet,
    TreatmentFollowUpViewSet, TreatmentComplicationViewSet
)

router = DefaultRouter()
router.register(r'categories', TreatmentCategoryViewSet, basename='treatmentcategory')
router.register(r'types', TreatmentTypeViewSet, basename='treatmenttype')
router.register(r'treatments', TreatmentViewSet, basename='treatment')
router.register(r'medications', TreatmentMedicationViewSet, basename='treatmentmedication')
router.register(r'documents', TreatmentDocumentViewSet, basename='treatmentdocument')
router.register(r'follow-ups', TreatmentFollowUpViewSet, basename='treatmentfollowup')
router.register(r'complications', TreatmentComplicationViewSet, basename='treatmentcomplication')

urlpatterns = [
    path('api/', include(router.urls)),
]