# PreciseOptics – Clinical Systems Review
**Prepared for:** Eye Hospital Management  
**Date:** July 2026  
**Scope:** Full codebase audit from a clinical informatics and eye hospital operations perspective  

---

## Executive Summary

PreciseOptics has a **solid and well-structured foundation** for an eye hospital management system. The core architecture — patient records, consultations, eye tests, medications, treatments, protocols, conditions, referrals, and a comprehensive audit trail — is in place and production-ready in terms of data modelling. The system is purpose-built for medical retina / ophthalmology workflows and has clearly been designed with UK NHS practice in mind (NHS numbers, OPCS-4 procedure codes, NICE pathway concepts).

The **primary strength** of the system is its audit capability: every significant action is traceable to a user, timestamp, and patient. The reporting layer is well-developed for condition-specific outcomes, medication effectiveness and patient-reported outcomes.

The **primary gap** is operational depth at the point of care. The data models are comprehensive but several key clinical workflows — particularly anti-VEGF injection tracking, pre/post VA recording on the same visit, and batch-to-patient traceability — are not yet exposed as usable clinical screens. These are the exact workflows that eye hospital auditors scrutinise.

Two external integrations are outside scope due to pending API access:
1. **NHS Spine / PDS (Patient Demographics Service)** — pulling patient notes and confirmed demographics
2. **Community Optician Portal** — enabling referrals in from high street opticians and sending outcomes back

Both are noted in this report but are not blockers to clinical use.

---

## 1. What Is Built and Working

### 1.1 Patient Management ✅
- Full patient record: demographics, NHS number, insurance, emergency contacts, allergies, medical history
- Soft-delete (is_active flag) — no hard deletes, maintaining audit integrity
- Patient search, list, detail and edit pages
- Patient detail page with tabbed interface: Overview, Contact, Medical, Conditions, Protocols, Outcomes, Activity

### 1.2 Eye Tests ✅ (14 test types modelled)
| Test | Model | Frontend Form |
|---|---|---|
| Visual Acuity (Snellen/LogMAR/ETDRS) | ✅ | ✅ |
| Refraction | ✅ | ✅ |
| Tonometry (IOP) | ✅ | ✅ |
| Slit Lamp Examination | ✅ | ✅ |
| Ophthalmoscopy | ✅ | ✅ |
| Visual Field | ✅ | ✅ |
| OCT Scan | ✅ | ✅ |
| Fluorescein Angiography | ✅ | ✅ |
| Cataract Assessment | ✅ | No dedicated form |
| Glaucoma Assessment | ✅ | No dedicated form |
| Diabetic Retinopathy Screening | ✅ | No dedicated form |
| Retinal Assessment | ✅ | No dedicated form |
| Vitreoretinal Assessment | ✅ | No dedicated form |
| Corneal Assessment | ✅ | No dedicated form |

### 1.3 Medications ✅
- Drug catalogue with anti-VEGF, glaucoma, steroid, antibiotic, lubricant classes
- Prescriptions with per-drug dosage, frequency, eye side, duration
- MedicationAdministration model (route, dose, batch linkage, adverse reactions, verification)
- Drug Allergy records with severity levels
- Medication Recall Centre
- Batch number field on medication records

### 1.4 Conditions (Disease Tracking) ✅
- Five key conditions pre-configured: AMD, RVO, Glaucoma, Diabetic Retinopathy, Post-Cataract
- PatientCondition model: severity, eye affected, diagnosis date, treatment plan, next assessment date
- ConditionProgress records for tracking change over time
- Overdue assessment warnings on patient detail page

### 1.5 Treatment Protocols ✅
- TreatmentProtocol model with ProtocolStep, ProtocolStepMedication, ProtocolStepTreatment, ProtocolStepTest
- PatientProtocol assignment with progress tracking, adherence percentage
- ProtocolStepCompletion with `scheduled`, `completed`, `missed` statuses
- ConsentForm model linked to protocols
- Protocol Builder UI and patient assignment page
- "Next Step Due" banner on patient detail page showing required action and medication

### 1.6 Audit Trail ✅ (comprehensive)
- AuditLog: every create/read/update/delete with user, IP, old values, new values
- PatientAccessLog: who accessed which patient record and when
- MedicationAudit: prescribing, dispensing, administration events
- ClinicalDecisionAudit: clinical decisions with justification
- DataExportLog: tracks every data export event
- SystemSecurityEvent: login attempts, access denials
- ComplianceReport: formal compliance snapshots

### 1.7 Patient Reported Outcomes (PROMs) ✅
- PatientOutcomeReport model capturing vision quality, pain, light sensitivity, daily activities, reading, driving, treatment satisfaction, side effects
- Patient questionnaire form with slider interface
- Outcomes tab on patient detail page with history table and score trending
- Condition–Medication–Outcome report correlating clinical VA data with PRO scores

### 1.8 Reporting Suite ✅
| Report | Status |
|---|---|
| Drug Audit (medication effectiveness charts) | ✅ |
| Patient Medications Report | ✅ |
| Treatment Effectiveness Timeline | ✅ |
| Medication Effectiveness (with charts) | ✅ |
| Disease-Specific Report (AMD/RVO/Glaucoma/DR/Cataracts) | ✅ |
| Condition Prevalence | ✅ |
| Condition Outcomes | ✅ |
| Protocol Adherence | ✅ |
| Patient Outcomes & Medication Report (PROs) | ✅ |
| Eye Tests Summary | ✅ |
| Batch Tracking | ✅ |
| Referral Source Analysis | ✅ |
| Revenue Analysis | ✅ |

### 1.9 Appointments & Alerts ✅
- PatientVisit scheduling (book, check in, mark no-show)
- AppointmentAlert auto-generation for late arrivals and missed appointments
- Alert scanning, acknowledgement and resolution workflow
- Follow-up alerts and return-due pages
- Alert severity: Low / Medium / High / Critical

### 1.10 Referrals ✅
- Incoming and outgoing referrals
- ReferralSource management (hospitals, opticians, GPs)
- Urgency levels: Routine / Soon / Urgent / Emergency
- Referral status tracking: Draft → Pending → Sent → Acknowledged → Completed
- ReferralResponse model for capturing outcome feedback
- Referral Source Analysis report

### 1.11 Security & Access Control ✅
- Token-based authentication with session timeout
- Role-based access: Doctor, Nurse, Admin, Reception
- Two-factor authentication (TOTP)
- Password reset workflow
- HTTPS enforcement settings in place

---

## 2. What Needs Improvement (Partially Built)

### 2.1 ⚠️ Anti-VEGF Injection Tracking — Critical Gap
**This is the single most important clinical workflow missing.**

The medication and treatment models exist, but there is no dedicated **intravitreal injection record** screen. Every NHS eye department that gives Eylea, Lucentis, Beovu, Vabysmo, or Avastin must record:

- Which drug, which batch number, which eye
- Injection number in the loading phase (injection 1, 2, 3)
- Injection number in the maintenance/treat-and-extend phase
- Days since previous injection (interval)
- Pre-injection VA (right and left)
- Post-injection VA (same visit, 30 minutes later)
- IOP pre and post
- Treating clinician
- Consent signed (linked to ConsentForm)
- Any adverse event (endophthalmitis, raised IOP, vitreous haemorrhage)

**Recommended fix:** A dedicated `IntravitrealInjectionRecord` model (or a structured ProtocolStepResult) with a clinical screen, plus a per-patient injection history timeline page.

### 2.2 ⚠️ Batch Number at Point of Administration — Critical for Audit
The `Medication` model has a `batch_number` field, but it is on the **stock record**, not on the `MedicationAdministration` record. This means you cannot answer the question: *"Which patients received batch X of drug Y?"* — which is the core requirement of a drug recall or incident investigation.

**Recommended fix:** Add `batch_number_administered` and `expiry_date_administered` fields to `MedicationAdministration`. The UI should show the batch from the stock record as the default but allow override.

### 2.3 ⚠️ Pre/Post VA on Same Visit — Not Linked
Visual acuity before and after a treatment on the same visit is currently recorded as two separate, unlinked `VisualAcuityTest` records. There is no structural relationship between "pre-treatment VA" and "post-treatment VA" on the same visit.

**Recommended fix:** Add a `pre_treatment` boolean flag and a `related_treatment` FK to `VisualAcuityTest`, or enforce this through the injection record described above.

### 2.4 ⚠️ Consent Form Digital Workflow
The `ConsentForm` model exists in the protocols app but the frontend only shows a list page (`ConsentFormsPage`). There is no:
- Form to record that a specific patient signed a specific consent form
- Timestamp, signing clinician, and patient acknowledgement capture
- Link from an injection visit to the consent signed

**Recommended fix:** A `PatientConsent` record linking `Patient`, `ConsentForm`, signing date, witnessing staff, and the related visit or protocol assignment.

### 2.5 ⚠️ Cataract Post-Treatment Workflow
The system has a `CataractAssessment` model and `CATARACT_POST` as a condition code, but there is no frontend form for entering a cataract assessment. Post-operative cataract patients need:
- BCVA (best corrected VA) recording at 1 day, 1 week, 4–6 weeks
- IOP monitoring
- Posterior capsule opacification (PCO) grading
- YAG capsulotomy outcome recording

### 2.6 ⚠️ Loading Dose / Treat-and-Extend Counter
The protocol system tracks step numbers but does not have a clinical concept of **loading phase** vs **maintenance phase** vs **treat-and-extend** interval. For AMD specifically, clinicians need to see at a glance: "This patient has had 3 loading doses; last injection was 8 weeks ago; next due in 6 weeks."

This information exists in fragmented form across ProtocolStepCompletion records but is not surfaced as a meaningful clinical timeline.

### 2.7 ⚠️ Drug Administration Frontend Not Exposed
The `MedicationAdministration` model (which records exactly which drug was administered in hospital, by whom, at what time, via which route) has no frontend screen. It is backend-only. Injecting Anti-VEGF or administering dilating drops should be recorded through this model.

### 2.8 ⚠️ Email/SMS Notifications
The alert system generates records in the database but has **no outbound notification capability**. Late and missed appointment alerts appear in the AlertCenter but no message is sent to clinical staff or to the patient. A production system needs:
- Email alerts to the duty nurse/coordinator when a patient is >15 minutes late
- SMS appointment reminders to patients (subject to patient consent)

### 2.9 ⚠️ Clinic Letter Generation
There is no automated **clinic letter / discharge summary** generation. After a medical retina clinic, the referring GP and the community optician should receive a structured letter summarising: diagnosis, treatment given, drug name and dose, next appointment, and any concerns. This is a regulatory expectation under NHS standard.

### 2.10 ⚠️ Waiting List / RTT Tracking
There is no Referral to Treatment (RTT) pathway tracking. For NHS compliance, the system should record:
- Date referral received (clock start)
- Whether the referral was triaged within required time (2-week-wait rule for suspected sight-threatening conditions)
- Date first seen
- Date treatment started
- Whether the 18-week RTT standard was met

### 2.11 ⚠️ Patient-Facing Interface
There is no patient portal or patient-facing interface. Currently all data entry is by clinical staff. A patient self-service portal — even a basic one — would allow:
- Pre-appointment questionnaire completion (the PRO questionnaire currently requires staff to enter on behalf of the patient)
- Appointment confirmation/cancellation
- Access to own clinic letters (post-GDPR expectation)

---

## 3. What Is Missing (Not Yet Built)

### 3.1 🔴 NHS Spine / PDS Integration — *Awaiting API Access*
**Scope:** Pull confirmed patient demographics, NHS number, registered GP, current medications from NHS Spine via the Personal Demographics Service (PDS) and SCRa (Summary Care Record application).

**Impact without it:** Manual data entry of demographics creates risk of duplicate records and transcription errors. The NHS number must be verified against Spine before it can be trusted clinically.

**When API access is available, required integrations:**
- PDS FHIR R4 API (`GET /Patient?identifier=<NHS number>`) — validate/confirm identity
- SCR API — retrieve current medications and allergies
- ERS (e-Referral Service) — receive and action referrals from GPs

### 3.2 🔴 Community Optician Referral Portal — *Awaiting API Access*
**Scope:** Allow high street/community opticians to refer patients into the eye hospital and receive back a structured outcome letter.

**Impact without it:** Referrals from community opticians are received by phone or paper and manually entered. This creates a delay and data quality risk.

**When API access is available, required integrations:**
- A secure web portal or API endpoint that community opticians can POST a structured referral to
- Automated creation of a `Referral` record with `direction=incoming` and `source_type=community_optician`
- Automated outcome letter generation when the hospital episode is completed
- Two-way message threading on the `ReferralResponse` model

**Note:** The `Referral` and `ReferralSource` models already support `direction=incoming` and `source_type=community_optician`. The data structure is ready; only the portal front-end and authentication layer are needed.

### 3.3 🔴 Medical Imaging / Scan Uploads
The `OCTScan` and `FluoresceinAngiography` models exist but there is no mechanism to **upload and view retinal images**. For a medical retina service, OCT images from Topcon, Heidelberg, or Zeiss machines are the primary diagnostic record. Currently:
- The models record metadata (scan type, findings, measurements) but not the actual image file
- There is no DICOM viewer or image storage

**What is needed:**
- DICOM file upload capability linked to `OCTScan` and `FluoresceinAngiography` records
- A lightweight image viewer (or link to an external viewer)
- Linking images to specific visits and conditions

For community scans arriving via referral, the referral model supports `ReferralDocument` attachments — this is the correct place to attach community-generated scan files.

### 3.4 🔴 Diabetic Eye Screening Programme (DESP) Integration
The system has a `DiabeticRetinopathyScreening` model but no connection to the NHS DESP. Diabetic patients screened in the community and referred to the hospital for treatment should have their grading (R0, R1, R2, R3, M1) imported automatically.

### 3.5 🟡 Drug Interaction Checking
The `DrugAllergy` model records known allergies, but there is no real-time **drug–drug interaction checker**. When a prescriber adds a new medication, the system should warn if it interacts with current medications or contraindicated by a known allergy.

**Recommendation:** Integrate with an open formulary or BNF API. The system already has a `test_bnf_urls.py` test script, suggesting this was considered.

### 3.6 🟡 GDPR / Subject Access Request (SAR) Tool
There is no tool for generating a complete **Subject Access Request** export of a patient's data. Under UK GDPR, a patient can request all data held about them within one month. Currently this would require a developer to run database queries.

**Needed:** A "Generate SAR Export" action on the patient record that compiles all records (consultations, tests, prescriptions, medications, referrals, outcomes, audit logs) into a downloadable PDF or structured JSON.

### 3.7 🟡 NHS e-Prescribing (EPS) Link
Prescriptions created in PreciseOptics are internal records only. There is no connection to the NHS Electronic Prescription Service (EPS) to electronically send prescriptions to community pharmacies. This is medium priority as most injections are administered in-house, but important for drop prescriptions (glaucoma, post-op).

### 3.8 🟡 Appointment Reminder Notifications (SMS/Email)
As noted in Section 2.8, the alert engine exists but no outbound channel is connected. Typical requirements:
- 48-hour SMS/email reminder to patient
- 24-hour reminder
- No-show SMS to patient offering rebooking
- Clinician email when alert is generated

**Recommended implementation:** Celery + Django email backend + Twilio (SMS). Infrastructure stubs for Celery are in `requirements.txt`.

### 3.9 🟡 Intraocular Pressure (IOP) Trending Dashboard
IOP monitoring is critical for glaucoma management. Although `GlaucomaAssessment` records IOP values, there is no **IOP trending chart per patient** analogous to a blood pressure chart. Glaucoma patients need to show IOP measurements over years against target IOP and against medication changes.

### 3.10 🟡 Visual Field Progression Analysis
Similarly, `VisualFieldTest` records mean deviation (MD) values but there is no automated **glaucoma progression analysis** — no Humphrey-style trend line, no pointwise progression detection. This would be a significant clinical aid for glaucoma services.

### 3.11 🟡 Clinic Session / Theatre List Management
The system schedules individual appointments but has no concept of a **clinic session** or **theatre list** — a block of time reserved for a specific consultant and clinic type (e.g., Dr Smith's AMD clinic, Tuesday afternoons). Without this:
- There is no capacity management
- Overbooking cannot be prevented
- The "Today's Schedule" view cannot be organised by clinic/room

### 3.12 🟠 Diary / Calendar View — Low Priority
A calendar/diary view (`/diary`) showing appointments as a week or month grid. Staff and clinicians raised this specifically. Currently appointments are only shown as a linear list. A grid calendar improves at-a-glance scheduling.

---

## 4. Data Quality and Workflow Observations

### 4.1 Prescription Requires a Visit
The `Prescription` model has a mandatory FK to `PatientVisit`. This means a prescription cannot be raised without first creating a visit record. In practice, clinicians often issue repeat prescriptions at outpatient clinics where no separate "visit" has been booked in the system. This FK should be made optional (nullable) — or the system should auto-create a visit when a consultation is opened.

### 4.2 VA Scores Not Standardised
The `VisualAcuityTest` model records both Snellen fractions and LogMAR values. Reports compare LogMAR values for trend analysis, which is correct. However, there is no validation preventing a clinician from entering a Snellen result in the LogMAR field. A validation rule or conversion helper should be added.

### 4.3 NHS Number Format Not Validated
The `Patient.nhs_number` field is a free text CharField with no format validation. NHS numbers have a fixed format (10 digits with Modulus 11 check digit). Invalid NHS numbers will cause problems when Spine integration is implemented.

### 4.4 No Duplicate Patient Detection
There is no check for potential duplicate patients at registration. A patient who attends both as a GP referral and a community optician referral could be registered twice. A minimum similarity check on name + date of birth should warn the registrar.

### 4.5 Protocol Step Dates Not Auto-Calculated
When a protocol is assigned to a patient, the step scheduled dates require manual calculation. For an AMD loading protocol (3 injections at 4-week intervals), the system should automatically calculate injection dates from the `start_date`. This is partly implemented but the auto-scheduling logic is not consistently applied.

---

## 5. Production Readiness

| Area | Status | Notes |
|---|---|---|
| Database | ⚠️ Development only | SQLite used. Migrate to PostgreSQL before go-live |
| Authentication | ✅ | Token auth + 2FA implemented |
| HTTPS | ✅ | Settings in place; requires reverse proxy configuration |
| Audit logging | ✅ | Comprehensive |
| Backups | ⚠️ | Scripts exist but not automated |
| Error monitoring | ❌ | No Sentry / APM integration |
| Performance | ⚠️ | No Redis caching; will struggle under load |
| Rate limiting | ⚠️ | DRF throttle set conservatively; causes issues in test environments |
| Data encryption at rest | ❌ | Not implemented at database level |
| Celery/async tasks | ❌ | Required for notifications and heavy reports |
| Environment secrets | ✅ | `.env` file pattern correctly enforced |
| Health check endpoints | ✅ | `/health/`, `/health/db/`, `/health/detailed/` |

---

## 6. Priority Recommendations

### Immediate (before clinical go-live)
1. **Anti-VEGF injection screen** with batch number, pre/post VA, IOP, adverse event fields
2. **Batch number at point of administration** — add to `MedicationAdministration`
3. **Patient consent digital capture** — `PatientConsent` record per visit
4. **NHS number validation** (Modulus 11 check digit)
5. **PostgreSQL migration** from SQLite

### Short-term (within 3 months)
6. Drug administration frontend screen (expose `MedicationAdministration` API)
7. Clinic letter / discharge summary template generator
8. IOP trending chart per patient
9. Outbound email/SMS for appointment reminders
10. SAR (Subject Access Request) export tool

### Medium-term (3–6 months)
11. Loading dose / treat-and-extend counter and injection timeline
12. Clinic session management (capacity and room allocation)
13. Calendar/diary view
14. DICOM-compatible OCT image attachment
15. Drug interaction checking (BNF API)

### Pending External APIs
16. NHS Spine / PDS integration — when API access granted
17. Community optician referral portal — when API access granted
18. NHS ERS (e-Referral) integration
19. DESP (Diabetic Eye Screening Programme) data feed

---

## 7. Summary

PreciseOptics is a **well-engineered clinical information system** that correctly prioritises audit, reporting, and traceability. The architecture and data modelling are sound and the system is significantly further along than most custom-built hospital systems at this stage.

The gap between what is modelled in the database and what is accessible through the clinical screens is the most important area to address before go-live. In particular, the anti-VEGF injection workflow — which represents the majority of clinical activity in a medical retina service — needs a dedicated screen that ties together the batch number, VA result, IOP, consent, and adverse event in a single, auditable record.

Once those point-of-care screens are in place, the reporting and audit layer already built will be able to answer the questions that NHS commissioners and clinical governance teams require: which patients received which drug, from which batch, with what clinical outcome, measured against validated scores and patient-reported experience.

---

*Report prepared based on full codebase review of the PreciseOptics repository, master branch, July 2026.*
