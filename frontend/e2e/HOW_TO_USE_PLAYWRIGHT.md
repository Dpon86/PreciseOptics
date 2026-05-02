# How to Use Playwright - Complete Setup & Command Guide

**Date**: May 2, 2026  
**Purpose**: Step-by-step guide for using Playwright E2E testing framework in PreciseOptics  
**Audience**: Developers, QA Engineers, Technical Staff

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Available Commands](#available-commands)
4. [Running Tests](#running-tests)
5. [Generating Screenshots](#generating-screenshots)
6. [Writing New Tests](#writing-new-tests)
7. [Configuration](#configuration)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Usage](#advanced-usage)
10. [Best Practices](#best-practices)

---

## 🔧 Prerequisites

Before using Playwright, ensure you have:

### Required Software
- ✅ **Node.js** v16.0.0 or higher
- ✅ **npm** v7.0.0 or higher
- ✅ **Git** (for version control)
- ✅ **Code editor** (VS Code recommended)

### Verify Installation
```powershell
# Check Node.js version
node --version
# Should show: v16.0.0 or higher

# Check npm version
npm --version
# Should show: 7.0.0 or higher
```

### Required: Running Backend & Frontend
Playwright tests require both servers to be running:
- **Backend**: Django server on http://localhost:8000
- **Frontend**: React dev server on http://localhost:3000

---

## 🚀 Initial Setup

### Step 1: Install Playwright

If Playwright is not already installed:

```powershell
# Navigate to frontend folder
cd frontend

# Install Playwright and test runner
npm install -D @playwright/test

# Install Playwright package
npm install -D playwright
```

**Expected Output**:
```
added 3 packages, and audited 51 packages in 5s
```

### Step 2: Install Browsers

Playwright needs to download browser binaries:

```powershell
# Install Chromium, Firefox, and WebKit browsers
npx playwright install
```

**Expected Output**:
```
Downloading Chromium 147.0.7727.15 (179.4 MB)
Downloading Firefox 148.0.2 (113.1 MB)
Downloading WebKit 26.4 (57.6 MB)
```

**This downloads ~461 MB of browser binaries** - it may take 5-10 minutes depending on your internet connection.

### Step 3: Verify Installation

Check that everything is installed:

```powershell
# Check Playwright version
npx playwright --version
# Should show: Version 1.51.0

# List installed browsers
npx playwright install --dry-run
# Should show: Chromium, Firefox, WebKit (already installed)
```

### Step 4: Verify Configuration

Check that `playwright.config.js` exists:

```powershell
# Should exist in frontend folder
dir playwright.config.js
```

If file doesn't exist, you need to create it (see [Configuration](#configuration) section).

### Step 5: Create Test User (Important!)

Tests need valid credentials to authenticate:

```powershell
# Navigate to backend folder
cd ..\Backend

# Open Django shell
python manage.py shell
```

In Python shell, create test user:
```python
from accounts.models import CustomUser

# Create test user
user = CustomUser.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpass123',
    role='DOCTOR',
    first_name='Test',
    last_name='User'
)
print(f"Created test user: {user.username}")

# Exit shell
exit()
```

### Step 6: Set Environment Variables

Create a `.env` file in the `frontend` folder:

```powershell
# Navigate to frontend folder
cd ..\frontend

# Create .env file
New-Item -ItemType File -Name .env
```

Add these variables to `.env`:
```
TEST_USERNAME=testuser
TEST_PASSWORD=testpass123
```

Or set them in your PowerShell session:
```powershell
$env:TEST_USERNAME = "testuser"
$env:TEST_PASSWORD = "testpass123"
```

---

## 📝 Available Commands

All commands should be run from the `frontend` folder:

### Quick Start Commands

```powershell
# 1. Run all E2E tests
npm run test:e2e

# 2. Open interactive UI mode
npm run test:e2e:ui

# 3. Run tests with browser visible
npm run test:e2e:headed

# 4. Run tests in Chromium only
npm run test:e2e:chromium

# 5. Generate screenshots for user manuals
npm run test:screenshots

# 6. View test report
npm run test:report
```

### Detailed Command Breakdown

#### 1. `npm run test:e2e`
**What it does**: Runs all tests in headless mode (no browser window visible)
```powershell
npm run test:e2e
```

**Output**:
```
Running 35 tests using 1 worker

✓ Authentication & Core Navigation (9 tests) - 45s
✓ Patients Module (8 tests) - 52s
✓ Consultations Module (5 tests) - 30s
...

35 passed (4m 15s)
```

**Use when**: Running complete test suite in CI/CD or before commits

---

#### 2. `npm run test:e2e:ui`
**What it does**: Opens Playwright's interactive UI
```powershell
npm run test:e2e:ui
```

**Features**:
- Click individual tests to run them
- See test execution in real-time
- Debug failing tests easily
- View screenshots and videos
- Filter tests by status

**Use when**: 
- First time running tests
- Debugging test failures
- Selective test execution
- Learning how tests work

**Screenshot of UI Mode**:
```
┌─────────────────────────────────────────┐
│  Playwright Test UI                     │
├─────────────────────────────────────────┤
│  ▶ auth.spec.js (9 tests)               │
│  ▶ patients.spec.js (11 tests)          │
│  ▶ consultations.spec.js (10 tests)     │
│  ▶ medications.spec.js (12 tests)       │
│  ...                                     │
└─────────────────────────────────────────┘
```

---

#### 3. `npm run test:e2e:headed`
**What it does**: Runs tests with browser window visible
```powershell
npm run test:e2e:headed
```

**Use when**:
- Want to see exactly what tests are doing
- Verifying screenshot capture
- Debugging visual issues
- Demonstrating test execution

---

#### 4. `npm run test:e2e:chromium`
**What it does**: Runs tests only in Chromium browser
```powershell
npm run test:e2e:chromium
```

**Use when**:
- Faster test execution (one browser instead of three)
- Developing new tests
- Chrome-specific testing

**Other browser options**:
```powershell
# Run in Firefox only
npx playwright test --project=firefox

# Run in WebKit (Safari) only
npx playwright test --project=webkit
```

---

#### 5. `npm run test:screenshots`
**What it does**: Generates all user manual screenshots
```powershell
npm run test:screenshots
```

**What happens**:
1. Runs only tests tagged with "User Manual"
2. Captures 78 screenshots
3. Saves to `e2e/screenshots/user-manual/`
4. Organizes by module folders

**Expected Output**:
```
Running 78 tests using 1 worker

✓ User Manual - Authentication (9/9) - 1m 15s
✓ User Manual - Patients Module (11/11) - 2m 30s
✓ User Manual - Consultations Module (10/10) - 2m 10s
✓ User Manual - Medications Module (12/12) - 2m 45s
...

78 passed (15m 20s)
```

**Screenshots saved to**:
```
frontend/e2e/screenshots/user-manual/
├── patients/
│   ├── 01-patients-list.png
│   ├── 02-patient-search.png
│   └── ... (11 total)
├── consultations/
│   └── ... (10 total)
└── ... (9 folders total)
```

**Use when**: Creating or updating user documentation

---

#### 6. `npm run test:report`
**What it does**: Opens HTML report in browser
```powershell
npm run test:report
```

**Report includes**:
- Test execution timeline
- Pass/fail status for each test
- Error messages and stack traces
- Screenshots captured on failures
- Video recordings (if enabled)
- Performance metrics

**Use when**: Reviewing test results after execution

---

### Advanced Playwright Commands

#### Run Specific Test File
```powershell
# Run only patients tests
npx playwright test patients.spec.js

# Run only medications tests
npx playwright test medications.spec.js

# Run only dashboard tests
npx playwright test dashboard-reports.spec.js
```

#### Run Tests Matching Pattern
```powershell
# Run all "User Manual" screenshot tests
npx playwright test --grep="User Manual"

# Run all tests with "form" in the name
npx playwright test --grep="form"

# Run tests NOT matching pattern
npx playwright test --grep-invert="User Manual"
```

#### Run Tests in Specific Browser
```powershell
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project=mobile-chrome

# Mobile Safari
npx playwright test --project=mobile-safari

# Tablet
npx playwright test --project=tablet
```

#### Run Tests with Debugging
```powershell
# Open Playwright Inspector for step-by-step debugging
npx playwright test --debug

# Debug specific test
npx playwright test patients.spec.js --debug

# Start from specific line
npx playwright test patients.spec.js:25 --debug
```

#### Update Snapshots
```powershell
# Update all visual snapshots
npx playwright test --update-snapshots

# Update snapshots for specific browser
npx playwright test --project=chromium --update-snapshots
```

#### Generate Code
```powershell
# Record a test by interacting with the app
npx playwright codegen http://localhost:3000

# Generate code with authentication
npx playwright codegen http://localhost:3000 --load-storage=auth.json
```

#### Show Test Trace
```powershell
# View trace for failed tests
npx playwright show-trace trace.zip
```

---

## 🎯 Running Tests

### Complete Workflow

Here's the complete process to run tests from scratch:

#### Step 1: Start Backend Server
```powershell
# Terminal 1
cd C:\Users\NickD\Documents\Github\PreciseOptics\Backend
python manage.py runserver
```

**Wait for**:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

#### Step 2: Start Frontend Server
```powershell
# Terminal 2 (New PowerShell window)
cd C:\Users\NickD\Documents\Github\PreciseOptics\frontend
npm start
```

**Wait for**:
```
webpack compiled successfully
Compiled successfully!

You can now view precise-optics in the browser.

  Local:            http://localhost:3000
```

#### Step 3: Run Tests
```powershell
# Terminal 3 (New PowerShell window)
cd C:\Users\NickD\Documents\Github\PreciseOptics\frontend

# Option A: Interactive mode (recommended)
npm run test:e2e:ui

# Option B: Run all tests
npm run test:e2e

# Option C: Generate screenshots
npm run test:screenshots
```

#### Step 4: View Results
```powershell
# Open HTML report
npm run test:report

# Or check terminal output for pass/fail status
```

---

## 📸 Generating Screenshots

### Why Generate Screenshots?
Screenshots are used to create user manuals and documentation. The automated screenshot generation ensures:
- ✅ Consistent image quality
- ✅ Up-to-date screenshots
- ✅ Complete coverage of all features
- ✅ Time savings vs manual screenshots

### Screenshot Generation Process

#### 1. Ensure Servers Are Running
Both backend and frontend must be running (see [Running Tests](#running-tests) section).

#### 2. Run Screenshot Tests
```powershell
cd frontend
npm run test:screenshots
```

#### 3. Monitor Progress
```
Running 78 tests using 1 worker

  auth.spec.js:45:3 › User Manual - Conditions › 01 - Conditions List View
  ✓ Screenshot saved: conditions/01-conditions-list.png

  auth.spec.js:54:3 › User Manual - Conditions › 02 - Add Condition Form
  ✓ Screenshot saved: conditions/02-add-condition-form.png

  ... (76 more tests)

  78 passed (15m)
```

#### 4. Verify Screenshots
```powershell
# Navigate to screenshots folder
cd e2e\screenshots\user-manual

# List all folders
dir

# View patients screenshots
dir patients

# View specific screenshot
start patients\01-patients-list.png
```

#### 5. Use Screenshots in Documentation
Copy screenshots to documentation folders:
```powershell
# Example: Copy to docs folder
Copy-Item -Path "e2e\screenshots\user-manual\patients\*" -Destination "..\..\docs\user-guides\images\patients\"
```

### Screenshot Organization

All screenshots follow this structure:
```
frontend/e2e/screenshots/user-manual/
├── alerts/
│   ├── 01-alert-center.png
│   ├── 02-header-alert-badge.png
│   └── 03-alert-dropdown.png
├── conditions/
│   ├── 01-conditions-list.png
│   └── 02-add-condition-form.png
├── consultations/
│   ├── 01-consultations-list.png
│   ├── 02-new-consultation-button.png
│   ├── 03-consultation-form.png
│   └── ... (10 total)
├── dashboard/
│   ├── 01-main-dashboard.png
│   ├── 02-statistics-cards.png
│   └── ... (5 total)
├── eye-tests/
│   └── ... (10 screenshots)
├── medications/
│   └── ... (12 screenshots)
├── patients/
│   └── ... (11 screenshots)
├── protocols/
│   └── ... (2 screenshots)
├── referrals/
│   └── ... (2 screenshots)
├── reports/
│   └── ... (9 screenshots)
└── treatments/
    └── ... (12 screenshots)
```

### Custom Screenshot Options

You can modify screenshot behavior in tests:

```javascript
// Full page screenshot
await captureManualScreenshot(page, 'module', '01-overview', {
  fullPage: true
});

// Element-specific screenshot
await page.locator('.specific-element').screenshot({
  path: 'screenshots/element.png'
});

// Screenshot with mask (hide sensitive data)
await page.screenshot({
  path: 'screenshots/masked.png',
  mask: [page.locator('.sensitive-data')]
});

// Clip specific area
await page.screenshot({
  path: 'screenshots/clipped.png',
  clip: { x: 0, y: 0, width: 800, height: 600 }
});
```

---

## ✍️ Writing New Tests

### Basic Test Structure

Create a new test file in `frontend/e2e/`:

```javascript
import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('My New Module', () => {
  
  // Functional test
  test('should display module page', async ({ page }) => {
    await page.goto('/my-module');
    await waitForStablePage(page);
    
    await expect(page.locator('h1')).toContainText('My Module');
  });

  // More functional tests...
});

// User Manual Screenshot Generation
test.describe('User Manual - My Module Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Module Overview', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/my-module');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'my-module', '01-overview', {
      fullPage: true
    });
  });

  test('02 - Module Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/my-module/new');
    await waitForStablePage(page, 1500);
    
    await captureManualScreenshot(page, 'my-module', '02-form', {
      fullPage: true
    });
  });

  // More screenshot tests...
});
```

### Available Helper Functions

From `helpers.js`:

#### 1. `authenticatedPage(page)`
Automatically logs in before test:
```javascript
test('my test', async ({ page }) => {
  await authenticatedPage(page);
  // Now logged in and on homepage
});
```

#### 2. `captureManualScreenshot(page, section, step, options)`
Captures screenshot with consistent naming:
```javascript
await captureManualScreenshot(page, 'patients', '01-list', {
  fullPage: true
});
// Saves to: user-manual/patients/01-list.png
```

#### 3. `waitForStablePage(page, additionalWait)`
Waits for page to fully load:
```javascript
await waitForStablePage(page, 2000);
// Waits for network idle + 2000ms
```

#### 4. `captureElementScreenshot(page, selector, filename)`
Captures specific element:
```javascript
await captureElementScreenshot(page, '.patient-card', 'patient-card.png');
```

#### 5. `captureHighlightedScreenshot(page, selector, filename, color)`
Highlights element in screenshot:
```javascript
await captureHighlightedScreenshot(page, 'button.submit', 'submit-button.png', 'red');
```

#### 6. `fillFormWithScreenshots(page, formData, section)`
Fills form and captures screenshots:
```javascript
await fillFormWithScreenshots(page, {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
}, 'patients');
```

#### 7. `captureWorkflow(page, steps, section)`
Captures complete workflow:
```javascript
await captureWorkflow(page, [
  { name: 'Step 1', action: async () => await page.click('button.start') },
  { name: 'Step 2', action: async () => await page.fill('input', 'value') },
  { name: 'Step 3', action: async () => await page.click('button.submit') }
], 'my-workflow');
```

### Test Writing Best Practices

#### 1. Use Descriptive Test Names
```javascript
// Good
test('should display patient list with search functionality', async ({ page }) => {

// Bad
test('test1', async ({ page }) => {
```

#### 2. Add Wait for Stability
```javascript
// Good
await page.goto('/patients');
await waitForStablePage(page, 1500);
await expect(page.locator('h1')).toBeVisible();

// Bad (can be flaky)
await page.goto('/patients');
await expect(page.locator('h1')).toBeVisible();
```

#### 3. Use Specific Selectors
```javascript
// Good
await page.locator('button[data-testid="submit-button"]').click();
await page.locator('input[name="firstName"]').fill('John');

// Bad (can break easily)
await page.locator('button').first().click();
await page.locator('input').fill('John');
```

#### 4. Clean Up After Tests
```javascript
test.afterEach(async ({ page }) => {
  // Delete created test data
  // Logout user
  // Clear local storage
  await page.context().clearCookies();
});
```

#### 5. Group Related Tests
```javascript
test.describe('Patient Management', () => {
  
  test.describe('Patient List', () => {
    test('should display list', async ({ page }) => { });
    test('should search patients', async ({ page }) => { });
  });
  
  test.describe('Patient Registration', () => {
    test('should register new patient', async ({ page }) => { });
    test('should validate form fields', async ({ page }) => { });
  });
});
```

---

## ⚙️ Configuration

### `playwright.config.js` Explained

Located at: `frontend/playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Global timeout for each test (60 seconds)
  timeout: 60000,
  
  // Run tests sequentially (important for screenshot consistency)
  fullyParallel: false,
  
  // Number of workers (1 = sequential execution)
  workers: 1,
  
  // Retry failed tests (0 = no retries)
  retries: 0,
  
  // Reporter configuration
  reporter: [
    ['html'],           // HTML report
    ['list'],           // Terminal output
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3000',
    
    // Browser viewport
    viewport: { width: 1280, height: 720 },
    
    // Take screenshot only on failure
    screenshot: 'only-on-failure',
    
    // Record video only on failure
    video: 'retain-on-failure',
    
    // Trace on first retry
    trace: 'on-first-retry',
  },
  
  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  // Auto-start web server
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### Customizing Configuration

#### Increase Timeout
```javascript
timeout: 120000,  // 2 minutes instead of 1
```

#### Enable Parallel Execution
```javascript
fullyParallel: true,
workers: 4,  // Use 4 parallel workers
```

#### Always Capture Screenshots
```javascript
use: {
  screenshot: 'on',  // Instead of 'only-on-failure'
}
```

#### Always Record Video
```javascript
use: {
  video: 'on',  // Instead of 'retain-on-failure'
}
```

#### Add More Browsers
```javascript
projects: [
  {
    name: 'edge',
    use: { ...devices['Desktop Edge'] },
  },
]
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Target closed" or "Browser closed" errors

**Symptoms**:
```
Error: page.goto: Target page, context or browser has been closed
```

**Solutions**:
1. Increase timeout in config:
   ```javascript
   timeout: 120000,  // 2 minutes
   ```

2. Add more wait time:
   ```javascript
   await waitForStablePage(page, 3000);  // 3 seconds
   ```

3. Check that servers are running properly

---

#### Issue 2: Authentication failures

**Symptoms**:
```
Error: Timeout 30000ms exceeded during page.waitForNavigation
```

**Solutions**:
1. Verify test user exists:
   ```powershell
   cd Backend
   python manage.py shell
   ```
   ```python
   from accounts.models import CustomUser
   CustomUser.objects.filter(username='testuser').exists()
   # Should return: True
   ```

2. Check environment variables:
   ```powershell
   echo $env:TEST_USERNAME
   echo $env:TEST_PASSWORD
   ```

3. Verify credentials in helpers.js match:
   ```javascript
   const username = process.env.TEST_USERNAME || 'testuser';
   const password = process.env.TEST_PASSWORD || 'testpass123';
   ```

---

#### Issue 3: Blank or incomplete screenshots

**Symptoms**:
- Screenshots are white/blank
- Elements missing from screenshots
- Loading spinners visible

**Solutions**:
1. Increase wait time before screenshot:
   ```javascript
   await waitForStablePage(page, 3000);  // Wait longer
   ```

2. Wait for specific element:
   ```javascript
   await page.waitForSelector('.main-content', { state: 'visible' });
   await page.waitForTimeout(1000);  // Additional wait
   ```

3. Disable animations in CSS:
   ```css
   * {
     animation-duration: 0s !important;
     transition-duration: 0s !important;
   }
   ```

---

#### Issue 4: Tests fail on CI/CD but pass locally

**Symptoms**:
- Tests pass on your machine
- Tests fail in GitHub Actions or other CI

**Solutions**:
1. Increase timeouts for CI:
   ```javascript
   timeout: process.env.CI ? 180000 : 60000,
   ```

2. Use `--workers=1` in CI:
   ```yaml
   - name: Run tests
     run: npx playwright test --workers=1
   ```

3. Always capture screenshots in CI:
   ```javascript
   screenshot: process.env.CI ? 'on' : 'only-on-failure',
   ```

---

#### Issue 5: "Cannot find module '@playwright/test'"

**Symptoms**:
```
Error: Cannot find module '@playwright/test'
```

**Solution**:
```powershell
cd frontend
npm install -D @playwright/test playwright
npx playwright install
```

---

#### Issue 6: Slow test execution

**Symptoms**:
- Tests take very long to complete
- Individual tests timeout

**Solutions**:
1. Run fewer browsers:
   ```powershell
   npm run test:e2e:chromium  # Only Chromium
   ```

2. Disable video recording:
   ```javascript
   video: 'off',
   ```

3. Reduce wait times where safe:
   ```javascript
   await waitForStablePage(page, 500);  // Reduce from 2000
   ```

4. Run tests in parallel (if safe):
   ```javascript
   fullyParallel: true,
   workers: 2,
   ```

---

#### Issue 7: Port already in use

**Symptoms**:
```
Error: Port 3000 is already in use
```

**Solution**:
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm start
```

---

### Debug Mode

For detailed debugging:

```powershell
# Open Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test patients.spec.js --debug

# Set breakpoint at specific line
npx playwright test patients.spec.js:42 --debug
```

**Playwright Inspector Features**:
- Step through test line by line
- Inspect page elements
- View console logs
- Take manual screenshots
- Modify test on the fly

---

## 🚀 Advanced Usage

### Continuous Integration (CI/CD)

#### GitHub Actions Example

Create `.github/workflows/playwright.yml`:

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Install Playwright Browsers
      run: |
        cd frontend
        npx playwright install --with-deps
    
    - name: Start Backend
      run: |
        cd Backend
        python manage.py runserver &
        sleep 5
    
    - name: Run Playwright tests
      run: |
        cd frontend
        npx playwright test --workers=1
      env:
        TEST_USERNAME: testuser
        TEST_PASSWORD: testpass123
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: frontend/playwright-report/
        retention-days: 30
```

### Visual Regression Testing

Compare screenshots over time:

```javascript
import { test, expect } from '@playwright/test';

test('visual regression - homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Compare with baseline screenshot
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100  // Allow 100 pixels difference
  });
});
```

Update baselines:
```powershell
npx playwright test --update-snapshots
```

### Performance Testing

Measure page load times:

```javascript
test('performance - patients list', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(5000);  // Should load in < 5 seconds
  console.log(`Page loaded in ${loadTime}ms`);
});
```

### Accessibility Testing

Install axe-core:
```powershell
npm install -D @axe-core/playwright
```

Use in tests:
```javascript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('accessibility - homepage', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### API Testing with Playwright

Test API endpoints directly:

```javascript
test('API - get patients list', async ({ request }) => {
  const response = await request.get('http://localhost:8000/api/v1/patients/patients/');
  
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  
  const data = await response.json();
  expect(data.results).toBeDefined();
  expect(Array.isArray(data.results)).toBeTruthy();
});
```

### Mobile Testing

Test on different devices:

```javascript
test.describe('Mobile - Patients Module', () => {
  test.use({ 
    ...devices['iPhone 12'],
    locale: 'en-US',
    geolocation: { longitude: 12.492507, latitude: 41.889938 },
    permissions: ['geolocation'],
  });

  test('should display patients list on mobile', async ({ page }) => {
    await page.goto('/patients');
    
    // Mobile-specific assertions
    await expect(page.locator('.mobile-menu-button')).toBeVisible();
  });
});
```

---

## ✅ Best Practices

### 1. Test Isolation
Each test should be independent:
```javascript
test.beforeEach(async ({ page }) => {
  // Set up clean state for each test
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  await page.context().clearCookies();
});
```

### 2. Page Object Model

Create reusable page objects:

```javascript
// pages/PatientsPage.js
export class PatientsPage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('input[type="search"]');
    this.addButton = page.locator('button:has-text("Add Patient")');
    this.patientCards = page.locator('.patient-card');
  }

  async goto() {
    await this.page.goto('/patients');
    await this.page.waitForLoadState('networkidle');
  }

  async searchPatient(name) {
    await this.searchInput.fill(name);
    await this.page.waitForTimeout(500);
  }

  async clickAddPatient() {
    await this.addButton.click();
  }

  async getPatientCount() {
    return await this.patientCards.count();
  }
}

// Use in tests
import { PatientsPage } from './pages/PatientsPage.js';

test('search patients', async ({ page }) => {
  const patientsPage = new PatientsPage(page);
  await patientsPage.goto();
  await patientsPage.searchPatient('John');
  
  expect(await patientsPage.getPatientCount()).toBeGreaterThan(0);
});
```

### 3. Custom Fixtures

Create reusable test fixtures:

```javascript
// fixtures.js
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedUser: async ({ page }, use) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    await use(page);
    
    // Logout
    await page.click('button.logout');
  },
});

// Use in tests
test('my test', async ({ authenticatedUser }) => {
  // Already logged in!
  await authenticatedUser.goto('/patients');
});
```

### 4. Data-Driven Testing

Test with multiple data sets:

```javascript
const patients = [
  { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com' },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob@test.com' },
];

for (const patient of patients) {
  test(`register patient: ${patient.firstName} ${patient.lastName}`, async ({ page }) => {
    await page.goto('/patients/register');
    await page.fill('input[name="firstName"]', patient.firstName);
    await page.fill('input[name="lastName"]', patient.lastName);
    await page.fill('input[name="email"]', patient.email);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
}
```

### 5. Smart Waiting

Use proper wait strategies:

```javascript
// Good - Wait for specific condition
await page.waitForSelector('.patient-list', { state: 'visible' });
await page.waitForLoadState('networkidle');

// Bad - Fixed timeout (flaky)
await page.waitForTimeout(5000);
```

### 6. Error Handling

Add try-catch blocks for graceful failures:

```javascript
test('handle errors gracefully', async ({ page }) => {
  try {
    await page.goto('/patients');
    await page.click('.non-existent-button');
  } catch (error) {
    console.log('Expected error:', error.message);
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-error.png' });
  }
});
```

### 7. Tagging Tests

Organize tests with tags:

```javascript
test('functional test @smoke', async ({ page }) => {
  // Quick smoke test
});

test('detailed test @slow', async ({ page }) => {
  // Comprehensive test
});

test('visual test @visual', async ({ page }) => {
  // Visual regression test
});
```

Run specific tags:
```powershell
# Run only smoke tests
npx playwright test --grep @smoke

# Run all except slow tests
npx playwright test --grep-invert @slow
```

---

## 📚 Additional Resources

### Official Documentation
- **Playwright Docs**: https://playwright.dev/
- **Playwright API**: https://playwright.dev/docs/api/class-playwright
- **Best Practices**: https://playwright.dev/docs/best-practices

### PreciseOptics Documentation
- **[Complete Playwright Guide](../../docs/testing/PLAYWRIGHT_GUIDE.md)** - Comprehensive guide
- **[E2E Testing Expansion Summary](../../E2E_TESTING_EXPANSION_COMPLETE.md)** - Test coverage details
- **[Quick Start Guide](../../QUICK_START_SCREENSHOTS.md)** - Fast setup guide

### Community Resources
- **Playwright Discord**: https://aka.ms/playwright/discord
- **GitHub Discussions**: https://github.com/microsoft/playwright/discussions
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/playwright

---

## 🎯 Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│  PLAYWRIGHT COMMAND QUICK REFERENCE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SETUP                                                       │
│  npm install -D @playwright/test playwright                 │
│  npx playwright install                                      │
│                                                              │
│  RUN TESTS                                                   │
│  npm run test:e2e              # Run all tests              │
│  npm run test:e2e:ui           # Interactive UI             │
│  npm run test:e2e:headed       # See browser                │
│  npm run test:screenshots      # Generate screenshots       │
│  npm run test:report           # View results               │
│                                                              │
│  SPECIFIC TESTS                                              │
│  npx playwright test patients.spec.js                       │
│  npx playwright test --grep="User Manual"                   │
│  npx playwright test --project=chromium                     │
│                                                              │
│  DEBUG                                                       │
│  npx playwright test --debug                                │
│  npx playwright test --headed                               │
│  npx playwright codegen http://localhost:3000               │
│                                                              │
│  MAINTENANCE                                                 │
│  npx playwright install --force     # Reinstall browsers    │
│  npx playwright --version           # Check version         │
│  npm run test:report                # View last results     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎉 Conclusion

You now have complete knowledge of how to use Playwright for E2E testing in PreciseOptics!

**Key Takeaways**:
1. ✅ Playwright is installed and configured
2. ✅ 78 screenshot tests ready to generate user manual images
3. ✅ All commands documented and explained
4. ✅ Troubleshooting guide for common issues
5. ✅ Best practices for writing maintainable tests

**Next Steps**:
1. Run `npm run test:screenshots` to generate all user manual screenshots
2. Review generated screenshots in `e2e/screenshots/user-manual/`
3. Create user documentation using the screenshots
4. Expand test coverage with new tests as features are added

**Need Help?**
- Check the [troubleshooting section](#troubleshooting)
- Review [best practices](#best-practices)
- Consult [official Playwright docs](https://playwright.dev/)
- Ask team members familiar with the testing framework

**Happy Testing! 🚀**
