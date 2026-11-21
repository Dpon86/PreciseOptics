"""
Celery tasks for patient appointment notifications.

Tasks:
    notify_coordinator_of_alert  — Email coordinator when an AppointmentAlert fires (2.8)
    scan_appointments_and_notify — Periodic scan that generates alerts and triggers emails (2.8)
    send_upcoming_appointment_reminders — 48h / 24h patient reminder emails (2.9)
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _coordinator_recipients():
    """
    Return a list of coordinator / admin email addresses.

    Priority order:
      1. COORDINATOR_EMAIL setting (single address configured in .env)
      2. Active admin / manager users who have an email address on record
    """
    from accounts.models import CustomUser  # local import to avoid circular deps

    recipients = []

    # Explicitly configured coordinator inbox takes priority
    if getattr(settings, 'COORDINATOR_EMAIL', ''):
        recipients.append(settings.COORDINATOR_EMAIL)

    # Also include any active admin or manager users
    coordinator_users = CustomUser.objects.filter(
        is_active=True,
        user_type__in=['admin', 'manager'],
        email__isnull=False,
    ).exclude(email='').values_list('email', flat=True)

    for email in coordinator_users:
        if email not in recipients:
            recipients.append(email)

    return recipients


# ---------------------------------------------------------------------------
# 2.8 — Coordinator alert notification
# ---------------------------------------------------------------------------

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # 1 minute between retries
    ignore_result=True,
    name='patients.tasks.notify_coordinator_of_alert',
)
def notify_coordinator_of_alert(self, alert_id):
    """
    Send an email to clinic coordinators when an AppointmentAlert is created.

    Called immediately after a new alert is persisted in AlertService.
    """
    from .models import AppointmentAlert  # local import

    try:
        alert = AppointmentAlert.objects.select_related('patient', 'visit').get(id=alert_id)
    except AppointmentAlert.DoesNotExist:
        logger.warning('notify_coordinator_of_alert: alert %s not found — skipping.', alert_id)
        return

    recipients = _coordinator_recipients()
    if not recipients:
        logger.info(
            'notify_coordinator_of_alert: no coordinator recipients configured — email not sent for alert %s.',
            alert_id,
        )
        return

    severity_label = alert.get_severity_display().upper()
    subject = f'[{severity_label}] {alert.title}'
    body = (
        f'Alert type: {alert.get_alert_type_display()}\n'
        f'Severity:   {alert.get_severity_display()}\n'
        f'Patient:    {alert.patient.get_full_name()} (ID: {alert.patient.patient_id})\n'
    )
    if alert.visit:
        body += (
            f'Visit type: {alert.visit.get_visit_type_display()}\n'
            f'Scheduled:  {alert.visit.scheduled_date.strftime("%d %b %Y %H:%M")}\n'
        )
    body += (
        f'\nMessage:\n{alert.message}\n\n'
        f'Triggered at: {alert.trigger_time.strftime("%d %b %Y %H:%M:%S")}\n\n'
        f'Please log in to PreciseOptics to review and resolve this alert.\n'
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        logger.info(
            'notify_coordinator_of_alert: alert %s email sent to %s recipients.',
            alert_id,
            len(recipients),
        )
    except Exception as exc:
        logger.error(
            'notify_coordinator_of_alert: failed to send email for alert %s: %s',
            alert_id,
            exc,
        )
        raise self.retry(exc=exc)


@shared_task(
    ignore_result=True,
    name='patients.tasks.scan_appointments_and_notify',
)
def scan_appointments_and_notify():
    """
    Periodic task (runs every 5 minutes via Celery Beat).

    Invokes AlertService.scan_all_appointments() which generates late / missed
    appointment alerts, then queues a coordinator notification for each new alert.
    """
    from .alert_service import AlertService
    from .models import AppointmentAlert

    # Remember which alert IDs existed before the scan
    existing_ids = set(
        AppointmentAlert.objects.filter(status='active').values_list('id', flat=True)
    )

    stats = AlertService.scan_all_appointments()

    # Find newly created alerts and notify coordinators
    new_alerts = AppointmentAlert.objects.filter(
        status='active',
    ).exclude(id__in=existing_ids)

    queued = 0
    for alert in new_alerts:
        notify_coordinator_of_alert.delay(str(alert.id))
        queued += 1

    logger.info(
        'scan_appointments_and_notify: scanned=%d late=%d missed=%d errors=%d queued_emails=%d',
        stats.get('scanned', 0),
        stats.get('late', 0),
        stats.get('missed', 0),
        stats.get('errors', 0),
        queued,
    )


# ---------------------------------------------------------------------------
# 2.9 — Patient appointment reminder emails (48h and 24h)
# ---------------------------------------------------------------------------

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # 5 minutes between retries
    ignore_result=True,
    name='patients.tasks.send_appointment_reminder_email',
)
def send_appointment_reminder_email(self, visit_id, hours_before):
    """
    Send a single appointment reminder email to the patient.

    Args:
        visit_id (str): UUID of the PatientVisit.
        hours_before (int): 48 or 24 — used in the email subject line.
    """
    from .models import PatientVisit  # local import

    try:
        visit = PatientVisit.objects.select_related('patient', 'primary_doctor').get(id=visit_id)
    except PatientVisit.DoesNotExist:
        logger.warning('send_appointment_reminder_email: visit %s not found — skipping.', visit_id)
        return

    patient = visit.patient
    patient_email = patient.email

    if not patient_email:
        logger.info(
            'send_appointment_reminder_email: patient %s has no email — skipping reminder.',
            patient.patient_id,
        )
        return

    # Don't send reminders for already completed / cancelled visits
    if visit.status in ('completed', 'cancelled', 'no_show'):
        logger.info(
            'send_appointment_reminder_email: visit %s status is %s — skipping.',
            visit_id,
            visit.status,
        )
        return

    hours_label = f'{hours_before} hours'
    if hours_before == 48:
        hours_label = '2 days'

    subject = f'Appointment Reminder — {hours_label} — {visit.scheduled_date.strftime("%d %b %Y")}'

    doctor_name = ''
    if visit.primary_doctor:
        doctor_name = f'Dr. {visit.primary_doctor.get_full_name()}'

    body = (
        f'Dear {patient.first_name},\n\n'
        f'This is a reminder that you have an appointment at PreciseOptics Eye Hospital.\n\n'
        f'Appointment details:\n'
        f'  Type:   {visit.get_visit_type_display()}\n'
        f'  Date:   {visit.scheduled_date.strftime("%A, %d %B %Y")}\n'
        f'  Time:   {visit.scheduled_date.strftime("%I:%M %p")}\n'
    )
    if doctor_name:
        body += f'  Doctor: {doctor_name}\n'
    body += (
        f'\nPlease arrive 10 minutes before your appointment time.\n'
        f'If you need to cancel or rearrange, please contact us as soon as possible.\n\n'
        f'Kind regards,\n'
        f'PreciseOptics Eye Hospital\n'
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[patient_email],
            fail_silently=False,
        )
        logger.info(
            'send_appointment_reminder_email: %sh reminder sent to patient %s for visit %s.',
            hours_before,
            patient.patient_id,
            visit_id,
        )
    except Exception as exc:
        logger.error(
            'send_appointment_reminder_email: failed for visit %s: %s',
            visit_id,
            exc,
        )
        raise self.retry(exc=exc)


@shared_task(
    ignore_result=True,
    name='patients.tasks.send_upcoming_appointment_reminders',
)
def send_upcoming_appointment_reminders():
    """
    Periodic task (runs every hour via Celery Beat).

    Finds all scheduled visits that fall within the 48h and 24h reminder
    windows and queues a reminder email for each, guarding against duplicates
    via the AppointmentAlert table.
    """
    from .models import AppointmentAlert, PatientVisit  # local import

    now = timezone.now()
    sent = 0

    for hours_before in (48, 24):
        window_start = now + timezone.timedelta(hours=hours_before - 1)
        window_end = now + timezone.timedelta(hours=hours_before)

        upcoming_visits = PatientVisit.objects.filter(
            status='scheduled',
            scheduled_date__gt=window_start,
            scheduled_date__lte=window_end,
        ).select_related('patient')

        for visit in upcoming_visits:
            # Skip if patient has no email — no point creating a reminder alert
            if not visit.patient.email:
                continue

            # Guard against duplicate reminders within this window
            reminder_tag = f'email_reminder_{hours_before}h'
            already_sent = AppointmentAlert.objects.filter(
                visit=visit,
                alert_type='upcoming',
                notes__contains=reminder_tag,
            ).exists()

            if already_sent:
                continue

            # Record the reminder in the alert log (avoids re-sending on next run)
            AppointmentAlert.objects.create(
                patient=visit.patient,
                visit=visit,
                alert_type='upcoming',
                severity='low',
                status='resolved',  # Informational only — no coordinator action needed
                title=f'{hours_before}h Email Reminder — {visit.patient.get_full_name()}',
                message=(
                    f'Automated {hours_before}-hour appointment reminder email queued '
                    f'for {visit.patient.get_full_name()} (visit {visit.id}).'
                ),
                trigger_time=now,
                notes=reminder_tag,
            )

            send_appointment_reminder_email.delay(str(visit.id), hours_before)
            sent += 1

    logger.info(
        'send_upcoming_appointment_reminders: queued %d reminder email(s).',
        sent,
    )
