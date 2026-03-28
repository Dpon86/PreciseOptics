// tests/eye-tests/add-oct-scan.spec.js - OCT Scan Test
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';
import { generateOCTScanData } from '../../utils/test-data.js';
import { fillForm, submitForm, selectOption } from '../../utils/form-helpers.js';

test.describe('Eye Tests - OCT Scan', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/eye-tests/oct/add');
  });

  test('should display OCT scan form', async ({ page }) => {
    await expect(page.locator('select[name="patient"], #patient')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="test_date"], #test_date')).toBeVisible();
    await expect(page.locator('select[name="scan_type"], #scan_type')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ OCT Scan form displayed');
  });

  test('should create OCT scan with all measurements', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Select patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
    }
    
    // Generate test data
    const testData = generateOCTScanData('placeholder');
    
    // Fill form
    await fillForm(page, {
      test_date: testData.test_date,
      scan_type: testData.scan_type,
      machine_model: testData.machine_model,
      right_eye_central_thickness: testData.right_eye_central_thickness,
      left_eye_central_thickness: testData.left_eye_central_thickness,
      findings: testData.findings,
      recommendations: testData.recommendations,
      notes: testData.notes
    });
    
    // Select eye side and status
    await selectOption(page, 'select[name="eye_side"], #eye_side', testData.eye_side);
    await selectOption(page, 'select[name="status"], #status', testData.status);
    
    // Screenshot
    await page.screenshot({ path: 'test-results/screenshots/oct-scan-form.png' });
    
    // Submit
    await submitForm(page);
    await page.waitForTimeout(3000);
    
    console.log('✓ OCT Scan created');
  });

  test('should test different scan types', async ({ page }) => {
    const scanTypes = ['macula', 'optic_disc', 'rnfl', 'anterior_segment'];
    
    for (const scanType of scanTypes) {
      await page.goto('/eye-tests/oct/add');
      await page.waitForSelector('select[name="patient"], #patient');
      
      // Select patient
      const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
      if (patientOptions.length > 0) {
        const firstPatientValue = await patientOptions[0].getAttribute('value');
        await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
      }
      
      // Fill minimal fields
      await page.fill('input[name="test_date"], #test_date', new Date().toISOString().split('T')[0]);
      await selectOption(page, 'select[name="scan_type"], #scan_type', scanType);
      await page.fill('input[name="machine_model"], #machine_model', 'Heidelberg Spectralis');
      
      await submitForm(page);
      await page.waitForTimeout(2000);
      
      console.log(`✓ Created OCT scan: ${scanType}`);
    }
  });

});
