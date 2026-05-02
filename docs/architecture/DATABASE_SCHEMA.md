# PreciseOptics Database Schema Documentation

**Version**: 1.0  
**Database**: MySQL 8.0.39 (Production) / SQLite 3 (Development)  
**Django Version**: 5.2.7  
**Last Updated**: May 2, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Database Statistics](#database-statistics)
3. [Entity Relationship Summary](#entity-relationship-summary)
4. [Core Modules](#core-modules)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Common Patterns](#common-patterns)
7. [Indexes & Performance](#indexes--performance)
8. [Data Retention & Archival](#data-retention--archival)

---

## Overview

The PreciseOptics database follows a modular Django application architecture with 10 core modules managing different aspects of the eye hospital management system. The schema is designed for:

- **Comprehensive Auditing**: All significant data changes tracked
- **Medical Compliance**: HIPAA/GDPR-ready with full access logging
- **Referential Integrity**: Protected deletes, soft deletes for audit preservation
- **Performance**: Strategic indexes on high-query fields
- **Scalability**: UUID primary keys, efficient relationship design

---

## Database Statistics

| Metric | Count |
|--------|-------|
| **Total Django Apps** | 10 |
| **Total Models** | 65+ |
| **Total Tables** | 70+ (including M2M intermediary tables) |
| **Audit Tables** | 6 dedicated audit models + audit fields in all models |
| **Foreign Key Relationships** | 120+ |
| **Many-to-Many Relationships** | 15+ |
| **Database Indexes** | 180+ |

---

## Entity Relationship Summary

### Core Patient Flow

```
Patient
  ├── PatientVisit (appointments)
  ├── PatientCondition (medical conditions)
  ├── Consultation (clinical consultations)
  ├── Prescription (medication prescriptions)
  ├── Treatment (procedures/treatments)
  ├── EyeTests (14 test types)
  ├── PatientProtocol (treatment protocols)
  ├── AppointmentAlert (alerts)
  ├── Referral (referrals in/out)
  └── PatientDocument (files)
```

### Key Relationships

```
Patient ←→ Consultation ←→ Prescription ←→ PrescriptionItem ←→ Medication
                       ├→ VitalSigns
                       ├→ ConsultationDocument
                       └→ ConsultationImage

Patient ←→ Treatment ←→ TreatmentMedication ←→ Medication
                    ├→ TreatmentCategory
                    ├→ TreatmentType
                    ├→ TreatmentDocument
                    ├→ TreatmentFollowUp
                    └→ TreatmentComplication

Patient ←→ PatientCondition ←→ MedicalCondition
                            └→ ConditionProgress

Patient ←→ PatientProtocol ←→ TreatmentProtocol ←→ ProtocolStep
                                                 ├→ ProtocolStepMedication
                                                 ├→ ProtocolStepTreatment
                                                 └→ ProtocolStepTest

Patient ←→ EyeTests (VisualAcuityTest, RefractionTest, OCTScan, etc.)

Patient ←→ Referral ←→ ReferralSource
                   ├→ ReferralDocument
                   └→ ReferralResponse
```

---

## Core Modules

### 1. Accounts Module (User Management)

**Tables**: 5

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **CustomUser** | System users (staff, doctors) | username, email, role, is_active, 2fa_enabled |
| **StaffProfile** | Extended staff information | user, department, specialization, phone |
| **UserSession** | Active user sessions | user, session_key, ip_address, user_agent |
| **PasswordResetToken** | Password reset tokens | user, token, expires_at, used |
| **TwoFactorBackupCode** | 2FA backup codes | user, code, used, used_at |

**Key Relationships**:
- CustomUser → (1:1) → StaffProfile
- CustomUser → (1:M) → UserSession
- CustomUser → (1:M) → PasswordResetToken
- CustomUser → (1:M) → TwoFactorBackupCode

**Indexes**:
- username, email (unique)
- session_key, token (unique, indexed)
- expires_at (indexed for cleanup queries)

---

### 2. Patients Module (Patient Management)

**Tables**: 6

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Patient** | Core patient records | patient_id, first_name, last_name, dob, gender, phone, email |
| **PatientVisit** | Appointments/visits | patient, scheduled_date, visit_type, status, arrival_time |
| **PatientDocument** | Patient file uploads | patient, document_type, file, description, uploaded_by |
| **AppointmentAlert** | Appointment alerts | patient, visit, alert_type, severity, status, trigger_time |
| **AlertConfiguration** | Alert system settings | late_threshold_minutes, missed_threshold_minutes, is_active |

**Key Relationships**:
- Patient → (1:M) → PatientVisit
- Patient → (1:M) → PatientDocument
- Patient → (1:M) → AppointmentAlert
- PatientVisit → (1:M) → AppointmentAlert

**Indexes**:
- patient_id (unique, indexed)
- scheduled_date, status (indexed for queries)
- alert status, type, severity (indexed)
- trigger_time (indexed for alert queries)

**Unique Constraints**:
- patient_id (system-generated unique identifier)
- email (if provided, must be unique)

---

### 3. Consultations Module (Clinical Consultations)

**Tables**: 4

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Consultation** | Clinical consultations | patient, visit, consultation_type, doctor, chief_complaint, diagnosis |
| **VitalSigns** | Patient vital signs | consultation, blood_pressure, heart_rate, temperature, weight |
| **ConsultationDocument** | Consultation files | consultation, file, document_type, description |
| **ConsultationImage** | Medical images | consultation, image, image_type, eye_side, description |

**Key Relationships**:
- Consultation → (FK) → Patient
- Consultation → (FK) → PatientVisit
- Consultation → (FK) → CustomUser (doctor)
- Consultation → (1:M) → VitalSigns
- Consultation → (1:M) → ConsultationDocument
- Consultation → (1:M) → ConsultationImage

**Indexes**:
- consultation_date (indexed)
- patient, doctor (indexed for filtering)
- consultation_type (indexed)

---

### 4. Conditions Module (Medical Conditions)

**Tables**: 4

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **MedicalCondition** | Master condition list | name, code, category, severity, description |
| **PatientCondition** | Patient-condition link | patient, condition, diagnosis_date, status, diagnosed_by |
| **ConditionProgress** | Condition tracking | patient_condition, progress_date, status, measurements, notes |
| **ConditionDocument** | Condition files | patient_condition, file, document_type, description |

**Key Relationships**:
- PatientCondition → (FK) → Patient
- PatientCondition → (FK) → MedicalCondition
- PatientCondition → (FK) → CustomUser (diagnosed_by)
- PatientCondition → (1:M) → ConditionProgress
- PatientCondition → (1:M) → ConditionDocument

**Categories**: Retinal, Corneal, Glaucoma, Cataract, Refractive, Pediatric, Other

**Indexes**:
- condition code (indexed)
- category, severity (indexed)
- diagnosis_date, status (indexed)

---

### 5. Medications Module (Medication Management)

**Tables**: 8

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **Manufacturer** | Drug manufacturers | name, contact_info, country, is_active |
| **MedicationCategory** | Medication categories | name, description |
| **Medication** | Drug catalog | name, generic_name, bnf_code, category, manufacturer, strength, form |
| **Prescription** | Patient prescriptions | patient, consultation, doctor, prescription_date, status, notes |
| **PrescriptionItem** | Prescription details | prescription, medication, dosage, frequency, duration, quantity |
| **MedicationAdministration** | Administration log | prescription_item, patient, administered_by, administered_at, dose |
| **DrugAllergy** | Patient allergies | patient, medication, allergy_type, severity, reaction, recorded_by |
| **MedicationRecall** | Drug recalls | medication, recall_date, reason, severity, affected_batches |

**Key Relationships**:
- Medication → (FK) → MedicationCategory
- Medication → (FK) → Manufacturer
- Prescription → (FK) → Patient
- Prescription → (FK) → Consultation
- PrescriptionItem → (FK) → Prescription
- PrescriptionItem → (FK) → Medication
- PrescriptionItem → (1:M) → MedicationAdministration
- DrugAllergy → (FK) → Patient
- DrugAllergy → (FK) → Medication (nullable)

**Indexes**:
- bnf_code (unique, indexed)
- medication name (indexed)
- prescription_date, status (indexed)
- allergy severity (indexed)

**Business Rules**:
- Cannot prescribe medication if patient has documented allergy
- Prescription status: draft, active, completed, cancelled
- Validation: dose ranges, drug interactions (future)

---

### 6. Treatments Module (Procedures & Treatments)

**Tables**: 7

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **TreatmentCategory** | Treatment categories | name, code, description |
| **TreatmentType** | Specific treatments | category, name, code, description, duration, cost |
| **Treatment** | Patient treatments | patient, consultation, treatment_type, scheduled_date, status, performed_by |
| **TreatmentMedication** | Medications used | treatment, medication, dosage, administered_at, administered_by |
| **TreatmentDocument** | Treatment files | treatment, file, document_type, description |
| **TreatmentFollowUp** | Follow-up tracking | treatment, follow_up_date, status, notes, completed_by |
| **TreatmentComplication** | Complication log | treatment, complication_date, severity, description, action_taken |

**Key Relationships**:
- TreatmentType → (FK) → TreatmentCategory
- Treatment → (FK) → Patient
- Treatment → (FK) → Consultation
- Treatment → (FK) → TreatmentType
- Treatment → (1:M) → TreatmentMedication
- Treatment → (1:M) → TreatmentDocument
- Treatment → (1:M) → TreatmentFollowUp
- Treatment → (1:M) → TreatmentComplication

**Treatment Categories**: Injection, Laser, Surgery, Other

**Indexes**:
- treatment code (indexed)
- scheduled_date, status (indexed)
- category (indexed)

---

### 7. Eye Tests Module (Diagnostic Tests)

**Tables**: 14 (1 abstract base + 13 concrete test types)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **BaseEyeTest** | Abstract base | patient, performed_by, test_date, notes |
| **VisualAcuityTest** | Visual acuity | distance_right, distance_left, near_right, near_left |
| **RefractionTest** | Refraction | sphere_right, cylinder_right, axis_right, add_right (same for left) |
| **CataractAssessment** | Cataract evaluation | right_lens_status, left_lens_status, cortical_opacity, nuclear_sclerosis |
| **GlaucomaAssessment** | Glaucoma screening | iop_right, iop_left, cup_disc_ratio_right, visual_field_defect |
| **VisualFieldTest** | Field testing | test_type, reliability_index, mean_deviation, pattern_standard_deviation |
| **RetinalAssessment** | Retinal exam | right_macula_status, left_macula_status, hemorrhages, exudates |
| **DiabeticRetinopathyScreening** | DR screening | right_dr_grade, left_dr_grade, macular_edema, proliferative_changes |
| **OCTScan** | OCT imaging | scan_type, right_central_thickness, left_central_thickness, images |
| **VitreoretinalAssessment** | Vitreous/retina | right_vitreous_status, right_retina_status, detachment_risk |
| **StrabismusAssessment** | Alignment | cover_test, prism_test, version_test, convergence |
| **PediatricEyeExam** | Pediatric testing | age_months, visual_behavior, red_reflex, cover_test |
| **EyeCasualtyAssessment** | Emergency | injury_type, eye_affected, foreign_body, trauma_details |
| **CornealAssessment** | Corneal exam | right_cornea_status, left_cornea_status, epithelium_condition |

**Key Relationships**:
- All tests → (FK) → Patient
- All tests → (FK) → CustomUser (performed_by)
- All tests → (FK) → Consultation (optional link)

**Indexes**:
- test_date (indexed)
- patient, performed_by (indexed)
- test-specific critical values (e.g., IOP, DR grade)

**Inheritance**: All test models inherit from BaseEyeTest (Django abstract base class)

---

### 8. Protocols Module (Treatment Protocols)

**Tables**: 10

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **TreatmentProtocol** | Protocol templates | name, code, condition, version, is_active, total_duration |
| **ProtocolStep** | Protocol steps | protocol, step_number, step_name, step_type, required, duration |
| **ProtocolStepMedication** | Medications per step | protocol_step, medication, dosage, frequency |
| **ProtocolStepTreatment** | Treatments per step | protocol_step, treatment_type |
| **ProtocolStepTest** | Tests per step | protocol_step, test_type |
| **PatientProtocol** | Patient-protocol link | patient, protocol, start_date, status, assigned_by |
| **ProtocolStepCompletion** | Step completion | patient_protocol, protocol_step, scheduled_date, completion_date, status |
| **ProtocolStepResult** | Step results | protocol_step_completion, result_type, result_value, notes |
| **ConsentForm** | Consent documents | protocol, patient_protocol, consent_type, signed_date, signature_data |

**Key Relationships**:
- ProtocolStep → (FK) → TreatmentProtocol
- ProtocolStep → (M2M) → Medication (via ProtocolStepMedication)
- ProtocolStep → (M2M) → TreatmentType (via ProtocolStepTreatment)
- PatientProtocol → (FK) → Patient
- PatientProtocol → (FK) → TreatmentProtocol
- ProtocolStepCompletion → (FK) → PatientProtocol
- ProtocolStepCompletion → (FK) → ProtocolStep

**Protocol Categories**: Loading Dose, Maintenance, Taper, Monitor

**Indexes**:
- protocol code (unique, indexed)
- condition (indexed)
- step_number (indexed)
- scheduled_date, completion_date (indexed)

**Business Logic**:
- Steps executed in sequence (step_number)
- Branching logic via conditions on ProtocolStep
- Required vs optional steps enforced
- Status: scheduled, in_progress, completed, skipped, cancelled

---

### 9. Referrals Module (Referral Management)

**Tables**: 4

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **ReferralSource** | Referral sources | name, source_type, contact_info, address, is_active |
| **Referral** | Referrals in/out | patient, referral_source, referral_type, referral_date, urgency, status |
| **ReferralDocument** | Referral files | referral, file, document_type, description |
| **ReferralResponse** | Referral responses | referral, response_date, responded_by, response_text, status |

**Key Relationships**:
- Referral → (FK) → Patient
- Referral → (FK) → ReferralSource
- Referral → (FK) → CustomUser (referred_by)
- Referral → (1:M) → ReferralDocument
- Referral → (1:M) → ReferralResponse

**Referral Types**: Incoming, Outgoing, Internal
**Urgency Levels**: Routine, Urgent, Emergency
**Status**: pending, in_progress, completed, cancelled

**Indexes**:
- referral_date, status (indexed)
- urgency (indexed)
- patient, referral_source (indexed)

---

### 10. Audit Module (Comprehensive Auditing)

**Tables**: 6

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **AuditLog** | General audit trail | user, action, model_name, object_id, changes, ip_address, timestamp |
| **PatientAccessLog** | Patient data access | user, patient, access_type, accessed_data, ip_address, timestamp |
| **MedicationAudit** | Medication changes | medication, user, action, changes, timestamp |
| **ClinicalDecisionAudit** | Clinical decisions | patient, user, decision_type, rationale, outcome, timestamp |
| **DataExportLog** | Data exports | user, export_type, record_count, filters, timestamp, exported_data |
| **ComplianceReport** | Compliance tracking | report_type, generated_by, report_date, findings, status |

**Key Relationships**:
- All audit models → (FK) → CustomUser
- PatientAccessLog, ClinicalDecisionAudit → (FK) → Patient
- MedicationAudit → (FK) → Medication

**Indexes**:
- timestamp (indexed - critical for audit queries)
- user, patient (indexed)
- action, access_type (indexed)
- model_name, object_id (composite index for lookups)

**Retention**: Audit logs retained for 7+ years per medical record requirements

---

## Data Flow Diagrams

### Patient Visit Workflow

```
1. Patient Registration
   Patient → Created/Updated

2. Appointment Scheduling
   PatientVisit → Created (status: scheduled)

3. Alert Generation (Automated)
   If late/missed → AppointmentAlert → Created

4. Check-In
   PatientVisit → Updated (status: checked_in)
   AppointmentAlert → Auto-resolved (if configured)

5. Consultation
   Consultation → Created
   VitalSigns → Recorded
   ConsultationDocument/Image → Uploaded

6. Diagnosis & Planning
   PatientCondition → Created/Updated
   ConditionProgress → Recorded

7. Eye Tests
   One or more EyeTest models → Created
   Tests linked to Consultation

8. Treatment Planning
   Treatment → Scheduled/Performed
   TreatmentMedication → Recorded

9. Prescription
   Prescription → Created
   PrescriptionItem → Added (medications)

10. Protocol Assignment (if applicable)
    PatientProtocol → Created
    ProtocolStepCompletion → Scheduled

11. Follow-up
    TreatmentFollowUp → Scheduled
    PatientVisit → Created (future appointment)

12. Audit Trail
    AuditLog → All actions logged
    PatientAccessLog → Data access logged
```

### Medication Prescription Flow

```
Consultation → Prescription Created → PrescriptionItem Added
                                    ↓
                              Medication Selected
                              (Check DrugAllergy first)
                                    ↓
                              Status: draft → active
                                    ↓
                           MedicationAdministration (if administered on-site)
                                    ↓
                              MedicationAudit logged
```

### Protocol Execution Flow

```
TreatmentProtocol → PatientProtocol Assignment
         ↓
   ProtocolStep (ordered sequence)
         ↓
   ProtocolStepCompletion (each step)
         ├→ ProtocolStepMedication (administered)
         ├→ ProtocolStepTreatment (performed)
         ├→ ProtocolStepTest (conducted)
         └→ ProtocolStepResult (recorded)
         ↓
   Branching logic (conditions met?)
         ↓
   Next step or completion
```

---

## Common Patterns

### 1. Audit Fields Pattern

Almost all models include these fields:

```python
created_at = models.DateTimeField(auto_now_add=True)
updated_at = models.DateTimeField(auto_now=True)
created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
is_active = models.BooleanField(default=True)  # Soft delete
```

### 2. UUID Primary Keys

All patient-related models use UUID primary keys for:
- Security (non-sequential IDs)
- Privacy (no patient count inference)
- Distributed systems (no collision risk)

```python
id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
```

### 3. Protected Deletes

Foreign keys use `on_delete=models.PROTECT` for audit preservation:

```python
patient = models.ForeignKey(Patient, on_delete=models.PROTECT)
```

Exceptions: `on_delete=CASCADE` only for true parent-child relationships where child has no independent meaning.

### 4. JSON Fields

Complex data stored as JSON for flexibility:

```python
measurements = models.JSONField(default=dict, blank=True)
metadata = models.JSONField(default=dict, blank=True)
```

### 5. Choice Fields

Enums using Django choices for data integrity:

```python
STATUS_CHOICES = (
    ('active', 'Active'),
    ('completed', 'Completed'),
    ('cancelled', 'Cancelled'),
)
status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
```

---

## Indexes & Performance

### Critical Indexes

| Table | Indexed Fields | Purpose |
|-------|---------------|---------|
| **Patient** | patient_id, last_name, phone | Fast patient lookup |
| **PatientVisit** | scheduled_date, status | Appointment queries |
| **Consultation** | consultation_date, patient, doctor | Filtering, reports |
| **Prescription** | prescription_date, status, patient | Active prescriptions |
| **Treatment** | scheduled_date, status, treatment_type | Treatment tracking |
| **AppointmentAlert** | status, trigger_time, severity | Alert dashboard |
| **AuditLog** | timestamp, user, model_name | Audit queries |
| **ProtocolStepCompletion** | scheduled_date, completion_date, status | Protocol tracking |
| **Referral** | referral_date, status, urgency | Referral management |

### Composite Indexes

```python
# Example from AppointmentAlert
indexes = [
    models.Index(fields=['status', 'alert_type']),
    models.Index(fields=['trigger_time']),
    models.Index(fields=['-created_at']),
]
```

### Query Optimization

- **select_related()**: Used for ForeignKey relationships (1:1, M:1)
- **prefetch_related()**: Used for reverse ForeignKey, M2M relationships
- Example from views:
```python
queryset = AppointmentAlert.objects.select_related(
    'patient', 'visit', 'acknowledged_by', 'resolved_by'
)
```

---

## Data Retention & Archival

### Retention Policies

| Data Type | Retention Period | Archive Strategy |
|-----------|------------------|------------------|
| **Patient Records** | 7+ years (legal requirement) | Never delete, use is_active flag |
| **Audit Logs** | 7+ years | Partition by year, archive old partitions |
| **Appointments** | 2 years active, then archive | Move to archival table |
| **Prescriptions** | 7+ years | Keep all, mark old as inactive |
| **Eye Test Results** | Permanent | Medical records, never delete |
| **User Sessions** | 30 days | Delete after expiry |
| **Password Reset Tokens** | 7 days | Delete after expiry or use |

### Soft Delete Pattern

Models use `is_active` flag instead of deletion:

```python
# Don't do this
patient.delete()

# Do this
patient.is_active = False
patient.save()
```

Queries automatically filter:

```python
active_patients = Patient.objects.filter(is_active=True)
```

### Backup Strategy

- **Daily Backups**: Full database backup at 2:00 AM
- **Point-in-Time Recovery**: Binary logs retained for 7 days
- **Retention**: Daily backups kept for 30 days, monthly for 7 years
- **Verification**: Weekly restore tests to ensure backup integrity

---

## Migration Strategy

### Adding New Tables

1. Create model in appropriate app
2. Add audit fields (created_at, created_by, is_active)
3. Add indexes for foreign keys and frequently queried fields
4. Run `makemigrations` and `migrate`
5. Update this documentation
6. Update API documentation

### Modifying Existing Tables

1. Use Django migrations for schema changes
2. For data migrations, create custom migration:
```python
from django.db import migrations

def migrate_data(apps, schema_editor):
    Model = apps.get_model('app_name', 'ModelName')
    # Data migration logic

class Migration(migrations.Migration):
    operations = [
        migrations.RunPython(migrate_data),
    ]
```

### Production Migration Checklist

- [ ] Test migration on staging database
- [ ] Estimate migration time (for large tables)
- [ ] Plan maintenance window if needed
- [ ] Backup database before migration
- [ ] Run migration
- [ ] Verify data integrity
- [ ] Monitor performance after migration
- [ ] Update documentation

---

## Database Constraints

### Unique Constraints

| Model | Fields | Reason |
|-------|--------|--------|
| Patient | patient_id | System-generated unique ID |
| CustomUser | username, email | Login credentials |
| Medication | bnf_code | BNF codes are unique |
| TreatmentProtocol | code | Protocol codes unique |
| MedicalCondition | code | Condition codes unique |

### Check Constraints (Application Level)

- Blood pressure values: systolic > diastolic
- Visual acuity: Valid range (e.g., 6/6 to CF)
- IOP: 0-50 mmHg range
- Age calculations: DOB not in future
- Date ranges: end_date > start_date

---

## Security Considerations

### Data Protection

1. **Encryption at Rest**: Database-level encryption for production
2. **Encryption in Transit**: TLS 1.3 for all connections
3. **Field-Level Encryption**: Consider for SSN, sensitive data (future)
4. **Access Control**: Database user has minimal required permissions
5. **Connection Pooling**: Limited connections to prevent exhaustion

### Audit Logging

Every data modification logged with:
- Who (user_id)
- What (action, changes)
- When (timestamp)
- Where (IP address)
- Why (optional notes/context)

### Patient Data Access

All patient data access logged in `PatientAccessLog`:
- User who accessed data
- Which patient
- What data fields accessed
- Timestamp and IP address
- Access reason (if provided)

---

## Performance Tuning

### Database Configuration (MySQL)

```ini
# Recommended settings for production

# InnoDB buffer pool (70-80% of RAM)
innodb_buffer_pool_size = 8G

# Connection pooling
max_connections = 200

# Query cache (if using MySQL 5.7)
query_cache_type = 1
query_cache_size = 256M

# Slow query log
slow_query_log = 1
long_query_time = 2
```

### Query Optimization Tips

1. **Always use select_related/prefetch_related** for related objects
2. **Avoid N+1 queries** - check with Django Debug Toolbar
3. **Use .only() and .defer()** to limit fields retrieved
4. **Paginate large result sets** - never fetch all records
5. **Use .exists()** instead of .count() for boolean checks
6. **Add indexes** on frequently filtered/joined fields

---

## Future Enhancements

### Planned Schema Changes

1. **Audit Partitioning**: Partition AuditLog by month for performance
2. **DICOM Integration**: Add imaging tables for DICOM files
3. **HL7 FHIR**: Add tables for FHIR resource mapping
4. **Analytics Tables**: Denormalized tables for reporting performance
5. **Archival Tables**: Separate tables for archived data (>2 years old)

---

## Appendix: Complete Model List

### Accounts (5 models)
1. CustomUser
2. StaffProfile
3. UserSession
4. PasswordResetToken
5. TwoFactorBackupCode

### Audit (6 models)
1. AuditLog
2. PatientAccessLog
3. MedicationAudit
4. ClinicalDecisionAudit
5. DataExportLog
6. ComplianceReport

### Conditions (4 models)
1. MedicalCondition
2. PatientCondition
3. ConditionProgress
4. ConditionDocument

### Consultations (4 models)
1. Consultation
2. VitalSigns
3. ConsultationDocument
4. ConsultationImage

### Eye Tests (14 models)
1. BaseEyeTest (abstract)
2. VisualAcuityTest
3. RefractionTest
4. CataractAssessment
5. GlaucomaAssessment
6. VisualFieldTest
7. RetinalAssessment
8. DiabeticRetinopathyScreening
9. VitreoretinalAssessment
10. StrabismusAssessment
11. PediatricEyeExam
12. EyeCasualtyAssessment
13. CornealAssessment
14. OCTScan

### Medications (8 models)
1. Manufacturer
2. MedicationCategory
3. Medication
4. Prescription
5. PrescriptionItem
6. MedicationAdministration
7. DrugAllergy
8. MedicationRecall

### Patients (6 models)
1. Patient
2. PatientVisit
3. PatientDocument
4. AppointmentAlert
5. AlertConfiguration

### Protocols (10 models)
1. TreatmentProtocol
2. ProtocolStep
3. ProtocolStepMedication
4. ProtocolStepTreatment
5. ProtocolStepTest
6. PatientProtocol
7. ProtocolStepCompletion
8. ProtocolStepResult
9. ConsentForm

### Referrals (4 models)
1. ReferralSource
2. Referral
3. ReferralDocument
4. ReferralResponse

### Treatments (7 models)
1. TreatmentCategory
2. TreatmentType
3. Treatment
4. TreatmentMedication
5. TreatmentDocument
6. TreatmentFollowUp
7. TreatmentComplication

**Total: 65+ models across 10 apps**

---

## Support & Maintenance

For questions about the database schema:
- **Technical Documentation**: See detailed catalog at `docs/DATABASE_SCHEMA_CATALOG.md`
- **Migration Issues**: Contact database administrator
- **Schema Change Requests**: Submit pull request with migration files
- **Performance Issues**: Run EXPLAIN on slow queries and submit findings

---

**End of Database Schema Documentation**
