import { test, expect } from '@playwright/test';
import { login, openSidebar, clickSidebarLink, step } from './helpers.js';

// ============================================================
// Authentication & Dashboard Navigation E2E Tests
// Every test starts from the login page, types credentials,
// clicks the submit button, and drives the real UI from there.
// ============================================================

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  test('shows username, password fields and submit button', async ({ page }) => {
    await step(page, 'auth', '01-login-page');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error with wrong credentials', async ({ page }) => {
    await step(page, 'auth', '02-login-blank');
    await page.locator('input[name="username"]').fill('wronguser');
    await page.locator('input[name="password"]').fill('wrongpass');
    await step(page, 'auth', '03-login-wrong-credentials-filled');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    await step(page, 'auth', '04-login-error-shown');
    // Should stay on login page — not redirected to dashboard
    await expect(page).toHaveURL(/login/);
  });

  test('successfully logs in with admin credentials and reaches dashboard', async ({ page }) => {
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin123');
    await step(page, 'auth', '05-login-credentials-filled');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await step(page, 'auth', '06-dashboard-after-login');
    // Dashboard heading or sidebar should be present
    await expect(page.locator('h1, h2, .sidebar, nav').first()).toBeVisible();
  });
});

test.describe('Dashboard Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Log in via real UI for every test in this suite
    await login(page);
  });

  test('sidebar is visible after login', async ({ page }) => {
    await step(page, 'auth', '07-dashboard-sidebar-visible');
    const sidebar = page.locator('.sidebar, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('navigate to Patients via sidebar "View Patients" link', async ({ page }) => {
    await step(page, 'auth', '08-sidebar-before-patients-click');
    await clickSidebarLink(page, 'View Patients');
    await step(page, 'auth', '09-patients-page-loaded');
    await expect(page).toHaveURL(/patients/);
    await expect(page.locator('h1').filter({ hasText: /patients/i })).toBeVisible();
  });

  test('navigate to Medications via sidebar "View All Medications" link', async ({ page }) => {
    await clickSidebarLink(page, 'View All Medications');
    await step(page, 'auth', '10-medications-page-loaded');
    await expect(page).toHaveURL(/medications/);
    await expect(page.locator('h1').filter({ hasText: /medications/i })).toBeVisible();
  });

  test('navigate to Consultations via sidebar "View Consultations" link', async ({ page }) => {
    await clickSidebarLink(page, 'View Consultations');
    await step(page, 'auth', '11-consultations-page-loaded');
    await expect(page).toHaveURL(/consultations/);
  });

  test('navigate to Eye Tests via sidebar "View Eye Tests" link', async ({ page }) => {
    await clickSidebarLink(page, 'View Eye Tests');
    await step(page, 'auth', '12-eye-tests-page-loaded');
    await expect(page).toHaveURL(/eye-tests/);
  });

  test('navigate to Treatments via sidebar "View Treatments" link', async ({ page }) => {
    await clickSidebarLink(page, 'View Treatments');
    await step(page, 'auth', '13-treatments-page-loaded');
    await expect(page).toHaveURL(/treatments/);
  });

  test('log out returns to login page', async ({ page }) => {
    await step(page, 'auth', '14-dashboard-before-logout');
    const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first();
    await logoutBtn.waitFor({ state: 'visible', timeout: 8000 });
    await logoutBtn.click();
    await page.waitForURL(url => url.pathname.includes('/login'), { timeout: 10000 });
    await step(page, 'auth', '15-login-page-after-logout');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });
});


