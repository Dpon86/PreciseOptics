"""
Health Check Endpoints for PreciseOptics
Provides system status monitoring for local development and production readiness
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import sys
import django


@api_view(['GET'])
@permission_classes([AllowAny])
def basic_health_check(request):
    """
    Basic health check - returns 200 if server is responding
    Useful for load balancers and monitoring tools
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'PreciseOptics API is running',
        'environment': 'development' if settings.DEBUG else 'production',
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def database_health_check(request):
    """
    Check database connectivity
    """
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        db_healthy = result == (1,)
        
        return JsonResponse({
            'status': 'healthy' if db_healthy else 'unhealthy',
            'database': {
                'connected': db_healthy,
                'engine': settings.DATABASES['default']['ENGINE'],
                'name': settings.DATABASES['default']['NAME'],
            }
        }, status=200 if db_healthy else 503)
    
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'database': {
                'connected': False,
                'error': str(e)
            }
        }, status=503)


@api_view(['GET'])
@permission_classes([AllowAny])
def detailed_health_check(request):
    """
    Comprehensive system health check
    Checks all critical components
    """
    health_status = {
        'status': 'healthy',
        'timestamp': None,
        'checks': {}
    }
    
    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        health_status['checks']['database'] = {
            'status': 'healthy' if result == (1,) else 'unhealthy',
            'engine': settings.DATABASES['default']['ENGINE'],
        }
    except Exception as e:
        health_status['checks']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        health_status['status'] = 'unhealthy'
    
    # Check cache (if configured)
    try:
        cache_key = 'health_check_test'
        cache.set(cache_key, 'test_value', 10)
        cache_value = cache.get(cache_key)
        health_status['checks']['cache'] = {
            'status': 'healthy' if cache_value == 'test_value' else 'degraded',
            'backend': settings.CACHES['default']['BACKEND']
        }
    except Exception as e:
        health_status['checks']['cache'] = {
            'status': 'unavailable',
            'error': str(e)
        }
    
    # System information
    health_status['checks']['system'] = {
        'status': 'healthy',
        'python_version': sys.version,
        'django_version': django.get_version(),
        'debug_mode': settings.DEBUG,
    }
    
    # Check installed apps
    health_status['checks']['applications'] = {
        'status': 'healthy',
        'core_modules': {
            'accounts': 'accounts' in settings.INSTALLED_APPS,
            'patients': 'patients' in settings.INSTALLED_APPS,
            'medications': 'medications' in settings.INSTALLED_APPS,
            'consultations': 'consultations' in settings.INSTALLED_APPS,
            'eye_tests': 'eye_tests' in settings.INSTALLED_APPS,
            'treatments': 'treatments' in settings.INSTALLED_APPS,
            'conditions': 'conditions' in settings.INSTALLED_APPS,
            'protocols': 'protocols' in settings.INSTALLED_APPS,
            'referrals': 'referrals' in settings.INSTALLED_APPS,
            'audit': 'audit' in settings.INSTALLED_APPS,
        }
    }
    
    # Add timestamp
    from datetime import datetime
    health_status['timestamp'] = datetime.now().isoformat()
    
    # Overall status
    status_code = 200 if health_status['status'] == 'healthy' else 503
    
    return JsonResponse(health_status, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Readiness check - indicates if the application is ready to serve traffic
    Used by Kubernetes and container orchestration
    """
    ready = True
    checks = {}
    
    # Check if database migrations are applied
    try:
        from django.db.migrations.executor import MigrationExecutor
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())
        checks['migrations'] = {
            'status': 'ready' if not plan else 'pending',
            'pending_count': len(plan)
        }
        if plan:
            ready = False
    except Exception as e:
        checks['migrations'] = {
            'status': 'unknown',
            'error': str(e)
        }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        checks['database'] = {'status': 'ready'}
    except Exception as e:
        checks['database'] = {
            'status': 'not_ready',
            'error': str(e)
        }
        ready = False
    
    return JsonResponse({
        'ready': ready,
        'checks': checks
    }, status=200 if ready else 503)


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Liveness check - indicates if the application is alive
    Used by Kubernetes to restart unhealthy pods
    Returns 200 if the application process is running
    """
    return JsonResponse({
        'alive': True,
        'message': 'Application is alive'
    })
