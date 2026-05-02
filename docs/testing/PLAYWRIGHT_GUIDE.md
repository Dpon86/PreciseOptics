# Playwright E2E Testing & User Manual Generation

**Version**: 1.0  
**Framework**: Playwright Test  
**Purpose**: End-to-end testing + automated screenshot capture for user manuals  
**Last Updated**: May 2, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running Tests](#running-tests)
5. [Generating User Manual Screenshots](#generating-user-manual-screenshots)
6. [Test Structure](#test-structure)
7. [Writing New Tests](#writing-new-tests)
8. [Screenshot Organization](#screenshot-organization)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This project uses Playwright for two primary purposes:

### 1. End-to-End Testing
- Test complete user workflows (login → action → verification)
- Cross-browser compatibility testing (Chrome, Firefox, Safari)
- Mobile and tablet responsive testing
- Performance and accessibility testing

### 2. User Manual Screenshot Generation
- Automated capture of UI screenshots for documentation
- Consistent image quality and sizing
- Step-by-step workflow visualization
- Highlighted elements for tutorial purposes

---

## Installation

Playwright is already installed in this project. If you need to reinstall:

```bash
cd frontend

# Install Playwright
npm install -D @playwright/test playwright

# Install browsers (Chromium, Firefox, WebKit)
npx playwright install

# Verify installation
npx playwright --version
```

**Installed Components**:
- ✅ @playwright/test v1.51.0
- ✅ Chromium browser
- ✅ Firefox browser
- ✅ WebKit (Safari) browser

---

## Configuration

Configuration file: `frontend/playwright.config.js`

### Key Settings

```javascript
{
  testDir: './e2e',                    // Test directory
  timeout: 60000,                      // Test timeout (60 seconds)
  fullyParallel: false,                // Sequential execution
  workers: 1,                          // Single worker for consistency
  baseURL: 'http://localhost:3000',    // Development server URL
  viewport: { width: 1280, height: 720 }, // Standard desktop size
}
```

### Projects (Browsers)

Tests run on multiple browsers:
- **chromium**: Desktop Chrome
- **firefox**: Desktop Firefox
- **webkit**: Desktop Safari
- **mobile-chrome**: Pixel 5 emulation
- **mobile-safari**: iPhone 12 emulation
- **tablet**: iPad Pro emulation

---

## Running Tests

### Basic Commands

```bash
cd frontend

# Run all tests (all browsers)
npx playwright test

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run specific test file
npx playwright test e2e/auth.spec.js

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests with UI mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test --debug
```

### Interactive Mode

```bash
# UI Mode - best for development
npx playwright test --ui

# This opens an interactive interface where you can:
# - See all tests
# - Run tests individually
# - Watch tests execute
# - Inspect page state
# - Time-travel through test steps
```

### Viewing Test Reports

```bash
# Open HTML report (after tests run)
npx playwright show-report

# Report location: frontend/playwright-report/index.html
```

---

## Generating User Manual Screenshots

### Quick Start

```bash
cd frontend

# 1. Start the development server (in separate terminal)
npm start

# 2. Run screenshot generation tests
npx playwright test --grep="User Manual" --project=chromium

# Screenshots saved to: frontend/e2e/screenshots/user-manual/
```

### Automated Screenshot Workflow

The test suite includes dedicated tests for generating user manual screenshots:

```javascript
test('User Manual Screenshot Generation', async ({ page }) => {
  // Navigate to page
  await page.goto('/patients');
  await page.waitForLoadState('networkidle');
  
  // Capture screenshot
  await page.screenshot({
    path: 'e2e/screenshots/user-manual/patients/01-patient-list.png',
    fullPage: true
  });
});
```

### Helper Functions

Use helper functions for consistent screenshot capture:

```javascript
import { captureManualScreenshot, captureHighlightedScreenshot } from './helpers';

// Basic screenshot
await captureManualScreenshot(page, 'patients', '01-patient-list');

// Highlighted element screenshot
await captureHighlightedScreenshot(page, 'button.add-patient', '02-add-button', 'red');

// Workflow capture
await captureWorkflow(page, [
  { action: 'goto', url: '/patients', description: 'Patient List' },
  { action: 'click', selector: 'button.add-patient', description: 'Click Add Patient' },
  { action: 'fill', selector: 'input[name="firstName"]', value: 'John', description: 'Enter First Name' }
], 'patients');
```

---

## Test Structure

```
frontend/
├── e2e/                                  # Test directory
│   ├── auth.spec.js                      # Authentication tests
│   ├── helpers.js                        # Test helpers and screenshot utilities
│   └── screenshots/                      # Screenshot output
│       └── user-manual/                  # Organized by module
│           ├── conditions/
│           ├── protocols/
│           ├── referrals/
│           ├── alerts/
│           ├── patients/
│           └── components/
├── playwright.config.js                  # Playwright configuration
├── playwright-report/                    # HTML test reports
└── test-results/                         # Test artifacts
```

### Test File Naming

- `*.spec.js` - Test specification files
- `*.test.js` - Alternative test file naming
- `helpers.js` - Shared test utilities

---

## Writing New Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/feature');
  });

  test('should perform action correctly', async ({ page }) => {
    // 1. Arrange - setup test data
    const input = page.locator('input[name="field"]');
    
    // 2. Act - perform action
    await input.fill('test value');
    await page.locator('button[type="submit"]').click();
    
    // 3. Assert - verify result
    await expect(page.locator('.success-message')).toBeVisible();
    
    // 4. Screenshot - capture for manual
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/feature/01-success.png',
      fullPage: true
    });
  });
});
```

### Authenticated Tests

```javascript
import { test, expect } from './helpers';  // Use custom test with auth

test('should access protected page', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await authenticatedPage.goto('/dashboard');
  await expect(authenticatedPage.locator('h1')).toContainText('Dashboard');
});
```

### Screenshot Capture Patterns

```javascript
// 1. Full page screenshot
await page.screenshot({
  path: 'e2e/screenshots/user-manual/section/step.png',
  fullPage: true
});

// 2. Visible viewport only
await page.screenshot({
  path: 'screenshots/viewport.png',
  fullPage: false
});

// 3. Specific element
await page.locator('.specific-element').screenshot({
  path: 'screenshots/element.png'
});

// 4. Clipped region
await page.screenshot({
  path: 'screenshots/header.png',
  clip: { x: 0, y: 0, width: 1280, height: 100 }
});

// 5. With specific viewport
await page.setViewportSize({ width: 1920, height: 1080 });
await page.screenshot({ path: 'screenshots/large.png' });
```

---

## Screenshot Organization

### Directory Structure

```
frontend/e2e/screenshots/user-manual/
├── 01-login-page.png
├── 02-dashboard.png
├── conditions/
│   ├── 01-conditions-list.png
│   ├── 02-add-condition-form.png
│   ├── 03-condition-detail.png
│   └── 04-progress-tracking.png
├── protocols/
│   ├── 01-protocols-list.png
│   ├── 02-protocol-builder.png
│   ├── 03-step-configuration.png
│   └── 04-patient-assignment.png
├── referrals/
│   ├── 01-referrals-list.png
│   ├── 02-create-referral.png
│   └── 03-referral-detail.png
├── alerts/
│   ├── 01-alert-center.png
│   ├── 02-header-badge.png
│   └── 03-alert-actions.png
└── components/
    ├── sidebar-navigation.png
    ├── patient-selector.png
    └── alert-badge.png
```

### Naming Convention

**Format**: `{number}-{descriptive-name}.png`

Examples:
- ✅ `01-patient-list-view.png`
- ✅ `02-add-patient-form.png`
- ✅ `03-filled-patient-form.png`
- ❌ `Screenshot 2026-05-02.png` (not descriptive)
- ❌ `test123.png` (not meaningful)

**Numbering**:
- Use 2-digit numbers (01, 02, 03...)
- Number in workflow sequence order
- Leave gaps for future insertions (01, 05, 10, 15...)

---

## Best Practices

### 1. Wait for Stable State

```javascript
// Always wait for page to be fully loaded
await page.waitForLoadState('networkidle');
await page.waitForLoadState('domcontentloaded');

// Wait for specific elements
await page.waitForSelector('.data-loaded');

// Additional wait for animations
await page.waitForTimeout(500);
```

### 2. Use Meaningful Assertions

```javascript
// ✅ Good - specific assertions
await expect(page.locator('h1')).toContainText('Patient List');
await expect(page.locator('.patient-row')).toHaveCount(5);

// ❌ Avoid - too generic
await expect(page.locator('div')).toBeVisible();
```

### 3. Isolate Tests

```javascript
// Each test should be independent
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  // Cleanup after each test
  await page.close();
});
```

### 4. Handle Dynamic Content

```javascript
// Wait for dynamic data to load
await page.waitForFunction(() => {
  return document.querySelectorAll('.patient-row').length > 0;
});

// Use retry logic for flaky elements
await expect(page.locator('.dynamic-element')).toBeVisible({ timeout: 10000 });
```

### 5. Screenshot Consistency

```javascript
// Always use same viewport for user manuals
await page.setViewportSize({ width: 1280, height: 720 });

// Wait for animations to complete
await page.waitForTimeout(300);

// Ensure consistent state
await page.waitForLoadState('networkidle');
```

---

## Advanced Features

### 1. Generate Screenshot Series

```javascript
test('Complete workflow with screenshots', async ({ page }) => {
  const steps = [
    { url: '/patients', name: '01-list' },
    { action: () => page.click('button.add'), name: '02-form' },
    { action: () => page.fill('input[name="firstName"]', 'John'), name: '03-filled' },
    { action: () => page.click('button[type="submit"]'), name: '04-submitted' }
  ];
  
  for (const step of steps) {
    if (step.url) await page.goto(step.url);
    if (step.action) await step.action();
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: `e2e/screenshots/user-manual/workflow/${step.name}.png`,
      fullPage: true
    });
  }
});
```

### 2. Mobile Responsive Screenshots

```javascript
test('Mobile view screenshots', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  
  await page.goto('/patients');
  await page.screenshot({
    path: 'screenshots/mobile/patients-mobile.png'
  });
});
```

### 3. Annotated Screenshots

```javascript
test('Annotated screenshot', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Add annotations with JavaScript
  await page.evaluate(() => {
    const addButton = document.querySelector('button.add-patient');
    if (addButton) {
      const annotation = document.createElement('div');
      annotation.textContent = '← Click here to add patient';
      annotation.style.cssText = 'position: absolute; top: 50px; left: 150px; background: yellow; padding: 5px;';
      document.body.appendChild(annotation);
    }
  });
  
  await page.screenshot({
    path: 'screenshots/annotated/dashboard-add-patient.png'
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Timing Out

**Problem**: Tests fail with timeout errors

**Solutions**:
```javascript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes
  // test code
});

// Wait longer for navigation
await page.goto('/slow-page', { timeout: 60000 });
```

#### 2. Element Not Found

**Problem**: `Error: Element not found`

**Solutions**:
```javascript
// Wait for element to appear
await page.waitForSelector('.element', { timeout: 10000 });

// Check if element exists before interacting
const element = page.locator('.element');
if (await element.isVisible()) {
  await element.click();
}
```

#### 3. Flaky Tests

**Problem**: Tests pass/fail intermittently

**Solutions**:
```javascript
// Use built-in retries
await expect(page.locator('.element')).toBeVisible({ timeout: 10000 });

// Wait for network idle
await page.waitForLoadState('networkidle');

// Disable animations
await page.addStyleTag({
  content: '* { animation: none !important; transition: none !important; }'
});
```

#### 4. Screenshot Differences

**Problem**: Screenshots look different each time

**Solutions**:
- Always use same viewport size
- Wait for `networkidle` before screenshot
- Wait for animations to complete (`waitForTimeout(300)`)
- Ensure consistent test data

### Debug Mode

```bash
# Run in debug mode with browser open
npx playwright test --debug

# Debug specific test
npx playwright test e2e/auth.spec.js --debug

# Run with trace on
npx playwright test --trace on
```

### View Trace Files

```bash
# Open trace viewer
npx playwright show-trace test-results/trace.zip
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps
      - name: Run tests
        run: cd frontend && npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## Next Steps

### Immediate Actions

1. **Start Backend**: Ensure Django server is running on `http://localhost:8000`
2. **Start Frontend**: Run `npm start` in frontend directory
3. **Run Tests**: Execute `npx playwright test --project=chromium --headed`
4. **Generate Screenshots**: Run screenshot generation tests
5. **Review Output**: Check `e2e/screenshots/user-manual/` directory

### Future Enhancements

- [ ] Add visual regression testing (screenshot comparison)
- [ ] Implement accessibility testing (@axe-core/playwright)
- [ ] Add performance metrics capture
- [ ] Create CI/CD pipeline integration
- [ ] Generate automated user manual from screenshots
- [ ] Add video recording for complex workflows
- [ ] Create interactive test documentation

---

## Resources

- **Playwright Documentation**: https://playwright.dev/docs/intro
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-playwright
- **Examples**: https://github.com/microsoft/playwright/tree/main/examples

---

## Support

For questions or issues:
- **Playwright Issues**: https://github.com/microsoft/playwright/issues
- **Project Issues**: [Create issue in repository]
- **Documentation**: See this guide and official Playwright docs

---

**End of Playwright E2E Testing & User Manual Generation Guide**
