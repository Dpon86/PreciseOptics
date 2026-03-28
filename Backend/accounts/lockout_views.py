"""
Account lockout management views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from precise_optics.account_lockout import AccountLockoutService
from precise_optics.middleware import get_client_ip


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_lockout_status(request):
    """
    Check if a username is currently locked
    POST /api/auth/lockout-status/
    Body: {"username": "someuser"}
    """
    username = request.data.get('username')
    
    if not username:
        return Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Only allow users to check their own status, or admins to check anyone
    if username != request.user.username and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    ip_address = get_client_ip(request)
    info = AccountLockoutService.get_attempts_info(username, ip_address)
    
    return Response(info)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def unlock_account(request):
    """
    Manually unlock a user account (admin only)
    POST /api/auth/unlock-account/
    Body: {"username": "someuser"}
    """
    username = request.data.get('username')
    
    if not username:
        return Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    is_locked, remaining_minutes = AccountLockoutService.is_locked(username)
    
    if not is_locked:
        return Response(
            {'message': f'Account {username} is not locked'},
            status=status.HTTP_200_OK
        )
    
    AccountLockoutService.unlock_account(username)
    
    return Response(
        {
            'message': f'Account {username} has been unlocked',
            'unlocked_by': request.user.username
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def lockout_config(request):
    """
    Get current lockout configuration (admin only)
    GET /api/auth/lockout-config/
    """
    from precise_optics.account_lockout import (
        MAX_LOGIN_ATTEMPTS,
        LOCKOUT_DURATION_MINUTES,
        ATTEMPT_WINDOW_MINUTES
    )
    
    return Response({
        'max_login_attempts': MAX_LOGIN_ATTEMPTS,
        'lockout_duration_minutes': LOCKOUT_DURATION_MINUTES,
        'attempt_window_minutes': ATTEMPT_WINDOW_MINUTES,
        'message': 'After {max} failed attempts within {window} minutes, account locks for {duration} minutes'.format(
            max=MAX_LOGIN_ATTEMPTS,
            window=ATTEMPT_WINDOW_MINUTES,
            duration=LOCKOUT_DURATION_MINUTES
        )
    })
