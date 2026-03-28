"""
Management command to unlock user accounts
Usage: python manage.py unlock_account <username>
"""
from django.core.management.base import BaseCommand
from precise_optics.account_lockout import AccountLockoutService


class Command(BaseCommand):
    help = 'Unlock a user account that has been locked due to failed login attempts'
    
    def add_arguments(self, parser):
        parser.add_argument(
            'username',
            type=str,
            help='Username of the account to unlock'
        )
    
    def handle(self, *args, **options):
        username = options['username']
        
        # Check if account is locked
        is_locked, remaining_minutes = AccountLockoutService.is_locked(username)
        
        if not is_locked:
            self.stdout.write(
                self.style.WARNING(f'Account "{username}" is not currently locked.')
            )
            return
        
        # Unlock the account
        AccountLockoutService.unlock_account(username)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully unlocked account "{username}" '
                f'(was locked for {remaining_minutes} more minutes)'
            )
        )
