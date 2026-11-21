"""
Celery application for PreciseOptics Eye Hospital Management System.

Workers are started with:
    celery -A precise_optics worker -l info

Beat scheduler (periodic tasks) is started separately:
    celery -A precise_optics beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

In production, both are typically managed by systemd or supervisord.
"""

import os

from celery import Celery

# Point Celery at the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')

app = Celery('precise_optics')

# Read Celery config from Django settings (keys prefixed with CELERY_)
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all INSTALLED_APPS
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Diagnostic task — prints request info to worker log."""
    print(f'Request: {self.request!r}')
