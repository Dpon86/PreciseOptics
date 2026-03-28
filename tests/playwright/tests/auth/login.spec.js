// tests/auth/login.spec.js - Login Authentication Tests
import { test, expect } from '@playwright/test';
import { login, logout, isAuthenticated } from '../../utils/auth-helper.js';

test.describe('Authentication - Login', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Verify login page elements
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Login page displays correctly');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const username = process.env.TEST_USERNAME || 'admin';
    const password = process.env.TEST_PASSWORD || 'admin123';
    
    // Perform login
    const token = await login(page, username, password);
    
    // Verify we're logged in
    expect(token).toBeTruthy();
    expect(await isAuthenticated(page)).toBe(true);
    
    // Verify redirect to home/dashboard
    const url = page.url();
    expect(url).not.toContain('login');
    
    console.log('✓ Login successful with valid credentials');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Listen for alert or error message
    let alertShown = false;
    page.on('dialog', async dialog => {
      console.log(`Alert: ${dialog.message()}`);
      alertShown = true;
      await dialog.accept();
    });
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Wait briefly for response
    await page.waitForTimeout(2000);
    
    // Verify still on login page or error shown
    const url = page.url();
    expect(url).toContain('login');
    
    // Should not have auth token
    const token = await page.evaluate(() => localStorage.getItem('authToken'));
    expect(token).toBeNull();
    
    console.log('✓ Login failed with invalid credentials (expected)');
  });

  test('should show validation error for empty fields', async ({ page }) => {
    // Try to submit with empty fields
    await page.click('button[type="submit"]');
    
    // Check for HTML5 validation or error messages
    const usernameInput = page.locator('input[name="username"]');
    const passwordInput = page.locator('input[name="password"]');
    
    // HTML5 validation should prevent submission
    const usernameValidity = await usernameInput.evaluate(el => el.validity.valid);
    const passwordValidity = await passwordInput.evaluate(el => el.validity.valid);
    
    expect(usernameValidity || passwordValidity).toBe(false);
    
    console.log('✓ Validation works for empty fields');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page);
    expect(await isAuthenticated(page)).toBe(true);
    
    // Then logout
    await logout(page);
    
    // Verify logout
    expect(await isAuthenticated(page)).toBe(false);
    await expect(page).toHaveURL(/.*login/);
    
    console.log('✓ Logout successful');
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/patients');
    
    // Should redirect to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
    
    console.log('✓ Protected route redirects to login');
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Login
    await login(page);
    expect(await isAuthenticated(page)).toBe(true);
    
    // Reload page
    await page.reload();
    
    // Should still be authenticated
    expect(await isAuthenticated(page)).toBe(true);
    
    // Should not redirect to login
    const url = page.url();
    expect(url).not.toContain('login');
    
    console.log('✓ Authentication persists across reloads');
  });

});
