# PreciseOptics - Feature Enhancement Implementation Plan

## 📋 **REQUIREMENTS SUMMARY**

Based on the "to do" list, the following major enhancements are needed:

### 1. **Medical Conditions Module** (NEW - Separate Implementation)
- Dedicated conditions management system separate from general diagnoses
- Track specific eye conditions with protocols:
  - **AMD** (Age-related Macular Degeneration)
  - **Diabetic Retinopathy**
  - **RVO** (Retinal Vein Occlusion)
  - **Glaucoma**
  - **Cataracts** (Post-treatment tracking)

### 2. **Protocol Management System** (NEW)
- Treatment protocols for each condition
- Automated scheduling (loading doses, follow-ups)
- Drug protocols with consent tracking
- Flowcharts for treatment pathways
- Protocol-driven patient care plans

### 3. **Referral Management System** (NEW)
- Receive and process referrals from community opticians
- Attach referrals to patients
- Track referral source (high street opticians)
- Scan/image attachment from community scans
- Referral response system (talk back to referrers)

### 4. **Home Dashboard Enhancement**
- Add condition-specific statistics to dashboard cards
- Display protocol adherence metrics
- Show pending referrals count
- Alert badges for each condition type

### 5. **Appointment Alert System** (NEW)
- Alerts for missed appointments
- Overdue appointment notifications
- Next appointment reminders
- Protocol-driven appointment scheduling

### 6. **Medication Batch Tracking** (KEEP & ENHANCE)
- Keep existing batch number tracking
- Remove full inventory management
- Focus on batch traceability for audit purposes

### 7. **Remove Diary Functionality**
- No calendar/diary system needed
- Replace with appointment alerts only

---

## 🏗️ **IMPLEMENTATION PLAN**

### **PHASE 1: Database Schema & Backend Models** (Priority: CRITICAL)

#### 1.1 Medical Conditions Module
**New Django App: `conditions/`**

```python
# Models to create:
1. MedicalCondition
   - name, code (AMD, RVO, etc.)
   - category (retinal, glaucoma, etc.)
   - description, risk_factors
   - typical_progression
   
2. PatientCondition
   - patient FK
   - condition FK
   - diagnosis_date, diagnosed_by
   - severity (mild, moderate, severe)
   - eye_affected (both, left, right)
   - current_status (active, stable, progressing, resolved)
   - notes
   
3. ConditionProgress
   - patient_condition FK
   - assessment_date, assessed_by
   - status_change
   - measurements (JSON field for flexible data)
   - next_assessment_date
```

#### 1.2 Protocol Management System
**New Django App: `protocols/`**

```python
# Models to create:
1. TreatmentProtocol
   - name (e.g., "AMD Anti-VEGF Loading Dose")
   - condition FK
   - description, indications
   - total_duration_weeks
   - requires_consent
   
2. ProtocolStep
   - protocol FK
   - step_number, step_type (medication, procedure, test)
   - timing_days (from protocol start)
   - description, instructions
   - medication FK (if applicable)
   - required_test_type
   
3. PatientProtocol
   - patient FK
   - protocol FK
   - start_date, end_date
   - status (active, completed, discontinued)
   - assigned_by
   - discontinuation_reason
   
4. ProtocolStepCompletion
   - patient_protocol FK
   - protocol_step FK
   - scheduled_date, completed_date
   - completed_by
   - notes, outcome
   - next_step_date (auto-calculated)
   
5. ConsentForm
   - patient FK
   - protocol FK
   - consent_type (treatment, procedure)
   - consent_given_date
   - consent_document (file upload)
   - witnessed_by
   - expires_date
```

#### 1.3 Referral Management System
**New Django App: `referrals/`**

```python
# Models to create:
1. ReferralSource
   - name (optician/clinic name)
   - type (high_street_optician, hospital, GP)
   - contact_person, email, phone
   - address
   - is_active
   
2. Referral
   - patient FK
   - source FK
   - referral_date, received_date
   - referring_clinician
   - urgency (routine, urgent, emergency)
   - reason_for_referral
   - clinical_findings
   - status (pending, reviewed, accepted, rejected)
   - reviewed_by, review_date
   - response_sent_date
   
3. ReferralDocument
   - referral FK
   - document_type (letter, scan, report)
   - title, description
   - file (upload)
   - uploaded_date
   
4. ReferralResponse
   - referral FK
   - response_date
   - outcome (accepted, advice_given, referred_on)
   - feedback_to_referrer
   - sent_by
```

#### 1.4 Appointment Alert System
**Extend existing models in `patients/` or create `appointments/`**

```python
# Models to create/extend:
1. AppointmentAlert
   - patient FK
   - appointment_type (consultation, follow_up, protocol_step)
   - related_protocol FK (optional)
   - due_date
   - alert_level (info, warning, urgent, overdue)
   - status (pending, acknowledged, completed, missed)
   - created_date, acknowledged_date
   - acknowledged_by
   
2. AppointmentReminder
   - patient FK
   - appointment_date
   - reminder_date
   - sent (boolean)
   - method (email, SMS, system_notification)
   - message
```

---

### **PHASE 2: Backend API Endpoints** (Priority: HIGH)

#### 2.1 Conditions API (`conditions/urls.py, views.py, serializers.py`)
```
GET    /api/conditions/                          # List all conditions
POST   /api/conditions/                          # Create condition
GET    /api/conditions/<id>/                     # Condition detail

GET    /api/patient-conditions/                  # List patient conditions
POST   /api/patient-conditions/                  # Assign condition to patient
GET    /api/patient-conditions/<id>/             # Patient condition detail
PUT    /api/patient-conditions/<id>/             # Update patient condition
GET    /api/patient-conditions/<id>/progress/    # Condition progress history
POST   /api/patient-conditions/<id>/progress/    # Record progress

GET    /api/patients/<id>/conditions/            # All conditions for patient
```

#### 2.2 Protocols API (`protocols/urls.py, views.py, serializers.py`)
```
GET    /api/protocols/                           # List all protocols
POST   /api/protocols/                           # Create protocol
GET    /api/protocols/<id>/                      # Protocol detail
GET    /api/protocols/<id>/steps/                # Protocol steps

GET    /api/patient-protocols/                   # List active patient protocols
POST   /api/patient-protocols/                   # Assign protocol to patient
GET    /api/patient-protocols/<id>/              # Patient protocol detail
PUT    /api/patient-protocols/<id>/              # Update patient protocol
POST   /api/patient-protocols/<id>/complete-step/ # Mark step complete
GET    /api/patient-protocols/<id>/schedule/     # Get protocol schedule

GET    /api/consent-forms/                       # List consent forms
POST   /api/consent-forms/                       # Create consent form
GET    /api/consent-forms/<id>/                  # Consent detail
```

#### 2.3 Referrals API (`referrals/urls.py, views.py, serializers.py`)
```
GET    /api/referral-sources/                    # List referral sources
POST   /api/referral-sources/                    # Add referral source

GET    /api/referrals/                           # List all referrals
POST   /api/referrals/                           # Create referral
GET    /api/referrals/<id>/                      # Referral detail
PUT    /api/referrals/<id>/                      # Update referral
POST   /api/referrals/<id>/review/               # Review referral
POST   /api/referrals/<id>/respond/              # Send response to referrer
GET    /api/referrals/<id>/documents/            # Referral documents
POST   /api/referrals/<id>/documents/            # Upload referral document

GET    /api/patients/<id>/referrals/             # Patient's referrals
```

#### 2.4 Appointment Alerts API (`appointments/urls.py or patients/urls.py`)
```
GET    /api/appointment-alerts/                  # List all alerts
GET    /api/appointment-alerts/pending/          # Pending alerts
GET    /api/appointment-alerts/overdue/          # Overdue alerts
POST   /api/appointment-alerts/<id>/acknowledge/ # Acknowledge alert
GET    /api/patients/<id>/alerts/                # Patient's alerts
```

---

### **PHASE 3: Frontend Components** (Priority: HIGH)

#### 3.1 Conditions Management (`frontend/src/pages/conditions/`)
```
ConditionsPage.js              # List all conditions
AddConditionPage.js            # Add new condition
PatientConditionsPage.js       # Patient's conditions list
AddPatientConditionPage.js     # Assign condition to patient
ConditionDetailPage.js         # View condition details & progress
AddConditionProgressPage.js    # Record condition progress

Components:
- ConditionCard.js             # Display condition summary
- ConditionProgressChart.js    # Visualize condition progression
- ConditionTimeline.js         # Timeline of assessments
```

#### 3.2 Protocol Management (`frontend/src/pages/protocols/`)
```
ProtocolsPage.js               # List all protocols
ProtocolDetailPage.js          # Protocol steps & details
CreateProtocolPage.js          # Create new protocol
PatientProtocolsPage.js        # Patient's active protocols
AssignProtocolPage.js          # Assign protocol to patient
ProtocolSchedulePage.js        # View protocol schedule
CompleteProtocolStepPage.js    # Mark step complete
ConsentFormsPage.js            # Manage consent forms

Components:
- ProtocolCard.js              # Display protocol summary
- ProtocolTimeline.js          # Visual protocol progress
- ProtocolStepList.js          # List of protocol steps
- ConsentFormUpload.js         # Upload consent documents
```

#### 3.3 Referral Management (`frontend/src/pages/referrals/`)
```
ReferralsPage.js               # List all referrals
ReferralDetailPage.js          # View referral details
CreateReferralPage.js          # Create new referral
ReviewReferralPage.js          # Review & process referral
ReferralSourcesPage.js         # Manage referral sources
AddReferralSourcePage.js       # Add referral source
ReferralResponsePage.js        # Send response to referrer

Components:
- ReferralCard.js              # Display referral summary
- ReferralDocumentUpload.js    # Upload referral documents
- ReferralTimeline.js          # Referral workflow timeline
```

#### 3.4 Dashboard Enhancements (`frontend/src/pages/`)
```
HomePage.js (MODIFY)           # Add condition cards
AdminDashboard.js (MODIFY)     # Add statistics for new modules

Components to add:
- ConditionStatisticsCard.js   # Condition-specific stats
- ReferralStatsCard.js         # Referral metrics
- ProtocolAdherenceCard.js     # Protocol compliance
- AlertBadge.js                # Alert indicators
```

#### 3.5 Alert System (`frontend/src/components/alerts/`)
```
AlertCenter.js                 # Central alert display
AlertBadge.js                  # Badge for alert counts
AppointmentAlertList.js        # List of appointment alerts
MissedAppointmentAlert.js      # Missed appointment indicator
OverdueAlert.js                # Overdue appointment alert

Components:
- AlertNotification.js         # Individual alert component
- AlertFilters.js              # Filter alerts by type
```

---

### **PHASE 4: Reporting & Analytics** (Priority: MEDIUM)

#### 4.1 Condition-Specific Reports
```
ConditionPrevalenceReport.js   # Breakdown by condition
ConditionOutcomesReport.js     # Treatment outcomes by condition
ProtocolAdherenceReport.js     # Protocol compliance metrics
ReferralSourceReport.js        # Referral source analysis
```

#### 4.2 Enhanced Dashboard Metrics
```
- Total patients by condition
- Active protocols count
- Pending referrals
- Overdue appointments
- Protocol adherence rates
- Condition progression trends
```

---

### **PHASE 5: Data Migration & Testing** (Priority: MEDIUM)

#### 5.1 Database Migrations
```bash
# Create new apps
python manage.py startapp conditions
python manage.py startapp protocols
python manage.py startapp referrals

# Make migrations
python manage.py makemigrations conditions
python manage.py makemigrations protocols
python manage.py makemigrations referrals

# Apply migrations
python manage.py migrate
```

#### 5.2 Seed Data
```
- Create default medical conditions (AMD, RVO, etc.)
- Create sample protocols
- Create test referral sources
```

#### 5.3 Testing
```
- Unit tests for models
- API endpoint testing
- Frontend component testing
- Integration testing
- User acceptance testing
```

---

## 📅 **IMPLEMENTATION TIMELINE**

### Week 1-2: Backend Foundation
- ✅ Create new Django apps
- ✅ Define all models
- ✅ Create migrations
- ✅ Build serializers
- ✅ Implement API views

### Week 3-4: Frontend Core
- ✅ Create page components
- ✅ Build reusable components
- ✅ Implement routing
- ✅ Connect to APIs

### Week 5: Dashboard & Alerts
- ✅ Update home dashboard
- ✅ Add condition cards
- ✅ Implement alert system
- ✅ Add notification badges

### Week 6: Testing & Refinement
- ✅ Backend testing
- ✅ Frontend testing
- ✅ Bug fixes
- ✅ Performance optimization

### Week 7: Documentation & Training
- ✅ User documentation
- ✅ API documentation
- ✅ Admin training materials
- ✅ Video tutorials

---

## 🔧 **TECHNICAL DECISIONS**

### Removed Features
- ❌ Diary/Calendar system (replaced with appointment alerts)
- ❌ Full inventory management (keeping batch tracking only)

### Enhanced Features
- ✅ Medication batch tracking (keep existing, enhance for audit)
- ✅ Appointment system (alerts only, no full calendar)

### New Features
- ✅ Medical conditions module (separate from diagnoses)
- ✅ Protocol management with automated scheduling
- ✅ Referral tracking with response system
- ✅ Alert system for appointments and protocols

---

## ⚠️ **PRODUCTION READINESS NOTES**

### Items to Add to PRODUCTION_READINESS.md
```markdown
### New Modules - Conditions, Protocols, Referrals
- [ ] **HIGH**: Real-time alert notifications not implemented
- [ ] **MEDIUM**: SMS reminders for appointments require third-party service
- [ ] **MEDIUM**: Email notifications for referral responses need SMTP setup
- [ ] **LOW**: Advanced protocol automation features pending

### Data Migration
- [ ] **CRITICAL**: Existing diagnosis data needs mapping to new conditions module
- [ ] **HIGH**: Historical appointment data needs migration to alert system
- [ ] **MEDIUM**: Batch number data quality audit required
```

---

## 📊 **SUCCESS METRICS**

### Conditions Module
- All 5 core conditions properly tracked
- Protocol assignment rate > 80% for eligible patients
- Condition progress recorded at each visit

### Protocols
- Protocol completion rate > 75%
- Automated scheduling accuracy > 95%
- Consent form compliance 100%

### Referrals
- Referral processing time < 48 hours
- Response sent rate > 90%
- Referral source satisfaction tracked

### Alerts
- Alert acknowledgment rate > 90%
- Missed appointment rate < 10%
- Overdue appointment reduction by 50%

---

## 🚀 **NEXT STEPS**

1. Review and approve this implementation plan
2. Set up development environment
3. Create feature branches for each module
4. Begin Phase 1: Backend models development
5. Daily standups to track progress
6. Weekly demos of completed features

---

**Document Version**: 1.0  
**Created**: November 1, 2025  
**Last Updated**: November 1, 2025  
**Status**: READY FOR IMPLEMENTATION
