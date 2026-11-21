# PreciseOptics Database Schema Catalog

**Generated:** May 2, 2026  
**Purpose:** Comprehensive catalog of all Django models across Backend applications

---

## Table of Contents

1. [Accounts App](#accounts-app)
2. [Audit App](#audit-app)
3. [Conditions App](#conditions-app)
4. [Consultations App](#consultations-app)
5. [Eye Tests App](#eye-tests-app)
6. [Medications App](#medications-app)
7. [Patients App](#patients-app)
8. [Protocols App](#protocols-app)
9. [Referrals App](#referrals-app)
10. [Treatments App](#treatments-app)

---

## Accounts App

### CustomUser
**Extends:** AbstractUser  
**Description:** Extended user model for eye hospital staff

**Fields:**
- `id` (UUIDField, PK) - UUID primary key
- `user_type` (CharField) - User role: admin, doctor, nurse, technician, receptionist, pharmacist, manager
- `employee_id` (CharField, Unique) - Employee identification number
- `phone_number` (CharField) - Contact phone with validation
- `date_of_birth` (DateField)
- `profile_picture` (ImageField)
- `is_active` (BooleanField) - Account active status
- `two_factor_enabled` (BooleanField) - 2FA enabled flag
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Indexes:** None specified  
**Unique Constraints:** employee_id  
**Ordering:** Not specified

---

### StaffProfile
**Description:** Extended profile information for staff members

**Fields:**
- `user` (OneToOneField → CustomUser) - Related staff member
- `department` (CharField) - ophthalmology, optometry, nursing, pharmacy, administration, reception, diagnostics, surgery
- `specialization` (CharField) - Clinical specialization (cataract, glaucoma, retina, etc.)
- `license_number` (CharField, Unique) - Professional license
- `qualification` (TextField) - Educational qualifications
- `years_of_experience` (PositiveIntegerField)
- `consultation_fee` (DecimalField)
- `availability_schedule` (JSONField) - Weekly schedule
- `emergency_contact` (CharField)
- `address` (TextField)
- `hire_date` (DateField)
- `is_consultant` (BooleanField)
- `can_prescribe` (BooleanField)
- `can_perform_surgery` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Meta:**
- **Table Name:** Not specified
- **Verbose Name:** Staff Profile

**Relationships:**
- OneToOne: CustomUser (CASCADE)

---

### UserSession
**Description:** Track user sessions for audit purposes

**Fields:**
- `user` (ForeignKey → CustomUser)
- `session_key` (CharField)
- `ip_address` (GenericIPAddressField)
- `user_agent` (TextField)
- `login_time` (DateTimeField, auto_now_add)
- `logout_time` (DateTimeField, nullable)
- `is_active` (BooleanField)

**Relationships:**
- ForeignKey: CustomUser (CASCADE)

---

### PasswordResetToken
**Description:** Password reset tokens for email-based recovery

**Fields:**
- `user` (ForeignKey → CustomUser)
- `token` (CharField, Unique)
- `created_at` (DateTimeField, auto_now_add)
- `expires_at` (DateTimeField)
- `is_used` (BooleanField)

**Relationships:**
- ForeignKey: CustomUser (CASCADE)

**Unique Constraints:** token

---

### TwoFactorBackupCode
**Description:** One-time-use backup codes for 2FA recovery

**Fields:**
- `user` (ForeignKey → CustomUser)
- `code_hash` (CharField) - Hashed backup code
- `created_at` (DateTimeField, auto_now_add)
- `used_at` (DateTimeField, nullable)
- `is_used` (BooleanField)

**Relationships:**
- ForeignKey: CustomUser (CASCADE, related_name='backup_codes')

**Ordering:** ['created_at']

---

## Audit App

### AuditLog
**Description:** Comprehensive audit logging for all system activities

**Fields:**
- `id` (UUIDField, PK)
- `user` (ForeignKey → CustomUser, nullable)
- `session_id` (CharField)
- `action` (CharField) - create, read, update, delete, login, logout, export, print, access_denied
- `resource_name` (CharField) - Model or resource name
- `resource_id` (CharField) - ID of affected resource
- `content_type` (ForeignKey → ContentType, nullable) - Generic FK
- `object_id` (CharField, nullable) - Generic FK
- `changes` (JSONField) - Change details
- `old_values` (JSONField) - Previous values
- `new_values` (JSONField) - New values
- `ip_address` (GenericIPAddressField)
- `user_agent` (TextField)
- `request_method` (CharField)
- `request_url` (URLField)
- `description` (TextField) - Human-readable description
- `severity` (CharField) - low, medium, high, critical
- `tags` (CharField) - Comma-separated tags
- `gdpr_relevant` (BooleanField)
- `hipaa_relevant` (BooleanField)
- `timestamp` (DateTimeField, auto_now_add)

**Relationships:**
- ForeignKey: CustomUser (SET_NULL)
- ForeignKey: ContentType (CASCADE)

**Indexes:**
- `['user', 'timestamp']`
- `['action', 'timestamp']`
- `['resource_name', 'timestamp']`
- `['ip_address', 'timestamp']`

**Ordering:** ['-timestamp']

---

### PatientAccessLog
**Description:** Specific audit trail for patient data access

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `accessed_by` (ForeignKey → CustomUser, nullable)
- `access_type` (CharField) - view_profile, view_medical_history, view_prescriptions, etc.
- `data_accessed` (TextField)
- `reason_for_access` (TextField)
- `ip_address` (GenericIPAddressField)
- `session_id` (CharField)
- `user_agent` (TextField)
- `legitimate_interest` (BooleanField)
- `patient_consent` (BooleanField)
- `access_time` (DateTimeField, auto_now_add)
- `session_duration_seconds` (PositiveIntegerField, nullable)

**Relationships:**
- ForeignKey: Patient (PROTECT, related_name='access_logs')
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-access_time']

---

### MedicationAudit
**Description:** Audit trail for medication-related activities

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `medication` (ForeignKey → Medication)
- `prescription` (ForeignKey → Prescription, nullable)
- `action` (CharField) - prescribed, administered, dispensed, discontinued, modified, etc.
- `performed_by` (ForeignKey → CustomUser, nullable)
- `dosage` (CharField)
- `frequency` (CharField)
- `duration` (CharField)
- `interactions_checked` (BooleanField)
- `allergies_checked` (BooleanField)
- `contraindications_reviewed` (BooleanField)
- `indication` (TextField)
- `clinical_notes` (TextField)
- `verified_by` (ForeignKey → CustomUser, nullable, related_name='verified_medications')
- `verification_time` (DateTimeField, nullable)
- `timestamp` (DateTimeField, auto_now_add)

**Relationships:**
- ForeignKey: Patient (PROTECT, related_name='medication_audits')
- ForeignKey: Medication (PROTECT)
- ForeignKey: Prescription (SET_NULL)
- ForeignKey: CustomUser (SET_NULL) x2

**Ordering:** ['-timestamp']

---

### ClinicalDecisionAudit
**Description:** Audit trail for clinical decisions and diagnostic processes

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `decision_maker` (ForeignKey → CustomUser, nullable)
- `decision_type` (CharField) - diagnosis, treatment_plan, surgery_decision, referral, etc.
- `decision_description` (TextField)
- `clinical_reasoning` (TextField)
- `risk_level` (CharField) - low, moderate, high, critical
- `risk_factors` (TextField)
- `mitigation_strategies` (TextField)
- `guidelines_followed` (CharField)
- `evidence_level` (CharField) - level_1 to level_5
- `expected_outcome` (TextField)
- `actual_outcome` (TextField)
- `outcome_date` (DateField, nullable)
- `patient_consent_obtained` (BooleanField)
- `second_opinion_sought` (BooleanField)
- `multidisciplinary_review` (BooleanField)
- `decision_date` (DateTimeField, auto_now_add)

**Relationships:**
- ForeignKey: Patient (PROTECT, related_name='clinical_decisions')
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-decision_date']

---

### DataExportLog
**Description:** Track data exports for compliance and security

**Fields:**
- `id` (UUIDField, PK)
- `exported_by` (ForeignKey → CustomUser, nullable)
- `export_type` (CharField) - patient_data, medical_records, test_results, reports, etc.
- `export_format` (CharField) - pdf, csv, excel, json, xml, dicom
- `file_name` (CharField)
- `file_size_bytes` (BigIntegerField)
- `patient_ids` (TextField) - JSON list
- `date_range_start` (DateField, nullable)
- `date_range_end` (DateField, nullable)
- `filters_applied` (JSONField)
- `encryption_used` (BooleanField)
- `password_protected` (BooleanField)
- `access_expires` (DateTimeField, nullable)
- `export_reason` (TextField)
- `data_controller_approval` (BooleanField)
- `patient_consent_verified` (BooleanField)
- `ip_address` (GenericIPAddressField)
- `user_agent` (TextField)
- `export_time` (DateTimeField, auto_now_add)
- `file_deleted_time` (DateTimeField, nullable)

**Relationships:**
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-export_time']

---

### ComplianceReport
**Description:** Regular compliance and audit reports

**Fields:**
- `id` (UUIDField, PK)
- `report_type` (CharField) - gdpr_compliance, hipaa_compliance, clinical_audit, etc.
- `title` (CharField)
- `description` (TextField)
- `period_start` (DateField)
- `period_end` (DateField)
- `compliance_status` (CharField) - compliant, minor_issues, major_issues, non_compliant
- `key_findings` (TextField)
- `recommendations` (TextField)
- `action_items` (TextField)
- `total_records_reviewed` (PositiveIntegerField)
- `issues_identified` (PositiveIntegerField)
- `issues_resolved` (PositiveIntegerField)
- `generated_by` (ForeignKey → CustomUser, nullable, related_name='generated_reports')
- `reviewed_by` (ForeignKey → CustomUser, nullable, related_name='reviewed_reports')
- `report_file` (FileField)
- `generated_date` (DateTimeField, auto_now_add)
- `review_date` (DateTimeField, nullable)

**Relationships:**
- ForeignKey: CustomUser (SET_NULL) x2

**Ordering:** ['-generated_date']

---

## Conditions App

### MedicalCondition
**Description:** Master list of eye conditions that can be tracked

**Fields:**
- `id` (UUIDField, PK)
- `code` (CharField, Unique) - AMD, RVO, GLAUCOMA, DIABETIC_RET, CATARACT_POST
- `name` (CharField)
- `category` (CharField) - retinal, glaucoma, cataract, corneal, diabetic, vascular, other
- `description` (TextField)
- `symptoms` (TextField)
- `risk_factors` (TextField)
- `typical_progression` (TextField)
- `standard_treatments` (TextField)
- `prognosis` (TextField)
- `has_standard_protocol` (BooleanField)
- `protocol_description` (TextField)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, nullable, related_name='created_conditions')

**Relationships:**
- ForeignKey: CustomUser (SET_NULL)

**Unique Constraints:** code  
**Ordering:** ['category', 'name']

---

### PatientCondition
**Description:** Links patients to their diagnosed conditions

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `condition` (ForeignKey → MedicalCondition)
- `diagnosis_date` (DateField)
- `diagnosed_by` (ForeignKey → CustomUser)
- `severity` (CharField) - mild, moderate, severe, very_severe
- `eye_affected` (CharField) - both, left, right
- `current_status` (CharField) - newly_diagnosed, active, stable, progressing, improving, resolved, managed
- `initial_measurements` (JSONField)
- `treatment_plan` (TextField)
- `medications_prescribed` (TextField)
- `last_assessment_date` (DateField, nullable)
- `next_assessment_date` (DateField, nullable)
- `diagnosis_notes` (TextField)
- `patient_notes` (TextField)
- `is_active` (BooleanField)
- `resolved_date` (DateField, nullable)
- `resolution_notes` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='medical_conditions')
- ForeignKey: MedicalCondition (PROTECT, related_name='patient_cases')
- ForeignKey: CustomUser (PROTECT, related_name='diagnosed_conditions')

**Unique Constraints:** ['patient', 'condition', 'diagnosis_date']  
**Ordering:** ['-diagnosis_date']

---

### ConditionProgress
**Description:** Tracks progress/changes in patient's condition over time

**Fields:**
- `id` (UUIDField, PK)
- `patient_condition` (ForeignKey → PatientCondition)
- `assessment_date` (DateField)
- `assessment_type` (CharField) - routine, urgent, post_treatment, protocol_step, emergency
- `assessed_by` (ForeignKey → CustomUser)
- `status_change` (CharField) - improved, stable, worsened, new_symptoms, resolved
- `severity_at_assessment` (CharField)
- `measurements` (JSONField)
- `clinical_findings` (TextField)
- `subjective_symptoms` (TextField)
- `treatment_changes` (TextField)
- `medications_adjusted` (BooleanField)
- `next_assessment_date` (DateField, nullable)
- `next_assessment_reason` (CharField)
- `assessment_notes` (TextField)
- `images_attached` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: PatientCondition (CASCADE, related_name='progress_records')
- ForeignKey: CustomUser (PROTECT, related_name='condition_assessments')

**Ordering:** ['-assessment_date']

---

### ConditionDocument
**Description:** Documents and images related to patient's condition

**Fields:**
- `id` (UUIDField, PK)
- `patient_condition` (ForeignKey → PatientCondition)
- `progress_record` (ForeignKey → ConditionProgress, nullable)
- `document_type` (CharField) - scan, report, image, consent, referral, protocol, other
- `title` (CharField)
- `description` (TextField)
- `file` (FileField)
- `uploaded_by` (ForeignKey → CustomUser, nullable)
- `uploaded_at` (DateTimeField, auto_now_add)

**Relationships:**
- ForeignKey: PatientCondition (CASCADE, related_name='documents')
- ForeignKey: ConditionProgress (CASCADE, related_name='documents')
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-uploaded_at']

---

## Consultations App

### Consultation
**Description:** Patient consultation records

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `visit` (ForeignKey → PatientVisit)
- `consulting_doctor` (ForeignKey → CustomUser)
- `consultation_type` (CharField) - initial, follow_up, emergency, pre_operative, post_operative, routine_check, second_opinion
- `status` (CharField) - scheduled, in_progress, completed, cancelled, no_show
- `scheduled_time` (DateTimeField)
- `actual_start_time` (DateTimeField, nullable)
- `actual_end_time` (DateTimeField, nullable)
- `chief_complaint` (TextField)
- `history_of_present_illness` (TextField)
- `past_ocular_history` (TextField)
- `past_medical_history` (TextField)
- `family_history` (TextField)
- `social_history` (TextField)
- `current_medications` (TextField)
- `allergies` (TextField)
- `general_examination` (TextField)
- `clinical_impression` (TextField)
- `diagnosis_primary` (TextField)
- `diagnosis_secondary` (TextField)
- `treatment_plan` (TextField)
- `follow_up_required` (BooleanField)
- `follow_up_duration` (CharField)
- `follow_up_instructions` (TextField)
- `referral_required` (BooleanField)
- `referral_to` (CharField)
- `referral_reason` (TextField)
- `consultation_notes` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='consultations')
- ForeignKey: PatientVisit (CASCADE, related_name='consultations')
- ForeignKey: CustomUser (CASCADE, related_name='consultations')

**Ordering:** ['-scheduled_time']

---

### VitalSigns
**Description:** Patient vital signs during consultation

**Fields:**
- `id` (UUIDField, PK)
- `consultation` (OneToOneField → Consultation)
- `blood_pressure_systolic` (PositiveIntegerField, 50-300)
- `blood_pressure_diastolic` (PositiveIntegerField, 30-200)
- `heart_rate` (PositiveIntegerField, 30-220)
- `temperature` (DecimalField, 30.0-45.0)
- `respiratory_rate` (PositiveIntegerField, 8-60)
- `oxygen_saturation` (PositiveIntegerField, 70-100)
- `height_cm` (DecimalField, 50.0-250.0)
- `weight_kg` (DecimalField, 10.0-300.0)
- `bmi` (DecimalField, 10.0-50.0)
- `notes` (TextField)
- `measured_by` (ForeignKey → CustomUser, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- OneToOne: Consultation (CASCADE, related_name='vital_signs')
- ForeignKey: CustomUser (SET_NULL)

---

### ConsultationDocument
**Description:** Documents related to consultations

**Fields:**
- `id` (UUIDField, PK)
- `consultation` (ForeignKey → Consultation)
- `document_type` (CharField) - consultation_notes, medical_certificate, referral_letter, treatment_plan, discharge_summary, consent_form, report, other
- `title` (CharField)
- `content` (TextField)
- `file` (FileField, nullable)
- `created_by` (ForeignKey → CustomUser, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Consultation (CASCADE, related_name='documents')
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-created_at']

---

### ConsultationImage
**Description:** Images taken during consultation

**Fields:**
- `id` (UUIDField, PK)
- `consultation` (ForeignKey → Consultation)
- `image_type` (CharField) - fundus_photo, anterior_segment, external_eye, oct, visual_field, angiogram, ultrasound, x_ray, other
- `eye_side` (CharField) - both, left, right
- `title` (CharField)
- `description` (TextField)
- `image` (ImageField)
- `equipment_used` (CharField)
- `settings` (TextField)
- `findings` (TextField)
- `taken_by` (ForeignKey → CustomUser, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Consultation (CASCADE, related_name='images')
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-created_at']

---

## Eye Tests App

### BaseEyeTest (Abstract)
**Description:** Base abstract model for all eye tests

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `consultation` (ForeignKey → Consultation, nullable)
- `performed_by` (ForeignKey → CustomUser, nullable)
- `test_date` (DateTimeField)
- `eye_side` (CharField) - both, left, right
- `status` (CharField) - scheduled, in_progress, completed, cancelled, incomplete
- `findings` (TextField)
- `recommendations` (TextField)
- `notes` (TextField)
- `follow_up_required` (BooleanField)
- `follow_up_date` (DateField, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Note:** Abstract base class - not a database table

---

### VisualAcuityTest
**Extends:** BaseEyeTest  
**Description:** Visual acuity testing

**Fields (Additional to BaseEyeTest):**
- `test_method` (CharField) - snellen_chart, logmar_chart, etdrs_chart, kay_pictures, lea_symbols, cardiff_cards
- `right_eye_unaided` (CharField)
- `right_eye_aided` (CharField)
- `right_eye_pinhole` (CharField)
- `left_eye_unaided` (CharField)
- `left_eye_aided` (CharField)
- `left_eye_pinhole` (CharField)
- `binocular_vision` (CharField)

---

### RefractionTest
**Extends:** BaseEyeTest  
**Description:** Refraction testing for glasses prescription

**Fields (Additional):**
- `method` (CharField) - subjective, objective, retinoscopy, cycloplegic
- `right_sphere` (DecimalField)
- `right_cylinder` (DecimalField)
- `right_axis` (PositiveIntegerField, 1-180)
- `right_add` (DecimalField)
- `right_prism` (CharField)
- `left_sphere` (DecimalField)
- `left_cylinder` (DecimalField)
- `left_axis` (PositiveIntegerField, 1-180)
- `left_add` (DecimalField)
- `left_prism` (CharField)
- `pupillary_distance` (DecimalField)

---

### CataractAssessment
**Extends:** BaseEyeTest  
**Description:** Comprehensive cataract evaluation

**Fields (Additional):**
- `right_eye_cataract_type` (CharField) - nuclear, cortical, psc, anterior_polar, posterior_polar, traumatic, congenital, mixed
- `right_eye_severity` (CharField) - trace, mild, moderate, severe, mature
- `right_eye_lens_clarity` (TextField)
- `left_eye_cataract_type` (CharField)
- `left_eye_severity` (CharField)
- `left_eye_lens_clarity` (TextField)
- `glare_disability` (BooleanField)
- `contrast_sensitivity_reduced` (BooleanField)
- `visual_function_impact` (TextField)
- `surgery_recommended` (BooleanField)
- `urgency_level` (CharField) - routine, soon, urgent, expedite
- `iol_power_calculation` (TextField)
- `target_refraction` (CharField)

---

### GlaucomaAssessment
**Extends:** BaseEyeTest  
**Description:** Comprehensive glaucoma evaluation

**Fields (Additional):**
- `right_eye_iop` (DecimalField, 0-80 mmHg)
- `left_eye_iop` (DecimalField, 0-80 mmHg)
- `iop_method` (CharField) - goldmann, tonopen, pneumatic, rebound
- `right_disc_cup_ratio` (DecimalField)
- `left_disc_cup_ratio` (DecimalField)
- `right_disc_hemorrhage` (BooleanField)
- `left_disc_hemorrhage` (BooleanField)
- `right_disc_notching` (BooleanField)
- `left_disc_notching` (BooleanField)
- `right_nfl_defect` (BooleanField)
- `left_nfl_defect` (BooleanField)
- `nfl_description` (TextField)
- `visual_field_defects` (BooleanField)
- `family_history_glaucoma` (BooleanField)
- `diabetes` (BooleanField)
- `myopia` (BooleanField)
- `central_corneal_thickness_right` (PositiveIntegerField)
- `central_corneal_thickness_left` (PositiveIntegerField)
- `glaucoma_type` (CharField) - poag, pacg, nsg, secondary, suspect, normal
- `treatment_required` (BooleanField)
- `target_iop` (DecimalField)

---

### VisualFieldTest
**Extends:** BaseEyeTest  
**Description:** Visual field testing (Perimetry)

**Fields (Additional):**
- `test_type` (CharField) - humphrey_24_2, humphrey_30_2, humphrey_10_2, octopus_g1, octopus_m1, goldmann, confrontation
- `strategy` (CharField) - sita_standard, sita_fast, sita_faster, full_threshold
- `right_eye_md` (DecimalField) - Mean Deviation
- `right_eye_psd` (DecimalField) - Pattern Standard Deviation
- `right_eye_vfi` (DecimalField) - Visual Field Index
- `right_eye_reliability` (CharField)
- `left_eye_md` (DecimalField)
- `left_eye_psd` (DecimalField)
- `left_eye_vfi` (DecimalField)
- `left_eye_reliability` (CharField)
- `right_eye_defects` (TextField)
- `left_eye_defects` (TextField)
- `fixation_losses_right` (CharField)
- `false_positives_right` (CharField)
- `false_negatives_right` (CharField)
- `fixation_losses_left` (CharField)
- `false_positives_left` (CharField)
- `false_negatives_left` (CharField)

---

### RetinalAssessment
**Extends:** BaseEyeTest  
**Description:** Medical retina examination

**Fields (Additional):**
- `right_retina_findings` (TextField)
- `left_retina_findings` (TextField)
- `right_macula_normal` (BooleanField)
- `left_macula_normal` (BooleanField)
- `right_macula_findings` (TextField)
- `left_macula_findings` (TextField)
- `arteriovenous_nicking` (BooleanField)
- `cotton_wool_spots` (BooleanField)
- `hard_exudates` (BooleanField)
- `hemorrhages` (BooleanField)
- `microaneurysms` (BooleanField)
- `diabetic_retinopathy_present` (BooleanField)
- `amd_present` (BooleanField)
- `retinal_detachment` (BooleanField)
- `primary_diagnosis` (CharField)
- `secondary_diagnosis` (CharField)

---

### DiabeticRetinopathyScreening
**Extends:** BaseEyeTest  
**Description:** Diabetic retinopathy screening and grading

**Fields (Additional):**
- `diabetes_type` (CharField) - type1, type2, gestational, other
- `diabetes_duration_years` (PositiveIntegerField)
- `last_hba1c` (DecimalField)
- `right_eye_dr_grade` (CharField) - r0, r1, r2, r3a, r3s
- `left_eye_dr_grade` (CharField)
- `right_eye_maculopathy` (CharField) - m0, m1
- `left_eye_maculopathy` (CharField)
- `photo_quality_right` (CharField) - p0, p1
- `photo_quality_left` (CharField)
- `microaneurysms_right` (BooleanField)
- `microaneurysms_left` (BooleanField)
- `hemorrhages_right` (BooleanField)
- `hemorrhages_left` (BooleanField)
- `exudates_right` (BooleanField)
- `exudates_left` (BooleanField)
- `cotton_wool_spots_right` (BooleanField)
- `cotton_wool_spots_left` (BooleanField)
- `venous_beading_right` (BooleanField)
- `venous_beading_left` (BooleanField)
- `irma_right` (BooleanField)
- `irma_left` (BooleanField)
- `neovascularization_right` (BooleanField)
- `neovascularization_left` (BooleanField)
- `referral_required` (BooleanField)
- `referral_urgency` (CharField) - routine, urgent, immediate
- `next_screening_months` (PositiveIntegerField)

---

### VitreoretinalAssessment
**Extends:** BaseEyeTest  
**Description:** Vitreoretinal examination

**Fields (Additional):**
- `right_vitreous_clear` (BooleanField)
- `left_vitreous_clear` (BooleanField)
- `right_vitreous_hemorrhage` (BooleanField)
- `left_vitreous_hemorrhage` (BooleanField)
- `right_pvd` (BooleanField) - Posterior Vitreous Detachment
- `left_pvd` (BooleanField)
- `right_retinal_detachment` (BooleanField)
- `left_retinal_detachment` (BooleanField)
- `rd_type` (CharField) - rhegmatogenous, tractional, exudative
- `right_macular_hole` (BooleanField)
- `left_macular_hole` (BooleanField)
- `right_epiretinal_membrane` (BooleanField)
- `left_epiretinal_membrane` (BooleanField)
- `surgery_required` (BooleanField)
- `surgical_procedure` (CharField)
- `urgency` (CharField) - elective, urgent, emergency

---

### StrabismusAssessment
**Extends:** BaseEyeTest  
**Description:** Strabismus and orthoptic evaluation

**Fields (Additional):**
- `cover_test_distance` (CharField) - orthophoric, esotropia, exotropia, hypertropia_right, hypertropia_left, alternating
- `cover_test_near` (CharField)
- `distance_deviation_horizontal` (CharField)
- `distance_deviation_vertical` (CharField)
- `near_deviation_horizontal` (CharField)
- `near_deviation_vertical` (CharField)
- `right_eye_motility` (TextField)
- `left_eye_motility` (TextField)
- `binocular_movements` (TextField)
- `stereopsis` (CharField)
- `fusion` (CharField) - present, absent, intermittent
- `amblyopia_present` (BooleanField)
- `amblyopic_eye` (CharField) - right, left, bilateral

---

### PediatricEyeExam
**Extends:** BaseEyeTest  
**Description:** Pediatric and orthoptic examination

**Fields (Additional):**
- `age_at_exam` (PositiveIntegerField) - Age in months
- `cooperation_level` (CharField) - excellent, good, fair, poor
- `fixation_right` (CharField) - central_steady, central_unsteady, eccentric, unable_assess
- `fixation_left` (CharField)
- `horizontal_tracking` (BooleanField)
- `vertical_tracking` (BooleanField)
- `smooth_pursuits` (BooleanField)
- `red_reflex_right` (BooleanField)
- `red_reflex_left` (BooleanField)
- `corneal_light_reflex` (CharField) - central, decentered, unable_assess
- `developmental_concerns` (TextField)
- `family_history_eye_problems` (BooleanField)

---

### EyeCasualtyAssessment
**Extends:** BaseEyeTest  
**Description:** Emergency eye casualty examination

**Fields (Additional):**
- `injury_type` (CharField) - blunt_trauma, penetrating, chemical_burn, thermal_burn, foreign_body, flash_burn, laceration, other
- `triage_category` (CharField) - immediate, urgent, less_urgent, non_urgent
- `mechanism_of_injury` (TextField)
- `time_of_injury` (DateTimeField)
- `pain_level` (PositiveIntegerField, 0-10)
- `vision_loss` (BooleanField)
- `diplopia` (BooleanField)
- `photophobia` (BooleanField)
- `discharge` (BooleanField)
- `eyelid_injury` (BooleanField)
- `conjunctival_hemorrhage` (BooleanField)
- `corneal_abrasion` (BooleanField)
- `hyphema` (BooleanField)
- `pupil_abnormality` (BooleanField)
- `irrigation_performed` (BooleanField)
- `foreign_body_removed` (BooleanField)
- `pressure_patch_applied` (BooleanField)
- `admission_required` (BooleanField)
- `surgery_required` (BooleanField)
- `discharge_home` (BooleanField)
- `follow_up_arranged` (BooleanField)

---

### CornealAssessment
**Extends:** BaseEyeTest  
**Description:** Corneal and external eye disease examination

**Fields (Additional):**
- `right_upper_lid_normal` (BooleanField)
- `right_lower_lid_normal` (BooleanField)
- `left_upper_lid_normal` (BooleanField)
- `left_lower_lid_normal` (BooleanField)
- `lid_abnormalities` (TextField)
- `right_conjunctiva_normal` (BooleanField)
- `left_conjunctiva_normal` (BooleanField)
- `conjunctival_injection` (BooleanField)
- `conjunctival_discharge` (BooleanField)
- `right_cornea_clear` (BooleanField)
- `left_cornea_clear` (BooleanField)
- `corneal_opacity` (BooleanField)
- `corneal_edema` (BooleanField)
- `corneal_neovascularization` (BooleanField)
- `fluorescein_staining_performed` (BooleanField)
- `right_staining_pattern` (TextField)
- `left_staining_pattern` (TextField)
- `dry_eye_present` (BooleanField)
- `keratoconus` (BooleanField)
- `corneal_dystrophy` (BooleanField)
- `lubricants_prescribed` (BooleanField)
- `antibiotics_prescribed` (BooleanField)
- `steroids_prescribed` (BooleanField)

---

### OCTScan
**Extends:** BaseEyeTest  
**Description:** Optical Coherence Tomography scans

**Fields (Additional):**
- `scan_type` (CharField) - macula, optic_disc, rnfl, anterior_segment, wide_field
- `machine_model` (CharField)
- `right_central_thickness` (PositiveIntegerField) - Microns
- `right_average_thickness` (PositiveIntegerField)
- `right_findings` (TextField)
- `left_central_thickness` (PositiveIntegerField)
- `left_average_thickness` (PositiveIntegerField)
- `left_findings` (TextField)
- `right_eye_image` (ImageField)
- `left_eye_image` (ImageField)
- `scan_quality` (CharField) - excellent, good, acceptable, poor

---

## Medications App

### Manufacturer
**Description:** Medication manufacturers

**Fields:**
- `id` (UUIDField, PK)
- `name` (CharField, Unique)
- `contact_person` (CharField)
- `email` (EmailField)
- `phone` (CharField)
- `address` (TextField)
- `website` (URLField)
- `country` (CharField)
- `is_certified` (BooleanField) - FDA/WHO certified
- `certification_number` (CharField)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, nullable)

**Relationships:**
- ForeignKey: CustomUser (SET_NULL)

**Unique Constraints:** name  
**Ordering:** ['name']

---

### MedicationCategory
**Description:** Categories for organizing medications

**Fields:**
- `id` (UUIDField, PK)
- `name` (CharField, Unique)
- `description` (TextField)
- `parent_category` (ForeignKey → self, nullable) - Self-referencing for hierarchy
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, nullable)

**Relationships:**
- ForeignKey: Self (SET_NULL, related_name='subcategories')
- ForeignKey: CustomUser (SET_NULL)

**Unique Constraints:** name  
**Ordering:** ['name']

---

### Medication
**Description:** Master medication database

**Fields:**
- `id` (UUIDField, PK)
- `name` (CharField, Unique)
- `generic_name` (CharField)
- `brand_names` (TextField) - Comma-separated
- `medication_type` (CharField) - eye_drop, ointment, tablet, injection, gel, insert, solution
- `therapeutic_class` (CharField) - antibiotic, anti_inflammatory, steroid, antiglaucoma, mydriatic, anesthetic, antiviral, antifungal, lubricant, vasodilator, anti_vegf, immunosuppressive
- `category` (ForeignKey → MedicationCategory, nullable)
- `strength` (CharField)
- `active_ingredients` (TextField)
- `description` (TextField)
- `indications` (TextField)
- `contraindications` (TextField)
- `side_effects` (TextField)
- `standard_dosage` (CharField)
- `maximum_daily_dose` (CharField)
- `storage_temperature` (CharField)
- `shelf_life_months` (PositiveIntegerField)
- `special_handling` (TextField)
- `manufacturer` (CharField) - Legacy field
- `manufacturer_fk` (ForeignKey → Manufacturer, nullable)
- `batch_number` (CharField)
- `expiry_date` (DateField, nullable)
- `approval_status` (BooleanField)
- `current_stock` (PositiveIntegerField)
- `minimum_stock_level` (PositiveIntegerField)
- `unit_price` (DecimalField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, nullable)

**Relationships:**
- ForeignKey: MedicationCategory (SET_NULL, related_name='medications')
- ForeignKey: Manufacturer (SET_NULL, related_name='medications')
- ForeignKey: CustomUser (SET_NULL)

**Unique Constraints:** name  
**Ordering:** ['name']

---

### Prescription
**Description:** Patient prescriptions

**Fields:**
- `id` (UUIDField, PK)
- `prescription_number` (CharField, Unique)
- `patient` (ForeignKey → Patient)
- `visit` (ForeignKey → PatientVisit)
- `prescribing_doctor` (ForeignKey → CustomUser)
- `diagnosis` (TextField)
- `instructions` (TextField)
- `status` (CharField) - active, completed, cancelled, expired
- `date_prescribed` (DateTimeField, auto_now_add)
- `valid_until` (DateField)
- `doctor_notes` (TextField)
- `pharmacy_notes` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='prescriptions')
- ForeignKey: PatientVisit (CASCADE, related_name='prescriptions')
- ForeignKey: CustomUser (CASCADE, related_name='prescriptions')

**Unique Constraints:** prescription_number  
**Ordering:** ['-date_prescribed']

---

### PrescriptionItem
**Description:** Individual medication items in a prescription

**Fields:**
- `id` (UUIDField, PK)
- `prescription` (ForeignKey → Prescription)
- `medication` (ForeignKey → Medication)
- `dosage` (CharField)
- `frequency` (CharField) - once_daily, twice_daily, three_times_daily, four_times_daily, every_2_hours, etc.
- `custom_frequency` (CharField)
- `duration_days` (PositiveIntegerField, 1-365)
- `eye_side` (CharField) - both, left, right
- `special_instructions` (TextField)
- `quantity_prescribed` (PositiveIntegerField)
- `quantity_dispensed` (PositiveIntegerField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Prescription (CASCADE, related_name='items')
- ForeignKey: Medication (CASCADE)

---

### MedicationAdministration
**Description:** Track medication administration in hospital

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `visit` (ForeignKey → PatientVisit)
- `medication` (ForeignKey → Medication)
- `administered_by` (ForeignKey → CustomUser)
- `administration_time` (DateTimeField)
- `route` (CharField) - topical, oral, injection_iv, injection_im, injection_subconjunctival, injection_intravitreal, injection_periocular
- `dosage_administered` (CharField)
- `eye_side` (CharField, nullable) - both, left, right
- `notes` (TextField)
- `adverse_reactions` (TextField)
- `verified_by` (ForeignKey → CustomUser, nullable, related_name='verified_administrations')
- `verification_time` (DateTimeField, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='administrations')
- ForeignKey: PatientVisit (CASCADE, related_name='administrations')
- ForeignKey: Medication (CASCADE)
- ForeignKey: CustomUser (CASCADE, related_name='administered_medications')
- ForeignKey: CustomUser (SET_NULL, related_name='verified_administrations')

**Ordering:** ['-administration_time']

---

### DrugAllergy
**Description:** Patient drug allergies and adverse reactions

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `medication` (ForeignKey → Medication)
- `reaction_type` (CharField) - allergic, adverse, intolerance, interaction
- `severity` (CharField) - mild, moderate, severe, life_threatening
- `symptoms` (TextField)
- `first_occurrence_date` (DateField)
- `last_occurrence_date` (DateField, nullable)
- `documented_by` (ForeignKey → CustomUser, nullable)
- `notes` (TextField)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='drug_allergies')
- ForeignKey: Medication (CASCADE, related_name='allergic_patients')
- ForeignKey: CustomUser (SET_NULL)

**Unique Constraints:** ['patient', 'medication']

---

### MedicationRecall
**Description:** Medication recall notices - track batch/product recalls

**Fields:**
- `id` (UUIDField, PK)
- `medication` (ForeignKey → Medication)
- `batch_number` (CharField) - Specific batch or blank for all batches
- `recall_type` (CharField) - safety, contamination, labelling, quality, expiry, other
- `severity` (CharField) - low, medium, high, critical
- `status` (CharField) - active, acknowledged, resolved, closed
- `title` (CharField)
- `description` (TextField)
- `action_required` (TextField)
- `issued_by` (ForeignKey → CustomUser, related_name='issued_recalls')
- `issued_date` (DateTimeField, auto_now_add)
- `acknowledged_at` (DateTimeField, nullable)
- `acknowledged_by` (ForeignKey → CustomUser, nullable, related_name='acknowledged_recalls')
- `resolved_at` (DateTimeField, nullable)
- `resolved_by` (ForeignKey → CustomUser, nullable, related_name='resolved_recalls')
- `resolution_notes` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Medication (PROTECT, related_name='recalls')
- ForeignKey: CustomUser (PROTECT) x3

**Ordering:** ['-issued_date']

---

## Patients App

### Patient
**Description:** Patient information model

**Fields:**
- `id` (UUIDField, PK)
- `patient_id` (CharField, Unique) - Hospital Patient ID
- `first_name` (CharField)
- `last_name` (CharField)
- `middle_name` (CharField)
- `date_of_birth` (DateField)
- `gender` (CharField) - M, F, O, N
- `blood_group` (CharField) - A+, A-, B+, B-, AB+, AB-, O+, O-
- `phone_number` (CharField)
- `alternate_phone` (CharField)
- `email` (EmailField, nullable)
- `address_line_1` (CharField)
- `address_line_2` (CharField)
- `city` (CharField)
- `state` (CharField)
- `postal_code` (CharField)
- `country` (CharField, default='UK')
- `emergency_contact_name` (CharField)
- `emergency_contact_phone` (CharField)
- `emergency_contact_relationship` (CharField)
- `insurance_provider` (CharField, nullable)
- `insurance_number` (CharField, nullable)
- `nhs_number` (CharField, Unique, nullable)
- `allergies` (TextField)
- `current_medications` (TextField)
- `medical_history` (TextField)
- `registration_date` (DateTimeField, auto_now_add)
- `registered_by` (ForeignKey → CustomUser, nullable)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: CustomUser (SET_NULL)

**Unique Constraints:** patient_id, nhs_number  
**Ordering:** ['-created_at']

---

### PatientVisit
**Description:** Track patient visits to the hospital

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `visit_type` (CharField) - consultation, follow_up, emergency, surgery, diagnostic, routine_check
- `status` (CharField) - scheduled, checked_in, in_progress, completed, cancelled, no_show
- `scheduled_date` (DateTimeField)
- `actual_arrival_time` (DateTimeField, nullable)
- `check_in_time` (DateTimeField, nullable)
- `consultation_start_time` (DateTimeField, nullable)
- `consultation_end_time` (DateTimeField, nullable)
- `primary_doctor` (ForeignKey → CustomUser, nullable, related_name='primary_visits')
- `attending_staff` (ManyToManyField → CustomUser, related_name='attended_visits')
- `chief_complaint` (TextField)
- `notes` (TextField)
- `total_cost` (DecimalField)
- `payment_status` (CharField) - pending, partial, paid, insurance_claim
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='visits')
- ForeignKey: CustomUser (SET_NULL, related_name='primary_visits')
- ManyToMany: CustomUser (related_name='attended_visits')

**Ordering:** ['-scheduled_date']

---

### PatientDocument
**Description:** Store patient documents and images

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `document_type` (CharField) - id_proof, insurance, medical_report, prescription, test_result, consent_form, discharge_summary, referral_letter, photograph, other
- `title` (CharField)
- `description` (TextField)
- `file` (FileField)
- `uploaded_by` (ForeignKey → CustomUser, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='documents')
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-created_at']

---

### AppointmentAlert
**Description:** Track alerts for missed or late appointments

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `visit` (ForeignKey → PatientVisit, nullable)
- `alert_type` (CharField) - missed, late, upcoming, overdue_followup
- `severity` (CharField) - low, medium, high, critical
- `status` (CharField) - active, acknowledged, resolved, dismissed
- `title` (CharField)
- `message` (TextField)
- `trigger_time` (DateTimeField)
- `acknowledged_at` (DateTimeField, nullable)
- `acknowledged_by` (ForeignKey → CustomUser, nullable, related_name='acknowledged_alerts')
- `resolved_at` (DateTimeField, nullable)
- `resolved_by` (ForeignKey → CustomUser, nullable, related_name='resolved_alerts')
- `action_taken` (TextField)
- `notes` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='alerts')
- ForeignKey: PatientVisit (CASCADE, related_name='alerts')
- ForeignKey: CustomUser (SET_NULL) x2

**Indexes:**
- `['status', 'alert_type']`
- `['trigger_time']`
- `['-created_at']`

**Ordering:** ['-trigger_time', '-created_at']

---

### AlertConfiguration
**Description:** System-wide alert configuration settings

**Fields:**
- `id` (UUIDField, PK)
- `late_threshold_minutes` (IntegerField, default=15)
- `missed_threshold_minutes` (IntegerField, default=60)
- `upcoming_reminder_minutes` (IntegerField, default=60)
- `overdue_followup_days` (IntegerField, default=30)
- `auto_resolve_on_checkin` (BooleanField, default=True)
- `auto_dismiss_after_days` (IntegerField, default=7)
- `send_email_alerts` (BooleanField)
- `send_sms_alerts` (BooleanField)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, nullable, related_name='created_alert_configs')

**Relationships:**
- ForeignKey: CustomUser (SET_NULL)

**Ordering:** ['-is_active', '-created_at']

---

## Protocols App

### TreatmentProtocol
**Description:** Master list of treatment protocols for various conditions

**Fields:**
- `id` (UUIDField, PK)
- `name` (CharField)
- `code` (CharField, Unique)
- `protocol_type` (CharField) - loading_dose, maintenance, fixed_interval, treat_extend, prn, post_op, custom
- `condition` (ForeignKey → MedicalCondition)
- `description` (TextField)
- `indications` (TextField)
- `contraindications` (TextField)
- `total_duration_weeks` (PositiveIntegerField, nullable)
- `repeat_interval_weeks` (PositiveIntegerField, nullable)
- `requires_consent` (BooleanField)
- `consent_type` (CharField)
- `expected_outcomes` (TextField)
- `potential_side_effects` (TextField)
- `monitoring_requirements` (TextField)
- `is_active` (BooleanField)
- `created_by` (ForeignKey → CustomUser)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: MedicalCondition (PROTECT, related_name='protocols')
- ForeignKey: CustomUser (PROTECT, related_name='created_protocols')

**Unique Constraints:** code  
**Ordering:** ['condition', 'name']

---

### ProtocolStep
**Description:** Individual steps within a treatment protocol

**Fields:**
- `id` (UUIDField, PK)
- `protocol` (ForeignKey → TreatmentProtocol)
- `step_number` (PositiveIntegerField)
- `step_type` (CharField) - medication, injection, procedure, test, assessment, consultation, follow_up, imaging, multiple
- `title` (CharField)
- `description` (TextField)
- `timing_type` (CharField) - fixed, from_previous, weekly, monthly
- `timing_days` (PositiveIntegerField)
- `timing_window_before` (PositiveIntegerField, default=0)
- `timing_window_after` (PositiveIntegerField, default=0)
- `is_recurring` (BooleanField)
- `recurrence_count` (PositiveIntegerField, nullable)
- `medication` (ForeignKey → Medication, nullable) - Legacy
- `medication_dosage` (CharField)
- `medication_route` (CharField)
- `required_test_type` (CharField) - Legacy
- `pre_instructions` (TextField)
- `post_instructions` (TextField)
- `has_branches` (BooleanField)
- `branch_condition_type` (CharField) - test_result, outcome, measurement, adverse_event, yes_no, met_not_met, free_text, manual
- `branch_logic` (JSONField)
- `parent_step` (ForeignKey → self, nullable, related_name='child_branches')
- `branch_label` (CharField)
- `default_next_step` (ForeignKey → self, nullable, related_name='preceding_steps')
- `is_mandatory` (BooleanField)
- `can_be_rescheduled` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: TreatmentProtocol (CASCADE, related_name='steps')
- ForeignKey: Medication (PROTECT, related_name='protocol_steps')
- ForeignKey: Self (CASCADE/SET_NULL)

**Unique Constraints:** ['protocol', 'step_number']  
**Ordering:** ['protocol', 'step_number']

---

### ProtocolStepMedication
**Description:** Multiple medications per protocol step

**Fields:**
- `id` (UUIDField, PK)
- `protocol_step` (ForeignKey → ProtocolStep)
- `medication` (ForeignKey → Medication)
- `dosage_amount` (CharField)
- `dosage_unit` (CharField)
- `route` (CharField) - oral, topical, intravitreal, subconjunctival, iv, im
- `frequency` (CharField)
- `duration_days` (PositiveIntegerField, nullable)
- `administer_at_same_time` (BooleanField)
- `offset_days` (IntegerField, default=0)
- `special_instructions` (TextField)
- `eye_side` (CharField) - OD, OS, OU
- `order` (PositiveIntegerField, default=0)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: ProtocolStep (CASCADE, related_name='medications')
- ForeignKey: Medication (PROTECT, related_name='step_medications')

**Ordering:** ['protocol_step', 'order']

---

### ProtocolStepTreatment
**Description:** Multiple treatments per protocol step

**Fields:**
- `id` (UUIDField, PK)
- `protocol_step` (ForeignKey → ProtocolStep)
- `treatment_type` (CharField) - injection, laser, surgery, therapy, other
- `treatment_name` (CharField)
- `description` (TextField)
- `administer_at_same_time` (BooleanField)
- `offset_days` (IntegerField, default=0)
- `eye_side` (CharField) - OD, OS, OU
- `expected_duration_minutes` (PositiveIntegerField, nullable)
- `requires_anesthesia` (BooleanField)
- `anesthesia_type` (CharField)
- `special_instructions` (TextField)
- `order` (PositiveIntegerField, default=0)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: ProtocolStep (CASCADE, related_name='treatments')

**Ordering:** ['protocol_step', 'order']

---

### ProtocolStepTest
**Description:** Multiple eye tests per protocol step

**Fields:**
- `id` (UUIDField, PK)
- `protocol_step` (ForeignKey → ProtocolStep)
- `test_type` (CharField) - visual_acuity, refraction, tonometry, oct, visual_field, fluorescein, fundus_photo, slit_lamp, ophthalmoscopy, other
- `test_name` (CharField)
- `description` (TextField)
- `administer_at_same_time` (BooleanField)
- `offset_days` (IntegerField, default=0)
- `eye_side` (CharField) - OD, OS, OU
- `is_baseline` (BooleanField)
- `expected_values` (JSONField)
- `special_instructions` (TextField)
- `order` (PositiveIntegerField, default=0)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: ProtocolStep (CASCADE, related_name='tests')

**Ordering:** ['protocol_step', 'order']

---

### PatientProtocol
**Description:** Protocol assigned to a specific patient

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `protocol` (ForeignKey → TreatmentProtocol)
- `status` (CharField) - pending, active, on_hold, completed, discontinued, cancelled
- `start_date` (DateField)
- `actual_start_date` (DateField, nullable)
- `expected_end_date` (DateField, nullable)
- `actual_end_date` (DateField, nullable)
- `assigned_by` (ForeignKey → CustomUser, related_name='assigned_patient_protocols')
- `assigned_date` (DateTimeField, auto_now_add)
- `assignment_reason` (TextField)
- `discontinuation_reason` (TextField)
- `discontinued_by` (ForeignKey → CustomUser, nullable, related_name='discontinued_patient_protocols')
- `discontinuation_date` (DateField, nullable)
- `completion_notes` (TextField)
- `outcome_assessment` (TextField)
- `protocol_modifications` (TextField)
- `current_step_number` (PositiveIntegerField, default=0)
- `total_steps_completed` (PositiveIntegerField, default=0)
- `adherence_percentage` (DecimalField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (PROTECT, related_name='assigned_protocols')
- ForeignKey: TreatmentProtocol (PROTECT, related_name='patient_assignments')
- ForeignKey: CustomUser (PROTECT) x2

**Ordering:** ['-start_date']

---

### ProtocolStepCompletion
**Description:** Tracking completion of individual protocol steps

**Fields:**
- `id` (UUIDField, PK)
- `patient_protocol` (ForeignKey → PatientProtocol)
- `protocol_step` (ForeignKey → ProtocolStep)
- `scheduled_date` (DateField)
- `scheduled_time` (TimeField, nullable)
- `status` (CharField) - scheduled, completed, missed, rescheduled, cancelled, not_applicable
- `completed_date` (DateField, nullable)
- `completed_time` (TimeField, nullable)
- `completed_by` (ForeignKey → CustomUser, nullable, related_name='completed_protocol_steps')
- `outcome` (CharField) - successful, partial, unsuccessful, adverse_event, deferred
- `clinical_notes` (TextField)
- `measurements` (JSONField)
- `adverse_event` (BooleanField)
- `adverse_event_description` (TextField)
- `original_scheduled_date` (DateField, nullable)
- `reschedule_reason` (TextField)
- `rescheduled_by` (ForeignKey → CustomUser, nullable, related_name='rescheduled_protocol_steps')
- `next_step_date` (DateField, nullable)
- `completed_within_window` (BooleanField)
- `days_variance` (IntegerField, default=0)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: PatientProtocol (CASCADE, related_name='step_completions')
- ForeignKey: ProtocolStep (PROTECT, related_name='completions')
- ForeignKey: CustomUser (PROTECT) x2

**Ordering:** ['patient_protocol', 'scheduled_date']

---

### ProtocolStepResult
**Description:** Results and evaluations for completed protocol steps

**Fields:**
- `id` (UUIDField, PK)
- `step_completion` (ForeignKey → ProtocolStepCompletion)
- `result_type` (CharField) - yes_no, met_not_met, numeric, free_text, scale, multiple_choice
- `result_label` (CharField)
- `result_value_text` (TextField)
- `result_value_numeric` (DecimalField, nullable)
- `result_value_choice` (CharField) - yes, no, met, not_met, improved, stable, worsened, n/a
- `result_value_json` (JSONField)
- `evaluation_notes` (TextField)
- `meets_criteria` (BooleanField, nullable)
- `triggers_branch` (BooleanField)
- `branch_taken` (CharField)
- `next_step_override` (ForeignKey → ProtocolStep, nullable, related_name='result_triggered_steps')
- `evaluated_by` (ForeignKey → CustomUser, related_name='protocol_step_evaluations')
- `evaluated_at` (DateTimeField, auto_now_add)

**Relationships:**
- ForeignKey: ProtocolStepCompletion (CASCADE, related_name='results')
- ForeignKey: ProtocolStep (SET_NULL)
- ForeignKey: CustomUser (PROTECT)

**Ordering:** ['step_completion', 'evaluated_at']

---

### ConsentForm
**Description:** Consent forms for protocols and treatments

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `protocol` (ForeignKey → TreatmentProtocol, nullable)
- `patient_protocol` (ForeignKey → PatientProtocol, nullable)
- `consent_type` (CharField) - treatment, procedure, medication, protocol, surgery, research, data_sharing
- `title` (CharField)
- `description` (TextField)
- `status` (CharField) - pending, obtained, declined, withdrawn, expired
- `consent_given_date` (DateField, nullable)
- `consent_given_time` (TimeField, nullable)
- `expiry_date` (DateField, nullable)
- `consent_document` (FileField, nullable)
- `obtained_by` (ForeignKey → CustomUser, related_name='obtained_consents')
- `witnessed_by` (ForeignKey → CustomUser, nullable, related_name='witnessed_consents')
- `patient_signature` (CharField)
- `patient_understood` (BooleanField)
- `interpreter_used` (BooleanField)
- `interpreter_name` (CharField)
- `withdrawal_date` (DateField, nullable)
- `withdrawal_reason` (TextField)
- `notes` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Patient (PROTECT, related_name='consent_forms')
- ForeignKey: TreatmentProtocol (PROTECT, related_name='consent_forms')
- ForeignKey: PatientProtocol (CASCADE, related_name='consent_forms')
- ForeignKey: CustomUser (PROTECT) x2

**Ordering:** ['-consent_given_date']

---

## Referrals App

### ReferralSource
**Description:** Healthcare providers that can send/receive referrals

**Fields:**
- `id` (UUIDField, PK)
- `name` (CharField)
- `source_type` (CharField) - ophthalmologist, optometrist, hospital, clinic, gp, specialist, other
- `contact_person` (CharField)
- `email` (EmailField)
- `phone` (CharField)
- `fax` (CharField)
- `address_line1` (CharField)
- `address_line2` (CharField)
- `city` (CharField)
- `state` (CharField)
- `postal_code` (CharField)
- `country` (CharField, default='United Kingdom')
- `specialties` (TextField)
- `notes` (TextField)
- `is_active` (BooleanField)
- `is_preferred` (BooleanField)
- `total_referrals_sent` (IntegerField, default=0)
- `total_referrals_received` (IntegerField, default=0)
- `average_response_time_days` (DecimalField, nullable)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser)

**Relationships:**
- ForeignKey: CustomUser (PROTECT, related_name='referral_sources_created')

**Indexes:**
- `['source_type', 'is_active']`
- `['is_preferred', 'is_active']`

**Ordering:** ['name']

---

### Referral
**Description:** Patient referrals to/from other healthcare providers

**Fields:**
- `id` (UUIDField, PK)
- `referral_number` (CharField, Unique)
- `patient` (ForeignKey → Patient)
- `direction` (CharField) - outgoing, incoming
- `referral_source` (ForeignKey → ReferralSource)
- `reason` (CharField) - specialist_opinion, surgical_evaluation, advanced_imaging, subspecialty_care, etc.
- `urgency` (CharField) - routine, soon, urgent, emergency
- `clinical_summary` (TextField)
- `relevant_history` (TextField)
- `current_medications` (TextField)
- `allergies` (TextField)
- `specific_questions` (TextField)
- `requested_services` (TextField)
- `current_status` (CharField) - draft, pending, sent, acknowledged, scheduled, completed, cancelled, rejected
- `status_notes` (TextField)
- `referral_date` (DateField)
- `sent_date` (DateField, nullable)
- `acknowledged_date` (DateField, nullable)
- `appointment_date` (DateField, nullable)
- `completion_date` (DateField, nullable)
- `referred_by` (ForeignKey → CustomUser, related_name='referrals_made')
- `reviewed_by` (ForeignKey → CustomUser, nullable, related_name='referrals_reviewed')
- `outcome_summary` (TextField)
- `follow_up_required` (BooleanField)
- `follow_up_notes` (TextField)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, related_name='referrals_created')

**Relationships:**
- ForeignKey: Patient (PROTECT, related_name='referrals')
- ForeignKey: ReferralSource (PROTECT, related_name='referrals')
- ForeignKey: CustomUser (PROTECT) x3

**Indexes:**
- `['patient', 'current_status']`
- `['referral_source', 'direction']`
- `['current_status', 'urgency']`
- `['referral_date']`

**Unique Constraints:** referral_number  
**Ordering:** ['-referral_date', '-created_at']

---

### ReferralDocument
**Description:** Documents attached to referrals

**Fields:**
- `id` (UUIDField, PK)
- `referral` (ForeignKey → Referral)
- `document_type` (CharField) - referral_letter, test_results, imaging, medical_records, consent_form, response_letter, discharge_summary, other
- `file` (FileField)
- `title` (CharField)
- `description` (TextField)
- `uploaded_at` (DateTimeField, auto_now_add)
- `uploaded_by` (ForeignKey → CustomUser)

**Relationships:**
- ForeignKey: Referral (CASCADE, related_name='documents')
- ForeignKey: CustomUser (PROTECT, related_name='referral_documents_uploaded')

**Ordering:** ['-uploaded_at']

---

### ReferralResponse
**Description:** Responses/communications related to referrals

**Fields:**
- `id` (UUIDField, PK)
- `referral` (ForeignKey → Referral)
- `response_type` (CharField) - acknowledgment, appointment_scheduled, additional_info_requested, clinical_report, discharge_summary, follow_up_recommendation, outcome_report, rejection, other
- `response_date` (DateField)
- `response_content` (TextField)
- `appointment_date` (DateTimeField, nullable)
- `appointment_location` (CharField)
- `additional_tests_required` (TextField)
- `recommendations` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `created_by` (ForeignKey → CustomUser, related_name='referral_responses_created')

**Relationships:**
- ForeignKey: Referral (CASCADE, related_name='responses')
- ForeignKey: CustomUser (PROTECT)

**Ordering:** ['-response_date', '-created_at']

---

## Treatments App

### TreatmentCategory
**Description:** Categories of treatments available

**Fields:**
- `id` (UUIDField, PK)
- `name` (CharField, Unique)
- `category_type` (CharField) - medical, surgical, laser, injection, optical, therapy, emergency, preventive
- `description` (TextField)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser)

**Relationships:**
- ForeignKey: CustomUser (PROTECT, related_name='created_treatment_categories')

**Unique Constraints:** name  
**Ordering:** ['category_type', 'name']

---

### TreatmentType
**Description:** Specific treatment types within categories

**Fields:**
- `id` (UUIDField, PK)
- `category` (ForeignKey → TreatmentCategory)
- `name` (CharField)
- `code` (CharField, Unique) - NHS/OPCS-4 procedure code
- `description` (TextField)
- `typical_duration_minutes` (PositiveIntegerField, nullable)
- `requires_consent` (BooleanField)
- `requires_anesthesia` (CharField) - none, topical, local, regional, general
- `urgency_level` (CharField) - routine, urgent, emergency
- `nice_guidance` (URLField) - Link to NICE guidance
- `contraindications` (TextField)
- `complications` (TextField)
- `success_rate_percentage` (DecimalField, 0-100)
- `estimated_cost_gbp` (DecimalField)
- `waiting_list_weeks` (PositiveIntegerField, nullable)
- `is_active` (BooleanField)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser)

**Relationships:**
- ForeignKey: TreatmentCategory (CASCADE, related_name='treatment_types')
- ForeignKey: CustomUser (PROTECT, related_name='created_treatment_types')

**Unique Constraints:** code  
**Ordering:** ['category__name', 'name']

---

### Treatment
**Description:** Individual treatment instances for patients

**Fields:**
- `id` (UUIDField, PK)
- `patient` (ForeignKey → Patient)
- `consultation` (ForeignKey → Consultation)
- `treatment_type` (ForeignKey → TreatmentType)
- `eye_treated` (CharField) - right, left, both
- `status` (CharField) - planned, scheduled, in_progress, completed, cancelled, postponed, failed
- `priority` (CharField) - routine, urgent, emergency
- `primary_surgeon` (ForeignKey → CustomUser, related_name='primary_treatments')
- `assisting_staff` (ManyToManyField → CustomUser, related_name='assisted_treatments')
- `scheduled_date` (DateTimeField, nullable)
- `actual_start_time` (DateTimeField, nullable)
- `actual_end_time` (DateTimeField, nullable)
- `indication` (TextField)
- `technique_notes` (TextField)
- `anesthesia_used` (CharField)
- `outcome` (CharField) - excellent, good, satisfactory, poor, failed, pending
- `complications_notes` (TextField)
- `post_operative_instructions` (TextField)
- `requires_follow_up` (BooleanField)
- `follow_up_weeks` (PositiveIntegerField, nullable)
- `follow_up_instructions` (TextField)
- `consent_obtained` (BooleanField)
- `consent_date` (DateTimeField, nullable)
- `consent_obtained_by` (ForeignKey → CustomUser, nullable, related_name='consented_treatments')
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)
- `created_by` (ForeignKey → CustomUser, related_name='created_treatments')

**Relationships:**
- ForeignKey: Patient (CASCADE, related_name='treatments')
- ForeignKey: Consultation (CASCADE, related_name='treatments')
- ForeignKey: TreatmentType (PROTECT)
- ForeignKey: CustomUser (PROTECT) x3
- ManyToMany: CustomUser (related_name='assisted_treatments')

**Ordering:** ['-scheduled_date', '-created_at']

---

### TreatmentMedication
**Description:** Medications prescribed as part of treatment

**Fields:**
- `id` (UUIDField, PK)
- `treatment` (ForeignKey → Treatment)
- `medication` (ForeignKey → Medication)
- `timing` (CharField) - pre_operative, intra_operative, post_operative, ongoing
- `dosage` (CharField)
- `frequency` (CharField)
- `duration_days` (PositiveIntegerField, nullable)
- `instructions` (TextField)
- `created_at` (DateTimeField, auto_now_add)
- `created_by` (ForeignKey → CustomUser)

**Relationships:**
- ForeignKey: Treatment (CASCADE, related_name='medications')
- ForeignKey: Medication (PROTECT)
- ForeignKey: CustomUser (PROTECT)

**Ordering:** ['timing', 'medication__name']

---

### TreatmentDocument
**Description:** Documents related to treatments

**Fields:**
- `id` (UUIDField, PK)
- `treatment` (ForeignKey → Treatment)
- `document_type` (CharField) - consent_form, surgical_notes, pre_op_assessment, post_op_notes, discharge_summary, follow_up_plan, complication_report, images, lab_results, other
- `title` (CharField)
- `description` (TextField)
- `file` (FileField)
- `created_at` (DateTimeField, auto_now_add)
- `created_by` (ForeignKey → CustomUser)

**Relationships:**
- ForeignKey: Treatment (CASCADE, related_name='documents')
- ForeignKey: CustomUser (PROTECT)

**Ordering:** ['-created_at']

---

### TreatmentFollowUp
**Description:** Follow-up appointments after treatment

**Fields:**
- `id` (UUIDField, PK)
- `treatment` (ForeignKey → Treatment)
- `scheduled_date` (DateTimeField)
- `status` (CharField) - scheduled, completed, missed, cancelled
- `visual_outcome` (TextField)
- `complications_noted` (TextField)
- `patient_satisfaction` (PositiveIntegerField, 1-10, nullable)
- `further_treatment_required` (BooleanField)
- `next_appointment_weeks` (PositiveIntegerField, nullable)
- `additional_notes` (TextField)
- `assessed_by` (ForeignKey → CustomUser)
- `created_at` (DateTimeField, auto_now_add)
- `updated_at` (DateTimeField, auto_now)

**Relationships:**
- ForeignKey: Treatment (CASCADE, related_name='follow_ups')
- ForeignKey: CustomUser (PROTECT)

**Ordering:** ['-scheduled_date']

---

### TreatmentComplication
**Description:** Complications arising from treatments

**Fields:**
- `id` (UUIDField, PK)
- `treatment` (ForeignKey → Treatment)
- `complication_type` (CharField) - infection, bleeding, vision_loss, retinal_detachment, increased_pressure, allergic_reaction, equipment_failure, anesthesia_reaction, other
- `severity` (CharField) - minor, moderate, major, life_threatening
- `description` (TextField)
- `onset_time` (DateTimeField)
- `resolution_time` (DateTimeField, nullable)
- `treatment_given` (TextField)
- `outcome` (TextField)
- `preventable` (BooleanField, nullable)
- `reported_to_clinical_governance` (BooleanField)
- `incident_number` (CharField)
- `reported_by` (ForeignKey → CustomUser)
- `created_at` (DateTimeField, auto_now_add)

**Relationships:**
- ForeignKey: Treatment (CASCADE, related_name='complications')
- ForeignKey: CustomUser (PROTECT)

**Ordering:** ['-onset_time']

---

## Summary Statistics

**Total Apps:** 10  
**Total Models:** 65+

### Models by App:
- **Accounts:** 5 models
- **Audit:** 6 models
- **Conditions:** 4 models
- **Consultations:** 4 models
- **Eye Tests:** 14+ models (including all test types)
- **Medications:** 8 models
- **Patients:** 4 models
- **Protocols:** 10 models
- **Referrals:** 3 models
- **Treatments:** 7 models

### Key Relationships:
- **Patient-centric:** Most models link to Patient as the central entity
- **Audit Trail:** Comprehensive tracking via created_by, updated_at, created_at fields
- **User Tracking:** All significant actions link to CustomUser
- **Cascade Protection:** Most critical relationships use PROTECT to prevent accidental deletions
- **Generic Relations:** AuditLog uses ContentType for flexible linking

### Common Patterns:
- **UUID Primary Keys:** All models use UUIDField for primary keys
- **Soft Deletes:** Many models use is_active flag instead of hard deletes
- **Timestamp Tracking:** created_at and updated_at on most models
- **User Attribution:** created_by and related user fields on all significant models
- **JSON Fields:** Used extensively for flexible data storage (measurements, settings, etc.)
- **Choices:** Extensive use of CharField with choices for enumerated values
- **Related Names:** Clear, descriptive related_name attributes on all ForeignKeys

---

**Document End**
