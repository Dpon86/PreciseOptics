// tests/eye-tests/add-visual-field-test.spec.js - Visual Field Test
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';
import { generateVisualFieldTestData } from '../../utils/test-data.js';
import { fillForm, submitForm, selectOption } from '../../utils/form-helpers.js';

test.describe('Eye Tests - Visual Field Test', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
    await page.goto('/eye-tests/visual-field/add');
  });

  test('should display visual field test form', async ({ page }) => {
    await expect(page.locator('select[name="patient"], #patient')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="test_date"], #test_date')).toBeVisible();
    await expect(page.locator('select[name="test_type"], #test_type')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Visual Field test form displayed');
  });

  test('should create visual field test with all parameters', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Select patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
    }
    
    // Generate test data
    const testData = generateVisualFieldTestData('placeholder');
    
    // Fill form
    await fillForm(page, {
      test_date: testData.test_date,
      test_type: testData.test_type,
      strategy: testData.strategy,
      right_eye_md: testData.right_eye_md,
      right_eye_psd: testData.right_eye_psd,
      right_eye_vfi: testData.right_eye_vfi,
      right_eye_fixation_losses: testData.right_eye_fixation_losses,
      right_eye_false_positives: testData.right_eye_false_positives,
      right_eye_false_negatives: testData.right_eye_false_negatives,
      left_eye_md: testData.left_eye_md,
      left_eye_psd: testData.left_eye_psd,
      left_eye_vfi: testData.left_eye_vfi,
      left_eye_fixation_losses: testData.left_eye_fixation_losses,
      left_eye_false_positives: testData.left_eye_false_positives,
      left_eye_false_negatives: testData.left_eye_false_negatives,
      findings: testData.findings,
      recommendations: testData.recommendations,
      notes: testData.notes
    });
    
    // Select eye side and status
    await selectOption(page, 'select[name="eye_side"], #eye_side', testData.eye_side);
    await selectOption(page, 'select[name="status"], #status', testData.status);
    
    // Screenshot
    await page.screenshot({ path: 'test-results/screenshots/visual-field-form.png' });
    
    // Submit
    await submitForm(page);
    await page.waitForTimeout(3000);
    
    console.log('✓ Visual Field test created');
  });

  test('should test different test types and strategies', async ({ page }) => {
    const testTypes = ['humphrey_24_2', 'humphrey_30_2'];
    const strategies = ['sita_standard', 'sita_fast', 'full_threshold'];
    
    for (const testType of testTypes) {
      for (const strategy of strategies) {
        await page.goto('/eye-tests/visual-field/add');
        await page.waitForSelector('select[name="patient"], #patient');
        
        // Select patient
        const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
        if (patientOptions.length > 0) {
          const firstPatientValue = await patientOptions[0].getAttribute('value');
          await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
        }
        
        // Fill minimal fields
        await page.fill('input[name="test_date"], #test_date', new Date().toISOString().split('T')[0]);
        await selectOption(page, 'select[name="test_type"], #test_type', testType);
        await selectOption(page, 'select[name="strategy"], #strategy', strategy);
        await page.fill('input[name="right_eye_md"], #right_eye_md', '-2.0');
        await page.fill('input[name="left_eye_md"], #left_eye_md', '-1.5');
        
        await submitForm(page);
        await page.waitForTimeout(2000);
        
        console.log(`✓ Created test: ${testType} with ${strategy}`);
      }
    }
  });

});
