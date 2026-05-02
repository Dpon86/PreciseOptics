# Quick Start: Generate Screenshots for User Manuals

**Date**: May 2, 2026  
**Purpose**: Quick reference for generating all user manual screenshots using Playwright

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start Backend & Frontend

```powershell
# Terminal 1 - Start Django Backend
cd Backend
python manage.py runserver
```

```powershell
# Terminal 2 - Start React Frontend
cd frontend
npm start
```

Wait for both servers to start (backend on http://localhost:8000, frontend on http://localhost:3000)

---

### 2️⃣ Generate All Screenshots

```powershell
# Terminal 3 - Run Screenshot Tests
cd frontend
npm run test:screenshots
```

This command will:
- Run all 103 screenshot generation tests
- Save screenshots to `frontend/e2e/screenshots/user-manual/`
- Take approximately 15-20 minutes to complete
- Generate organized screenshots by module

---

### 3️⃣ Review Generated Screenshots

After tests complete, check the screenshot folders:

```powershell
cd frontend/e2e/screenshots/user-manual
dir
```

**Expected Folders**:
- `alerts/` (3 screenshots)
- `conditions/` (2 screenshots)
- `consultations/` (10 screenshots)
- `dashboard/` (5 screenshots)
- `eye-tests/` (10 screenshots)
- `medications/` (12 screenshots)
- `patients/` (11 screenshots)
- `protocols/` (2 screenshots)
- `referrals/` (2 screenshots)
- `reports/` (9 screenshots)
- `treatments/` (12 screenshots)
- `admin/` (25 screenshots) — NEW!

**Total Expected Screenshots**: 103 images

---

## 🎯 Alternative Commands

### Interactive Mode (Recommended for First Run)
```powershell
cd frontend
npm run test:e2e:ui
```
- Opens Playwright's interactive UI
- See tests execute in real-time
- Click individual tests to run them
- Perfect for debugging or selective screenshot generation

### Watch Tests Execute (Headed Mode)
```powershell
cd frontend
npm run test:e2e:headed
```
- Browser window visible during test execution
- See exactly what screenshots capture
- Useful for verifying test behavior

### Run Specific Module Tests
```powershell
# Patients module only
npx playwright test patients.spec.js --grep="User Manual" --project=chromium

# Medications module only
npx playwright test medications.spec.js --grep="User Manual" --project=chromium

# Dashboard & Reports only
npx playwright test dashboard-reports.spec.js --grep="User Manual" --project=chromium
```

### View Test Report
```powershell
cd frontend
npm run test:report
```
Opens HTML report in browser showing:
- Test execution results
- Pass/fail status
- Execution time
- Screenshots on failures

---

## 🔧 Troubleshooting

### Issue: Tests Fail with "Target closed" or timeout errors

**Solution**: Increase timeout in `playwright.config.js`
```javascript
timeout: 120000,  // Increase to 2 minutes
```

### Issue: Some screenshots are blank or incomplete

**Solution**: Add more wait time in specific tests
```javascript
await waitForStablePage(page, 3000);  // Increase from 2000 to 3000
```

### Issue: Authentication fails

**Solution**: Create test user credentials
```powershell
cd Backend
python manage.py shell
```
```python
from accounts.models import CustomUser
user = CustomUser.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123',
    role='DOCTOR',
    first_name='Test',
    last_name='User'
)
```

Set environment variables:
```powershell
$env:TEST_USERNAME = "testuser"
$env:TEST_PASSWORD = "testpass123"
```

### Issue: Frontend not loading in tests

**Solution**: Check baseURL in `playwright.config.js`
```javascript
baseURL: 'http://localhost:3000',  // Ensure this matches your dev server
```

---

## 📊 Test Coverage Overview

| Module | Test File | Screenshots |
|--------|-----------|-------------|
| Authentication | auth.spec.js | 9 |
| Patients | patients.spec.js | 11 |
| Consultations | consultations.spec.js | 10 |
| Medications | medications.spec.js | 12 |
| Eye Tests | eye-tests.spec.js | 10 |
| Treatments | treatments.spec.js | 12 |
| Admin/System | admin-system.spec.js | 25 |
| **TOTAL** | **8 files** | **103reports.spec.js | 14 |
| **TOTAL** | **7 files** | **78** |

---

## 📝 Next Steps After Screenshot Generation

### 1. Review Screenshot Quality
- Open each folder in `frontend/e2e/screenshots/user-manual/`
- Verify screenshots are clear and complete
- Check that UI elements are fully loaded
- Ensure no error messages or loading spinners visible

### 2. Organize Screenshots for Documentation
- Copy screenshots to `docs/user-guides/images/` folder
- Rename if needed for clarity
- Create separate folders for each user guide

### 3. Create User Manual Documents
Start writing user guides using the generated screenshots:
- `docs/user-guides/PATIENTS_USER_GUIDE.md`
- `docs/user-guides/CONSULTATIONS_USER_GUIDE.md`
- `docs/user-guides/MEDICATIONS_USER_GUIDE.md`
- `docs/user-guides/EYE_TESTS_USER_GUIDE.md`
- `docs/user-guides/TREATMENTS_USER_GUIDE.md`
- `docs/user-guides/DASHBOARD_GUIDE.md`
- `docs/user-guides/REPORTS_GUIDE.md`

### 4. Generate Additional Screenshots (Optional)
If you need more screenshots for specific workflows:
1. Open `frontend/e2e/{module}.spec.js`
2. Add new screenshot test
3. Run `npm run test:screenshots` again

---

## 📚 Related Documentation

- **[Comprehensive Playwright Guide](docs/testing/PLAYWRIGHT_GUIDE.md)** - Full testing documentation
- **[E2E Testing Expansion Summary](E2E_TESTING_EXPANSION_COMPLETE.md)** - Complete test coverage details
- **[TODO Checklist](docs/planning/TODO_CHECKLIST.md)** - Project task tracking

---

## ✅ Success Criteria

After running `npm run test:screenshots`, you should see:
- ✅ 103 screenshots generated
- ✅ Screenshots organized in folders by module
- ✅ No error screenshots (these indicate test failures)
- ✅ HTML report generated in `test-results/`

**Example successful output**:
```
Running 103 tests using 1 worker

  ✓ User Manual - Patients Module Screenshots (11/11)
  ✓ User Manual - Consultations Module Screenshots (10/10)
  ✓ User Manual - Medications Module Screenshots (12/12)
  ✓ User Manual - Eye Tests Module Screenshots (10/10)
  ✓ User Manual - Treatments Module Screenshots (12/12)
  ✓ User Manual - Dashboard & Reports Screenshots (14/14)
  ✓ User Manual - Admin & System Screenshots (25/25)

  103 passed (20
  78 passed (15m)
```

---

## 🎉 You're Ready!

Once screenshots are generated, you have everything needed to create comprehensive, visually-rich user manuals for all PreciseOptics modules.

**Happy Testing! 🚀**
