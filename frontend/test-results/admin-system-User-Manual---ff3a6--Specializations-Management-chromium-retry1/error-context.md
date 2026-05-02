# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-system.spec.js >> User Manual - Admin & System Screenshots >> 22 - Specializations Management
- Location: e2e\admin-system.spec.js:507:7

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('button, a').filter({ hasText: /specialization/i }).first()
    - locator resolved to <a class="nav-item-link " href="/specializations/add">…</a>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - element is outside of the viewport
    - retrying click action
      - waiting 100ms
    19 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - element is outside of the viewport
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - button "Open navigation menu" [ref=e7] [cursor=pointer]: ☰
        - button "← Back" [ref=e8] [cursor=pointer]
        - heading "PreciseOptics Eye Hospital" [level=1] [ref=e9]
      - generic [ref=e10]:
        - generic [ref=e11]: Welcome, User
        - button "Logout" [ref=e12] [cursor=pointer]
  - generic [ref=e13]:
    - generic [ref=e14]:
      - heading "Navigation" [level=2] [ref=e15]
      - button "Close sidebar" [ref=e16] [cursor=pointer]: ×
    - navigation [ref=e17]:
      - generic [ref=e18]:
        - heading "Dashboard" [level=3] [ref=e19]
        - list [ref=e20]:
          - listitem [ref=e21]:
            - link "🏠 Home" [ref=e22] [cursor=pointer]:
              - /url: /
              - generic [ref=e23]: 🏠
              - generic [ref=e24]: Home
          - listitem [ref=e25]:
            - link "📊 Admin Dashboard" [ref=e26] [cursor=pointer]:
              - /url: /admin
              - generic [ref=e27]: 📊
              - generic [ref=e28]: Admin Dashboard
      - generic [ref=e29]:
        - heading "Patient Management" [level=3] [ref=e30]
        - list [ref=e31]:
          - listitem [ref=e32]:
            - link "👥 View Patients" [ref=e33] [cursor=pointer]:
              - /url: /patients
              - generic [ref=e34]: 👥
              - generic [ref=e35]: View Patients
          - listitem [ref=e36]:
            - link "➕ Add Patient" [ref=e37] [cursor=pointer]:
              - /url: /patients/add
              - generic [ref=e38]: ➕
              - generic [ref=e39]: Add Patient
      - generic [ref=e40]:
        - heading "Consultations" [level=3] [ref=e41]
        - list [ref=e42]:
          - listitem [ref=e43]:
            - link "📋 View Consultations" [ref=e44] [cursor=pointer]:
              - /url: /consultations
              - generic [ref=e45]: 📋
              - generic [ref=e46]: View Consultations
          - listitem [ref=e47]:
            - link "➕ Add Consultation" [ref=e48] [cursor=pointer]:
              - /url: /consultations/add
              - generic [ref=e49]: ➕
              - generic [ref=e50]: Add Consultation
      - generic [ref=e51]:
        - heading "Eye Tests" [level=3] [ref=e52]
        - list [ref=e53]:
          - listitem [ref=e54]:
            - link "👁️ View Eye Tests" [ref=e55] [cursor=pointer]:
              - /url: /eye-tests
              - generic [ref=e56]: 👁️
              - generic [ref=e57]: View Eye Tests
          - listitem [ref=e58]:
            - link "🔍 Visual Acuity Test" [ref=e59] [cursor=pointer]:
              - /url: /eye-tests/visual-acuity/add
              - generic [ref=e60]: 🔍
              - generic [ref=e61]: Visual Acuity Test
      - generic [ref=e62]:
        - heading "Conditions Management" [level=3] [ref=e63]
        - list [ref=e64]:
          - listitem [ref=e65]:
            - link "🏥 View All Conditions" [ref=e66] [cursor=pointer]:
              - /url: /conditions
              - generic [ref=e67]: 🏥
              - generic [ref=e68]: View All Conditions
          - listitem [ref=e69]:
            - link "👤 Patient Conditions (Select Patient)" [ref=e70] [cursor=pointer]:
              - /url: /patients
              - generic [ref=e71]: 👤
              - generic [ref=e72]: Patient Conditions (Select Patient)
          - listitem [ref=e73]:
            - link "📊 Prevalence Report" [ref=e74] [cursor=pointer]:
              - /url: /reports/condition-prevalence
              - generic [ref=e75]: 📊
              - generic [ref=e76]: Prevalence Report
          - listitem [ref=e77]:
            - link "📈 Outcomes Report" [ref=e78] [cursor=pointer]:
              - /url: /reports/condition-outcomes
              - generic [ref=e79]: 📈
              - generic [ref=e80]: Outcomes Report
          - listitem [ref=e81]:
            - link "🦠 Disease-Specific Report" [ref=e82] [cursor=pointer]:
              - /url: /reports/diseases
              - generic [ref=e83]: 🦠
              - generic [ref=e84]: Disease-Specific Report
      - generic [ref=e85]:
        - heading "Treatment Protocols" [level=3] [ref=e86]
        - list [ref=e87]:
          - listitem [ref=e88]:
            - link "📋 View All Protocols" [ref=e89] [cursor=pointer]:
              - /url: /protocols
              - generic [ref=e90]: 📋
              - generic [ref=e91]: View All Protocols
          - listitem [ref=e92]:
            - link "🏗️ Protocol Builder" [ref=e93] [cursor=pointer]:
              - /url: /protocols/builder
              - generic [ref=e94]: 🏗️
              - generic [ref=e95]: Protocol Builder
          - listitem [ref=e96]:
            - link "➕ Create Protocol" [ref=e97] [cursor=pointer]:
              - /url: /protocols/add
              - generic [ref=e98]: ➕
              - generic [ref=e99]: Create Protocol
          - listitem [ref=e100]:
            - link "✅ Protocol Adherence" [ref=e101] [cursor=pointer]:
              - /url: /reports/protocol-adherence
              - generic [ref=e102]: ✅
              - generic [ref=e103]: Protocol Adherence
      - generic [ref=e104]:
        - heading "Referrals" [level=3] [ref=e105]
        - list [ref=e106]:
          - listitem [ref=e107]:
            - link "📤 View Referrals" [ref=e108] [cursor=pointer]:
              - /url: /referrals
              - generic [ref=e109]: 📤
              - generic [ref=e110]: View Referrals
          - listitem [ref=e111]:
            - link "➕ Create Referral" [ref=e112] [cursor=pointer]:
              - /url: /referrals/create
              - generic [ref=e113]: ➕
              - generic [ref=e114]: Create Referral
          - listitem [ref=e115]:
            - link "📋 Manage Sources" [ref=e116] [cursor=pointer]:
              - /url: /referral-sources
              - generic [ref=e117]: 📋
              - generic [ref=e118]: Manage Sources
          - listitem [ref=e119]:
            - link "🏥 Add Source" [ref=e120] [cursor=pointer]:
              - /url: /referral-sources/add
              - generic [ref=e121]: 🏥
              - generic [ref=e122]: Add Source
      - generic [ref=e123]:
        - heading "Treatments" [level=3] [ref=e124]
        - list [ref=e125]:
          - listitem [ref=e126]:
            - link "💉 View Treatments" [ref=e127] [cursor=pointer]:
              - /url: /treatments
              - generic [ref=e128]: 💉
              - generic [ref=e129]: View Treatments
          - listitem [ref=e130]:
            - link "➕ Add Treatment (Select Patient)" [ref=e131] [cursor=pointer]:
              - /url: /patients
              - generic [ref=e132]: ➕
              - generic [ref=e133]: Add Treatment (Select Patient)
      - generic [ref=e134]:
        - heading "Medications & Inventory" [level=3] [ref=e135]
        - list [ref=e136]:
          - listitem [ref=e137]:
            - link "💊 View All Medications" [ref=e138] [cursor=pointer]:
              - /url: /medications
              - generic [ref=e139]: 💊
              - generic [ref=e140]: View All Medications
          - listitem [ref=e141]:
            - link "➕ Add New Medication" [ref=e142] [cursor=pointer]:
              - /url: /medications/add
              - generic [ref=e143]: ➕
              - generic [ref=e144]: Add New Medication
          - listitem [ref=e145]:
            - link "📝 Add Prescription" [ref=e146] [cursor=pointer]:
              - /url: /prescriptions/add
              - generic [ref=e147]: 📝
              - generic [ref=e148]: Add Prescription
          - listitem [ref=e149]:
            - link "🏭 Add Manufacturer" [ref=e150] [cursor=pointer]:
              - /url: /manufacturers/add
              - generic [ref=e151]: 🏭
              - generic [ref=e152]: Add Manufacturer
          - listitem [ref=e153]:
            - link "📂 Add Category" [ref=e154] [cursor=pointer]:
              - /url: /medication-categories/add
              - generic [ref=e155]: 📂
              - generic [ref=e156]: Add Category
          - listitem [ref=e157]:
            - link "⚠️ Medication Recall Centre" [ref=e158] [cursor=pointer]:
              - /url: /medications/recalls
              - generic [ref=e159]: ⚠️
              - generic [ref=e160]: Medication Recall Centre
          - listitem [ref=e161]:
            - link "📦 Batch Number Tracking" [ref=e162] [cursor=pointer]:
              - /url: /reports/batch-tracking
              - generic [ref=e163]: 📦
              - generic [ref=e164]: Batch Number Tracking
      - generic [ref=e165]:
        - heading "Reports & Analytics" [level=3] [ref=e166]
        - list [ref=e167]:
          - listitem [ref=e168]:
            - link "📈 Treatment & Medication Effectiveness" [ref=e169] [cursor=pointer]:
              - /url: /reports/treatment-effectiveness
              - generic [ref=e170]: 📈
              - generic [ref=e171]: Treatment & Medication Effectiveness
          - listitem [ref=e172]:
            - link "📊 Patient Medications Report" [ref=e173] [cursor=pointer]:
              - /url: /reports/patient-medications
              - generic [ref=e174]: 📊
              - generic [ref=e175]: Patient Medications Report
          - listitem [ref=e176]:
            - link "🔍 Drug Audit Report" [ref=e177] [cursor=pointer]:
              - /url: /reports/drug-audit
              - generic [ref=e178]: 🔍
              - generic [ref=e179]: Drug Audit Report
          - listitem [ref=e180]:
            - link "📈 Patient Visits Report" [ref=e181] [cursor=pointer]:
              - /url: /reports/patient-visits
              - generic [ref=e182]: 📈
              - generic [ref=e183]: Patient Visits Report
          - listitem [ref=e184]:
            - link "👁️ Eye Tests Summary" [ref=e185] [cursor=pointer]:
              - /url: /reports/eye-tests-summary
              - generic [ref=e186]: 👁️
              - generic [ref=e187]: Eye Tests Summary
          - listitem [ref=e188]:
            - link "💊 Medication Effectiveness" [ref=e189] [cursor=pointer]:
              - /url: /reports/medication-effectiveness
              - generic [ref=e190]: 💊
              - generic [ref=e191]: Medication Effectiveness
          - listitem [ref=e192]:
            - link "🦠 Disease-Specific Reports" [ref=e193] [cursor=pointer]:
              - /url: /reports/diseases
              - generic [ref=e194]: 🦠
              - generic [ref=e195]: Disease-Specific Reports
          - listitem [ref=e196]:
            - link "📉 Condition Prevalence" [ref=e197] [cursor=pointer]:
              - /url: /reports/condition-prevalence
              - generic [ref=e198]: 📉
              - generic [ref=e199]: Condition Prevalence
          - listitem [ref=e200]:
            - link "🎯 Condition Outcomes" [ref=e201] [cursor=pointer]:
              - /url: /reports/condition-outcomes
              - generic [ref=e202]: 🎯
              - generic [ref=e203]: Condition Outcomes
          - listitem [ref=e204]:
            - link "✅ Protocol Adherence" [ref=e205] [cursor=pointer]:
              - /url: /reports/protocol-adherence
              - generic [ref=e206]: ✅
              - generic [ref=e207]: Protocol Adherence
          - listitem [ref=e208]:
            - link "🔄 Referral Source Analysis" [ref=e209] [cursor=pointer]:
              - /url: /reports/referral-sources
              - generic [ref=e210]: 🔄
              - generic [ref=e211]: Referral Source Analysis
          - listitem [ref=e212]:
            - link "📦 Batch Number Tracking" [ref=e213] [cursor=pointer]:
              - /url: /reports/batch-tracking
              - generic [ref=e214]: 📦
              - generic [ref=e215]: Batch Number Tracking
          - listitem [ref=e216]:
            - link "💷 Revenue Analysis" [ref=e217] [cursor=pointer]:
              - /url: /reports/revenue-analysis
              - generic [ref=e218]: 💷
              - generic [ref=e219]: Revenue Analysis
      - generic [ref=e220]:
        - heading "Alerts" [level=3] [ref=e221]
        - list [ref=e222]:
          - listitem [ref=e223]:
            - link "🔔 Alert Center" [ref=e224] [cursor=pointer]:
              - /url: /alerts
              - generic [ref=e225]: 🔔
              - generic [ref=e226]: Alert Center
          - listitem [ref=e227]:
            - link "🔁 Return Due" [ref=e228] [cursor=pointer]:
              - /url: /alerts/return-due
              - generic [ref=e229]: 🔁
              - generic [ref=e230]: Return Due
          - listitem [ref=e231]:
            - link "📅 Follow-up Alerts" [ref=e232] [cursor=pointer]:
              - /url: /alerts/followup
              - generic [ref=e233]: 📅
              - generic [ref=e234]: Follow-up Alerts
      - generic [ref=e235]:
        - heading "Audit & Compliance" [level=3] [ref=e236]
        - list [ref=e237]:
          - listitem [ref=e238]:
            - link "📑 Audit Logs" [ref=e239] [cursor=pointer]:
              - /url: /audit-logs
              - generic [ref=e240]: 📑
              - generic [ref=e241]: Audit Logs
          - listitem [ref=e242]:
            - link "➕ Add Audit Entry" [ref=e243] [cursor=pointer]:
              - /url: /audit-logs/add
              - generic [ref=e244]: ➕
              - generic [ref=e245]: Add Audit Entry
      - generic [ref=e246]:
        - heading "System Administration" [level=3] [ref=e247]
        - list [ref=e248]:
          - listitem [ref=e249]:
            - link "👨‍⚕️ Manage Staff" [ref=e250] [cursor=pointer]:
              - /url: /staff
              - generic [ref=e251]: 👨‍⚕️
              - generic [ref=e252]: Manage Staff
          - listitem [ref=e253]:
            - link "➕ Add Staff Member" [ref=e254] [cursor=pointer]:
              - /url: /staff/add
              - generic [ref=e255]: ➕
              - generic [ref=e256]: Add Staff Member
          - listitem [ref=e257]:
            - link "🎓 Add Specialization" [ref=e258] [cursor=pointer]:
              - /url: /specializations/add
              - generic [ref=e259]: 🎓
              - generic [ref=e260]: Add Specialization
          - listitem [ref=e261]:
            - link "📋 Forms Overview" [ref=e262] [cursor=pointer]:
              - /url: /forms-overview
              - generic [ref=e263]: 📋
              - generic [ref=e264]: Forms Overview
  - main [ref=e265]:
    - generic [ref=e266]:
      - generic [ref=e267]:
        - heading "Manage Staff" [level=1] [ref=e268]
        - paragraph [ref=e269]: View and manage all staff members in the system
        - link "Add New Staff Member" [ref=e271] [cursor=pointer]:
          - /url: /staff/add
          - text: Add New Staff Member
      - generic [ref=e272]:
        - generic [ref=e273]:
          - generic [ref=e274]: "2"
          - generic [ref=e275]: Total Staff
          - generic [ref=e276]: 👥
        - generic [ref=e277]:
          - generic [ref=e278]: "1"
          - generic [ref=e279]: Doctors
          - generic [ref=e280]: 👨‍⚕️
        - generic [ref=e281]:
          - generic [ref=e282]: "1"
          - generic [ref=e283]: Nurses
          - generic [ref=e284]: 👩‍⚕️
        - generic [ref=e285]:
          - generic [ref=e286]: "1"
          - generic [ref=e287]: Consultants
          - generic [ref=e288]: 🩺
      - generic [ref=e289]:
        - heading "Filter Staff" [level=3] [ref=e290]
        - generic [ref=e291]:
          - generic [ref=e292]:
            - generic [ref=e293]: Department
            - combobox "Department" [ref=e294]:
              - option "All Departments" [selected]
              - option "Ophthalmology"
              - option "Optometry"
              - option "Nursing"
              - option "Pharmacy"
              - option "Administration"
              - option "Reception"
              - option "Diagnostics"
              - option "Surgery"
          - generic [ref=e295]:
            - generic [ref=e296]: Specialization
            - combobox "Specialization" [ref=e297]:
              - option "All Specializations" [selected]
              - option "Cataract Surgery"
              - option "Glaucoma"
              - option "Medical Retina"
              - option "Diabetic Retinopathy"
              - option "Vitreoretinal Surgery"
              - option "Strabismus"
              - option "Paediatrics & Orthoptics"
              - option "Eye Casualty"
              - option "Corneal & External Eye Disease"
              - option "General Ophthalmology"
          - generic [ref=e298]:
            - generic [ref=e299]: User Type
            - combobox "User Type" [ref=e300]:
              - option "All Types" [selected]
              - option "Administrator"
              - option "Doctor"
              - option "Nurse"
              - option "Technician"
              - option "Receptionist"
              - option "Pharmacist"
              - option "Manager"
      - table [ref=e302]:
        - rowgroup [ref=e303]:
          - row "Photo Name Employee ID User Type Department Specialization Actions Status" [ref=e304]:
            - columnheader "Photo" [ref=e305]
            - columnheader "Name" [ref=e306]
            - columnheader "Employee ID" [ref=e307]
            - columnheader "User Type" [ref=e308]
            - columnheader "Department" [ref=e309]
            - columnheader "Specialization" [ref=e310]
            - columnheader "Actions" [ref=e311]
            - columnheader "Status" [ref=e312]
        - rowgroup [ref=e313]:
          - row "JS John Smith dr.smith@preciseoptics.com DOC001 Doctor Ophthalmology Medical Retina View Edit Delete Active" [ref=e314]:
            - cell "JS" [ref=e315]:
              - generic [ref=e317]: JS
            - cell "John Smith dr.smith@preciseoptics.com" [ref=e318]:
              - generic [ref=e319]:
                - strong [ref=e320]: John Smith
                - generic [ref=e321]: dr.smith@preciseoptics.com
            - cell "DOC001" [ref=e322]
            - cell "Doctor" [ref=e323]
            - cell "Ophthalmology" [ref=e324]
            - cell "Medical Retina" [ref=e325]
            - cell "View Edit Delete" [ref=e326]:
              - generic [ref=e327]:
                - link "View" [ref=e328] [cursor=pointer]:
                  - /url: /staff/1
                  - generic [ref=e329]: View
                - link "Edit" [ref=e330] [cursor=pointer]:
                  - /url: /staff/1/edit
                  - generic [ref=e331]: Edit
                - button "Delete" [ref=e332] [cursor=pointer]:
                  - generic [ref=e333]: Delete
            - cell "Active" [ref=e334]:
              - generic [ref=e335]: Active
          - row "SB Sarah Brown nurse.brown@preciseoptics.com NUR001 Nurse general N/A View Edit Delete Active" [ref=e336]:
            - cell "SB" [ref=e337]:
              - generic [ref=e339]: SB
            - cell "Sarah Brown nurse.brown@preciseoptics.com" [ref=e340]:
              - generic [ref=e341]:
                - strong [ref=e342]: Sarah Brown
                - generic [ref=e343]: nurse.brown@preciseoptics.com
            - cell "NUR001" [ref=e344]
            - cell "Nurse" [ref=e345]
            - cell "general" [ref=e346]
            - cell "N/A" [ref=e347]
            - cell "View Edit Delete" [ref=e348]:
              - generic [ref=e349]:
                - link "View" [ref=e350] [cursor=pointer]:
                  - /url: /staff/2
                  - generic [ref=e351]: View
                - link "Edit" [ref=e352] [cursor=pointer]:
                  - /url: /staff/2/edit
                  - generic [ref=e353]: Edit
                - button "Delete" [ref=e354] [cursor=pointer]:
                  - generic [ref=e355]: Delete
            - cell "Active" [ref=e356]:
              - generic [ref=e357]: Active
```

# Test source

```ts
  416 |     await page.goto('/system');
  417 |     await waitForStablePage(page, 2000);
  418 |     
  419 |     await captureManualScreenshot(page, 'admin', '15-system-settings', {
  420 |       fullPage: true
  421 |     });
  422 |   });
  423 | 
  424 |   test('16 - System Configuration', async ({ page }) => {
  425 |     await authenticatedPage(page);
  426 |     
  427 |     await page.goto('/system');
  428 |     await waitForStablePage(page, 1500);
  429 |     
  430 |     await captureManualScreenshot(page, 'admin', '16-system-configuration', {
  431 |       fullPage: true
  432 |     });
  433 |   });
  434 | 
  435 |   test('17 - Audit Logs Page', async ({ page }) => {
  436 |     await authenticatedPage(page);
  437 |     
  438 |     await page.goto('/audit-logs');
  439 |     await waitForStablePage(page, 2000);
  440 |     
  441 |     await captureManualScreenshot(page, 'admin', '17-audit-logs', {
  442 |       fullPage: true
  443 |     });
  444 |   });
  445 | 
  446 |   test('18 - Audit Log Details', async ({ page }) => {
  447 |     await authenticatedPage(page);
  448 |     
  449 |     await page.goto('/audit-logs');
  450 |     await waitForStablePage(page);
  451 |     
  452 |     // Click first audit log entry
  453 |     const logEntry = page.locator('tr, .log-entry, .audit-item').nth(1);
  454 |     if (await logEntry.isVisible()) {
  455 |       await logEntry.click();
  456 |       await waitForStablePage(page, 1000);
  457 |       
  458 |       await captureManualScreenshot(page, 'admin', '18-audit-log-detail');
  459 |     }
  460 |   });
  461 | 
  462 |   test('19 - Audit Logs Filter', async ({ page }) => {
  463 |     await authenticatedPage(page);
  464 |     
  465 |     await page.goto('/audit-logs');
  466 |     await waitForStablePage(page);
  467 |     
  468 |     // Click filter button or dropdown
  469 |     const filterButton = page.locator('button, select').filter({ hasText: /filter|action|user/i }).first();
  470 |     if (await filterButton.isVisible()) {
  471 |       await filterButton.click();
  472 |       await page.waitForTimeout(500);
  473 |       
  474 |       await captureManualScreenshot(page, 'admin', '19-audit-filter');
  475 |     }
  476 |   });
  477 | 
  478 |   test('20 - Audit Logs Search', async ({ page }) => {
  479 |     await authenticatedPage(page);
  480 |     
  481 |     await page.goto('/audit-logs');
  482 |     await waitForStablePage(page);
  483 |     
  484 |     // Search audit logs
  485 |     const searchInput = page.locator('input[type="text"], input[type="search"]').first();
  486 |     if (await searchInput.isVisible()) {
  487 |       await searchInput.click();
  488 |       await searchInput.fill('patient');
  489 |       await page.waitForTimeout(500);
  490 |       await waitForStablePage(page);
  491 |       
  492 |       await captureManualScreenshot(page, 'admin', '20-audit-search');
  493 |     }
  494 |   });
  495 | 
  496 |   test('21 - Forms Overview Page', async ({ page }) => {
  497 |     await authenticatedPage(page);
  498 |     
  499 |     await page.goto('/forms-overview');
  500 |     await waitForStablePage(page, 2000);
  501 |     
  502 |     await captureManualScreenshot(page, 'admin', '21-forms-overview', {
  503 |       fullPage: true
  504 |     });
  505 |   });
  506 | 
  507 |   test('22 - Specializations Management', async ({ page }) => {
  508 |     await authenticatedPage(page);
  509 |     
  510 |     await page.goto('/staff');
  511 |     await waitForStablePage(page);
  512 |     
  513 |     // Look for specializations section or button
  514 |     const specializationsButton = page.locator('button, a').filter({ hasText: /specialization/i }).first();
  515 |     if (await specializationsButton.isVisible()) {
> 516 |       await specializationsButton.click();
      |                                   ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  517 |       await waitForStablePage(page, 1500);
  518 |       
  519 |       await captureManualScreenshot(page, 'admin', '22-specializations', {
  520 |         fullPage: true
  521 |       });
  522 |     }
  523 |   });
  524 | 
  525 |   test('23 - Add Specialization Form', async ({ page }) => {
  526 |     await authenticatedPage(page);
  527 |     
  528 |     await page.goto('/staff/specializations/add');
  529 |     await waitForStablePage(page, 2000);
  530 |     
  531 |     await captureManualScreenshot(page, 'admin', '23-add-specialization', {
  532 |       fullPage: true
  533 |     });
  534 |   });
  535 | 
  536 |   test('24 - User Profile Settings', async ({ page }) => {
  537 |     await authenticatedPage(page);
  538 |     
  539 |     // Click on user profile/settings
  540 |     const profileButton = page.locator('button, a').filter({ hasText: /profile|account|settings/i }).first();
  541 |     if (await profileButton.isVisible()) {
  542 |       await profileButton.click();
  543 |       await waitForStablePage(page, 1500);
  544 |       
  545 |       await captureManualScreenshot(page, 'admin', '24-user-profile', {
  546 |         fullPage: true
  547 |       });
  548 |     }
  549 |   });
  550 | 
  551 |   test('25 - System Statistics Summary', async ({ page }) => {
  552 |     await authenticatedPage(page);
  553 |     
  554 |     await page.goto('/admin');
  555 |     await waitForStablePage(page, 2000);
  556 |     
  557 |     // Capture just the statistics summary section
  558 |     const statsSection = page.locator('.stats, .statistics, .summary').first();
  559 |     if (await statsSection.isVisible()) {
  560 |       await captureManualScreenshot(page, 'admin', '25-system-statistics');
  561 |     } else {
  562 |       await captureManualScreenshot(page, 'admin', '25-system-statistics', {
  563 |         fullPage: true
  564 |       });
  565 |     }
  566 |   });
  567 | 
  568 | });
  569 | 
```