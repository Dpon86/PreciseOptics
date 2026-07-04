from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientOutcomeReportViewSet

router = DefaultRouter()
router.register(r'patient-outcomes', PatientOutcomeReportViewSet, basename='patient-outcomes')

urlpatterns = [
    path('', include(router.urls)),
]
