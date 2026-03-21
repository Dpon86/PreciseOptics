"""
Management command to generate appointment alerts.
Run this on a schedule (e.g. every 15 minutes via cron) in production.

Usage:
  python manage.py generate_alerts              # Run all alert checks
  python manage.py generate_alerts --type scan  # Scan for late/missed only
  python manage.py generate_alerts --type reminders
  python manage.py generate_alerts --type followups
"""
from django.core.management.base import BaseCommand
from patients.alert_service import AlertService


class Command(BaseCommand):
    help = 'Generate appointment alerts: scan for late/missed, upcoming reminders, overdue follow-ups'

    def add_arguments(self, parser):
        parser.add_argument(
            '--type',
            choices=['all', 'scan', 'reminders', 'followups'],
            default='all',
            help='Type of alerts to generate (default: all)'
        )

    def handle(self, *args, **options):
        alert_type = options['type']

        if alert_type in ('all', 'scan'):
            self.stdout.write('🔍 Scanning appointments for late/missed alerts...')
            stats = AlertService.scan_all_appointments()
            self.stdout.write(self.style.SUCCESS(
                f'  Scanned {stats["scanned"]} visits | '
                f'Late: {stats["late"]} | Missed: {stats["missed"]} | Errors: {stats["errors"]}'
            ))

        if alert_type in ('all', 'reminders'):
            self.stdout.write('📅 Generating upcoming appointment reminders...')
            reminders = AlertService.generate_upcoming_reminders()
            self.stdout.write(self.style.SUCCESS(
                f'  Generated {len(reminders)} reminder alert(s)'
            ))

        if alert_type in ('all', 'followups'):
            self.stdout.write('📋 Checking for overdue follow-ups...')
            followups = AlertService.check_overdue_followups()
            self.stdout.write(self.style.SUCCESS(
                f'  Found {len(followups)} overdue follow-up alert(s)'
            ))

        self.stdout.write(self.style.SUCCESS('✅ Alert generation complete.'))
