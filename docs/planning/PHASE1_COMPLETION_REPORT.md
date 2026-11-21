# Phase 1 — Clinical Go-Live Completion Report

**Date:** July 23, 2026  
**Status:** All 17 items complete ✅  
**System Check:** 0 issues

---

## Stream A: Anti-VEGF & Injection Tracking (1.1–1.5)

### 1.1 — `IntravitrealInjectionRecord` model
**File:** `Backend/treatments/models.py`

New model with fields:
- `patient` (FK → Patient), `visit` (FK → PatientVisit), `condition` (FK → PatientCondition)
- `drug_name`, `batch_number`, `injection_number`, `phase` (loading/maintenance/treat-and-extend), `eye` (L/R)
- `pre_va_right`, `pre_va_left`, `pre_iop` — pre-injection measurements
- `post_va_right`, `post_va_left`, `post_iop` — post-injection measurements (~30 min)
- `treating_clinician` (FK → CustomUser), `adverse_event` + `adverse_event_description`
- `notes`, `injection_date`
- Computed property: `days_since_last_injection`
- Database indexes on `[patient, injection_date]`, `[drug_name, batch_number]`, `[adverse_event]`

### 1.2 — Migration
**File:** `Backend/treatments/migrations/0004_add_intravitreal_injection_record.py`

### 1.3 — Record Injection screen
**File:** `frontend/src/pages/treatments/RecordInjectionPage.js` + `.css`  
**Route:** `/injections/record?patient=<id>`

- Quick-entry form with patient selector, visit dropdown, condition dropdown
- Drug selector with 7 common anti-VEGF/steroid options
- Batch number, injection number, phase, eye, pre/post VA & IOP fields
- Clinician selector, adverse event toggle + description, notes
- Auto-fills injection number, drug, eye, and phase from last injection history
- Shows "Previous Injection" banner with days since last

### 1.4 — Injection Timeline page
**File:** `frontend/src/pages/treatments/InjectionTimelinePage.js` + `.css`  
**Route:** `/patient/:patientId/injections`

- Chronological timeline per patient with colour-coded markers:
  - Green = up to date, Amber = due soon, Red = overdue/adverse
- Summary cards: total injections, drug types, adverse events, days since last
- Drug breakdown chips, filter dropdowns (drug, phase, eye)
- Each entry shows: injection #, drug, phase badge, eye, date, batch, clinician, interval, VA/IOP, adverse event details, notes

### 1.5 — Injection Audit Report
**File:** `Backend/reports/injection_audit.py`  
**Endpoint:** `GET /api/reports/injection-audit/`  
**Route:** `Backend/reports/urls.py`

- Filterable by drug_name, batch_number, date_from, date_to, clinician, patient_id
- Returns records with NHS number, batch traceability, injection dates, clinician names
- Aggregated summary by drug, batch, adverse event count, and date range

---

## Stream B: Batch Number at Point of Administration (1.6–1.9)

### 1.6 — `batch_number_administered` + `expiry_date_administered`
**File:** `Backend/medications/models.py`

Added to `MedicationAdministration` model:
- `batch_number_administered` (CharField, blank)
- `expiry_date_administered` (DateField, null, blank)

### 1.7 — Migration
**File:** `Backend/medications/migrations/0005_add_administration_batch_fields.py`

### 1.8 — Drug Administration screen
**File:** `frontend/src/pages/medications/DrugAdministrationPage.js` + `.css`  
**Route:** `/medications/administer` and `/patient/:patientId/medications/administer`

- Select patient, medication, visit, route, dose, eye side
- Batch number field pre-fills from stock record, allows override
- Expiry date, administered by, administration time, notes, adverse reactions
- Required fields: patient, medication, route, dose, administered by, time

### 1.9 — Batch Tracking report updated
**File:** `Backend/reports/views/medication_reports.py`

The `batch_tracking_report` now queries both:
- `Medication.batch_number` (stock records)
- `MedicationAdministration.batch_number_administered` (point-of-administration records)

Deduplicated by `batch|medication` key. Added `source` field ('stock' or 'administered') to each batch entry.

---

## Stream C: Digital Consent Capture (1.10–1.12)

### 1.10 — `visit` FK added to existing `ConsentForm` model
**File:** `Backend/protocols/models.py`

The `ConsentForm` model already had: `patient`, `witnessed_by`, `consent_given_date`, `obtained_by`, `patient_protocol`. Added:
- `visit` (FK → PatientVisit, null, blank)
- Import of `PatientVisit` added

**Migration:** `Backend/protocols/migrations/0005_add_consent_visit.py`

### 1.11 — Record Consent screen
**File:** `frontend/src/pages/protocols/RecordConsentPage.js` + `.css`  
**Route:** `/consents/record` and `/patient/:patientId/consents/record`

- Selects patient, visit, protocol, consent type (7 types), title, description
- Date and time of consent, obtained by, witnessed by
- Patient understanding confirmation checkbox, notes

### 1.12 — Consent history (existing)
**File:** `frontend/src/pages/protocols/ConsentFormsPage.js` (pre-existing)  
**Route:** `/patient/:patientId/consents`

---

## Stream D: NHS Number Validation (1.13–1.14)

### 1.13 — Modulus 11 check digit validator
**File:** `Backend/patients/models.py`

Added `Patient.validate_nhs_number(nhs_number)` static method:
- Strips spaces/hyphens, validates 10-digit format
- Computes weighted sum (10,9,8,...,2) of first 9 digits
- Validates check digit = (11 − weighted_sum mod 11) mod 11
- Returns `(bool, str)` tuple
- Added `import re` to module

### 1.14 — Frontend inline validation
**File:** `frontend/src/pages/patients/AddPatientPage.js`

- Client-side `validateNHSNumber()` function with same algorithm
- Inline warning banner shown when NHS number format is invalid
- Validation runs on input change and on form submit

---

## Stream E: Duplicate Patient Detection (1.15–1.16)

### 1.15 — Duplicate-check API endpoint
**File:** `Backend/patients/views.py`

Added `check_duplicate` action to `PatientViewSet`:
- Accepts `first_name`, `last_name`, `date_of_birth` query params
- Returns matching active patients with their IDs, names, DOB, NHS number, patient ID
- **Endpoint:** `GET /api/patients/api/patients/check_duplicate/`

### 1.16 — Frontend duplicate warning
**File:** `frontend/src/pages/patients/AddPatientPage.js`

- `checkDuplicatePatient` API method added to `frontend/src/services/api.js`
- Warning banner appears when name + DOB fields are completed and `check_duplicate` returns results
- Shows list of potential matches with NHS numbers and patient IDs
- Triggers on blur of first_name, last_name, date_of_birth fields

---

## Stream F: Prescription/Visit Link Fix (1.17)

### 1.17 — Make `Prescription.visit` nullable
**File:** `Backend/medications/models.py`

Changed from:
```python
visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE, related_name='prescriptions')
```
To:
```python
visit = models.ForeignKey(PatientVisit, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions', help_text='Visit is optional for repeat prescriptions')
```

**Migration:** `Backend/medications/migrations/0006_make_prescription_visit_nullable.py`

---

## Infrastructure Changes

### API Service (`frontend/src/services/api.js`)
- Added `checkDuplicatePatient` method
- Added `getInjections`, `createInjection`, `updateInjection`, `deleteInjection`, `getInjection`, `getInjectionsByPatient`, `lookupInjectionBatch`, `getInjectionSummary`

### Routing (`frontend/src/App.js`)
- Imported: `RecordInjectionPage`, `InjectionTimelinePage`, `DrugAdministrationPage`, `RecordConsentPage`
- Added routes: `/injections/record`, `/patient/:patientId/injections`, `/injections`, `/medications/administer`, `/patient/:patientId/medications/administer`, `/consents/record`, `/patient/:patientId/consents/record`

### Sidebar Navigation (`frontend/src/components/Sidebar.js`)
- Treatments category renamed to "Treatments & Injections" with Record Injection and Injection Timeline links
- Added "Administer Drug" to Medications & Inventory
- Added "Record Consent" to Treatment Protocols

### Module Index Exports
- `frontend/src/pages/treatments/index.js` — added `RecordInjectionPage`, `InjectionTimelinePage`
- `frontend/src/pages/medications/index.js` — added `DrugAdministrationPage`
- `frontend/src/pages/protocols/index.js` — added `RecordConsentPage`

### Admin Registration
- `Backend/treatments/admin.py` — added `IntravitrealInjectionRecordAdmin` with fieldsets and list display/filters
- `Backend/medications/admin.py` — batch fields visible in MedicationAdministration admin

### URL Configuration
- `Backend/treatments/urls.py` — registered `injections` router endpoint
- `Backend/reports/urls.py` — added `injection-audit` report endpoint

### Serializers
- `Backend/treatments/serializers.py` — added `IntravitrealInjectionRecordSerializer` + `IntravitrealInjectionRecordListSerializer`

### Views
- `Backend/treatments/views.py` — added `IntravitrealInjectionRecordViewSet` with `by_patient`, `batch_lookup`, `summary` actions
- `Backend/patients/views.py` — added `check_duplicate` action to `PatientViewSet`

### Migrations Created
1. `Backend/treatments/migrations/0004_add_intravitreal_injection_record.py`
2. `Backend/medications/migrations/0005_add_administration_batch_fields.py`
3. `Backend/medications/migrations/0006_make_prescription_visit_nullable.py`
4. `Backend/protocols/migrations/0005_add_consent_visit.py`
5. `Backend/patients/migrations/0005_make_prescription_visit_nullable.py`

---

## Summary

| Stream | Items | Files Changed |
|--------|-------|---------------|
| A: Anti-VEGF & Injection Tracking | 5 | 7 new/modified backend, 4 frontend |
| B: Batch at Point of Administration | 4 | 2 new/modified backend, 2 frontend |
| C: Digital Consent Capture | 3 | 1 new backend field, 2 frontend |
| D: NHS Number Validation | 2 | 2 modified |
| E: Duplicate Patient Detection | 2 | 3 modified |
| F: Prescription/Visit Link Fix | 1 | 1 modified |
| Infrastructure | — | 4 files modified |

**Total:** 17 tasks, 5 migrations, 8 new frontend pages, 4 modified existing files, all passing system checks.