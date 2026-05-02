"""
URL configuration for PreciseOptics Eye Hospital Management System
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from .views import api_root
from .health_checks import (
    basic_health_check,
    database_health_check,
    detailed_health_check,
    readiness_check,
    liveness_check
)

# Customize admin site headers
admin.site.site_header = "PreciseOptics Eye Hospital Management"
admin.site.site_title = "PreciseOptics Admin"
admin.site.index_title = "Welcome to PreciseOptics Management System"

urlpatterns = [
    path('', api_root, name='api_root'),  # Root API info endpoint
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),

    # Health Check Endpoints (for monitoring and production readiness)
    path('health/', basic_health_check, name='health_check'),
    path('health/db/', database_health_check, name='health_check_db'),
    path('health/detailed/', detailed_health_check, name='health_check_detailed'),
    path('health/ready/', readiness_check, name='readiness_check'),
    path('health/live/', liveness_check, name='liveness_check'),

    # ──────────────────────────────────────────────────────────────────
    # Versioned API — /api/v1/…
    # All new clients and external integrations should use these paths.
    # ──────────────────────────────────────────────────────────────────
    path('api/v1/', include([
        path('', include('accounts.urls')),
        path('', include('patients.urls')),
        path('', include('consultations.urls')),
        path('', include('medications.urls')),
        path('', include('eye_tests.urls')),
        path('', include('treatments.urls')),
        path('', include('audit.urls')),
        path('', include('reports.urls')),
        path('conditions/', include('conditions.urls')),
        path('protocols/', include('protocols.urls')),
        path('referrals/', include('referrals.urls')),
    ])),

    # ──────────────────────────────────────────────────────────────────
    # Legacy unversioned paths — kept for backwards compatibility with
    # the existing React frontend.  New external integrations should
    # use /api/v1/ above.
    # ──────────────────────────────────────────────────────────────────
    path('', include('accounts.urls')),
    path('', include('patients.urls')),
    path('', include('consultations.urls')),
    path('', include('medications.urls')),
    path('', include('eye_tests.urls')),
    path('', include('treatments.urls')),
    path('', include('audit.urls')),
    path('', include('reports.urls')),
    path('api/conditions/', include('conditions.urls')),
    path('api/protocols/', include('protocols.urls')),
    path('api/referrals/', include('referrals.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
