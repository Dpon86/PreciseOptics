"""
Celery tasks for medication recall notifications.
"""

import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _recall_notification_recipients():
    """
    Return email addresses for staff who should be alerted about a recall:
    active admin/manager/pharmacist users, plus the configured COORDINATOR_EMAIL.
    """
    from accounts.models import CustomUser

    recipients = []
    if getattr(settings, 'COORDINATOR_EMAIL', ''):
        recipients.append(settings.COORDINATOR_EMAIL)

    staff_emails = CustomUser.objects.filter(
        is_active=True,
        user_type__in=['admin', 'manager', 'pharmacist'],
        email__isnull=False,
    ).exclude(email='').values_list('email', flat=True)

    for email in staff_emails:
        if email not in recipients:
            recipients.append(email)

    return recipients


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    ignore_result=True,
    name='medications.tasks.notify_staff_of_recall',
)
def notify_staff_of_recall(self, recall_id):
    """
    Email clinical/pharmacy staff when a medium+ severity medication recall is issued.
    """
    from django.utils import timezone
    from .models import MedicationRecall

    try:
        recall = MedicationRecall.objects.select_related('medication', 'issued_by').get(id=recall_id)
    except MedicationRecall.DoesNotExist:
        logger.warning('notify_staff_of_recall: recall %s not found — skipping.', recall_id)
        return

    recipients = _recall_notification_recipients()
    if not recipients:
        logger.info('notify_staff_of_recall: no recipients configured — email not sent for recall %s.', recall_id)
        return

    affected_count = recall.affected_prescription_count
    batch_label = f'Batch {recall.batch_number}' if recall.batch_number else 'All batches'

    subject = f'[{recall.get_severity_display().upper()} RECALL] {recall.medication.name} — {recall.title}'
    body = (
        f'Medication: {recall.medication.name}\n'
        f'{batch_label}\n'
        f'Recall type: {recall.get_recall_type_display()}\n'
        f'Severity:    {recall.get_severity_display()}\n'
        f'Issued by:   {recall.issued_by.get_full_name()}\n\n'
        f'Description:\n{recall.description}\n\n'
        f'Action required:\n{recall.action_required}\n\n'
        f'Affected patients identified so far: {affected_count}\n\n'
        f'Please log in to PreciseOptics Recall Centre to review the affected patient list '
        f'and acknowledge this recall.\n'
    )

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipients,
            fail_silently=False,
        )
        recall.notification_sent_at = timezone.now()
        recall.save(update_fields=['notification_sent_at'])
        logger.info(
            'notify_staff_of_recall: recall %s email sent to %s recipients.',
            recall_id,
            len(recipients),
        )
    except Exception as exc:
        logger.error('notify_staff_of_recall: failed to send email for recall %s: %s', recall_id, exc)
        raise self.retry(exc=exc)
