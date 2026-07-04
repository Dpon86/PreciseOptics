import { test, expect } from '@playwright/test';
import { step } from './helpers.js';

/**
 * Standalone login check – verifies admin credentials work end-to-end.
 * Command: npx playwright test e2e/login-check.spec.js --project=chromium
 */

test('can login with admin credentials', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await step(page, 'auth', 'login-check-01-login-page');

  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('admin123');
  await step(page, 'auth', 'login-check-02-filled-form');

  await page.locator('button[type="submit"]').click();
  // Wait for React to navigate away after successful authentication
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await step(page, 'auth', 'login-check-03-after-login');

  const token = await page.evaluate(() => sessionStorage.getItem('authToken'));
  console.log('Auth token present:', token !== null);
  console.log('Final URL:', page.url());

  expect(page.url()).not.toContain('/login');
  expect(token).not.toBeNull();
});
