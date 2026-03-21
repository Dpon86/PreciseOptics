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
- [ ] Create disease-specific filtering in reports
- [ ] Add dedicated disease reports page
- [ ] Allow users to filter Treatment Effectiveness Report by condition
- [ ] Add condition-specific outcome metrics

**Files to Create/Modify**:
- [ ] `frontend/src/pages/reports/DiseaseSpecificReport.js` (NEW)
- [ ] `Backend/reports/views.py` - Add disease filtering
- [ ] Update Treatment Effectiveness Report filters

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
- [ ] Add visual flow chart display for protocols
- [ ] Implement "when selected for a patient it says when and what to use"
  - [ ] Auto-suggest next steps based on current step
  - [ ] Display timeline of upcoming protocol steps
  - [ ] Show medication schedule from protocol

**Files to Create/Modify**:
- [ ] `frontend/src/pages/protocols/ProtocolFlowChart.js` (NEW)
- [ ] `frontend/src/components/ProtocolTimeline.js` (NEW)
- [ ] Enhance `ProtocolDetailPage.js` with visual workflow

---

### 🟡 HIGH PRIORITY - Alert System

**Requirement**: "alert for missed appointments or late appointments alerts"

#### Current Status:
- ❌ 0% complete (per TODO_CHECKLIST.md)

#### Implementation Needed:
- [ ] Backend: Create appointment alert models
- [ ] Backend: Create alert generation logic (scheduled task)
- [ ] Frontend: Alert Center UI component
- [ ] Frontend: Badge notifications in header
- [ ] Frontend: Alert management page

**Estimated Effort**: 8-12 hours

**Files to Create**:
- Backend:
  - [ ] `patients/models.py` - Add `AppointmentAlert` model
  - [ ] `patients/alert_service.py` - Alert generation logic
  - [ ] `patients/tasks.py` - Celery scheduled tasks (if needed)
  - [ ] `patients/serializers.py` - Alert serializers
  - [ ] `patients/views.py` - Alert endpoints

- Frontend:
  - [ ] `frontend/src/pages/alerts/AlertCenter.js`
  - [ ] `frontend/src/components/AlertBadge.js`  
  - [ ] `frontend/src/components/AppointmentAlertList.js`
  - [ ] Update `Header.js` with alert badge

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
- [ ] Add batch number to prescription UI
- [ ] Create batch number tracking report
- [ ] Add alerts for batch recalls
- [ ] Track batch usage statistics

**Estimated Effort**: 4-6 hours

---

## 🔧 Bug Fixes & Cleanup (From Screenshot Analysis)

### Immediate Fixes Needed:

1. ✅ **FIXED**: Double `/api/api/` URLs causing 404 errors
2. ✅ **FIXED**: Treatment Effectiveness 500 error
3. ⏳ **PENDING**: Remove or fix missing route links:
   - [ ] `/treatments` route or remove link
   - [ ] `/treatments/add` route or remove link
   - [ ] `/inventory/add` remove link (not needed)
   - [ ] `/reports/revenue-analysis` implement or defer
   - [ ] Verify `/specializations/add` routing

---

## 📊 Updated Project Status

### Module Completion Status:
- ✅ **100%** - Conditions Module
- ✅ **95%** - Protocols Module (needs flow chart UI)
- ✅ **100%** - Referrals Module (testing complete)
- ❌ **0%** - Alert System
- ⚠️ **50%** - Disease-Specific Reports
- ❌ **0%** - Community Scans Feature
- ❌ **0%** - Optician Integration

### Overall Project Completion: ~70%

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
