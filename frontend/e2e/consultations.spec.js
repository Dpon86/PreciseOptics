import { test, expect } from '@playwright/test';
import { login, clickSidebarLink, step } from './helpers.js';

const SARAH_ID = '56747eb4-4b3f-49e6-bcca-df188350a6d9';

// ============================================================
// Consultations Module – E2E Workflow Tests
// Every test: login → sidebar click → workflow → verify
// ============================================================

test.describe('View Consultations List', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Consultations via sidebar and see list', async ({ page }) => {
    await step(page, 'consultations', '01-dashboard-before-consultations-click');
    await clickSidebarLink(page, 'View Consultations');
    await step(page, 'consultations', '02-consultations-list-loaded');
    await expect(page).toHaveURL(/consultations/);
    // A heading or list should be visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Add Consultation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Add Consultation via sidebar and verify form loads', async ({ page }) => {
    await clickSidebarLink(page, 'Add Consultation');
    await step(page, 'consultations', '03-add-consultation-form-empty');
    await expect(page).toHaveURL(/consultations\/add/);
    // Patient selector should be present
    const patientSelect = page.locator('select[name="patient"]').first();
    await patientSelect.waitFor({ state: 'visible', timeout: 8000 });
    await expect(patientSelect).toBeVisible();
  });

  test('fill Add Consultation form for Sarah White and submit', async ({ page }) => {
    await clickSidebarLink(page, 'Add Consultation');
    await expect(page).toHaveURL(/consultations\/add/);
    await page.waitForLoadState('networkidle');

    // Select patient (Sarah White by UUID or first available)
    const patientSelect = page.locator('select[name="patient"]').first();
    await patientSelect.waitFor({ state: 'visible', timeout: 8000 });
    const sarahOption = patientSelect.locator(`option[value="${SARAH_ID}"]`);
    if (await sarahOption.count() > 0) {
      await patientSelect.selectOption(SARAH_ID);
    } else {
      await patientSelect.selectOption({ index: 1 });
    }

    // Select consulting doctor/staff — required; auto-set if current user has a staff record,
    // otherwise pick the first available option
    const doctorSelect = page.locator('select[name="consulting_doctor"]').first();
    if (await doctorSelect.isVisible()) {
      const currentValue = await doctorSelect.inputValue();
      if (!currentValue) {
        await doctorSelect.selectOption({ index: 1 });
      }
    }

    // Select consultation type
    const consultationTypeSelect = page.locator('select[name="consultation_type"]').first();
    if (await consultationTypeSelect.isVisible()) {
      await consultationTypeSelect.selectOption('follow_up');
    }

    // Scheduled time
    const scheduledTime = page.locator('input[name="scheduled_time"], input[type="datetime-local"]').first();
    if (await scheduledTime.isVisible()) {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      await scheduledTime.fill(now.toISOString().slice(0, 16));
    }

    // Chief complaint
    const chiefComplaint = page.locator('textarea[name="chief_complaint"], input[name="chief_complaint"]').first();
    if (await chiefComplaint.isVisible()) {
      await chiefComplaint.fill('E2E test consultation - routine eye check');
    }

    await step(page, 'consultations', '04-add-consultation-form-filled');

    // Accept any success alert
    page.on('dialog', d => d.accept());

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await step(page, 'consultations', '05-after-add-consultation-submit');

    // Should navigate away from the add form
    await expect(page).not.toHaveURL(/consultations\/add$/);
  });
});

test.describe('View Consultation Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('click a consultation in the list and open its detail page', async ({ page }) => {
    await clickSidebarLink(page, 'View Consultations');
    await expect(page).toHaveURL(/consultations/);
    await step(page, 'consultations', '06-consultations-list-for-detail');

    // Click the first consultation detail link — exclude nav links like /add, /consultations (exact), etc.
    const firstLink = page.locator('main a[href*="/consultations/"], .consultation-card a, table a').filter({ hasNot: page.locator('[href="/consultations/add"], [href="/consultations"]') }).first();
    if (await firstLink.isVisible({ timeout: 6000 }).catch(() => false)) {
      await firstLink.click();
      await page.waitForLoadState('networkidle');
      await step(page, 'consultations', '07-consultation-detail-page');
      await expect(page).toHaveURL(/consultations\//);
    }
  });
});
