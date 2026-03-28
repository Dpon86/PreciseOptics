"""
Custom authentication backend with account lockout support
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from .account_lockout import AccountLockoutService
import logging

User = get_user_model()
security_logger = logging.getLogger('django.security')


class LockoutModelBackend(ModelBackend):
    """
    Custom authentication backend that checks for account lockout
    before allowing authentication
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate user, checking for account lockout first
        """
        if username is None or password is None:
            return None
        
        # Get client IP address
        ip_address = self.get_client_ip(request) if request else 'unknown'
        
        # Check if account is locked
        is_locked, remaining_minutes = AccountLockoutService.is_locked(username)
        
        if is_locked:
            security_logger.warning(
                f'Authentication blocked for locked account: {username} from IP: {ip_address} '
                f'({remaining_minutes} minutes remaining)'
            )
            # Return None to indicate authentication failure
            # The failed login signal will still be triggered
            return None
        
        # Proceed with normal authentication
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user
            User().set_password(password)
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
    
    @staticmethod
    def get_client_ip(request):
        """
        Get the client's IP address from the request
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        return ip
