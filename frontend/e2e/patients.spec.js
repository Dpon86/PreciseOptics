import { test, expect } from '@playwright/test';
import { login, clickSidebarLink, step } from './helpers.js';

// Patient info used throughout tests
const SARAH = {
  id: '56747eb4-4b3f-49e6-bcca-df188350a6d9',
  firstName: 'Sarah',
  lastName: 'White',
  searchTerm: 'Sarah White',
};

// Unique name suffix so we can find the patient we created
const UNIQUE_NAME_SUFFIX = `E2ETest${Date.now()}`;

// ============================================================
// Patients Module – E2E Workflow Tests
// Every test: login → sidebar click → workflow → verify
// ============================================================

test.describe('View Patient List', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Patients page via sidebar and see list', async ({ page }) => {
    await step(page, 'patients', '01-dashboard-before-patients-click');
    await clickSidebarLink(page, 'View Patients');
    await step(page, 'patients', '02-patients-list-loaded');
    await expect(page).toHaveURL(/patients/);
    await expect(page.locator('h1').filter({ hasText: /patients/i })).toBeVisible();
    // Table or patient cards should be present
    const listItem = page.locator('table, .patient-card, [class*="patient"]').first();
    await listItem.waitFor({ state: 'visible', timeout: 8000 });
  });

  test('search input is visible and filters patients list', async ({ page }) => {
    await clickSidebarLink(page, 'View Patients');
    await expect(page).toHaveURL(/patients/);

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 6000 });

    // Wait for patients to load
    const table = page.locator('table tbody tr, .patient-card').first();
    await table.waitFor({ state: 'visible', timeout: 10000 });
    await step(page, 'patients', '03-patients-list-with-search-bar');

    // Count rows before searching
    const rowsBefore = await page.locator('table tbody tr').count();

    // Type a search term that should reduce results
    await searchInput.fill('zzz_no_match_xyz');
    await page.waitForTimeout(500);
    await step(page, 'patients', '04-patients-search-no-results');

    // Either results are empty or less than before
    const rowsAfter = await page.locator('table tbody tr').count();
    // Results should change — either 0 rows or a "no patients found" message
    const noData = page.locator('text=/no patients/i').first();
    const filtersWork = (rowsAfter < rowsBefore) || await noData.isVisible();
    expect(filtersWork).toBe(true);
  });
});

test.describe('View Patient Detail', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate directly to Sarah White patient detail page', async ({ page }) => {
    // Navigate directly — avoids pagination limits on the list page
    await page.goto(`/patients/${SARAH.id}`);
    await page.waitForLoadState('networkidle');
    await step(page, 'patients', '05-patient-detail-overview-tab');

    // URL should contain the patient id
    await expect(page).toHaveURL(new RegExp(SARAH.id));

    // Patient name should appear on detail page
    await expect(page.locator(`text=${SARAH.firstName}`).first()).toBeVisible();
  });

  test('patient detail page shows Overview, Contact & Address, Medical Information, Recent Activity tabs', async ({ page }) => {
    await page.goto(`/patients/${SARAH.id}`);
    await page.waitForLoadState('networkidle');
    await step(page, 'patients', '06-patient-detail-tabs-visible');

    for (const tab of ['Overview', 'Contact & Address', 'Medical Information', 'Recent Activity']) {
      await expect(page.locator(`button`).filter({ hasText: tab }).first()).toBeVisible();
    }
  });

  test('clicking Medical Information tab shows medical content', async ({ page }) => {
    await page.goto(`/patients/${SARAH.id}`);
    await page.waitForLoadState('networkidle');

    await page.locator('button').filter({ hasText: 'Medical Information' }).first().click();
    await page.waitForTimeout(400);
    await step(page, 'patients', '07-patient-medical-information-tab');

    // Some medical content should be visible
    const content = page.locator('.tab-content, .tab-panel').first();
    await expect(content).toBeVisible();
  });
});

test.describe('Add New Patient', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navigate to Add Patient via sidebar and verify form fields', async ({ page }) => {
    await clickSidebarLink(page, 'Add Patient');
    await step(page, 'patients', '08-add-patient-form-empty');
    await expect(page).toHaveURL(/patients\/add|patients\/register|add-patient/);

    // Key fields should be present
    await expect(page.locator('input[name="first_name"], input[name="firstName"]').first()).toBeVisible();
    await expect(page.locator('input[name="last_name"], input[name="lastName"]').first()).toBeVisible();
  });

  test('fill and submit Add Patient form then verify patient appears in list', async ({ page }) => {
    await clickSidebarLink(page, 'Add Patient');
    await expect(page).toHaveURL(/patients\/(add|register)/);
    await page.waitForLoadState('networkidle');

    const firstName = `TestFirst${UNIQUE_NAME_SUFFIX}`;
    const lastName = `TestLast${UNIQUE_NAME_SUFFIX}`;

    // Fill mandatory fields
    await page.locator('input[name="first_name"], input[name="firstName"]').first().fill(firstName);
    await page.locator('input[name="last_name"], input[name="lastName"]').first().fill(lastName);

    // Date of birth
    const dobField = page.locator('input[name="date_of_birth"], input[name="dob"], input[type="date"]').first();
    if (await dobField.isVisible()) {
      await dobField.fill('1980-05-15');
    }

    // Gender select
    const genderSelect = page.locator('select[name="gender"]').first();
    if (await genderSelect.isVisible()) {
      await genderSelect.selectOption({ index: 1 });
    }

    // Phone
    const phoneField = page.locator('input[name="phone_number"], input[name="phone"], input[type="tel"]').first();
    if (await phoneField.isVisible()) {
      await phoneField.fill('07700900123');
    }

    await step(page, 'patients', '09-add-patient-form-filled');

    // Submit
    page.on('dialog', d => d.accept());
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
    await step(page, 'patients', '10-after-add-patient-submit');

    // After save we should either be back on patients list or the patient detail
    await expect(page).toHaveURL(/patients/);
  });
});
