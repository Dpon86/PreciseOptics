import { test as base } from '@playwright/test';

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
    // Navigate to login page
    await page.goto('/login');
    
    // Perform login (customize credentials as needed)
    await page.fill('input[name="username"], input[type="text"]', process.env.TEST_USERNAME || 'testuser');
    await page.fill('input[name="password"], input[type="password"]', process.env.TEST_PASSWORD || 'testpassword');
    await page.locator('button[type="submit"]').click();
    
    // Wait for successful login (adjust selector based on your app)
    await page.waitForURL(/dashboard|home|\/$/, { timeout: 10000 });
    
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
