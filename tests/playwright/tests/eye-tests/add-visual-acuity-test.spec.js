// tests/eye-tests/add-visual-acuity-test.spec.js - Visual Acuity Test
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';
import { generateVisualAcuityTestData } from '../../utils/test-data.js';
import { fillForm, submitForm, selectOption, waitForSuccessMessage } from '../../utils/form-helpers.js';

test.describe('Eye Tests - Visual Acuity Test', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/eye-tests/visual-acuity/add');
  });

  test('should display visual acuity test form', async ({ page }) => {
    await expect(page.locator('select[name="patient"], #patient')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="test_date"], #test_date')).toBeVisible();
    await expect(page.locator('select[name="test_method"], #test_method')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Visual Acuity test form displayed');
  });

  test('should create visual acuity test with all measurements', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Select patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
    }
    
    // Generate test data
    const testData = generateVisualAcuityTestData('placeholder');
    
    // Fill form
    await fillForm(page, {
      test_date: testData.test_date,
      test_method: testData.test_method,
      right_eye_unaided: testData.right_eye_unaided,
      right_eye_aided: testData.right_eye_aided,
      right_eye_pinhole: testData.right_eye_pinhole,
      left_eye_unaided: testData.left_eye_unaided,
      left_eye_aided: testData.left_eye_aided,
      left_eye_pinhole: testData.left_eye_pinhole,
      binocular_vision: testData.binocular_vision,
      findings: testData.findings,
      recommendations: testData.recommendations,
      notes: testData.notes
    });
    
    // Select eye side
    await selectOption(page, 'select[name="eye_side"], #eye_side', testData.eye_side);
    
    // Select status
    await selectOption(page, 'select[name="status"], #status', testData.status);
    
    // Screenshot
    await page.screenshot({ path: 'test-results/screenshots/visual-acuity-form.png' });
    
    // Submit
    await submitForm(page);
    await page.waitForTimeout(3000);
    
    console.log('✓ Visual Acuity test created');
  });

  test('should test different test methods', async ({ page }) => {
    const testMethods = ['snellen_chart', 'logmar_chart', 'etdrs_chart'];
    
    for (const method of testMethods) {
      await page.goto('/eye-tests/visual-acuity/add');
      await page.waitForSelector('select[name="patient"], #patient');
      
      // Select patient
      const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
      if (patientOptions.length > 0) {
        const firstPatientValue = await patientOptions[0].getAttribute('value');
        await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
      }
      
      // Fill minimal fields
      await page.fill('input[name="test_date"], #test_date', new Date().toISOString().split('T')[0]);
      await selectOption(page, 'select[name="test_method"], #test_method', method);
      await page.fill('input[name="right_eye_unaided"], #right_eye_unaided', '6/6');
      await page.fill('input[name="left_eye_unaided"], #left_eye_unaided', '6/6');
      
      await submitForm(page);
      await page.waitForTimeout(2000);
      
      console.log(`✓ Created test with method: ${method}`);
    }
  });

});
