from django.http import JsonResponse

def api_root(request):
    """
    API Root endpoint providing information about available endpoints
    """
    return JsonResponse({
        'message': 'Welcome to PreciseOptics API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'api-auth': '/api-auth/',
            'token-auth': '/api-token-auth/',
            'patients': '/api/patients/',
            'consultations': '/api/consultations/',
            'medications': '/api/medications/',
            'eye-tests': '/api/eye-tests/',
            'audit': '/api/audit/'
        },
        'frontend': 'http://localhost:3000',
        'documentation': 'Access the admin panel for API management'
    })