"""
URL configuration for consultations app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'consultations', views.ConsultationViewSet)
router.register(r'vital-signs', views.VitalSignsViewSet)
router.register(r'consultation-documents', views.ConsultationDocumentViewSet)
router.register(r'consultation-images', views.ConsultationImageViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]