"""
accounts.views - centralized import module

All view functions and classes are imported here for backwards compatibility.
This allows existing code to continue using:
    from accounts.views import login_view, StaffListCreateView, etc.
"""

# Authentication views
from .auth_views import (
    login_view,
    logout_view,
)

# Two-factor authentication views
from .two_factor_views import (
    setup_2fa,
    verify_2fa_setup,
    verify_backup_code,
    regenerate_backup_codes,
    verify_2fa_login,
    disable_2fa,
    get_2fa_status,
)

# Password reset views
from .password_reset_views import (
    request_password_reset,
    confirm_password_reset,
)

# Staff management views
from .staff_views import (
    StaffListCreateView,
    StaffDetailView,
    staff_statistics,
    SpecializationData,
    create_specialization,
    delete_specialization,
)

# User management views
from .user_views import (
    UserListView,
    UserDetailView,
)

# Lookup views
from .lookup_views import (
    get_departments,
    get_specializations,
    get_user_types,
)

# Explicit __all__ for clarity
__all__ = [
    # Auth
    'login_view',
    'logout_view',
    # 2FA
    'setup_2fa',
    'verify_2fa_setup',
    'verify_backup_code',
    'regenerate_backup_codes',
    'verify_2fa_login',
    'disable_2fa',
    'get_2fa_status',
    # Password reset
    'request_password_reset',
    'confirm_password_reset',
    # Staff
    'StaffListCreateView',
    'StaffDetailView',
    'staff_statistics',
    'SpecializationData',
    'create_specialization',
    'delete_specialization',
    # Users
    'UserListView',
    'UserDetailView',
    # Lookups
    'get_departments',
    'get_specializations',
    'get_user_types',
]
