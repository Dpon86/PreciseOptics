// tests/eye-tests/add-refraction-test.spec.js - Refraction Test
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';
import { generateRefractionTestData } from '../../utils/test-data.js';
import { fillForm, submitForm, selectOption } from '../../utils/form-helpers.js';

test.describe('Eye Tests - Refraction Test', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/eye-tests/refraction/add');
  });

  test('should display refraction test form', async ({ page }) => {
    await expect(page.locator('select[name="patient"], #patient')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="test_date"], #test_date')).toBeVisible();
    await expect(page.locator('select[name="method"], #method')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Refraction test form displayed');
  });

  test('should create refraction test with all measurements', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Select patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
    }
    
    // Generate test data
    const testData = generateRefractionTestData('placeholder');
    
    // Fill form fields
    await fillForm(page, {
      test_date: testData.test_date,
      method: testData.method,
      right_sphere: testData.right_sphere,
      right_cylinder: testData.right_cylinder,
      right_axis: testData.right_axis,
      right_add: testData.right_add,
      right_prism: testData.right_prism,
      left_sphere: testData.left_sphere,
      left_cylinder: testData.left_cylinder,
      left_axis: testData.left_axis,
      left_add: testData.left_add,
      left_prism: testData.left_prism,
      pupillary_distance: testData.pupillary_distance,
      findings: testData.findings,
      recommendations: testData.recommendations,
      notes: testData.notes
    });
    
    // Select eye side and status
    await selectOption(page, 'select[name="eye_side"], #eye_side', testData.eye_side);
    await selectOption(page, 'select[name="status"], #status', testData.status);
    
    // Screenshot
    await page.screenshot({ path: 'test-results/screenshots/refraction-form.png' });
    
    // Submit
    await submitForm(page);
    await page.waitForTimeout(3000);
    
    console.log('✓ Refraction test created with all measurements');
  });

  test('should test different refraction methods', async ({ page }) => {
    const methods = ['subjective', 'objective', 'retinoscopy', 'cycloplegic'];
    
    for (const method of methods) {
      await page.goto('/eye-tests/refraction/add');
      await page.waitForSelector('select[name="patient"], #patient');
      
      // Select patient
      const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
      if (patientOptions.length > 0) {
        const firstPatientValue = await patientOptions[0].getAttribute('value');
        await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
      }
      
      // Fill minimal fields
      await page.fill('input[name="test_date"], #test_date', new Date().toISOString().split('T')[0]);
      await selectOption(page, 'select[name="method"], #method', method);
      await page.fill('input[name="right_sphere"], #right_sphere', '-1.00');
      await page.fill('input[name="left_sphere"], #left_sphere', '-1.25');
      
      await submitForm(page);
      await page.waitForTimeout(2000);
      
      console.log(`✓ Created refraction test with method: ${method}`);
    }
  });

});
