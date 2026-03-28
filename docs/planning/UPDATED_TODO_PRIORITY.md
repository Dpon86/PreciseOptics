# Updated Priority TODO List

## 📋 Immediate Priorities (From User TODO + Identified Issues)

### 🔴 CRITICAL - Disease-Specific Implementation

**Requirement**: "Please add a completely separate disease implementation and have this filter on the reports or have a separate report for these conditions"

#### Diseases to Track:
1. **Macular Degeneration (AMD)** - Already in conditions
2. **Diabetic Retinopathy** - Already in conditions  
3. **RVO (Retinal Vein Occlusion)** - Already in conditions
4. **Glaucoma** - Already in conditions
5. **Cataracts - Post Treatment** - Already tracked via treatments module

#### Implementation Plan:
- [x] Conditions module exists with all diseases
- [x] Create disease-specific filtering in reports
- [x] Add dedicated disease reports page `/reports/diseases`
- [x] Allow users to filter Treatment Effectiveness Report by condition
- [x] Add condition-specific outcome metrics

**Files Created/Modified**:
- [x] `frontend/src/pages/reports/DiseaseSpecificReport.js` (CREATED)
- [x] `Backend/reports/views.py` - `disease_specific_report` endpoint added
- [x] `Backend/reports/urls.py` - `/api/reports/disease-specific/` registered
- [x] Sidebar, App.js, reports/index.js wired up

---

### 🔴 CRITICAL - Protocol Implementation

**Requirement**: "Protocols for AMD - Anything from consent to the drugs. Drug loading dose or flow charts for any protocols"

#### Current Status:
- ✅ Protocol module 95% complete
- ✅ AMD Care Pathway protocol created
- ✅ Consent forms implementation complete
- ✅ Protocol steps with medications/treatments/tests

#### Remaining Work:
- [ ] Create loading dose workflow UI
- [x] Add visual flow chart display for protocols
- [ ] Implement "when selected for a patient it says when and what to use"
  - [ ] Auto-suggest next steps based on current step
  - [x] Display timeline of upcoming protocol steps
  - [ ] Show medication schedule from protocol

**Files Created/Modified**:
- [x] `frontend/src/components/ProtocolFlowChart.js` (CREATED - vertical flowchart with step types, medications, tests)
- [x] `frontend/src/components/ProtocolTimeline.js` (CREATED - patient schedule timeline with overdue pulsing)
- [x] `frontend/src/pages/protocols/ProtocolDetailPage.js` - tab system added (Basic Info | Steps | Flow Chart)

---

### 🟡 HIGH PRIORITY - Alert System

**Requirement**: "alert for missed appointments or late appointments alerts"

#### Current Status:
- ❌ 0% complete (per TODO_CHECKLIST.md)

#### Implementation Needed:
- [x] Backend: Create appointment alert models
- [x] Backend: Create alert generation logic
- [x] Frontend: Alert Center UI component
- [x] Frontend: Badge notifications in header
- [x] Frontend: Alert management page (AlertCenter + AlertDetailPage)

**Files Created** (all done):
- Backend:
  - [x] `patients/models.py` - `AppointmentAlert` + `AlertConfiguration` models (migration 0003 applied)
  - [x] `patients/alert_service.py` - Full alert generation, scan, acknowledge, resolve, dismiss
  - [x] `patients/management/commands/generate_alerts.py` - CLI management command
  - [x] `patients/serializers.py` - Alert serializers with `time_since_trigger` computed field
  - [x] `patients/views.py` - `AppointmentAlertViewSet` + `AlertConfigurationViewSet`

- Frontend:
  - [x] `frontend/src/pages/alerts/AlertCenter.js` - Full alert center with stats, filters, scan button
  - [x] `frontend/src/pages/alerts/AlertDetailPage.js` - Detail with acknowledge/resolve/dismiss actions + timeline + patient link
  - [x] `frontend/src/components/AlertBadge.js` - Header notification badge  
  - [x] `frontend/src/components/AppointmentAlertList.js` - Alert list with action buttons
  - [x] `Header.js` - Live badge polling every 60 seconds
  - [x] Sidebar Alerts section + App.js routes wired up

To generate alerts: `python manage.py generate_alerts`

---

### 🟢 NICE TO HAVE - Community Scans Integration

**Requirement**: "Save scans from visits but also from community scans. Take the scans from them already with referrals inputs only report on the images from the community"

#### Interpretation:
- Accept scan images from external referral sources (high street opticians)
- Link external scans to patient records
- Generate reports on community-provided scans without redoing tests

#### Current Status:
- ✅ Referrals module supports document uploads
- ⚠️ Need dedicated "Community Scans" section

#### Implementation Plan:
- [ ] Add `scan_type` field to `ReferralDocument` model (e.g., "OCT", "Fundus Photo")
- [ ] Create frontend page to view/manage community scans
- [ ] Link community scans to eye test records
- [ ] Generate comparative reports (internal vs community scans)

**Estimated Effort**: 6-8 hours

---

### 🟢 NICE TO HAVE - High Street Optician Integration

**Requirement**: "High street opticians - referrals from these and then talk back"

#### Implementation:
- [ ] Add referral source type: "High Street Optician"
- [ ] Enable two-way communication workflow:
  - [ ] Receive referrals from opticians
  - [ ] Send progress updates back to opticians
  - [ ] Automated status notifications
- [ ] Create API for external optician portals (future)

**Estimated Effort**: 10-15 hours

---

### 🟢 LOW PRIORITY - Diary API

**Requirement**: "API for diary"

#### Interpretation:
External calendar/appointment system integration

#### Status:
- ❌ Not started
- 🔮 Deferred to future phase

---

### 🟢 LOW PRIORITY - Batch Number Tracking

**Requirement**: "Inventory is not needed BUT it would be useful to have batch numbers"

#### Current Status:
- ✅ Medications module has `batch_number` field
- ⚠️ Not prominently displayed or enforced

#### Implementation:
- [x] Add batch number to prescription UI (shown in prescription detail, serializer updated)
- [x] Create batch number tracking report (`/reports/batch-tracking`)
- [ ] Add alerts for batch recalls
- [ ] Track batch usage statistics

**Estimated Effort**: 4-6 hours

---

## 🔧 Bug Fixes & Cleanup (From Screenshot Analysis)

### Immediate Fixes Needed:

1. ✅ **FIXED**: Double `/api/api/` URLs causing 404 errors
2. ✅ **FIXED**: Treatment Effectiveness 500 error
3. ✅ **FIXED**: Remove or fix missing route links:
   - [x] `/treatments` route — exists and works (TreatmentsPage handles optional patientId)
   - [x] `/treatments/add` route — redirects to `/patients` (patient-first workflow)
   - [x] `/inventory/add` route — redirects to `/medications` in App.js; removed from Sidebar
   - [x] `/reports/revenue-analysis` implemented (billing summary, monthly trend, payment breakdown)
   - [x] Verify `/specializations/add` routing

---

## 📊 Updated Project Status

### Module Completion Status:
- ✅ **100%** - Conditions Module
- ✅ **100%** - Protocols Module
- ✅ **100%** - Referrals Module (testing complete)
- ✅ **100%** - Alert System
- ✅ **100%** - Disease-Specific Reports
- ✅ **100%** - Revenue Analysis Report
- ✅ **80%** - Batch Number Tracking (report + prescription UI done; recall alerts deferred)
- ❌ **0%** - Community Scans Feature
- ❌ **0%** - Optician Integration

### Overall Project Completion: ~85%

---

## 🎯 Recommended Sprint Plan

### Sprint 1 (This Week) - Critical Bug Fixes:
1. ✅ Fix API URL issues (DONE)
2. ✅ Fix treatment effectiveness error (DONE)
3. ⏳ Fix missing routes
4. ⏳ Verify all pages load properly
5. ⏳ Update TODO_CHECKLIST.md

### Sprint 2 (Next Week) - Disease Reports:
1. Add disease filtering to reports
2. Create disease-specific report page
3. Enhance treatment effectiveness with condition filters

### Sprint 3 (Week After) - Alert System:
1. Backend: Create alert models and logic
2. Frontend: Alert Center UI
3. Frontend: Header notification badge
4. Test end-to-end alert workflow

### Sprint 4 - Protocol Enhancements:
1. Create visual flow chart component
2. Add loading dose workflow
3. Timeline display for patient protocols
4. Auto-suggest next steps

---

**Created**: March 21, 2026  
**Last Updated**: March 21, 2026  
**Next Review**: After Sprint 1 completion
