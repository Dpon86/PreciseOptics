"""
Alert Service for generating and managing appointment alerts
"""
from django.utils import timezone
from datetime import timedelta
from .models import PatientVisit, AppointmentAlert, AlertConfiguration


class AlertService:
    """
    Service for generating and managing appointment alerts
    """
    
    @staticmethod
    def get_config():
        """Get active alert configuration"""
        return AlertConfiguration.get_active_config()
    
    @staticmethod
    def generate_alerts_for_visit(visit):
        """
        Generate alerts for a specific visit based on its current status and timing
        Returns list of created alerts
        """
        config = AlertService.get_config()
        now = timezone.now()
        created_alerts = []
        
        # Skip if visit is completed, cancelled or patient is checked in
        if visit.status in ['completed', 'cancelled', 'checked_in', 'in_progress']:
            # Auto-resolve any active alerts if configured
            if config.auto_resolve_on_checkin and visit.status in ['checked_in', 'in_progress']:
                AlertService.auto_resolve_visit_alerts(visit)
            return created_alerts
        
        # Calculate time difference
        time_diff = now - visit.scheduled_date
        minutes_late = time_diff.total_seconds() / 60
        
        # Check for late arrival
        if minutes_late > config.late_threshold_minutes and minutes_late <= config.missed_threshold_minutes:
            # Check if late alert already exists
            existing_late = AppointmentAlert.objects.filter(
                visit=visit,
                alert_type='late',
                status='active'
            ).exists()
            
            if not existing_late:
                alert = AppointmentAlert.objects.create(
                    patient=visit.patient,
                    visit=visit,
                    alert_type='late',
                    severity='medium',
                    status='active',
                    title=f"Late Arrival - {visit.patient.get_full_name()}",
                    message=f"Patient {visit.patient.get_full_name()} (ID: {visit.patient.patient_id}) is {int(minutes_late)} minutes late for their {visit.get_visit_type_display()} appointment scheduled at {visit.scheduled_date.strftime('%I:%M %p')}.",
                    trigger_time=now
                )
                created_alerts.append(alert)
        
        # Check for missed appointment
        elif minutes_late > config.missed_threshold_minutes:
            # Check if missed alert already exists
            existing_missed = AppointmentAlert.objects.filter(
                visit=visit,
                alert_type='missed',
                status='active'
            ).exists()
            
            if not existing_missed:
                # Auto-resolve any late alerts
                AppointmentAlert.objects.filter(
                    visit=visit,
                    alert_type='late',
                    status='active'
                ).update(
                    status='resolved',
                    resolved_at=now,
                    action_taken='Auto-resolved: Escalated to missed appointment'
                )
                
                alert = AppointmentAlert.objects.create(
                    patient=visit.patient,
                    visit=visit,
                    alert_type='missed',
                    severity='high',
                    status='active',
                    title=f"Missed Appointment - {visit.patient.get_full_name()}",
                    message=f"Patient {visit.patient.get_full_name()} (ID: {visit.patient.patient_id}) has missed their {visit.get_visit_type_display()} appointment scheduled at {visit.scheduled_date.strftime('%I:%M %p on %b %d, %Y')}. Please contact patient.",
                    trigger_time=now
                )
                created_alerts.append(alert)
        
        return created_alerts
    
    @staticmethod
    def scan_all_appointments():
        """
        Scan all scheduled appointments and generate alerts as needed
        Returns dict with counts of alerts created
        """
        config = AlertService.get_config()
        now = timezone.now()
        
        # Get all scheduled visits that haven't been checked in today
        scheduled_visits = PatientVisit.objects.filter(
            status='scheduled',
            scheduled_date__lte=now
        ).select_related('patient')
        
        stats = {
            'scanned': 0,
            'late': 0,
            'missed': 0,
            'errors': 0
        }
        
        for visit in scheduled_visits:
            stats['scanned'] += 1
            try:
                alerts = AlertService.generate_alerts_for_visit(visit)
                for alert in alerts:
                    if alert.alert_type == 'late':
                        stats['late'] += 1
                    elif alert.alert_type == 'missed':
                        stats['missed'] += 1
            except Exception as e:
                stats['errors'] += 1
                print(f"Error processing visit {visit.id}: {str(e)}")
        
        return stats
    
    @staticmethod
    def generate_upcoming_reminders():
        """
        Generate upcoming appointment reminders
        Returns list of created alerts
        """
        config = AlertService.get_config()
        now = timezone.now()
        reminder_window = now + timedelta(minutes=config.upcoming_reminder_minutes)
        
        # Get visits scheduled within the reminder window
        upcoming_visits = PatientVisit.objects.filter(
            status='scheduled',
            scheduled_date__gte=now,
            scheduled_date__lte=reminder_window
        ).select_related('patient')
        
        created_alerts = []
        
        for visit in upcoming_visits:
            # Check if reminder already exists
            existing_reminder = AppointmentAlert.objects.filter(
                visit=visit,
                alert_type='upcoming',
                status='active'
            ).exists()
            
            if not existing_reminder:
                time_until = visit.scheduled_date - now
                minutes_until = int(time_until.total_seconds() / 60)
                
                alert = AppointmentAlert.objects.create(
                    patient=visit.patient,
                    visit=visit,
                    alert_type='upcoming',
                    severity='low',
                    status='active',
                    title=f"Upcoming Appointment - {visit.patient.get_full_name()}",
                    message=f"Patient {visit.patient.get_full_name()} has a {visit.get_visit_type_display()} appointment in {minutes_until} minutes at {visit.scheduled_date.strftime('%I:%M %p')}.",
                    trigger_time=now
                )
                created_alerts.append(alert)
        
        return created_alerts
    
    @staticmethod
    def check_overdue_followups():
        """
        Check for patients who need follow-up visits
        Returns list of created alerts
        """
        config = AlertService.get_config()
        now = timezone.now()
        followup_threshold = now - timedelta(days=config.overdue_followup_days)
        
        # Get patients who had completed visits but no subsequent visits
        from django.db.models import Max, Q
        
        # Get patients with their last visit date
        patients_with_last_visit = PatientVisit.objects.filter(
            status='completed',
            consultation_end_time__isnull=False
        ).values('patient').annotate(
            last_visit=Max('consultation_end_time')
        ).filter(
            last_visit__lte=followup_threshold
        )
        
        created_alerts = []
        
        for patient_data in patients_with_last_visit:
            patient_id = patient_data['patient']
            last_visit_date = patient_data['last_visit']
            
            # Check if there's a scheduled follow-up
            has_scheduled = PatientVisit.objects.filter(
                patient_id=patient_id,
                status='scheduled',
                scheduled_date__gte=last_visit_date
            ).exists()
            
            if not has_scheduled:
                # Check if alert already exists
                existing_alert = AppointmentAlert.objects.filter(
                    patient_id=patient_id,
                    alert_type='overdue_followup',
                    status='active',
                    trigger_time__gte=followup_threshold
                ).exists()
                
                if not existing_alert:
                    from .models import Patient
                    patient = Patient.objects.get(id=patient_id)
                    days_since = (now - timezone.make_aware(last_visit_date) if timezone.is_naive(last_visit_date) else now - last_visit_date).days
                    
                    alert = AppointmentAlert.objects.create(
                        patient=patient,
                        visit=None,
                        alert_type='overdue_followup',
                        severity='medium',
                        status='active',
                        title=f"Overdue Follow-up - {patient.get_full_name()}",
                        message=f"Patient {patient.get_full_name()} (ID: {patient.patient_id}) hasn't had a visit in {days_since} days. Last visit: {last_visit_date.strftime('%b %d, %Y')}. Consider scheduling follow-up.",
                        trigger_time=now
                    )
                    created_alerts.append(alert)
        
        return created_alerts
    
    @staticmethod
    def auto_resolve_visit_alerts(visit):
        """
        Auto-resolve active alerts for a visit when patient checks in
        """
        updated_count = AppointmentAlert.objects.filter(
            visit=visit,
            status='active',
            alert_type__in=['late', 'missed']
        ).update(
            status='resolved',
            resolved_at=timezone.now(),
            action_taken='Auto-resolved: Patient checked in'
        )
        return updated_count
    
    @staticmethod
    def acknowledge_alert(alert_id, user):
        """
        Mark an alert as acknowledged by a user
        """
        try:
            alert = AppointmentAlert.objects.get(id=alert_id)
            if alert.status == 'active':
                alert.status = 'acknowledged'
                alert.acknowledged_at = timezone.now()
                alert.acknowledged_by = user
                alert.save()
                return True, "Alert acknowledged successfully"
            return False, "Alert is not active"
        except AppointmentAlert.DoesNotExist:
            return False, "Alert not found"
    
    @staticmethod
    def resolve_alert(alert_id, user, action_taken='', notes=''):
        """
        Mark an alert as resolved with action taken
        """
        try:
            alert = AppointmentAlert.objects.get(id=alert_id)
            if alert.status in ['active', 'acknowledged']:
                alert.status = 'resolved'
                alert.resolved_at = timezone.now()
                alert.resolved_by = user
                if action_taken:
                    alert.action_taken = action_taken
                if notes:
                    alert.notes = notes
                alert.save()
                return True, "Alert resolved successfully"
            return False, "Alert is already resolved or dismissed"
        except AppointmentAlert.DoesNotExist:
            return False, "Alert not found"
    
    @staticmethod
    def dismiss_alert(alert_id, user, reason=''):
        """
        Dismiss an alert (mark as not requiring action)
        """
        try:
            alert = AppointmentAlert.objects.get(id=alert_id)
            if alert.status in ['active', 'acknowledged']:
                alert.status = 'dismissed'
                alert.resolved_at = timezone.now()
                alert.resolved_by = user
                if reason:
                    alert.notes = f"Dismissed: {reason}"
                alert.save()
                return True, "Alert dismissed successfully"
            return False, "Cannot dismiss this alert"
        except AppointmentAlert.DoesNotExist:
            return False, "Alert not found"
    
    @staticmethod
    def get_alert_statistics():
        """
        Get statistics about current alerts
        """
        from django.db.models import Count, Q
        
        stats = AppointmentAlert.objects.aggregate(
            total_active=Count('id', filter=Q(status='active')),
            total_acknowledged=Count('id', filter=Q(status='acknowledged')),
            total_resolved_today=Count('id', filter=Q(
                status='resolved',
                resolved_at__date=timezone.now().date()
            )),
            
            # By type
            missed_active=Count('id', filter=Q(status='active', alert_type='missed')),
            late_active=Count('id', filter=Q(status='active', alert_type='late')),
            overdue_followup_active=Count('id', filter=Q(status='active', alert_type='overdue_followup')),
            
            # By severity
            critical_active=Count('id', filter=Q(status='active', severity='critical')),
            high_active=Count('id', filter=Q(status='active', severity='high')),
            medium_active=Count('id', filter=Q(status='active', severity='medium')),
            low_active=Count('id', filter=Q(status='active', severity='low')),
        )
        
        return stats
