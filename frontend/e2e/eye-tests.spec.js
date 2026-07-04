import { test, expect } from '@playwright/test';
import { login, clickSidebarLink, step } from './helpers.js';

const SARAH_ID = '56747eb4-4b3f-49e6-bcca-df188350a6d9';

// ============================================================
// Eye Tests Module – E2E Workflow Tests
// Every test: login → sidebar click → workflow → verify
// ============================================================

test.describe('View Eye Tests List', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Eye Tests via sidebar and see list', async ({ page }) => {
    await step(page, 'eye-tests', '01-dashboard-before-eye-tests-click');
    await clickSidebarLink(page, 'View Eye Tests');
    await step(page, 'eye-tests', '02-eye-tests-list-loaded');
    await expect(page).toHaveURL(/eye-tests/);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });
});

test.describe('Add Visual Acuity Test', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Visual Acuity Test via sidebar and verify form loads', async ({ page }) => {
    await step(page, 'eye-tests', '03-dashboard-before-visual-acuity-click');
    await clickSidebarLink(page, 'Visual Acuity Test');
    await step(page, 'eye-tests', '04-visual-acuity-form-empty');
    await expect(page).toHaveURL(/visual-acuity/);
    // performed_by select must be present (no patient select — patient set via context)
    const performedBySelect = page.locator('select[name="performed_by"]').first();
    await performedBySelect.waitFor({ state: 'visible', timeout: 8000 });
    await expect(performedBySelect).toBeVisible();
  });

  test('fill Visual Acuity Test form for Sarah White and submit', async ({ page }) => {
    // Capture API response for debugging
    let apiStatus = null;
    let apiBody = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/visual-acuity-tests/') && response.request().method() === 'POST') {
        apiStatus = response.status();
        try { apiBody = await response.text(); } catch {}
      }
    });

    // Set selectedPatientId in sessionStorage so PatientContext restores Sarah on reload
    await page.evaluate((id) => sessionStorage.setItem('selectedPatientId', id), SARAH_ID);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Navigate to the Visual Acuity add form (no patientId route param needed — context has patient)
    await page.goto('/eye-tests/visual-acuity/add');
    await page.waitForLoadState('networkidle');
    await step(page, 'eye-tests', '05-visual-acuity-form-for-sarah');

    // performed_by is required — select the first available staff member
    const performedBySelect = page.locator('select[name="performed_by"]').first();
    await performedBySelect.waitFor({ state: 'visible', timeout: 8000 });
    await performedBySelect.selectOption({ index: 1 });

    // Test date (datetime-local)
    const testDate = page.locator('input[name="test_date"]').first();
    if (await testDate.isVisible()) {
      const now = new Date();
      now.setSeconds(0, 0);
      await testDate.fill(now.toISOString().slice(0, 16));
    }

    // Eye side
    const eyeSideSelect = page.locator('select[name="eye_side"]').first();
    if (await eyeSideSelect.isVisible()) {
      await eyeSideSelect.selectOption('both');
    }

    // Right eye unaided
    const rightUnaided = page.locator('input[name="right_eye_unaided"]').first();
    if (await rightUnaided.isVisible()) {
      await rightUnaided.fill('6/6');
    }

    // Left eye unaided
    const leftUnaided = page.locator('input[name="left_eye_unaided"]').first();
    if (await leftUnaided.isVisible()) {
      await leftUnaided.fill('6/9');
    }

    await step(page, 'eye-tests', '06-visual-acuity-form-filled');

    // Accept any success alert
    page.on('dialog', d => d.accept());

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await step(page, 'eye-tests', '07-after-visual-acuity-submit');
    console.log('API status:', apiStatus, 'body:', apiBody?.substring(0, 300));

    // Should navigate away from the add form after success
    await expect(page).not.toHaveURL(/visual-acuity\/add$/);
  });
});
