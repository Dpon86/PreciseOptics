# PreciseOptics Eye Hospital Management System - Software Architecture Map

## 🏗️ **SYSTEM OVERVIEW**

**Technology Stack:**
- **Backend:** Django 5.2.7 + Django REST Framework
- **Frontend:** React 18.x
- **Database:** MySQL 8.0.39 (Production) / SQLite (Development)
- **Authentication:** Django Token Authentication
- **API:** RESTful APIs with comprehensive serializers

---

## 🎯 **BACKEND ARCHITECTURE**

### **Project Structure**
```
Backend/
├── precise_optics/          # Main Django project settings
├── accounts/               # User & staff management
├── patients/              # Patient records & visits
├── consultations/         # Patient consultations
├── medications/           # Medication management
├── eye_tests/            # Comprehensive eye testing
├── audit/                # System auditing & compliance
├── reports/              # Reporting system
├── fixtures/             # Database seed data
├── logs/                 # Application logs
└── media/               # File uploads
```

---

## 📊 **BACKEND APPLICATIONS DETAILED BREAKDOWN**

### 1. **ACCOUNTS APP** (`accounts/`)
**Purpose:** User authentication, staff management, and role-based access control

#### **Models:**
- **`CustomUser`** - Extended Django user model with employee details
  - Fields: user_type, employee_id, phone_number, date_of_birth, profile_picture
  - Supports: Admin, Doctor, Nurse, Technician, Receptionist, Pharmacist, Manager roles

- **`StaffProfile`** - Extended staff information and medical credentials
  - Fields: department, specialization, license_number, consultation_fee, availability_schedule
  - Medical specializations: Cataract, Glaucoma, Retina, Diabetic Retinopathy, etc.

- **`UserSession`** - Session tracking for audit compliance
  - Fields: session_key, ip_address, user_agent, login/logout times

#### **Views (API Endpoints):**
- **Authentication:** `login_view`, `logout_view`
- **Staff Management:** `StaffListCreateView`, `StaffDetailView`, `staff_statistics`
- **User Management:** `UserListView`, `UserDetailView`
- **Lookups:** `get_departments`, `get_specializations`, `get_user_types`

#### **URLs:**
```
/login/                     # User authentication
/logout/                    # User logout
/staff/                     # Staff CRUD operations
/staff/<id>/               # Individual staff details
/staff/statistics/         # Staff analytics
/users/                    # User management
/departments/              # Department listings
/specializations/          # Medical specializations
```

---

### 2. **PATIENTS APP** (`patients/`)
**Purpose:** Patient record management, demographics, and visit tracking

#### **Models:**
- **`Patient`** - Core patient demographic and medical information
  - Fields: patient_id, personal info, contact details, emergency contacts
  - Medical: blood_group, allergies, current_medications, medical_history
  - Insurance: nhs_number, insurance_provider, insurance_number

- **`PatientVisit`** - Individual patient visits and appointments
  - Fields: visit_date, visit_type, reason_for_visit, diagnosis
  - Relationships: Links to patient, consultation, assigned doctor

- **`PatientNote`** - Clinical notes and observations
  - Fields: note_type, content, visibility, follow_up_required
  - Audit trail for all patient interactions

#### **Views (API Endpoints):**
- **Patient Management:** CRUD operations for patient records
- **Visit Tracking:** Appointment scheduling and visit management
- **Medical Records:** Access to patient history and documentation
- **Statistics:** Patient demographics and visit analytics

#### **URLs:**
```
/patients/                 # Patient list and creation
/patients/<id>/           # Individual patient details
/patients/<id>/visits/    # Patient visit history
/patients/<id>/notes/     # Clinical notes
/patients/statistics/     # Patient analytics
/patients/search/         # Patient search functionality
```

---

### 3. **CONSULTATIONS APP** (`consultations/`)
**Purpose:** Medical consultation management and clinical documentation

#### **Models:**
- **`Consultation`** - Main consultation record
  - Fields: consultation_date, chief_complaint, examination_findings
  - Clinical: diagnosis, treatment_plan, follow_up_instructions
  - Links: patient, doctor, consultation_type, duration

- **`VitalSigns`** - Patient vital signs during consultation
  - Fields: blood_pressure, heart_rate, temperature, weight
  - Eye-specific: intraocular_pressure, pupil_response

- **`ConsultationDocument`** - Attached documents and forms
  - Fields: document_type, file_path, description, upload_date
  - Document types: Reports, Images, Referrals, Forms

- **`ConsultationImage`** - Medical images and photographs
  - Fields: image_type, file_path, description, eye_side
  - Image types: Fundus photos, OCT scans, Visual field tests

#### **Views (API Endpoints):**
- **Consultation Management:** Create, update, view consultations
- **Documentation:** File upload and management
- **Clinical Data:** Vital signs and examination results
- **Follow-up:** Appointment scheduling and tracking

#### **URLs:**
```
/consultations/           # Consultation list and creation
/consultations/<id>/      # Individual consultation details
/consultations/<id>/vitals/    # Vital signs management
/consultations/<id>/documents/ # Document management
/consultations/<id>/images/    # Image management
/consultations/statistics/     # Consultation analytics
```

---

### 4. **MEDICATIONS APP** (`medications/`)
**Purpose:** Medication inventory, prescriptions, and drug interaction management

#### **Models:**
- **`Medication`** - Drug catalog and information
  - Fields: name, generic_name, brand_names, medication_type
  - Details: therapeutic_class, dosage_forms, strength, contraindications
  - Safety: side_effects, drug_interactions, pregnancy_category

- **`Prescription`** - Patient medication prescriptions
  - Fields: dosage, frequency, duration, quantity_prescribed
  - Instructions: administration_route, special_instructions
  - Links: patient, prescribing_doctor, consultation, medication

- **`MedicationInventory`** - Stock management
  - Fields: current_stock, reorder_level, expiry_date, supplier
  - Tracking: batch_number, cost_per_unit, total_value

- **`PrescriptionRefill`** - Prescription renewal tracking
  - Fields: refill_date, quantity_dispensed, remaining_refills
  - Authorization: dispensed_by, authorization_code

#### **Views (API Endpoints):**
- **Medication Catalog:** Drug information and management
- **Prescriptions:** Create and manage prescriptions
- **Inventory:** Stock levels and reorder management
- **Drug Interactions:** Safety checks and warnings
- **Dispensing:** Medication dispensing workflow

#### **URLs:**
```
/medications/             # Medication catalog
/medications/<id>/        # Individual medication details
/prescriptions/           # Prescription management
/prescriptions/<id>/      # Individual prescription
/inventory/              # Stock management
/drug-interactions/      # Safety checking
```

---

### 5. **EYE_TESTS APP** (`eye_tests/`)
**Purpose:** Comprehensive eye testing, results tracking, and analysis

#### **Models:**
- **`BaseEyeTest`** - Abstract base for all eye tests
  - Fields: patient, consultation, performed_by, test_date, eye_side, status
  - Results: findings, recommendations, follow_up_required

- **`VisualAcuityTest`** - Visual sharpness testing
  - Fields: distance_vision_od/os, near_vision_od/os, correction_type
  - Results: snellen_fraction, logmar_value, improvement_notes

- **`RefractionTest`** - Eye prescription testing
  - Fields: sphere_od/os, cylinder_od/os, axis_od/os, add_power
  - Results: final_prescription, subjective_findings

- **`CataractAssessment`** - Cataract evaluation
  - Fields: lens_opacity_grade, visual_function_impact, surgical_recommendation
  - Grading: cortical_cataract, nuclear_sclerosis, posterior_subcapsular

- **`GlaucomaAssessment`** - Glaucoma screening and monitoring
  - Fields: iop_od/os, optic_disc_assessment, visual_field_defects
  - Risk factors: family_history, diabetes, hypertension

- **`VisualFieldTest`** - Peripheral vision testing
  - Fields: test_strategy, reliability_indices, field_defects
  - Results: mean_deviation, pattern_standard_deviation

- **`RetinalAssessment`** - Retinal examination
  - Fields: macula_condition, vessel_changes, hemorrhages
  - Conditions: diabetic_retinopathy, macular_degeneration

- **`DiabeticRetinopathyScreening`** - Diabetes-related eye screening
  - Fields: retinopathy_grade, macular_edema_present, referral_required
  - Grading: background, pre-proliferative, proliferative

#### **Views (API Endpoints):**
- **Test Management:** Schedule, perform, and track eye tests
- **Results Analysis:** Test result interpretation and trends
- **Patient Outcomes:** Track improvement/decline over time
- **Medication Correlation:** Link test results to prescribed treatments
- **Reporting:** Generate test reports and summaries

#### **URLs:**
```
/eye-tests/                    # All eye tests overview
/eye-tests/visual-acuity/     # Visual acuity tests
/eye-tests/refraction/        # Refraction tests
/eye-tests/cataract/          # Cataract assessments
/eye-tests/glaucoma/          # Glaucoma tests
/eye-tests/visual-field/      # Visual field tests
/eye-tests/retinal/           # Retinal assessments
/eye-tests/diabetic-screening/ # Diabetic retinopathy screening
/eye-tests/statistics/        # Test analytics
/eye-tests/patient/<id>/      # Patient-specific test history
```

---

### 6. **AUDIT APP** (`audit/`)
**Purpose:** Comprehensive audit trail, compliance, and security monitoring

#### **Models:**
- **`AuditLog`** - General system activity logging
  - Fields: action_type, table_name, object_id, old_values, new_values
  - Tracking: user, timestamp, ip_address, success_status

- **`PatientAccessLog`** - Patient record access tracking
  - Fields: patient, accessed_by, access_type, data_viewed
  - Compliance: access_reason, authorization_level, duration

- **`MedicationAudit`** - Medication-related audit trail
  - Fields: prescription, action_type, quantity_change, reason
  - Safety: drug_interactions_checked, contraindications_reviewed

- **`ClinicalDecisionAudit`** - Clinical decision documentation
  - Fields: decision_type, clinical_reasoning, evidence_based
  - Quality: peer_review_status, outcome_tracking

#### **Views (API Endpoints):**
- **Audit Reporting:** Generate compliance reports
- **Access Monitoring:** Track user activities
- **Security Analysis:** Identify suspicious activities
- **Compliance Dashboards:** HIPAA/GDPR compliance monitoring

#### **URLs:**
```
/audit/logs/              # Audit log viewer
/audit/patient-access/    # Patient access logs
/audit/medication/        # Medication audit trail
/audit/clinical-decisions/ # Clinical decision logs
/audit/reports/           # Compliance reports
/audit/security/          # Security monitoring
```

---

### 7. **REPORTS APP** (`reports/`)
**Purpose:** Business intelligence, analytics, and regulatory reporting

#### **Features:**
- **Patient Demographics:** Age distribution, gender analysis, geographic data
- **Clinical Outcomes:** Treatment success rates, test result trends
- **Medication Analysis:** Prescription patterns, drug effectiveness
- **Staff Performance:** Consultation volumes, patient satisfaction
- **Financial Reports:** Revenue analysis, cost tracking
- **Quality Metrics:** Clinical quality indicators, patient safety metrics

#### **URLs:**
```
/reports/dashboard/       # Executive dashboard
/reports/clinical/        # Clinical outcome reports
/reports/financial/       # Financial analytics
/reports/compliance/      # Regulatory compliance
/reports/quality/         # Quality metrics
/reports/custom/          # Custom report builder
```

---

## 🎨 **FRONTEND ARCHITECTURE**

### **Project Structure**
```
frontend/src/
├── components/           # Reusable UI components
├── pages/               # Main application pages
├── services/            # API communication
├── context/             # React Context for state management
├── App.js              # Main application component
└── index.js            # Application entry point
```

### **Page Structure:**
```
pages/
├── auth/               # Authentication pages
├── patients/           # Patient management
├── consultations/      # Consultation workflow
├── eye-tests/          # Eye test interfaces
├── medications/        # Medication management
├── reports/            # Analytics and reporting
├── audit/              # Audit trail viewing
├── system/             # System administration
├── AdminDashboard.js   # Main dashboard
└── HomePage.js         # Landing page
```

### **Components:**
- **`Header.js`** - Navigation and user info
- **`Sidebar.js`** - Main navigation menu
- **`PatientDashboard.js`** - Patient overview interface
- **`PatientSelector.js`** - Patient search and selection

### **Services:**
- **`api.js`** - Centralized API communication layer
  - HTTP client configuration
  - Authentication token management
  - Error handling and response processing

---

## 🔗 **KEY RELATIONSHIPS & DATA FLOW**

### **Patient-Medication-Test Correlation:**
```
Patient → Consultation → Prescription (Medications)
                    ↓
                Eye Tests Results
                    ↓
            Treatment Effectiveness Analysis
```

### **Audit Trail Flow:**
```
User Action → AuditLog → PatientAccessLog/MedicationAudit
                                ↓
                        Compliance Reports
```

### **Clinical Workflow:**
```
Patient Registration → Consultation → Eye Tests → Diagnosis
                                          ↓
                              Prescription → Follow-up
```

---

## 📈 **PRODUCTION READINESS STATUS**

### **Completed Components:**
- ✅ Complete database design with proper relationships
- ✅ Comprehensive audit logging system
- ✅ RESTful API with authentication
- ✅ Eye test data correlation with medications
- ✅ MySQL database migration and setup
- ✅ Rich fixture data for testing (875+ objects)

### **Key Features:**
- **Patient-Medication Correlation:** Track treatment effectiveness over time
- **Comprehensive Auditing:** Full compliance with healthcare regulations  
- **Multi-role Access Control:** Doctor, Nurse, Technician, Admin roles
- **Rich Eye Test Suite:** 8+ different test types with detailed results
- **Production Database:** MySQL with proper indexing and relationships

This architecture provides a robust foundation for a production-ready eye hospital management system with comprehensive patient care tracking, medication management, and regulatory compliance capabilities.