"""
Shared permissions and authentication classes for PreciseOptics Eye Hospital Management System
"""
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


# ---------------------------------------------------------------------------
# Token expiry
# ---------------------------------------------------------------------------

# How long a token stays valid after it was created.  Configurable via
# settings.TOKEN_EXPIRY_HOURS so it can be overridden per environment.
_TOKEN_EXPIRY_HOURS = getattr(settings, 'TOKEN_EXPIRY_HOURS', 24)


class ExpiringTokenAuthentication(TokenAuthentication):
    """
    Extends DRF TokenAuthentication to reject tokens older than
    TOKEN_EXPIRY_HOURS (default 24 h).

    Tokens are created at login via Token.objects.get_or_create().
    The `created` field on the Token model is used for the expiry check.
    When a token expires the client receives HTTP 401 and must log in again.
    """

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        expiry_time = token.created + timedelta(hours=_TOKEN_EXPIRY_HOURS)
        if timezone.now() > expiry_time:
            # Delete the expired token so it cannot be used again
            token.delete()
            raise AuthenticationFailed(
                'Token has expired. Please log in again.',
                code='token_expired',
            )

        return user, token


# ---------------------------------------------------------------------------
# Permission classes
# ---------------------------------------------------------------------------

class ReadOnlyOrAuthenticatedPermission(permissions.BasePermission):
    """
    Requires authentication for all operations.
    Write operations additionally require the user to be active.

    Note: Read-only (GET/HEAD/OPTIONS) still requires a valid token —
    all patient data is sensitive and must never be exposed to anonymous users.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated)


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allow access only to the object owner or admin/manager users.
    Assumes the model instance has a `created_by` attribute.
    """

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if getattr(request.user, 'user_type', None) in ('admin', 'manager'):
            return True
        return getattr(obj, 'created_by', None) == request.user
