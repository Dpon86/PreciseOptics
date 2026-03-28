# PreciseOptics Playwright E2E Tests

Comprehensive end-to-end testing suite for the PreciseOptics Eye Hospital Management System using Playwright.

## 🚀 Quick Setup (5 Minutes)

### Automated Setup Script (Recommended ⭐)

**Windows (PowerShell - Run as Administrator recommended):**
```powershell
cd tests\playwright
.\setup.ps1
```

**Windows (CMD):**
```cmd
cd tests\playwright
setup.bat
```

**Linux/Mac:**
```bash
cd tests/playwright
chmod +x setup.sh
./setup.sh
```

**What the setup script does:**
- ✅ Installs NPM dependencies
- ✅ Installs Playwright browsers
- ✅ Creates .env configuration file
- ✅ Optionally creates test superuser
- ✅ Sets up helper scripts

**After setup completes:**
1. Start servers (see "Server Management" below)
2. Run tests: `npm test`
3. View results: `npm run report`

---

## 🎯 Complete Workflow

Here's the complete workflow from setup to running tests:

### First Time Setup
```bash
# 1. Run automated setup
cd tests/playwright
.\setup.ps1              # Windows PowerShell
# OR
./setup.sh               # Linux/Mac

# 2. Setup will:
#    - Install dependencies
#    - Install browsers
#    - Create .env file
#    - Prompt to create test user
```

### Every Time You Test
```bash
# 1. Start servers (in one terminal)
.\start-servers.ps1      # Windows
./start-servers.sh       # Linux/Mac

# 2. Wait 30-60 seconds for servers to start

# 3. Run tests (in new terminal)
cd tests/playwright
npm run check:servers    # Verify ready
npm test                 # Run tests

# 4. View results
npm run report
```

### Quick Reference Commands
```bash
# Setup (one-time)
.\setup.ps1 / ./setup.sh     # Automated setup

# Start servers
.\start-servers.ps1          # Windows
./start-servers.sh           # Linux/Mac

# Check servers
npm run check:servers         # Verify servers ready

# Run tests
npm test                      # All tests
npm run test:login           # Just login tests
npm run test:patient         # Just patient tests
npm run test:consultation    # Just consultation tests
npm run test:eye-tests       # Just eye test tests

# View results
npm run report                # Open HTML report
```

---

## 📋 Test Coverage

### Authentication Tests
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Empty field validation
- ✅ Logout functionality
- ✅ Protected route access
- ✅ Session persistence

### Patient Management Tests
- ✅ Add patient with all fields
- ✅ Add patient with minimal required fields
- ✅ Form validation (missing fields, invalid formats)
- ✅ Phone number validation
- ✅ Email validation
- ✅ Date of birth validation
- ✅ Create multiple patients sequentially
- ✅ Cancel patient creation

### Consultation Tests
- ✅ Add consultation with required fields
- ✅ Add consultation with all fields
- ✅ Patient data auto-population
- ✅ Validation of required fields
- ✅ Scheduled time format validation
- ✅ Different consultation types (initial, follow_up, emergency, routine_check)
- ✅ Cancel consultation creation

### Eye Test Tests
All tests cover form display, data entry, validation, and different test parameters:

#### Visual Acuity Test
- ✅ Create with all measurements (unaided, aided, pinhole for both eyes)
- ✅ Different test methods (Snellen, LogMAR, ETDRS)
- ✅ Binocular vision measurement

#### Refraction Test
- ✅ Create with full prescription (sphere, cylinder, axis, add, prism)
- ✅ Different methods (subjective, objective, retinoscopy, cycloplegic)
- ✅ Pupillary distance measurement

#### Visual Field Test
- ✅ Create with reliability indices and field parameters (MD, PSD, VFI)
- ✅ Different test types (Humphrey 24-2, Humphrey 30-2)
- ✅ Different strategies (SITA Standard, SITA Fast, Full Threshold)

#### OCT Scan
- ✅ Create with thickness measurements
- ✅ Different scan types (macula, optic disc, RNFL, anterior segment)
- ✅ Machine model specification

## 🚀 Manual Setup (Alternative)

> **Note:** If you already ran the automated `setup.ps1` or `setup.sh` script, you can skip this section!

### Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed
- Backend dependencies installed (`pip install -r requirements.txt`)
- Frontend dependencies installed (`npm install`)
- Database migrations applied (`python manage.py migrate`)
- **Test user created** for authentication (see below)

### Create Test User

Before running tests, create an admin user for authentication:

```bash
cd ../../Backend
python manage.py createsuperuser

# Use these credentials (must match .env settings):
# Username: admin
# Email: admin@preciseoptics.test
# Password: admin123
```

### Installation

```bash
# Navigate to tests directory
cd tests/playwright

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Configuration

Create a `.env` file in the `tests/playwright` directory:

```bash
cp .env.example .env
```

Edit `.env` with your test credentials:

```env
# Test User Credentials (must match the superuser you created)
TEST_USERNAME=admin
TEST_PASSWORD=admin123

# Server URLs (if different from defaults)
BASE_URL=http://localhost:3000
API_URL=http://localhost:8000
```

## 🖥️ Server Management

Playwright tests require both backend and frontend servers to be running. Choose the method that works best for you:

### ⭐ Recommended: Automated Server Startup

**Windows (PowerShell):**
```powershell
cd tests\playwright
.\start-servers.ps1
```

**Linux/Mac:**
```bash
cd tests/playwright
./start-servers.sh
```

**Then in a NEW terminal (after 30-60 seconds):**
```bash
cd tests/playwright
npm run check:servers    # Verify servers are ready
npm test                 # Run tests
```

### Alternative: Manual Server Startup

**Terminal 1 - Backend:**
```bash
cd Backend
python manage.py runserver 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Run Tests:**
```bash
cd tests/playwright
npm test
```

### Advanced: Auto-Start in Config (CI/CD)

For automated testing, uncomment the `webServer` section in [playwright.config.js](playwright.config.js) (lines 50-74). Playwright will automatically start and stop servers.

### Check Server Status

Before running tests:
```bash
npm run check:servers
```

This verifies both servers are accessible and ready.

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Authentication tests
npm run test:login

# Patient management tests
npm run test:patient

# Consultation tests
npm run test:consultation

# All eye test tests
npm run test:eye-tests
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Tests with UI Mode (Interactive)
```bash
npm run test:ui
```

### View Last Test Report
```bash
npm run report
```

## 📊 Test Reports

After running tests, reports are generated in multiple formats:

- **HTML Report**: `playwright-report/index.html` (open in browser)
- **JSON Results**: `test-results/results.json`
npm run test:login          # Authentication tests only
npm run test:patient        # Patient management tests
npm run test:consultation   # Consultation tests
npm run test:eye-tests      # All eye test tests
```

### Run with Different Modes
```bash
npm run test:headed         # See browser in action
npm run test:debug          # Debug mode (step through tests)
npm run test:ui             # Interactive UI mode
```

### View Test Report
```bash
npm run report              # Open HTML report in browser
```

### Check Server Status
```bash
npm run check:servers       # Verify servers are running
### Basic Test Template

```javascript
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';

test.describe('Feature Name', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Your test code
    await expect(page.locator('selector')).toBeVisible();
  });

});
```

### Using Helper Functions

```javascript
import { fillForm, submitForm } from '../../utils/form-helpers.js';
import { generatePatientData } from '../../utils/test-data.js';

// Generate test data
const data = generatePatientData();

// Fill form automatically
await fillForm(page, data);

// Submit and wait
await submitForm(page);
```

## 🔧 Configuration

### Playwright Config Options

Edit `playwright.config.js` to customize:

- **Timeout**: Test and action timeouts
- **Browsers**: Enable/disable different browsers
- **Retries**: Number of retries on failure
- **Workers**: Parallel test execution
- **Screenshots/Videos**: When to capture
- **Base URL**: Frontend URL

### Test Execution Settings

# Run tests sequentially (recommended for data integrity)
```bash
WORKERS=1 npm test
```

# Run with custom timeout
```bash
TIMEOUT=120000 npm test
```

# Run without headless mode
```bash
HEADLESS=false npm test
```

## 🐛 Debugging

### Debug a Single Test
```bash
npx playwright test tests/patient/add-patient.spec.js --debug
```

### Generate Test Code (Codegen)
```bash
npm run codegen
```

This opens a browser where you can interact with your app, and Playwright will generate test code.

### View Trace
If a test fails, download the trace from the HTML report and view it:
```bash
npx playwright show-trace trace.zip
```

## 🔧 Troubleshooting

### Problem: "Cannot connect to http://localhost:8000"

**Cause:** Backend server is not running

**Solutions:**
1. Check if backend is running: `npm run check:servers`
2. Start backend manually: `cd Backend && python manage.py runserver 8000`
3. Check for errors in backend console
4. Verify Python dependencies are installed: `pip install -r requirements.txt`
5. Check database migrations: `python manage.py migrate`

### Problem: "Cannot connect to http://localhost:3000"

**Cause:** Frontend server is not running

**Solutions:**
1. Check if frontend is running: `npm run check:servers`
2. Start frontend manually: `cd frontend && npm start`
3. Check for errors in frontend console
4. Verify Node dependencies are installed: `npm install`
5. Clear cache and reinstall: `rm -rf node_modules && npm install`

### Problem: "Login test fails with 401 Unauthorized"

**Cause:** Test user doesn't exist or credentials are wrong

**Solutions:**
1. Create test superuser:
   ```bash
   cd Backend
   python manage.py createsuperuser
   # Username: admin
   # Password: admin123
   ```
2. Verify credentials in `.env` match the superuser
3. Check backend authentication endpoint is working: `curl -X POST http://localhost:8000/api-token-auth/ -d "username=admin&password=admin123"`

### Problem: "Port 8000 or 3000 already in use"

**Cause:** Another process is using the ports

**Solutions:**
1. **Option 1** - Use existing servers (if they're yours):
   - Playwright will detect and use existing servers
   - Make sure they're running the correct code version

2. **Option 2** - Kill existing processes:
   
   **Windows:**
   ```powershell
   # Find process using port
   netstat -ano | findstr :8000
   # Kill process (replace PID)
   taskkill /PID <PID> /F
   ```
   
   **Linux/Mac:**
   ```bash
   # Find and kill process using port
   lsof -ti:8000 | xargs kill -9
   lsof -ti:3000 | xargs kill -9
   ```

### Problem: "Tests fail on form submission"

**Cause:** Form selectors don't match or API endpoint changed

**Solutions:**
1. Run test in headed mode to see what's happening: `npm run test:headed`
2. Use debug mode to step through: `npm run test:debug`
3. Check browser console for JavaScript errors
4. Verify form field names match the test selectors
5. Check API endpoints are returning expected responses

### Problem: "Timeout errors"

**Cause:** Servers are slow or elements not loading

**Solutions:**
1. Increase timeout in `playwright.config.js`:
   ```javascript
   timeout: 120000, // 2 minutes
   ```
2. Check server performance (database queries, network)
3. Use debug mode to see where it's getting stuck
4. Add explicit waits in tests if needed

### Problem: "Browser installation failed"

**Cause:** Playwright browsers not installed correctly

**Solutions:**
```bash
# Reinstall browsers
npx playwright install --force

# Install with system dependencies (Linux)
npx playwright install --with-deps
```

### Problem: "Environment variables not loaded"

**Cause:** .env file missing or not in correct location

**Solutions:**
1. Ensure `.env` file exists in `tests/playwright/` directory
2. Copy from template: `cp .env.example .env`
3. Verify file contents are correct (no extra spaces, correct syntax)
4. Don't use quotes around values unless they contain spaces

### Problem: "Tests pass locally but fail in CI"

**Cause:** Environment differences

**Solutions:**
1. Enable CI-specific retries in `playwright.config.js`
2. Ensure test user exists in CI database
3. Add startup delays for servers in CI
4. Check CI environment variables are set correctly
5. Use video/trace recording to debug: `video: 'on'` in config

## ✅ Best Practices

1. **Authentication**: Always use `setupAuthenticatedSession()` for protected routes
2. **Test Data**: Use data generators from `test-data.js` for consistent test data
3. **Selectors**: Prefer name/id selectors over complex CSS selectors
4. **Waits**: Use Playwright's auto-waiting; avoid manual `waitForTimeout` unless necessary
5. **Cleanup**: Tests should be independent; don't rely on test order
6. **Screenshots**: Taken automatically on failure; use sparingly for debugging
7. **Assertions**: Use Playwright's `expect()` for better error messages

## 🚦 CI/CD Integration

To run tests in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Playwright Tests
  run: |
    cd tests/playwright
    npm install
    npx playwright install --with-deps
    npm test
  env:
    BASE_URL: ${{ secrets.BASE_URL }}
    TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## 📈 Test Coverage Goals

- ✅ Authentication: 100%
- ✅ Patient Management: 90%
- ✅ Consultations: 85%
- ✅ Eye Tests: 80% (4 main test types)
- ⏳ Conditions: Pending
- ⏳ Protocols: Pending
- ⏳ Referrals: Pending
- ⏳ Reports: Pending

## 🤝 Contributing

When adding new tests:

1. Follow the existing structure and naming conventions
2. Add helper functions to `utils/` if reusable
3. Generate test data with `test-data.js` generators
4. Include both positive and negative test cases
5. Add screenshots for complex workflows
6. Update this README with new test coverage

## 📞 Support

For issues or questions about the tests:
- Check Playwright documentation: https://playwright.dev
- Review test logs in `playwright-report/`
- Check screenshots/videos in `test-results/`
- Enable debug mode to step through tests

---

**Last Updated**: March 28, 2026
**Test Framework**: Playwright v1.42.0
**Total Tests**: 40+
**Estimated Run Time**: ~5 minutes (sequential)
