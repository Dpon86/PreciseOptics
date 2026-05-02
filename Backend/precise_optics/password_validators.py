"""
Custom password validators for PreciseOptics medical system.
Healthcare systems require strong password complexity.
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class PasswordComplexityValidator:
    """
    Enforce that a password contains at least:
    - 1 uppercase letter
    - 1 lowercase letter
    - 1 digit
    - 1 special character
    """

    SPECIAL_CHARS = r'[!@#$%^&*(),.?":{}|<>\-_=+\[\]\\;\'`~/]'

    def validate(self, password, user=None):
        errors = []
        if not re.search(r'[A-Z]', password):
            errors.append(_('Password must contain at least one uppercase letter.'))
        if not re.search(r'[a-z]', password):
            errors.append(_('Password must contain at least one lowercase letter.'))
        if not re.search(r'\d', password):
            errors.append(_('Password must contain at least one digit.'))
        if not re.search(self.SPECIAL_CHARS, password):
            errors.append(_('Password must contain at least one special character (!@#$%^&* etc.).'))
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            'Your password must contain at least one uppercase letter, '
            'one lowercase letter, one digit, and one special character.'
        )
