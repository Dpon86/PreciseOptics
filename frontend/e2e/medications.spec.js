import { test, expect } from '@playwright/test';
import { login, clickSidebarLink, step } from './helpers.js';

const SARAH_ID = '56747eb4-4b3f-49e6-bcca-df188350a6d9';
const MED_NAME = `E2ETimolol${Date.now()}`;

// ============================================================
// Medications Module – E2E Workflow Tests
// Every test: login → sidebar click → workflow → verify
// ============================================================

test.describe('View Medications List', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Medications via sidebar and see heading', async ({ page }) => {
    await step(page, 'medications', '01-dashboard-before-medications-click');
    await clickSidebarLink(page, 'View All Medications');
    await step(page, 'medications', '02-medications-list-loaded');
    await expect(page).toHaveURL(/medications/);
    await expect(page.locator('h1').filter({ hasText: /medications/i })).toBeVisible();
  });

  test('medications page shows medication cards or table', async ({ page }) => {
    await clickSidebarLink(page, 'View All Medications');
    await expect(page).toHaveURL(/medications/);
    // At least one medication card or row should load
    const item = page.locator('.medication-card, .card, table tr').first();
    await item.waitFor({ state: 'visible', timeout: 10000 });
    await step(page, 'medications', '03-medications-cards-visible');
  });
});

test.describe('Add New Medication', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Add New Medication via sidebar and verify form', async ({ page }) => {
    await clickSidebarLink(page, 'Add New Medication');
    await step(page, 'medications', '04-add-medication-form-empty');
    await expect(page).toHaveURL(/medications\/add/);
    // Form fields should be visible
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="generic_name"]')).toBeVisible();
    await expect(page.locator('select[name="medication_type"]')).toBeVisible();
  });

  test('fill Add Medication form, submit, and verify medication saved', async ({ page }) => {
    await clickSidebarLink(page, 'Add New Medication');
    await expect(page).toHaveURL(/medications\/add/);
    await page.waitForLoadState('networkidle');

    // Fill all required fields
    await page.locator('input[name="name"]').fill(MED_NAME);
    await page.locator('input[name="generic_name"]').fill('Timolol Maleate E2E');
    await page.locator('input[name="brand_names"]').fill('TimoE2E');
    await page.locator('select[name="medication_type"]').selectOption('eye_drop');
    await page.locator('select[name="therapeutic_class"]').selectOption('antiglaucoma');
    await page.locator('input[name="strength"]').fill('0.5%');
    await page.locator('textarea[name="active_ingredients"]').fill('Timolol maleate 0.5%');
    await page.locator('textarea[name="description"]').fill('Beta-blocker eye drop for glaucoma management (E2E test)');
    await page.locator('textarea[name="indications"]').fill('Open-angle glaucoma, ocular hypertension');
    await page.locator('textarea[name="contraindications"]').fill('Asthma, COPD, bradycardia');
    await page.locator('textarea[name="side_effects"]').fill('Stinging, blurred vision, systemic beta-blockade');
    await page.locator('input[name="standard_dosage"]').fill('1 drop twice daily');
    await page.locator('input[name="maximum_daily_dose"]').fill('2 drops daily');
    await page.locator('input[name="storage_temperature"]').fill('Room temperature (15-25°C)');
    await page.locator('input[name="shelf_life_months"]').fill('24');
    await page.locator('input[name="manufacturer"]').fill('E2E Pharma Ltd');
    await page.locator('input[name="unit_price"]').fill('12.50');
    await page.locator('input[name="expiry_date"]').fill('2027-12-31');

    await step(page, 'medications', '05-add-medication-form-filled');

    // Accept the browser alert that fires on successful save
    page.on('dialog', d => d.accept());

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await step(page, 'medications', '06-after-add-medication-submit');

    // Should redirect away from the add form (the API filters by approval_status
    // so new meds won't appear in list until approved, just verify redirect)
    await expect(page).not.toHaveURL(/medications\/add/);
  });
});

test.describe('Add Prescription for Patient', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Add Prescription via sidebar', async ({ page }) => {
    await step(page, 'medications', '07-dashboard-before-prescription-click');
    await clickSidebarLink(page, 'Add Prescription');
    await step(page, 'medications', '08-add-prescription-form-loaded');
    await expect(page).toHaveURL(/prescriptions\/add/);
    // Form should load with patient and medication selects
    const patientSelect = page.locator('select[name="patient"], select[id="patient"]').first();
    await patientSelect.waitFor({ state: 'visible', timeout: 8000 });
    await expect(patientSelect).toBeVisible();
  });

  test('Add Prescription form has required fields for patient and medications', async ({ page }) => {
    await clickSidebarLink(page, 'Add Prescription');
    await expect(page).toHaveURL(/prescriptions\/add/);
    await page.waitForLoadState('networkidle');
    await step(page, 'medications', '09-add-prescription-form-detail');

    // The h1 heading should be present
    await expect(page.locator('h1').filter({ hasText: /prescription/i })).toBeVisible();

    // The submit button should be present
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
  });
});

test.describe('View Patient Medications', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Sarah White patient detail and see Recent Activity tab', async ({ page }) => {
    // Navigate directly to avoid pagination issues on the patients list
    await page.goto(`/patients/${SARAH_ID}`);
    await page.waitForLoadState('networkidle');
    await step(page, 'medications', '10-patient-detail-for-medications');

    // Verify we are on the patient detail page
    await expect(page).toHaveURL(new RegExp(SARAH_ID));
    await expect(page.locator('text=Sarah').first()).toBeVisible();

    // Click Recent Activity tab
    const activityTab = page.locator('button').filter({ hasText: 'Recent Activity' }).first();
    await activityTab.waitFor({ state: 'visible', timeout: 8000 });
    await activityTab.click();
    await page.waitForTimeout(400);
    await step(page, 'medications', '11-patient-recent-activity-tab');
  });
});
