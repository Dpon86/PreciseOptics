import { test as base } from '@playwright/test';
import { TEST_PATIENT, TEST_CONSULTATION, TEST_PRESCRIPTION, TEST_EYE_TEST } from './test-data.js';
export { TEST_PATIENT, TEST_CONSULTATION, TEST_PRESCRIPTION, TEST_EYE_TEST };

// Stable admin token - tied to admin user in db.sqlite3
const ADMIN_TOKEN = '75202b24a1b49dd388c18bdd45bc698d692a0ea7';

/**
 * Inject auth token into sessionStorage BEFORE the page loads.
 * Call this once per test, before any page.goto().
 * addInitScript runs on every navigation for the lifetime of the page.
 */
export async function injectAuthToken(page) {
  await page.addInitScript(token => {
    window.sessionStorage.setItem('authToken', token);
  }, ADMIN_TOKEN);
  // Mock the auth-check endpoint so rate-limiting never causes a login redirect
  await page.route('**/api/patients/?limit=1', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ results: [], count: 0 }) });
  });
}

/**
 * Log in via the real login form UI (username + password).
 * Use this for true end-to-end tests that must start from the login page.
 * After this resolves the page is on '/' and authenticated.
 */
export async function login(page) {
  // Mock the auth-check endpoint to prevent rate-limit-induced login redirects
  await page.route('**/api/patients/?limit=1', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ results: [], count: 0 }) });
  });
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.locator('button[type="submit"]').click();
  // Wait until we leave the login page (redirected to dashboard)
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

/**
 * Open the sidebar. Tries a hamburger toggle first; falls back to assuming it
 * is already visible (desktop layout keeps sidebar open by default).
 */
export async function openSidebar(page) {
  const toggle = page.locator('button').filter({ hasText: /menu|☰/i })
    .or(page.locator('[class*="hamburger"], [class*="toggle"], [aria-label*="menu"]'))
    .first();
  if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(400);
  }
}

/**
 * Click a sidebar link by its visible label text.
 */
export async function clickSidebarLink(page, label) {
  await openSidebar(page);
  const link = page.locator('.sidebar a, nav a, [class*="sidebar"] a')
    .filter({ hasText: label })
    .first();
  await link.waitFor({ state: 'visible', timeout: 8000 });
  await link.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Capture a how-to-guide step screenshot.
 * Saves to e2e/screenshots/how-to/<section>/<stepNumber>-<description>.png
 *
 * Usage:
 *   await step(page, 'auth', '01-login-page');
 *
 * @param {Page}   page        - Playwright page object
 * @param {string} section     - Guide section name, e.g. 'auth', 'patients'
 * @param {string} description - Step description (will be used as filename)
 */
export async function step(page, section, description) {
  const sanitised = description.replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
  const path = `e2e/screenshots/how-to/${section}/${sanitised}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`📸 Step: ${section}/${sanitised}.png`);
}

/**
 * Authenticated Test Helpers
 * 
 * Provides fixtures for tests that require authentication.
 * Handles login state management and reuse across tests.
 */

// Extend base test with authenticated user fixture
export const test = base.extend({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Mock the auth-check endpoint to prevent rate-limit-induced login redirects
    await page.route('**/api/patients/?limit=1', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ results: [], count: 0 }) });
    });
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for React app to fully mount
    
    // Wait for login form to be fully visible
    await page.locator('.login-form').waitFor({ state: 'visible', timeout: 10000 });
    
    // Fill and submit the form
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin123');
    
    // Click submit and wait for navigation
    await Promise.all([
      page.waitForURL((url) => url.pathname === '/', { timeout: 15000 }),
      page.locator('button[type="submit"]').click()
    ]);
    
    // Wait for page to stabilize and auth token to be set
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give time for auth token to be stored in sessionStorage
    
    // Verify we're authenticated
    const hasToken = await page.evaluate(() => {
      return sessionStorage.getItem('authToken') !== null;
    });
    
    if (!hasToken) {
      throw new Error('Authentication failed - no token in sessionStorage');
    }
    
    // Use the authenticated page
    await use(page);
    
    // Cleanup: logout after test
    try {
      const logoutButton = page.locator('button, a').filter({ hasText: /logout|sign out/i });
      if (await logoutButton.isVisible({ timeout: 1000 })) {
        await logoutButton.click();
      }
    } catch (e) {
      // Ignore logout errors in cleanup
    }
  },
});

export { expect } from '@playwright/test';

/**
 * Helper Functions for Authentication
 */

/**
 * Authenticate a page (for use in screenshot tests)
 * @param {Page} page - Playwright page object
 */
export async function authenticatedPage(page) {
  // Mock the auth-check endpoint to prevent rate-limit-induced login redirects
  await page.route('**/api/patients/?limit=1', (route) => {
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ results: [], count: 0 }) });
  });
  // Navigate to login page
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for React app to fully mount
  
  // Wait for login form to be fully visible
  await page.locator('.login-form').waitFor({ state: 'visible', timeout: 10000 });
  
  // Fill and submit the form
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('admin123');
  
  // Click submit and wait for navigation
  await Promise.all([
    page.waitForURL((url) => url.pathname === '/', { timeout: 15000 }),
    page.locator('button[type="submit"]').click()
  ]);
  
  // Wait for page to stabilize and auth token to be set
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Give time for auth token to be stored in sessionStorage
  
  // Verify we're authenticated by checking sessionStorage has auth token
  const hasToken = await page.evaluate(() => {
    return sessionStorage.getItem('authToken') !== null;
  });
  
  if (!hasToken) {
    throw new Error('Authentication failed - no token in sessionStorage');
  }
}

/**
 * Helper Functions for Screenshot Capture
 */

/**
 * Capture a screenshot with consistent naming for user manuals
 * @param {Page} page - Playwright page object
 * @param {string} section - Manual section (e.g., 'patients', 'conditions')
 * @param {string} step - Step number and description (e.g., '01-list-view')
 * @param {object} options - Playwright screenshot options
 */
export async function captureManualScreenshot(page, section, step, options = {}) {
  const defaultOptions = {
    fullPage: true,
    path: `e2e/screenshots/user-manual/${section}/${step}.png`,
    ...options,
  };
  
  await page.screenshot(defaultOptions);
  console.log(`📸 Captured: ${section}/${step}.png`);
}

/**
 * Capture a specific element screenshot
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector for element
 * @param {string} filename - Output filename
 */
export async function captureElementScreenshot(page, selector, filename) {
  const element = page.locator(selector);
  await element.screenshot({
    path: `e2e/screenshots/user-manual/components/${filename}.png`,
  });
  console.log(`📸 Captured component: ${filename}.png`);
}

/**
 * Highlight an element and capture screenshot (for tutorial purposes)
 * @param {Page} page - Playwright page object
 * @param {string} selector - CSS selector for element to highlight
 * @param {string} filename - Output filename
 */
export async function captureHighlightedScreenshot(page, selector, filename, color = 'red') {
  // Add highlight CSS
  await page.evaluate(({ selector, color }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.outline = `3px solid ${color}`;
      element.style.outlineOffset = '2px';
    }
  }, { selector, color });
  
  await page.screenshot({
    path: `e2e/screenshots/user-manual/highlighted/${filename}.png`,
    fullPage: true,
  });
  
  // Remove highlight
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.outline = '';
      element.style.outlineOffset = '';
    }
  }, selector);
  
  console.log(`📸 Captured highlighted: ${filename}.png`);
}

/**
 * Wait for page to be fully loaded and stable
 * @param {Page} page - Playwright page object
 * @param {number} additionalWait - Extra wait time in ms
 */
export async function waitForStablePage(page, additionalWait = 500) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(additionalWait);
}

/**
 * Fill form with data and capture each step
 * @param {Page} page - Playwright page object
 * @param {object} formData - Object with field selectors and values
 * @param {string} section - Manual section for screenshots
 */
export async function fillFormWithScreenshots(page, formData, section) {
  let step = 1;
  
  for (const [selector, value] of Object.entries(formData)) {
    await page.fill(selector, value);
    await captureManualScreenshot(
      page,
      section,
      `${String(step).padStart(2, '0')}-fill-${selector.replace(/[^\w]/g, '-')}`,
      { fullPage: false }
    );
    step++;
  }
}

/**
 * Navigate directly to the E2E test patient's detail page.
 * Injects auth token so no login flow is needed.
 */
export async function navigateToTestPatient(page) {
  await injectAuthToken(page);
  await page.goto(`/patients/${TEST_PATIENT.id}`);
  await waitForStablePage(page);
}

/**
 * Navigate directly to the E2E test consultation detail page.
 * Injects auth token so no login flow is needed.
 */
export async function navigateToTestConsultation(page) {
  await injectAuthToken(page);
  await page.goto(`/consultations/${TEST_CONSULTATION.id}`);
  await waitForStablePage(page);
}

/**
 * Navigate to patients list and click the test patient (Sarah White).
 * Injects auth token so no login flow is needed.
 */
export async function selectTestPatientFromList(page) {
  await injectAuthToken(page);
  await page.goto('/patients');
  await waitForStablePage(page);

  // Try searching for the patient by name
  const searchInput = page.locator('input[type="text"], input[type="search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill(TEST_PATIENT.searchTerm);
    await page.waitForTimeout(600);
    await waitForStablePage(page);
  }

  // Click the test patient link
  const patientLink = page.locator(`a[href*="${TEST_PATIENT.id}"]`).first();
  if (await patientLink.isVisible()) {
    await patientLink.click();
  } else {
    // Direct navigation fallback
    await page.goto(`/patients/${TEST_PATIENT.id}`);
  }
  await waitForStablePage(page);
}

/**
 * Navigate through workflow and capture each step
 * @param {Page} page - Playwright page object
 * @param {Array} steps - Array of step objects with action and description
 * @param {string} section - Manual section for screenshots
 */
export async function captureWorkflow(page, steps, section) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNum = String(i + 1).padStart(2, '0');
    
    // Perform action
    if (step.action === 'goto') {
      await page.goto(step.url);
      await waitForStablePage(page);
    } else if (step.action === 'click') {
      await page.locator(step.selector).click();
      await waitForStablePage(page);
    } else if (step.action === 'fill') {
      await page.fill(step.selector, step.value);
    }
    
    // Capture screenshot
    await captureManualScreenshot(
      page,
      section,
      `${stepNum}-${step.description.toLowerCase().replace(/\s+/g, '-')}`
    );
  }
}
