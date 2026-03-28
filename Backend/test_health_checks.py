"""
Tests for health check endpoints
"""
import pytest
from django.urls import reverse


@pytest.mark.api
class TestHealthCheckEndpoints:
    """
    Test suite for health check endpoints
    """
    
    def test_basic_health_check(self, api_client):
        """
        Test basic health check endpoint returns 200
        """
        url = reverse('health_check')
        response = api_client.get(url)
        
        assert response.status_code == 200
        assert response.json()['status'] == 'healthy'
        assert 'environment' in response.json()
    
    def test_database_health_check(self, api_client, db):
        """
        Test database health check endpoint
        """
        url = reverse('health_check_db')
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert data['database']['connected'] is True
    
    def test_detailed_health_check(self, api_client, db):
        """
        Test detailed health check returns comprehensive status
        """
        url = reverse('health_check_detailed')
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        
        # Check main status
        assert 'status' in data
        assert 'timestamp' in data
        assert 'checks' in data
        
        # Check individual components
        assert 'database' in data['checks']
        assert 'system' in data['checks']
        assert 'applications' in data['checks']
        
        # Verify core modules are registered
        core_modules = data['checks']['applications']['core_modules']
        assert core_modules['patients'] is True
        assert core_modules['conditions'] is True
        assert core_modules['protocols'] is True
    
    def test_readiness_check(self, api_client, db):
        """
        Test readiness check endpoint (for K8s)
        """
        url = reverse('readiness_check')
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert 'ready' in data
        assert 'checks' in data
    
    def test_liveness_check(self, api_client):
        """
        Test liveness check endpoint (for K8s)
        """
        url = reverse('liveness_check')
        response = api_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert data['alive'] is True
    
    def test_health_checks_no_authentication_required(self, api_client):
        """
        Verify health checks work without authentication
        """
        # All health endpoints should work without auth
        endpoints = [
            'health_check',
            'health_check_db',
            'health_check_detailed',
            'readiness_check',
            'liveness_check',
        ]
        
        for endpoint_name in endpoints:
            url = reverse(endpoint_name)
            response = api_client.get(url)
            assert response.status_code in [200, 503], f"{endpoint_name} should allow unauthenticated access"


@pytest.mark.smoke
def test_server_is_running(api_client):
    """
    Smoke test - verify the server responds
    """
    response = api_client.get(reverse('health_check'))
    assert response.status_code == 200
