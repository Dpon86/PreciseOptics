# PreciseOptics Backend - Detailed Models, Views & URLs Reference

## 📊 **COMPLETE BACKEND APPLICATION BREAKDOWN**

---

## 1. **ACCOUNTS APP** - User & Staff Management

### **Models (3 total):**

#### **`CustomUser` (Extended Django User)**
```python
# Extends AbstractUser with eye hospital specific fields
Fields:
├── id: UUIDField (Primary Key)
├── user_type: CharField (admin, doctor, nurse, technician, receptionist, pharmacist, manager)
├── employee_id: CharField (Unique hospital ID)
├── phone_number: CharField (Validated phone format)
├── date_of_birth: DateField
├── profile_picture: ImageField
├── is_active: BooleanField
├── created_at/updated_at: DateTimeField (Audit timestamps)

Purpose: Core user authentication with role-based access control
Relationships: → StaffProfile (OneToOne), → UserSession (ForeignKey)
```

#### **`StaffProfile` (Medical Staff Details)**
```python
# Extended medical staff information and credentials
Fields:
├── user: OneToOneField → CustomUser
├── department: CharField (ophthalmology, optometry, nursing, pharmacy, etc.)
├── specialization: CharField (cataract, glaucoma, retina, diabetic_retinopathy, etc.)
├── license_number: CharField (Medical license - Unique)
├── qualification: TextField (Education & certifications)
├── years_of_experience: PositiveIntegerField
├── consultation_fee: DecimalField (Doctor consultation charges)
├── availability_schedule: JSONField (Weekly schedule)
├── emergency_contact: CharField (Staff emergency contact)
├── address: TextField
├── hire_date: DateField
├── is_consultant: BooleanField (Senior doctor flag)
├── can_prescribe: BooleanField (Prescription authority)
├── can_perform_surgery: BooleanField (Surgery authorization)

Purpose: Medical staff credentials and scheduling
Relationships: → CustomUser (OneToOne)
```

#### **`UserSession` (Audit & Security)**
```python
# Track user sessions for compliance and security
Fields:
├── user: ForeignKey → CustomUser
├── session_key: CharField (Django session identifier)
├── ip_address: GenericIPAddressField (Login source)
├── user_agent: TextField (Browser/device info)
├── login_time: DateTimeField (Session start)
├── logout_time: DateTimeField (Session end - nullable)
├── is_active: BooleanField (Session status)

Purpose: Session tracking for audit compliance and security monitoring
```

### **Views (API Endpoints):**

#### **Authentication Views:**
- **`login_view`** - User authentication endpoint
- **`logout_view`** - User logout endpoint

#### **Staff Management Views:**
- **`StaffListCreateView`** - List all staff / Create new staff
- **`StaffDetailView`** - Retrieve/Update/Delete individual staff
- **`staff_statistics`** - Staff analytics and metrics

#### **User Management Views:**
- **`UserListView`** - List all users with filtering
- **`UserDetailView`** - Individual user details management

#### **Lookup/Helper Views:**
- **`get_departments`** - Available departments list
- **`get_specializations`** - Medical specializations list
- **`get_user_types`** - User role types
- **`create_specialization`** - Add new specialization
- **`delete_specialization`** - Remove specialization

### **URLs Mapping:**
```
/login/                          → login_view
/logout/                         → logout_view
/staff/                          → StaffListCreateView
/staff/<int:pk>/                 → StaffDetailView
/staff/statistics/               → staff_statistics
/users/                          → UserListView
/users/<uuid:pk>/                → UserDetailView
/departments/                    → get_departments
/specializations/                → get_specializations
/user-types/                     → get_user_types
/specializations/                → create_specialization
/specializations/<int:spec_id>/  → delete_specialization
```

---

## 2. **PATIENTS APP** - Patient Records & Visits

### **Models (3 total):**

#### **`Patient` (Core Patient Information)**
```python
# Comprehensive patient demographics and medical information
Fields:
├── id: UUIDField (Primary Key)
├── patient_id: CharField (Hospital Patient ID - Unique)
├── first_name/last_name/middle_name: CharField (Personal details)
├── date_of_birth: DateField
├── gender: CharField (M/F/O/N - Male/Female/Other/Prefer not to say)
├── blood_group: CharField (A+, A-, B+, B-, AB+, AB-, O+, O-)
├── phone_number: CharField (Primary contact - Validated format)
├── alternate_phone: CharField (Secondary contact)
├── email: EmailField
├── address/city/state/postal_code/country: CharField (Address details)
├── emergency_contact_name: CharField
├── emergency_contact_phone: CharField (Validated format)
├── emergency_contact_relationship: CharField
├── insurance_provider/insurance_number: CharField (Insurance details)
├── nhs_number: CharField (UK NHS number - Unique)
├── allergies: TextField (Known allergies)
├── current_medications: TextField (Current treatments)
├── medical_history: TextField (Past medical conditions)
├── registration_date: DateTimeField
├── is_active: BooleanField
├── created_at/updated_at: DateTimeField

Purpose: Central patient registry with complete demographic and medical data
Relationships: → PatientVisit (ForeignKey), → Consultation (ForeignKey)
```

#### **`PatientVisit` (Appointment & Visit Tracking)**
```python
# Individual patient visits and appointments
Fields:
├── id: UUIDField (Primary Key)
├── patient: ForeignKey → Patient
├── visit_date: DateTimeField
├── visit_type: CharField (consultation, follow_up, emergency, screening, surgery)
├── reason_for_visit: TextField
├── appointment_status: CharField (scheduled, arrived, in_progress, completed, cancelled)
├── assigned_doctor: ForeignKey → CustomUser
├── department: CharField
├── priority_level: CharField (low, medium, high, urgent)
├── check_in_time: DateTimeField
├── check_out_time: DateTimeField
├── waiting_time_minutes: PositiveIntegerField
├── consultation_duration: PositiveIntegerField
├── diagnosis: TextField
├── treatment_provided: TextField
├── follow_up_required: BooleanField
├── follow_up_date: DateField
├── notes: TextField
├── created_at/updated_at: DateTimeField

Purpose: Track patient appointments, visits, and outcomes
Relationships: → Patient (ForeignKey), → CustomUser (assigned_doctor)
```

#### **`PatientNote` (Clinical Notes)**
```python
# Clinical observations and notes
Fields:
├── id: UUIDField (Primary Key)
├── patient: ForeignKey → Patient
├── author: ForeignKey → CustomUser (Note creator)
├── note_type: CharField (clinical, administrative, discharge, referral)
├── title: CharField
├── content: TextField (Note content)
├── visibility: CharField (public, private, doctor_only)
├── is_confidential: BooleanField
├── follow_up_required: BooleanField
├── follow_up_date: DateField
├── tags: CharField (Searchable tags)
├── created_at/updated_at: DateTimeField

Purpose: Clinical documentation and communication
Relationships: → Patient (ForeignKey), → CustomUser (author)
```

### **Views (ViewSets - RESTful CRUD):**

#### **`PatientViewSet`**
```python
# Full CRUD operations for patients
Features:
├── List patients with filtering (name, patient_id, date_of_birth)
├── Create new patient records with validation
├── Retrieve individual patient details
├── Update patient information
├── Soft delete (deactivate) patients
├── Search functionality (name, phone, NHS number)
├── Patient statistics and demographics
```

#### **`PatientVisitViewSet`**
```python
# Manage patient visits and appointments
Features:
├── Schedule new appointments
├── Update visit status and details
├── Track appointment history
├── Filter by patient, date, doctor, department
├── Calculate waiting times and metrics
```

### **URLs (REST API):**
```
/api/patients/                   → PatientViewSet (CRUD operations)
  ├── GET    /                   → List all patients
  ├── POST   /                   → Create new patient
  ├── GET    /<uuid:id>/         → Retrieve patient details
  ├── PUT    /<uuid:id>/         → Update patient
  ├── DELETE /<uuid:id>/         → Deactivate patient

/api/visits/                     → PatientVisitViewSet (CRUD operations)
  ├── GET    /                   → List all visits
  ├── POST   /                   → Schedule new visit
  ├── GET    /<uuid:id>/         → Visit details
  ├── PUT    /<uuid:id>/         → Update visit
  ├── DELETE /<uuid:id>/         → Cancel visit
```

---

## 3. **CONSULTATIONS APP** - Medical Consultations

### **Models (4 total):**

#### **`Consultation` (Main Consultation Record)**
```python
# Core consultation documentation
Fields:
├── id: UUIDField (Primary Key)
├── patient: ForeignKey → Patient
├── doctor: ForeignKey → CustomUser
├── consultation_date: DateTimeField
├── consultation_type: CharField (initial, follow_up, emergency, second_opinion)
├── duration_minutes: PositiveIntegerField
├── chief_complaint: TextField (Patient's main concern)
├── history_of_present_illness: TextField
├── examination_findings: TextField (Physical examination results)
├── diagnosis: TextField (Medical diagnosis)
├── differential_diagnosis: TextField (Alternative diagnoses)
├── treatment_plan: TextField (Prescribed treatment)
├── medications_prescribed: JSONField (List of prescribed medications)
├── follow_up_instructions: TextField
├── follow_up_date: DateField
├── referrals: TextField (Specialist referrals)
├── consultation_fee: DecimalField
├── status: CharField (in_progress, completed, cancelled)
├── notes: TextField (Additional notes)
├── created_at/updated_at: DateTimeField

Purpose: Central consultation documentation with clinical details
Relationships: → Patient, → CustomUser (doctor), → VitalSigns, → Documents, → Images
```

#### **`VitalSigns` (Patient Vital Signs)**
```python
# Vital signs recorded during consultation
Fields:
├── consultation: ForeignKey → Consultation
├── recorded_by: ForeignKey → CustomUser
├── blood_pressure_systolic: PositiveIntegerField
├── blood_pressure_diastolic: PositiveIntegerField
├── heart_rate: PositiveIntegerField (bpm)
├── temperature: DecimalField (°C)
├── respiratory_rate: PositiveIntegerField
├── oxygen_saturation: DecimalField (%)
├── weight: DecimalField (kg)
├── height: DecimalField (cm)
├── bmi: DecimalField (calculated)
├── intraocular_pressure_od: DecimalField (Right eye IOP)
├── intraocular_pressure_os: DecimalField (Left eye IOP)
├── pupil_response_od: CharField (Right eye pupil reaction)
├── pupil_response_os: CharField (Left eye pupil reaction)
├── notes: TextField
├── recorded_at: DateTimeField

Purpose: Standardized vital signs documentation
```

#### **`ConsultationDocument` (Attached Documents)**
```python
# Document attachments for consultations
Fields:
├── consultation: ForeignKey → Consultation
├── uploaded_by: ForeignKey → CustomUser
├── document_type: CharField (report, referral, insurance, consent, prescription)
├── title: CharField
├── description: TextField
├── file: FileField (Document file)
├── file_size: PositiveIntegerField
├── mime_type: CharField
├── is_confidential: BooleanField
├── patient_accessible: BooleanField
├── upload_date: DateTimeField

Purpose: Document management and attachment system
```

#### **`ConsultationImage` (Medical Images)**
```python
# Medical images and photographs
Fields:
├── consultation: ForeignKey → Consultation
├── uploaded_by: ForeignKey → CustomUser
├── image_type: CharField (fundus_photo, oct_scan, visual_field, slit_lamp, external)
├── eye_side: CharField (both, left, right, not_applicable)
├── title: CharField
├── description: TextField
├── image: ImageField
├── image_size: PositiveIntegerField
├── capture_date: DateTimeField
├── equipment_used: CharField
├── settings_used: JSONField
├── annotations: JSONField (Image annotations)
├── is_before_treatment: BooleanField
├── is_after_treatment: BooleanField

Purpose: Medical imaging management with metadata
```

### **Views (ViewSets):**

#### **`ConsultationViewSet`**
```python
# Complete consultation management
Features:
├── Create new consultations
├── Update consultation details
├── List consultations with filtering
├── Generate consultation reports
├── Track consultation metrics
```

#### **`VitalSignsViewSet`**
```python
# Vital signs management
Features:
├── Record vital signs during consultation
├── Update vital sign measurements
├── Historical vital signs tracking
├── Trend analysis
```

#### **`ConsultationDocumentViewSet`**
```python
# Document management
Features:
├── Upload consultation documents
├── Document categorization
├── Access control and permissions
├── Document version tracking
```

#### **`ConsultationImageViewSet`**
```python
# Medical image management
Features:
├── Upload medical images
├── Image metadata management
├── Before/after treatment comparisons
├── Equipment and settings tracking
```

### **URLs (REST API):**
```
/api/consultations/              → ConsultationViewSet
/api/vital-signs/               → VitalSignsViewSet
/api/consultation-documents/    → ConsultationDocumentViewSet
/api/consultation-images/       → ConsultationImageViewSet
```

---

## 4. **MEDICATIONS APP** - Medication Management

### **Models (5 total):**

#### **`Medication` (Drug Catalog)**
```python
# Comprehensive medication database
Fields:
├── id: UUIDField (Primary Key)
├── name: CharField (Medication name)
├── generic_name: CharField (Generic drug name)
├── brand_names: TextField (Commercial brand names)
├── medication_type: CharField (eye_drop, ointment, tablet, injection, implant)
├── therapeutic_class: CharField (antibiotic, anti_inflammatory, glaucoma_med, etc.)
├── strength: CharField (Dosage strength)
├── dosage_forms: CharField (Available forms)
├── route_of_administration: CharField (topical, oral, iv, im, subconjunctival)
├── manufacturer: CharField
├── description: TextField
├── indications: TextField (Medical uses)
├── contraindications: TextField (When not to use)
├── side_effects: TextField (Known side effects)
├── drug_interactions: TextField (Interaction warnings)
├── pregnancy_category: CharField (Pregnancy safety rating)
├── storage_instructions: TextField
├── prescription_required: BooleanField
├── controlled_substance: BooleanField
├── active_ingredients: JSONField
├── is_active: BooleanField

Purpose: Complete medication database with safety information
```

#### **`Prescription` (Patient Prescriptions)**
```python
# Prescription management
Fields:
├── id: UUIDField (Primary Key)
├── patient: ForeignKey → Patient
├── prescribed_by: ForeignKey → CustomUser
├── consultation: ForeignKey → Consultation
├── prescription_date: DateTimeField
├── status: CharField (active, completed, cancelled, expired)
├── total_cost: DecimalField
├── insurance_covered: BooleanField
├── notes: TextField
├── created_at/updated_at: DateTimeField

Purpose: Prescription header with patient and doctor details
Relationships: → PrescriptionItem (prescription items)
```

#### **`PrescriptionItem` (Individual Prescribed Medications)**
```python
# Individual medications in a prescription
Fields:
├── prescription: ForeignKey → Prescription
├── medication: ForeignKey → Medication
├── dosage: CharField (Amount per dose)
├── frequency: CharField (How often to take)
├── duration: CharField (How long to take)
├── quantity_prescribed: PositiveIntegerField
├── refills_allowed: PositiveIntegerField
├── administration_route: CharField
├── special_instructions: TextField
├── start_date: DateField
├── end_date: DateField
├── is_active: BooleanField

Purpose: Detailed prescription item with dosage and instructions
```

#### **`MedicationAdministration` (Medication Tracking)**
```python
# Track medication administration in hospital
Fields:
├── prescription_item: ForeignKey → PrescriptionItem
├── administered_by: ForeignKey → CustomUser
├── patient: ForeignKey → Patient
├── administration_date: DateTimeField
├── dose_given: CharField
├── route_given: CharField
├── site_of_administration: CharField
├── patient_response: TextField
├── side_effects_observed: TextField
├── notes: TextField

Purpose: In-hospital medication administration tracking
```

#### **`DrugAllergy` (Patient Drug Allergies)**
```python
# Patient drug allergy tracking
Fields:
├── patient: ForeignKey → Patient
├── medication: ForeignKey → Medication (nullable for general allergies)
├── allergen_name: CharField
├── allergy_type: CharField (drug, food, environmental)
├── severity: CharField (mild, moderate, severe, anaphylactic)
├── symptoms: TextField
├── onset_date: DateField
├── verified_by: ForeignKey → CustomUser
├── notes: TextField
├── is_active: BooleanField

Purpose: Track patient allergies for prescription safety
```

### **Views (ViewSets):**

#### **`MedicationViewSet`**
```python
# Medication catalog management
Features:
├── Browse medication database
├── Search by name, class, indication
├── Filter by therapeutic class
├── Get therapeutic classes list
├── Medication safety information
```

#### **`PrescriptionViewSet`**
```python
# Prescription management
Features:
├── Create new prescriptions
├── Update prescription status
├── Patient prescription history
├── Prescription analytics
```

#### **`PrescriptionItemViewSet`**
```python
# Individual prescription items
Features:
├── Add medications to prescriptions
├── Update dosage and instructions
├── Track medication compliance
```

#### **`MedicationAdministrationViewSet`**
```python
# Hospital medication tracking
Features:
├── Record medication administration
├── Track patient responses
├── Monitor side effects
```

#### **`DrugAllergyViewSet`**
```python
# Allergy management
Features:
├── Record patient allergies
├── Allergy verification
├── Prescription safety checks
```

### **URLs (REST API):**
```
/api/medications/               → MedicationViewSet
/api/prescriptions/            → PrescriptionViewSet
/api/prescription-items/       → PrescriptionItemViewSet
/api/medication-administration/ → MedicationAdministrationViewSet
/api/drug-allergies/           → DrugAllergyViewSet
```

---

## 5. **EYE_TESTS APP** - Comprehensive Eye Testing

### **Models (9+ total):**

#### **`BaseEyeTest` (Abstract Base Class)**
```python
# Common fields for all eye tests
Fields:
├── id: UUIDField (Primary Key)
├── patient: ForeignKey → Patient
├── consultation: ForeignKey → Consultation
├── performed_by: ForeignKey → CustomUser
├── test_date: DateTimeField
├── eye_side: CharField (both, left, right)
├── status: CharField (scheduled, in_progress, completed, cancelled, incomplete)
├── findings: TextField
├── recommendations: TextField
├── follow_up_required: BooleanField
├── follow_up_date: DateField
├── equipment_used: CharField
├── test_conditions: JSONField
├── notes: TextField
├── created_at/updated_at: DateTimeField

Purpose: Base class providing common eye test functionality
```

#### **`VisualAcuityTest` (Visual Sharpness Testing)**
```python
# Visual acuity measurement
Fields:
├── BaseEyeTest fields (inherited)
├── distance_vision_od: CharField (Right eye distance vision)
├── distance_vision_os: CharField (Left eye distance vision)
├── near_vision_od: CharField (Right eye near vision)
├── near_vision_os: CharField (Left eye near vision)
├── correction_type: CharField (uncorrected, glasses, contact_lens, pinhole)
├── test_distance: CharField (6m, 3m, 1m)
├── chart_type: CharField (snellen, logmar, picture, e_chart)
├── lighting_conditions: CharField
├── patient_cooperation: CharField
├── improvement_notes: TextField

Purpose: Track visual sharpness and clarity measurements
```

#### **`RefractionTest` (Eye Prescription Testing)**
```python
# Detailed refraction measurements
Fields:
├── BaseEyeTest fields (inherited)
├── sphere_od/os: DecimalField (Spherical power for each eye)
├── cylinder_od/os: DecimalField (Cylindrical power for astigmatism)
├── axis_od/os: PositiveIntegerField (Axis angle for astigmatism)
├── add_power: DecimalField (Reading addition for presbyopia)
├── prism_od/os: DecimalField (Prism correction if needed)
├── prism_base_od/os: CharField (Prism base direction)
├── pupillary_distance: DecimalField (PD measurement)
├── subjective_refraction: JSONField (Patient responses)
├── objective_refraction: JSONField (Autorefractor results)
├── final_prescription: JSONField (Final prescription details)
├── visual_acuity_corrected: CharField (VA with prescription)
├── patient_adaptation: TextField (Patient comfort with prescription)

Purpose: Determine precise eye prescription for glasses/contacts
```

#### **`CataractAssessment` (Cataract Evaluation)**
```python
# Comprehensive cataract evaluation
Fields:
├── BaseEyeTest fields (inherited)
├── lens_opacity_grade_od/os: CharField (Severity grading)
├── cortical_cataract_od/os: BooleanField
├── nuclear_sclerosis_od/os: CharField (Nuclear cataract grading)
├── posterior_subcapsular_od/os: BooleanField
├── visual_function_impact: CharField (mild, moderate, severe)
├── glare_disability: BooleanField
├── contrast_sensitivity: CharField
├── surgical_recommendation: CharField (not_indicated, consider, recommended, urgent)
├── lens_measurement: JSONField (IOL power calculations)
├── biometry_results: JSONField (Eye measurements for surgery)
├── patient_symptoms: TextField
├── lifestyle_impact: TextField

Purpose: Evaluate cataracts and surgical planning
```

#### **`GlaucomaAssessment` (Glaucoma Screening)**
```python
# Comprehensive glaucoma evaluation
Fields:
├── BaseEyeTest fields (inherited)
├── iop_od/os: DecimalField (Intraocular pressure measurements)
├── central_corneal_thickness_od/os: DecimalField
├── optic_disc_appearance_od/os: CharField
├── cup_disc_ratio_od/os: DecimalField
├── rim_appearance_od/os: CharField
├── nerve_fiber_layer_od/os: CharField
├── visual_field_defects_od/os: BooleanField
├── gonioscopy_od/os: CharField (Drainage angle assessment)
├── risk_factors: JSONField (Family history, diabetes, etc.)
├── glaucoma_stage_od/os: CharField (early, moderate, advanced)
├── treatment_recommendation: TextField
├── follow_up_frequency: CharField

Purpose: Early detection and monitoring of glaucoma
```

#### **`VisualFieldTest` (Peripheral Vision Testing)**
```python
# Visual field analysis
Fields:
├── BaseEyeTest fields (inherited)
├── test_strategy: CharField (24-2, 30-2, 10-2, etc.)
├── test_duration_minutes: PositiveIntegerField
├── reliability_indices: JSONField (False positives, negatives, fixation losses)
├── mean_deviation_od/os: DecimalField (Overall field loss)
├── pattern_standard_deviation_od/os: DecimalField (Field irregularity)
├── visual_field_index_od/os: DecimalField (Percentage of normal field)
├── field_defects_od/os: TextField (Description of defects)
├── progression_analysis: JSONField (Rate of change over time)
├── patient_cooperation: CharField
├── test_validity: CharField (reliable, unreliable, learning_effect)

Purpose: Assess peripheral vision and detect field defects
```

#### **`RetinalAssessment` (Retinal Examination)**
```python
# Detailed retinal evaluation
Fields:
├── BaseEyeTest fields (inherited)
├── macula_condition_od/os: CharField (normal, abnormal, drusen, etc.)
├── foveal_reflex_od/os: CharField (present, absent, irregular)
├── retinal_vessels_od/os: CharField (normal, arteriolar_narrowing, etc.)
├── optic_disc_od/os: CharField (normal, pale, swollen, cupped)
├── hemorrhages_od/os: BooleanField
├── exudates_od/os: BooleanField
├── cotton_wool_spots_od/os: BooleanField
├── neovascularization_od/os: BooleanField
├── retinal_detachment_od/os: BooleanField
├── peripheral_retina_od/os: TextField
├── vitreous_condition: CharField
├── fundus_photography_done: BooleanField

Purpose: Comprehensive retinal health assessment
```

#### **`DiabeticRetinopathyScreening` (Diabetes Eye Screening)**
```python
# Diabetic retinopathy evaluation
Fields:
├── BaseEyeTest fields (inherited)
├── retinopathy_grade_od/os: CharField (none, mild, moderate, severe, proliferative)
├── macular_edema_od/os: CharField (none, mild, moderate, severe)
├── microaneurysms_od/os: BooleanField
├── dot_blot_hemorrhages_od/os: BooleanField
├── hard_exudates_od/os: BooleanField
├── cotton_wool_spots_od/os: BooleanField
├── venous_beading_od/os: BooleanField
├── intraretinal_microvascular_abnormalities_od/os: BooleanField
├── neovascularization_disc_od/os: BooleanField
├── neovascularization_elsewhere_od/os: BooleanField
├── vitreous_hemorrhage_od/os: BooleanField
├── referral_required: BooleanField
├── referral_urgency: CharField (routine, soon, urgent)
├── diabetes_duration_years: PositiveIntegerField
├── hba1c_level: DecimalField

Purpose: Systematic diabetic eye disease screening
```

#### **`OCTScan` (Optical Coherence Tomography)**
```python
# OCT imaging results
Fields:
├── BaseEyeTest fields (inherited)
├── scan_type: CharField (macula, optic_nerve, rnfl, angiography)
├── central_retinal_thickness_od/os: PositiveIntegerField (microns)
├── retinal_volume_od/os: DecimalField
├── rnfl_average_od/os: DecimalField (Nerve fiber layer thickness)
├── rim_area_od/os: DecimalField
├── cup_volume_od/os: DecimalField
├── macular_thickness_map: JSONField (9-zone thickness map)
├── abnormal_findings: TextField
├── comparison_to_previous: TextField
├── image_quality_score: PositiveIntegerField
├── scan_protocol: CharField

Purpose: High-resolution retinal and optic nerve imaging
```

### **Views (ViewSets) - All follow similar pattern:**

#### **Eye Test ViewSets (8 main types):**
```python
# Each ViewSet provides:
├── VisualAcuityTestViewSet
├── RefractionTestViewSet
├── CataractAssessmentViewSet
├── GlaucomaAssessmentViewSet
├── VisualFieldTestViewSet
├── RetinalAssessmentViewSet
├── DiabeticRetinopathyScreeningViewSet
├── OCTScanViewSet

# Common Features for all ViewSets:
├── Create new tests
├── Update test results
├── List tests with filtering (by patient, date, doctor)
├── Retrieve individual test details
├── Delete/cancel tests
├── Patient test history
├── Test result analytics and trends
├── Equipment integration endpoints
```

### **URLs (REST API):**
```
/api/visual-acuity-tests/              → VisualAcuityTestViewSet
/api/refraction-tests/                 → RefractionTestViewSet
/api/cataract-assessments/             → CataractAssessmentViewSet
/api/glaucoma-assessments/             → GlaucomaAssessmentViewSet
/api/visual-field-tests/               → VisualFieldTestViewSet
/api/retinal-assessments/              → RetinalAssessmentViewSet
/api/diabetic-retinopathy-screenings/  → DiabeticRetinopathyScreeningViewSet
/api/oct-scans/                        → OCTScanViewSet
```

---

## 6. **AUDIT APP** - Compliance & Security Monitoring

### **Models (4 total):**

#### **`AuditLog` (General System Audit)**
```python
# Comprehensive system activity logging
Fields:
├── id: UUIDField (Primary Key)
├── user: ForeignKey → CustomUser (Action performer)
├── action_type: CharField (create, read, update, delete, login, logout)
├── table_name: CharField (Database table affected)
├── object_id: CharField (Record ID affected)
├── old_values: JSONField (Previous field values)
├── new_values: JSONField (Updated field values)
├── ip_address: GenericIPAddressField
├── user_agent: TextField
├── timestamp: DateTimeField
├── success: BooleanField (Action success/failure)
├── error_message: TextField (If action failed)
├── session_key: CharField

Purpose: Complete audit trail for compliance and security
```

#### **`PatientAccessLog` (Patient Data Access Tracking)**
```python
# HIPAA-compliant patient data access logging
Fields:
├── patient: ForeignKey → Patient
├── accessed_by: ForeignKey → CustomUser
├── access_type: CharField (view, edit, create, delete, export, print)
├── data_viewed: JSONField (Specific fields accessed)
├── access_reason: CharField (treatment, emergency, administrative, research)
├── authorization_level: CharField (direct_care, break_glass, administrative)
├── session_id: CharField
├── ip_address: GenericIPAddressField
├── access_duration: DurationField
├── timestamp: DateTimeField

Purpose: Track all patient data access for HIPAA compliance
```

#### **`MedicationAudit` (Medication Safety Tracking)**
```python
# Medication prescription and administration audit
Fields:
├── prescription: ForeignKey → Prescription
├── action_type: CharField (prescribed, dispensed, administered, modified, cancelled)
├── performed_by: ForeignKey → CustomUser
├── patient: ForeignKey → Patient
├── medication: ForeignKey → Medication
├── quantity_change: DecimalField
├── old_dosage: CharField
├── new_dosage: CharField
├── reason_for_change: TextField
├── drug_interactions_checked: BooleanField
├── contraindications_reviewed: BooleanField
├── allergy_check_performed: BooleanField
├── supervisor_approval: ForeignKey → CustomUser (nullable)
├── timestamp: DateTimeField

Purpose: Medication safety and audit trail
```

#### **`ClinicalDecisionAudit` (Clinical Decision Documentation)**
```python
# Clinical decision-making audit trail
Fields:
├── patient: ForeignKey → Patient
├── decision_maker: ForeignKey → CustomUser
├── consultation: ForeignKey → Consultation
├── decision_type: CharField (diagnosis, treatment, surgery, referral, discharge)
├── clinical_reasoning: TextField
├── evidence_based: TextField (Supporting evidence)
├── guidelines_followed: CharField (Which clinical guidelines used)
├── peer_consultation: BooleanField (Discussed with colleagues)
├── patient_informed_consent: BooleanField
├── risk_assessment: TextField
├── alternative_options_considered: TextField
├── outcome_expected: TextField
├── follow_up_plan: TextField
├── peer_review_status: CharField (pending, reviewed, approved)
├── quality_score: PositiveIntegerField
├── timestamp: DateTimeField

Purpose: Quality assurance and clinical governance
```

### **Views (Function-Based and Class-Based):**

#### **Audit Reporting Views:**
```python
├── AuditLogListView - Browse audit logs with filtering
├── PatientAccessLogView - Patient access reports
├── MedicationAuditView - Medication safety reports
├── ClinicalDecisionAuditView - Clinical decision reviews
├── compliance_dashboard - Overall compliance metrics
├── security_monitoring - Security incident detection
├── generate_audit_report - Custom audit report generation
```

### **URLs:**
```
/audit/logs/              → Audit log viewer
/audit/patient-access/    → Patient access logs
/audit/medication/        → Medication audit trail
/audit/clinical-decisions/ → Clinical decision logs
/audit/reports/           → Compliance reports
/audit/security/          → Security monitoring
/audit/dashboard/         → Compliance dashboard
```

---

## 7. **REPORTS APP** - Business Intelligence & Analytics

### **Features & Endpoints:**

#### **Dashboard Analytics:**
```python
├── patient_demographics - Age, gender, geographic distribution
├── consultation_metrics - Volume, duration, outcomes
├── medication_analytics - Prescription patterns, effectiveness
├── eye_test_trends - Test volumes, results, improvements
├── staff_performance - Consultation volumes, patient satisfaction
├── financial_reports - Revenue, costs, profitability
├── quality_indicators - Clinical quality metrics
├── compliance_status - Regulatory compliance monitoring
```

#### **Custom Reports:**
```python
├── medication_effectiveness_report - Track patient outcomes by medication
├── doctor_performance_analytics - Individual doctor metrics  
├── patient_outcome_trends - Long-term patient improvement tracking
├── equipment_utilization - Test equipment usage statistics
├── appointment_analytics - Scheduling efficiency and wait times
├── inventory_reports - Medication stock levels and usage
├── audit_compliance_reports - Regulatory compliance status
```

### **URLs:**
```
/reports/dashboard/       → Executive dashboard
/reports/clinical/        → Clinical outcome reports  
/reports/financial/       → Financial analytics
/reports/compliance/      → Regulatory compliance
/reports/quality/         → Quality metrics
/reports/custom/          → Custom report builder
```

---

## 📊 **DATABASE RELATIONSHIPS SUMMARY**

### **Core Data Flow:**
```
Patient ← → PatientVisit ← → Consultation ← → EyeTests
   ↑              ↓              ↓              ↓
   └── Prescriptions ← → Medications → Treatment Outcomes
   
All actions → AuditLog/PatientAccessLog (Compliance)
```

### **Key Statistics (Current Database):**
- **Users**: 12 (Various roles: doctors, nurses, technicians)
- **Patients**: 15 (Complete demographic data)
- **Consultations**: 45 (Clinical encounters)
- **Medications**: 10 (Medication catalog)
- **Eye Tests**: 80+ (Various test types with results)
- **Total Objects**: 875+ (Comprehensive dataset)

This architecture provides a robust, scalable, and compliant foundation for a production eye hospital management system with comprehensive audit trails, detailed clinical documentation, and powerful analytics capabilities.