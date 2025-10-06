"""
URL configuration for PreciseOptics Eye Hospital Management System
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from .views import api_root

# Customize admin site headers
admin.site.site_header = "PreciseOptics Eye Hospital Management"
admin.site.site_title = "PreciseOptics Admin"
admin.site.index_title = "Welcome to PreciseOptics Management System"

urlpatterns = [
    path('', api_root, name='api_root'),  # Root API info endpoint
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    
    # App URLs
    path('', include('accounts.urls')),
    path('', include('patients.urls')),
    path('', include('consultations.urls')),
    path('', include('medications.urls')),
    path('', include('eye_tests.urls')),
    path('', include('audit.urls')),
    path('', include('reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
