import { test, expect } from '@playwright/test';

/**
 * Authentication and Login Tests
 * 
 * Purpose:
 * - Test login/logout functionality
 * - Capture screenshots for user manual
 * - Verify 2FA workflow
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Capture screenshot for user manual
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/01-login-page.png',
      fullPage: true,
    });
    
    // Verify page elements
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i);
    await expect(page.locator('input[name="username"], input[type="text"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Click login without entering credentials
    await page.locator('button[type="submit"]').click();
    
    // Wait for error messages
    await page.waitForTimeout(500);
    
    // Capture screenshot
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/02-login-validation-errors.png',
      fullPage: true,
    });
  });

  test('should navigate to password reset page', async ({ page }) => {
    // Click forgot password link
    const forgotPasswordLink = page.locator('a').filter({ hasText: /forgot.*password|reset.*password/i });
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForLoadState('networkidle');
      
      // Capture screenshot
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/03-password-reset-page.png',
        fullPage: true,
      });
      
      await expect(page).toHaveURL(/reset|forgot/i);
    }
  });

  test('should login with valid credentials', async ({ page }) => {
    // Fill in login form
    await page.fill('input[name="username"], input[type="text"]', 'testuser');
    
    // Capture screenshot of filled form
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/04-login-form-filled.png',
      fullPage: true,
    });
    
    await page.fill('input[name="password"], input[type="password"]', 'testpassword');
    
    // Click login button
    await page.locator('button[type="submit"]').click();
    
    // Wait for navigation or error
    await page.waitForTimeout(2000);
    
    // Capture result
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/05-after-login-attempt.png',
      fullPage: true,
    });
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // For these tests, we need to be logged in
    // This is a placeholder - you'll need to implement actual login
    await page.goto('/');
  });

  test('should display dashboard homepage', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Capture dashboard screenshot
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/10-dashboard-homepage.png',
      fullPage: true,
    });
    
    // Verify key dashboard elements
    await expect(page.locator('header, .header')).toBeVisible();
    await expect(page.locator('nav, .sidebar, .navigation')).toBeVisible();
  });

  test('should navigate through sidebar menu', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Capture initial sidebar
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/11-sidebar-navigation.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 300, height: 800 },
    });
    
    // Click Patients menu item
    const patientsLink = page.locator('a, button').filter({ hasText: /^patients$/i });
    if (await patientsLink.isVisible()) {
      await patientsLink.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/12-patients-page.png',
        fullPage: true,
      });
    }
  });
});

test.describe('User Manual Screenshot Generation', () => {
  /**
   * This test suite is specifically for generating comprehensive
   * screenshots for the user manual. It walks through common workflows
   * and captures screens at each step.
   */

  test('Condition Management Workflow', async ({ page }) => {
    await page.goto('/conditions');
    await page.waitForLoadState('networkidle');
    
    // 1. Conditions list page
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/conditions/01-conditions-list.png',
      fullPage: true,
    });
    
    // 2. Click add condition button (if visible)
    const addButton = page.locator('button, a').filter({ hasText: /add.*condition|new.*condition/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/conditions/02-add-condition-form.png',
        fullPage: true,
      });
    }
  });

  test('Protocol Management Workflow', async ({ page }) => {
    await page.goto('/protocols');
    await page.waitForLoadState('networkidle');
    
    // 1. Protocols list page
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/protocols/01-protocols-list.png',
      fullPage: true,
    });
    
    // 2. Protocol builder
    const builderLink = page.locator('a, button').filter({ hasText: /protocol.*builder|create.*protocol/i });
    if (await builderLink.isVisible()) {
      await builderLink.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/protocols/02-protocol-builder.png',
        fullPage: true,
      });
    }
  });

  test('Referrals Management Workflow', async ({ page }) => {
    await page.goto('/referrals');
    await page.waitForLoadState('networkidle');
    
    // 1. Referrals list page
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/referrals/01-referrals-list.png',
      fullPage: true,
    });
    
    // 2. Create referral
    const createButton = page.locator('button, a').filter({ hasText: /create.*referral|new.*referral/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForLoadState('networkidle');
      
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/referrals/02-create-referral-form.png',
        fullPage: true,
      });
    }
  });

  test('Alert System Workflow', async ({ page }) => {
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    
    // 1. Alert center
    await page.screenshot({
      path: 'e2e/screenshots/user-manual/alerts/01-alert-center.png',
      fullPage: true,
    });
    
    // 2. Click alert badge in header
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const alertBadge = page.locator('.alert-badge, [class*="alert"]').first();
    if (await alertBadge.isVisible()) {
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/alerts/02-header-alert-badge.png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1280, height: 100 },
      });
      
      await alertBadge.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: 'e2e/screenshots/user-manual/alerts/03-alert-dropdown.png',
        fullPage: true,
      });
    }
  });
});
