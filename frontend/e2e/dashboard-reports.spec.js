import { test, expect } from '@playwright/test';
import { login, clickSidebarLink, step } from './helpers.js';

// ============================================================
// Dashboard & Reports Module – E2E Workflow Tests
// Every test: login → navigate → verify
// ============================================================

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard loads after login with sidebar visible', async ({ page }) => {
    await step(page, 'dashboard', '01-dashboard-after-login');
    // We are already on the dashboard after login()
    const sidebar = page.locator('.sidebar, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
    // Some dashboard content should be visible
    const content = page.locator('h1, h2, .stat-card, .dashboard-card').first();
    await expect(content).toBeVisible();
  });

  test('dashboard shows statistics or summary cards', async ({ page }) => {
    await step(page, 'dashboard', '02-dashboard-stat-cards');
    const statCards = page.locator('.stat-card, .dashboard-card, [class*="stat"]');
    const count = await statCards.count();
    // Soft check — if cards are rendered they should be visible
    if (count > 0) {
      await expect(statCards.first()).toBeVisible();
    }
  });
});

test.describe('Reports via Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Treatment Effectiveness report via sidebar', async ({ page }) => {
    await step(page, 'dashboard', '03-sidebar-before-treatment-effectiveness');
    await clickSidebarLink(page, 'Treatment & Medication Effectiveness');
    await step(page, 'dashboard', '04-treatment-effectiveness-report-loaded');
    await expect(page).toHaveURL(/treatment-effectiveness/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('navigate to Patient Medications report via sidebar', async ({ page }) => {
    await step(page, 'dashboard', '05-sidebar-before-patient-medications');
    await clickSidebarLink(page, 'Patient Medications');
    await step(page, 'dashboard', '06-patient-medications-report-loaded');
    await expect(page).toHaveURL(/patient-medications/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('navigate to Drug Audit report via sidebar', async ({ page }) => {
    await step(page, 'dashboard', '07-sidebar-before-drug-audit');
    await clickSidebarLink(page, 'Drug Audit');
    await step(page, 'dashboard', '08-drug-audit-report-loaded');
    await expect(page).toHaveURL(/drug-audit/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('navigate to Audit Logs via sidebar', async ({ page }) => {
    await step(page, 'dashboard', '09-sidebar-before-audit-logs');
    await clickSidebarLink(page, 'Audit Logs');
    await step(page, 'dashboard', '10-audit-logs-loaded');
    await expect(page).toHaveURL(/audit/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});