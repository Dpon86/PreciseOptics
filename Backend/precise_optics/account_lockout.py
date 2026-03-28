"""
Account lockout mechanism for PreciseOptics
Prevents brute force attacks by locking accounts after failed login attempts
"""
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
import logging

security_logger = logging.getLogger('django.security')

# Configuration
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30
ATTEMPT_WINDOW_MINUTES = 15  # Window to track attempts


class AccountLockoutService:
    """
    Service to handle account lockout functionality
    Uses cache to track failed login attempts
    """
    
    @staticmethod
    def get_cache_key(username, ip_address):
        """
        Generate cache key for tracking attempts
        """
        return f'login_attempts:{username}:{ip_address}'
    
    @staticmethod
    def get_lockout_key(username):
        """
        Generate cache key for lockout status
        """
        return f'account_locked:{username}'
    
    @staticmethod
    def is_locked(username):
        """
        Check if account is currently locked
        Returns: (is_locked: bool, remaining_minutes: int)
        """
        lockout_key = AccountLockoutService.get_lockout_key(username)
        lockout_until = cache.get(lockout_key)
        
        if lockout_until:
            now = timezone.now()
            if now < lockout_until:
                remaining = (lockout_until - now).total_seconds() / 60
                return True, int(remaining)
            else:
                # Lockout expired, clear it
                cache.delete(lockout_key)
                return False, 0
        
        return False, 0
    
    @staticmethod
    def record_failed_attempt(username, ip_address):
        """
        Record a failed login attempt
        Returns: (should_lock: bool, attempts_remaining: int, lockout_minutes: int)
        """
        cache_key = AccountLockoutService.get_cache_key(username, ip_address)
        
        # Get current attempts or initialize
        attempts = cache.get(cache_key, [])
        now = timezone.now()
        
        # Add current attempt
        attempts.append(now.isoformat())
        
        # Filter attempts within the window
        window_start = now - timedelta(minutes=ATTEMPT_WINDOW_MINUTES)
        recent_attempts = [
            attempt for attempt in attempts
            if timezone.datetime.fromisoformat(attempt) > window_start
        ]
        
        # Update cache
        cache.set(cache_key, recent_attempts, timeout=ATTEMPT_WINDOW_MINUTES * 60)
        
        attempt_count = len(recent_attempts)
        
        # Check if we should lock the account
        if attempt_count >= MAX_LOGIN_ATTEMPTS:
            lockout_until = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            lockout_key = AccountLockoutService.get_lockout_key(username)
            cache.set(lockout_key, lockout_until, timeout=LOCKOUT_DURATION_MINUTES * 60)
            
            security_logger.critical(
                f'ACCOUNT LOCKED: {username} from IP: {ip_address} - '
                f'{attempt_count} failed attempts. Locked until {lockout_until.isoformat()}'
            )
            
            return True, 0, LOCKOUT_DURATION_MINUTES
        
        attempts_remaining = MAX_LOGIN_ATTEMPTS - attempt_count
        
        security_logger.warning(
            f'Failed login attempt {attempt_count}/{MAX_LOGIN_ATTEMPTS}: '
            f'{username} from IP: {ip_address}. Attempts remaining: {attempts_remaining}'
        )
        
        return False, attempts_remaining, 0
    
    @staticmethod
    def clear_failed_attempts(username, ip_address):
        """
        Clear failed attempts after successful login
        """
        cache_key = AccountLockoutService.get_cache_key(username, ip_address)
        cache.delete(cache_key)
        
        security_logger.info(
            f'Login attempts cleared for {username} from IP: {ip_address} (successful login)'
        )
    
    @staticmethod
    def unlock_account(username):
        """
        Manually unlock an account (e.g., by admin)
        """
        lockout_key = AccountLockoutService.get_lockout_key(username)
        cache.delete(lockout_key)
        
        security_logger.info(f'Account manually unlocked: {username}')
        return True
    
    @staticmethod
    def get_attempts_info(username, ip_address):
        """
        Get current attempt information for user/IP
        Returns: dict with attempt details
        """
        cache_key = AccountLockoutService.get_cache_key(username, ip_address)
        attempts = cache.get(cache_key, [])
        
        now = timezone.now()
        window_start = now - timedelta(minutes=ATTEMPT_WINDOW_MINUTES)
        recent_attempts = [
            attempt for attempt in attempts
            if timezone.datetime.fromisoformat(attempt) > window_start
        ]
        
        is_locked, remaining_minutes = AccountLockoutService.is_locked(username)
        
        return {
            'username': username,
            'ip_address': ip_address,
            'is_locked': is_locked,
            'remaining_lockout_minutes': remaining_minutes,
            'recent_attempts': len(recent_attempts),
            'attempts_remaining': MAX_LOGIN_ATTEMPTS - len(recent_attempts) if not is_locked else 0,
            'max_attempts': MAX_LOGIN_ATTEMPTS,
            'lockout_duration_minutes': LOCKOUT_DURATION_MINUTES,
        }
