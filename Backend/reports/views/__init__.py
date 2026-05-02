"""
reports.views - centralized import module

All report functions are imported here for backwards compatibility.
This allows existing code to continue using:
    from reports.views import disease_specific_report, patient_progress_dashboard, etc.
"""

# Report utilities
from .report_utils import _get_int_param

# Patient reports
from .patient_reports import (
    patient_progress_dashboard,
    patient_visits_report,
    medication_patients_report,
)

# Medication reports
from .medication_reports import (
    drug_audit_report,
    batch_tracking_report,
    medication_effectiveness_report,
)

# Eye test reports
from .eye_test_reports import (
    eye_tests_summary_report,
)

# Clinical reports
from .clinical_reports import (
    disease_specific_report,
    followup_alerts,
)

# Financial reports
from .financial_reports import (
    revenue_analysis_report,
)

# Explicit __all__ for clarity
__all__ = [
    # Utils
    '_get_int_param',
    # Patient reports
    'patient_progress_dashboard',
    'patient_visits_report',
    'medication_patients_report',
    # Medication reports
    'drug_audit_report',
    'batch_tracking_report',
    'medication_effectiveness_report',
    # Eye test reports
    'eye_tests_summary_report',
    # Clinical reports
    'disease_specific_report',
    'followup_alerts',
    # Financial reports
    'revenue_analysis_report',
]
