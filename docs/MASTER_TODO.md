# PreciseOptics - Master TODO (Canonical)

Last updated: September 26, 2026
Status: Active source of truth for all remaining work

This file is the canonical TODO list for the repository.
Consolidated from:
- docs/planning/TODO_CHECKLIST.md (archived)
- frontend/to do (clinical development backlog)
- Inline TODO comments in source code

## 1) Critical Production Readiness

- [ ] Provision production PostgreSQL or MySQL instance
- [ ] Execute SQLite to production DB cutover rehearsal in staging
  - [x] Rehearsal automation script added (`Backend/scripts/rehearse_sqlite_to_postgres.sh`)
  - [ ] Run rehearsal on staging and capture duration + validation output
- [ ] Execute production cutover with rollback window
- [ ] Configure production Sentry project, DSN, and alert routing
- [ ] Run first encrypted backup on production
- [ ] Run first restore drill in staging and record results against:
  - [ ] RTO <= 4 hours
  - [ ] RPO <= 24 hours
- [ ] Verify cron backup schedule on production host
- [ ] Confirm production env values are complete and secure:
  - [ ] DEBUG=False
  - [ ] Strong SECRET_KEY
  - [ ] Correct ALLOWED_HOSTS
  - [ ] HTTPS frontend URL and CORS origins

## 2) Security Hardening

- [ ] Migrate auth token storage to httpOnly cookies (currently sessionStorage in `frontend/src/context/AuthContext.js`)
- [ ] Build audit trail integration (outstanding backend item)
- [x] Remove navigation links to non-existent routes (verified: Inventory redirects to /medications; Treatments & Revenue Analysis routes now exist)

## 3) Remaining Product Features

### Protocol workflow enhancements
- [ ] Build loading dose workflow UI
- [x] Add auto-suggest next step for assigned patient protocols
- [x] Add protocol medication schedule display (when and what to use)

### Community scans and referral enrichment
- [ ] Add scan_type to referral documents
- [ ] Build community scans page and filters
- [ ] Link community scans to patient and eye test records
- [ ] Add report view for community scans

### High street optician integration
- [ ] Add source type for high street opticians
- [ ] Add two-way communication workflow
- [ ] Add outbound status updates to referrers

### Batch tracking follow-through
- [x] Add batch recall alert workflow
- [x] Add batch usage statistics tracking

### Clinical workflow (from Clinical Systems Review)
- [ ] BNF / drug-interaction checking backend integration (check prescriptions vs current medications + allergies)
- [ ] Frontend interaction warning banner on AddPrescriptionPage
- [ ] Twilio SMS appointment reminders (fallback for patients without email)

### Blocked — pending external API access
- [ ] NHS Spine / PDS integration (verify NHS number, pull medications/allergies)
- [ ] NHS e-Referral (ERS) — receive GP referrals electronically
- [ ] Community Optician referral portal (secure API + automated outcome letters)
- [ ] DESP data feed — import screening grades (R0/R1/R2/R3/M1)
- [ ] NHS EPS (electronic prescribing) integration

### Nice to have / future sprints
- [ ] Patient portal (self-serve PRO, confirm/cancel appointments, view letters)
- [ ] Waiting list / RTT pathway tracking (18-week standard)
- [ ] Theatre list (surgeon, anaesthetist, equipment requirements)
- [ ] Post-op cataract review workflow (day 1 / week 1 / 4–6 week)
- [ ] Visual acuity Snellen→LogMAR conversion helper on forms
- [ ] Protocol step dates auto-calculated from start date on assignment
- [ ] Automated compliance report generation (monthly/quarterly PDF)
- [ ] Dashboard home page (today's clinic list, active alerts, overdue assessments, injection intervals)

## 4) Testing and Quality Gaps

- [ ] Backend API integration tests across critical workflows
- [x] Appointment alerts API tests (Module 4 — 20 tests in `Backend/patients/tests.py`)
- [ ] Performance testing and report endpoint benchmarks
- [ ] Security testing (OWASP, auth bypass, CSRF, injection)
- [ ] Cross-browser test run completion (Chromium, Firefox, WebKit)
- [ ] Mobile responsiveness test run completion
- [ ] Accessibility testing integration and baseline report

## 5) Documentation and Enablement

- [ ] Review and add code comments and docstrings
- [ ] Generate and validate user manual screenshots end-to-end
- [ ] Complete module user guides
- [ ] Complete admin setup guide and operator runbook validation
- [ ] Complete deployment training and handover checklist

## 6) Recently Completed (Reference)

- [x] Production DB hardening in settings (SQLite blocked in production)
- [x] DB connection reuse and health checks configured
- [x] Backup and restore scripts added
- [x] DR section with RTO and RPO added to deployment runbook
- [x] Sentry integration wiring added (env-driven)
- [x] Alerts API and docs completed
- [x] E2E coverage expansion completed across core modules
- [x] Security audit items resolved (38/38: 13 critical, 8 high, 10 medium, 7 low)
- [x] Account lockout after 5 failed attempts + admin/CLI unlock
- [x] pytest test infrastructure configured
- [x] Real-time system health monitoring widget
- [x] Anti-VEGF & injection tracking (record, timeline, audit report)
- [x] Batch number at point of administration
- [x] Digital consent capture
- [x] NHS number validation (Modulus 11) + duplicate patient detection
- [x] Loading dose / treat-and-extend counter
- [x] IOP trending + visual field progression charts
- [x] Clinic letter / discharge summary generation
- [x] Outbound email notifications + Celery reminder tasks
- [x] SAR (Subject Access Request) export
- [x] Missing eye test frontend forms (Glaucoma, DR screening, Cataract, Retinal)
- [x] Clinic session management + calendar diary view
- [x] DICOM/OCT image upload + lightweight viewer
- [x] Disease-specific reports (ConditionPrevalence, ConditionOutcomes, etc.)
- [x] Condition-specific dashboard widgets
- [x] New analytical reports implementation (4 reports)
- [x] MED-04: Monolithic Django view files split into modules
- [x] MED-09: PropTypes validation on shared React components
- [x] Frontend audit & architecture documentation
- [x] Protocol medication schedule display (when and what to use) — per-step medications/treatments/tests on the schedule endpoint + "Medications" view on ProtocolSchedulePage
- [x] Auto-suggest next step for assigned patient protocols — `PatientProtocol.get_suggested_next_step()` (branch-aware) surfaced in `PatientDetailPage` and `PatientProtocolsPage`
- [x] Batch recall alert workflow — `MedicationRecall.get_affected_patient_ids()` now unions `MedicationAdministration.batch_number_administered` with prescription records (previously prescriptions-only, missing administered-batch patients); `medications/tasks.py::notify_staff_of_recall` emails admin/manager/pharmacist staff + `COORDINATOR_EMAIL` on medium+ severity recall creation
- [x] Batch usage statistics tracking — `MedicationRecallViewSet.batch_usage_stats` endpoint (`/api/medication-recalls/batch-usage-stats/`) returns total administrations, unique patients, date range, per-clinician and per-route breakdown, adverse reaction count; surfaced in `RecallCenter.js` detail panel

## 7) Working Rule

When any TODO status changes, update this file only.
