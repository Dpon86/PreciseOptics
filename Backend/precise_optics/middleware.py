"""
Security middleware for PreciseOptics
Tracks authentication events and implements security policies
"""
import logging
from django.utils import timezone
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver
from .account_lockout import AccountLockoutService

# Security logger
security_logger = logging.getLogger('django.security')


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """
    Log successful user login for security audit
    Clear failed login attempts on successful login
    """
    ip_address = get_client_ip(request)
    
    security_logger.info(
        f'User login: {user.username} (ID: {user.id}) from IP: {ip_address} '
        f'at {timezone.now().isoformat()}'
    )
    
    # Clear failed attempts after successful login
    AccountLockoutService.clear_failed_attempts(user.username, ip_address)


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """
    Log user logout for security audit
    """
    if user:
        security_logger.info(
            f'User logout: {user.username} (ID: {user.id}) from IP: {get_client_ip(request)} '
            f'at {timezone.now().isoformat()}'
        )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """
    Log failed login attempts for security monitoring
    Implement account lockout after multiple failed attempts
    """
    username = credentials.get('username', 'unknown')
    ip_address = get_client_ip(request)
    
    # Check if account is already locked
    is_locked, remaining_minutes = AccountLockoutService.is_locked(username)
    
    if is_locked:
        security_logger.warning(
            f'Login attempt on LOCKED account: {username} from IP: {ip_address} '
            f'(locked for {remaining_minutes} more minutes)'
        )
        return
    
    # Record the failed attempt
    should_lock, attempts_remaining, lockout_minutes = AccountLockoutService.record_failed_attempt(
        username, ip_address
    )
    
    if should_lock:
        security_logger.critical(
            f'ACCOUNT LOCKED: {username} from IP: {ip_address} - '
            f'Too many failed login attempts. Locked for {lockout_minutes} minutes.'
        )
    else:
        security_logger.warning(
            f'Failed login attempt: username={username} from IP: {ip_address} '
            f'({attempts_remaining} attempts remaining) at {timezone.now().isoformat()}'
        )


def get_client_ip(request):
    """
    Get the client's IP address from the request
    Handles proxy headers (X-Forwarded-For)
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class SecurityHeadersMiddleware:
    """
    Add security headers to all responses
    Helps protect against common web vulnerabilities
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Content Security Policy (adjust as needed for your frontend)
        # response['Content-Security-Policy'] = "default-src 'self'"
        
        return response


class RequestLoggingMiddleware:
    """
    Log all incoming requests for audit trail
    Useful for debugging and security monitoring
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('performance')
    
    def __call__(self, request):
        import time
        
        # Record start time
        start_time = time.time()
        
        # Process request
        response = self.get_response(request)
        
        # Calculate request processing time
        duration = time.time() - start_time
        
        # Log request details
        self.logger.info(
            f'{request.method} {request.path} - '
            f'Status: {response.status_code} - '
            f'Duration: {duration:.3f}s - '
            f'User: {request.user.username if request.user.is_authenticated else "Anonymous"} - '
            f'IP: {get_client_ip(request)}'
        )
        
        # Warn if request is slow (>2 seconds)
        if duration > 2.0:
            self.logger.warning(
                f'SLOW REQUEST: {request.method} {request.path} took {duration:.3f}s'
            )
        
        return response
