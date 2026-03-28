// utils/auth-helper.js - Authentication Helper Functions
import { expect } from '@playwright/test';

/**
 * Login to PreciseOptics application
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @returns {Promise<string>} Authentication token
 */
export async function login(page, username = 'admin', password = 'admin123') {
  console.log(`Attempting login with username: ${username}`);
  
  // Navigate to login page
  await page.goto('/login');
  await expect(page).toHaveURL(/.*login/);
  
  // Wait for login form to be visible
  await page.waitForSelector('input[name="username"]', { state: 'visible' });
  
  // Fill in credentials
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  
  // Click submit button
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForURL(/^(?!.*login).*/, { timeout: 10000 });
  
  // Verify successful login - should redirect to dashboard/home
  const url = page.url();
  expect(url).not.toContain('login');
  
  // Get auth token from localStorage
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  expect(token).toBeTruthy();
  
  console.log('Login successful, token obtained');
  return token;
}

/**
 * Logout from PreciseOptics application
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function logout(page) {
  console.log('Logging out...');
  
  // Click on user menu or logout button (adjust selector as needed)
  try {
    await page.click('button:has-text("Logout")', { timeout: 5000 });
  } catch {
    // Try alternative logout path
    await page.click('.user-menu', { timeout: 5000 });
    await page.click('text=Logout', { timeout: 5000 });
  }
  
  // Verify redirect to login page
  await page.waitForURL(/.*login/, { timeout: 10000 });
  
  // Verify token is cleared
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  expect(token).toBeNull();
  
  console.log('Logout successful');
}

/**
 * Setup authenticated session
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 */
export async function setupAuthenticatedSession(page, username = 'admin', password = 'admin123') {
  await login(page, username, password);
}

/**
 * Check if user is authenticated
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated(page) {
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  return !!token;
}

/**
 * Get authentication token from page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string|null>} Authentication token or null
 */
export async function getAuthToken(page) {
  return await page.evaluate(() => localStorage.getItem('authToken'));
}
