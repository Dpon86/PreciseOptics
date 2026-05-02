"""
Audit utility helpers for PreciseOptics.

Provides:
  - log_patient_access()  — record a PatientAccessLog entry
  - PatientAccessLoggingMixin — DRF mixin that auto-logs retrieve() calls
"""
import logging

logger = logging.getLogger(__name__)

# Access type constants (match PatientAccessLog.ACCESS_TYPES choices)
ACCESS_VIEW_PROFILE = 'view_profile'
ACCESS_VIEW_HISTORY = 'view_medical_history'
ACCESS_VIEW_PRESCRIPTIONS = 'view_prescriptions'
ACCESS_VIEW_TEST_RESULTS = 'view_test_results'
ACCESS_VIEW_IMAGES = 'view_images'


def _get_client_ip(request):
    """Extract the real client IP, honouring X-Forwarded-For in proxy deployments."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Take the first (client) address; the rest are proxies
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')


def _get_session_id(request):
    """Return a short session identifier suitable for the session_id CharField(max_length=50)."""
    # Token-authenticated requests have no Django session
    if request.auth and hasattr(request.auth, 'key'):
        return f"tok:{request.auth.key[:12]}"
    session_key = getattr(request.session, 'session_key', None)
    if session_key:
        return session_key[:50]
    return 'anonymous'


def log_patient_access(request, patient, access_type, data_description=None):
    """
    Create a PatientAccessLog entry for HIPAA-compliant read-access tracking.

    Must not raise — a logging failure must never break an API response.
    The function is a no-op if the request user is not authenticated.

    Args:
        request:          The DRF request object.
        patient:          The Patient model instance being accessed.
        access_type:      One of the ACCESS_* constants above.
        data_description: Optional human-readable description of what was viewed.
                          Defaults to a description based on access_type.
    """
    from audit.models import PatientAccessLog  # local import to avoid circular deps

    if not (request and request.user and request.user.is_authenticated):
        return

    if data_description is None:
        label_map = {
            ACCESS_VIEW_PROFILE: 'Patient profile viewed',
            ACCESS_VIEW_HISTORY: 'Medical history viewed',
            ACCESS_VIEW_PRESCRIPTIONS: 'Prescription records viewed',
            ACCESS_VIEW_TEST_RESULTS: 'Eye test results viewed',
            ACCESS_VIEW_IMAGES: 'Medical images viewed',
        }
        data_description = label_map.get(access_type, 'Patient data viewed')

    try:
        PatientAccessLog.objects.create(
            patient=patient,
            accessed_by=request.user,
            access_type=access_type,
            data_accessed=data_description,
            reason_for_access='Routine clinical access',
            ip_address=_get_client_ip(request),
            session_id=_get_session_id(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
        )
    except Exception:
        # Never allow audit logging to break an API response
        logger.exception(
            "Failed to create PatientAccessLog for patient_id=%s user_id=%s",
            getattr(patient, 'pk', '?'),
            getattr(request.user, 'pk', '?'),
        )


class PatientAccessLoggingMixin:
    """
    DRF ViewSet mixin that logs `retrieve()` calls to PatientAccessLog.

    Apply to any ViewSet whose queryset is or relates to Patient records.

    Override `_get_log_patient()` if the object returned is not itself a Patient
    (e.g. on ConsultationViewSet, the patient is `self.get_object().patient`).

    Override `_get_access_type()` to specify a non-default access type.
    """

    _access_type = ACCESS_VIEW_PROFILE

    def _get_log_patient(self, obj):
        """Return the Patient instance for the given retrieved object."""
        from patients.models import Patient  # local import
        if isinstance(obj, Patient):
            return obj
        return getattr(obj, 'patient', None)

    def _get_access_type(self):
        return self._access_type

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        # Only log successful reads
        if response.status_code == 200:
            try:
                obj = self.get_object()
                patient = self._get_log_patient(obj)
                if patient is not None:
                    log_patient_access(request, patient, self._get_access_type())
            except Exception:
                logger.exception("PatientAccessLoggingMixin: failed to log retrieve access")
        return response
