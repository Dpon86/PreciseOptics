# Quick Start Guide - Enhanced Protocols System

## For Administrators

### Creating a Protocol with Multiple Items per Step

1. **Access Django Admin**: http://127.0.0.1:8000/admin/

2. **Create Base Protocol**:
   - Protocols → Treatment Protocols → Add
   - Fill in name, code, type, condition
   - Save

3. **Add Protocol Steps**:
   - Protocols → Protocol Steps → Add
   - Select your protocol
   - Set step number (1, 2, 3...)
   - Choose timing type:
     * Fixed: Days from start (0, 7, 14, 28, 56...)
     * Weekly: Every X weeks (set timing_days to interval)
     * Monthly: Every X months (set timing_days to interval)
   - Check "Is recurring" if step repeats
   - Set recurrence count (leave blank for indefinite)

4. **Add Medications to Step** (bottom of step form):
   - Click "Add another Protocol Step Medication"
   - Select medication from dropdown
   - Enter: dosage amount, unit, route, frequency
   - Set eye side (OD/OS/OU)
   - Enter duration in days if medication continues
   - Set order (1, 2, 3...) for display sequence
   - **Repeat for each medication**

5. **Add Treatments to Step** (bottom of step form):
   - Click "Add another Protocol Step Treatment"
   - Choose treatment type (injection, laser, surgery)
   - Enter treatment name
   - Set eye side
   - Enter duration in minutes
   - Check anesthesia if required
   - Set order
   - **Repeat for each treatment**

6. **Add Tests to Step** (bottom of step form):
   - Click "Add another Protocol Step Test"
   - Choose test type
   - Enter test name
   - Set eye side
   - Check "is baseline" for initial measurements
   - Set order
   - **Repeat for each test**

7. **Save the step**

8. **Repeat steps 3-7** for each protocol step

### Example: 3-Injection Loading Dose

**Step 1 (Day 0)**:
- Medications: Bevacizumab 1.25mg intravitreal (OD), order 1
- Medications: Prednisolone 1% drops 4x daily (OU), order 2
- Treatments: Intravitreal injection (OD), order 1
- Tests: Visual Acuity (OU), baseline, order 1
- Tests: OCT (OD), baseline, order 2
- Tests: IOP (OU), baseline, order 3

**Step 2 (Day 28)**:
- Same as Step 1

**Step 3 (Day 56)**:
- Same as Step 1

**Step 4 (Every 8 weeks from Day 84)**:
- Timing type: Weekly, timing_days: 8
- Is recurring: Yes, recurrence_count: blank (indefinite)
- Same medication/treatment/tests

## For Clinicians

### Assigning a Protocol to a Patient

**Method 1: From Patient Page** (recommended when link added):
1. Go to patient detail page
2. Click "Assign Protocol" button
3. Patient is pre-selected
4. Choose protocol from dropdown
5. Review protocol preview (shows steps, items, dates)
6. Select start date
7. Enter clinical reason
8. Click "Assign Protocol"

**Method 2: Direct URL**:
1. Navigate to: `/protocols/assign`
2. Select patient from dropdown
3. Select protocol from dropdown
4. Preview updates showing:
   - Protocol details (type, duration, consent requirements)
   - All steps with calculated dates
   - Number of medications/treatments/tests per step
5. Select start date
6. Enter clinical reason (required)
7. Review timeline showing exact dates for each step
8. Click "Assign Protocol"

**What Happens Next:**
- System creates PatientProtocol record (status: pending)
- Generates scheduled appointments for ALL steps
- For recurring steps, creates multiple appointments
- Calculates exact dates based on start date + timing rules
- You're redirected to view the patient's protocols

### What You Can Track After Assignment:
- Patient's active protocols
- All upcoming scheduled steps
- Completed steps with outcomes
- Adherence percentage
- Next due appointment
- Medications patient should be receiving
- Tests that need to be performed

## Common Scenarios

### Scenario 1: Anti-VEGF Loading + Maintenance
```
Protocol: "Wet AMD Treatment"
Duration: Ongoing

Step 1-3 (Days 0, 28, 56): Loading dose
  - Bevacizumab 1.25mg intravitreal
  - Visual Acuity + OCT tests

Step 4 (Day 84 onwards, every 8 weeks): Maintenance
  - Same medication + tests
  - Recurring: Yes, indefinite
```

### Scenario 2: Post-Op Cataract
```
Protocol: "Post-Cataract Care"
Duration: 30 days

Step 1 (Day 0): Surgery + meds
  - Treatment: Phaco + IOL
  - Medications: Antibiotic drops + Steroid drops (both 7 days)

Step 2 (Day 1): First check
  - Tests: VA, IOP, Slit Lamp

Step 3 (Day 7): Week check
  - Tests: VA, Refraction

Step 4 (Day 30): Final
  - Tests: VA, Refraction
```

### Scenario 3: Glaucoma Management
```
Protocol: "Glaucoma Drops Trial"
Duration: 12 weeks

Step 1 (Day 0): Baseline
  - Tests: IOP, VA, Visual Field

Step 2 (Day 0, starting same day): Start drops
  - Medications: Latanoprost 0.005% once daily (OU), 84 days
  - offset_days: 0 (same day as tests)

Step 3 (Day 28): First follow-up
  - Tests: IOP

Step 4 (Day 56): Second follow-up
  - Tests: IOP

Step 5 (Day 84): Final assessment
  - Tests: IOP, Visual Field
  - Branching: If IOP controlled → continue; If not → add second drop
```

## API Quick Reference

### Get Active Protocols
```javascript
GET /api/protocols/protocols/?is_active=true
```

### Get Protocol Details with Steps
```javascript
GET /api/protocols/protocols/{protocol_id}/
// Returns protocol with nested: steps, medications, treatments, tests
```

### Assign Protocol to Patient
```javascript
POST /api/protocols/assign-to-patient/
{
  "patient": "patient-uuid",
  "protocol": "protocol-uuid",
  "start_date": "2024-01-15",
  "assignment_reason": "Wet AMD, CNV confirmed on OCT"
}
```

### Get Patient's Assigned Protocols
```javascript
GET /api/protocols/patient/{patient_id}/protocols/
```

### Get Step Details with All Items
```javascript
GET /api/protocols/steps/{step_id}/
// Returns medications[], treatments[], tests[]
```

### Get Medications for a Step
```javascript
GET /api/protocols/step-medications/?protocol_step={step_id}
```

### Get Upcoming Steps for a Patient
```javascript
GET /api/protocols/completions/upcoming/
```

## Key Features Summary

✅ **Multiple items per step** - Unlimited medications, treatments, tests
✅ **Individual dosing** - Each medication has own dose, route, frequency, duration
✅ **Flexible timing** - Fixed, from previous, weekly, monthly recurring
✅ **Branching logic** - Conditional pathways based on outcomes
✅ **Patient assignment** - Full workflow with automated scheduling
✅ **Timeline visualization** - See exactly when each step occurs
✅ **Recurring steps** - For ongoing maintenance protocols
✅ **Eye side specification** - OD, OS, or OU for each item
✅ **Display ordering** - Control how items appear

## Troubleshooting

**Problem: Can't see medications/treatments/tests in step**
- Solution: Make sure you added them using the inline forms at the bottom of the Protocol Step form in Django Admin

**Problem: Recurring step only shows once**
- Solution: Check that `is_recurring` is checked and `recurrence_count` is set (or blank for indefinite)

**Problem: Assignment fails with "consent required" error**
- Solution: The protocol requires consent. Create a ConsentForm record for the patient first, or update the protocol to not require consent.

**Problem: Wrong dates calculated**
- Solution: Check the `timing_type` field - should be "fixed" for days from start, not "from_previous"

**Problem: Items not showing in order**
- Solution: Set the `order` field (1, 2, 3...) for each medication/treatment/test

## Support

For issues or questions:
1. Check `PROTOCOLS_IMPLEMENTATION_COMPLETE.md` for detailed technical documentation
2. Review `Backend/ENHANCED_PROTOCOLS_SUMMARY.md` for API examples
3. Check Django Admin logs for errors
4. Review browser console for frontend errors
