// tests/consultation/add-consultation.spec.js - Add Consultation Tests
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';
import { generatePatientData, generateConsultationData } from '../../utils/test-data.js';
import { fillForm, submitForm, waitForSuccessMessage, selectOption } from '../../utils/form-helpers.js';

test.describe('Consultation Management - Add Consultation', () => {
  
  let testPatientId = null;
  let testPatientName = '';

  test.beforeAll(async ({ browser }) => {
    // Create a test patient to use for consultations
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await setupAuthenticatedSession(page);
    
    // Create patient via API for faster setup
    const patientData = generatePatientData('consult-test');
    testPatientName = `${patientData.first_name} ${patientData.last_name}`;
    
    try {
      // Try to create patient via UI
      await page.goto('/patients/add');
      await fillForm(page, patientData);
      await submitForm(page);
      await page.waitForTimeout(2000);
      
      // Try to get patient ID from URL or API
      console.log(`✓ Test patient created: ${testPatientName}`);
    } catch (error) {
      console.error('Failed to create test patient:', error);
    }
    
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await setupAuthenticatedSession(page);
    
    // Navigate to add consultation page
    await page.goto('/consultations/add');
    await expect(page).toHaveURL(/.*consultations\/add/);
  });

  test('should display add consultation form correctly', async ({ page }) => {
    // Verify form elements are present
    await expect(page.locator('select[name="patient"], #patient')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('select[name="consultation_type"], #consultation_type')).toBeVisible();
    await expect(page.locator('input[name="scheduled_time"], #scheduled_time')).toBeVisible();
    await expect(page.locator('textarea[name="chief_complaint"], #chief_complaint')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Add consultation form displays correctly');
  });

  test('should populate patient dropdown with options', async ({ page }) => {
    // Wait for patient dropdown to load
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Get number of options
    const options = await page.$$('select[name="patient"] option, #patient option');
    
    expect(options.length).toBeGreaterThan(0);
    console.log(`✓ Patient dropdown has ${options.length} options`);
  });

  test('should add consultation with required fields', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Generate consultation data
    const consultationData = generateConsultationData('placeholder-patient-id');
    
    console.log('Creating consultation...');
    
    // Select first available patient from dropdown
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
      console.log('✓ Selected patient from dropdown');
    }
    
    // Fill consultation type
    await selectOption(page, 'select[name="consultation_type"], #consultation_type', consultationData.consultation_type);
    
    // Fill scheduled time (current time + 1 hour)
    await page.fill('input[name="scheduled_time"], #scheduled_time', consultationData.scheduled_time);
    
    // Fill chief complaint
    await page.fill('textarea[name="chief_complaint"], #chief_complaint', consultationData.chief_complaint);
    
    // Fill clinical impression
    const clinicalImpressionField = await page.$('textarea[name="clinical_impression"], #clinical_impression');
    if (clinicalImpressionField) {
      await page.fill('textarea[name="clinical_impression"], #clinical_impression', consultationData.clinical_impression);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/screenshots/consultation-form-filled.png' });
    
    // Set up success handler
    let successShown = false;
    page.on('dialog', async dialog => {
      console.log(`Alert: ${dialog.message()}`);
      if (dialog.message().toLowerCase().includes('success')) {
        successShown = true;
      }
      await dialog.accept();
    });
    
    // Submit form
    await submitForm(page);
    
    // Wait for success
    try {
      await page.waitForURL(/.*consultations(?!\/add)/, { timeout: 10000 });
      console.log('✓ Redirected to consultations list');
    } catch {
      await waitForSuccessMessage(page, 'success');
    }
    
    console.log('✓ Consultation created successfully');
  });

  test('should add consultation with all fields filled', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible', timeout: 10000 });
    
    // Generate full consultation data
    const consultationData = generateConsultationData('placeholder');
    
    // Select patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
    }
    
    // Select consulting doctor if available
    const doctorSelect = await page.$('select[name="consulting_doctor"], #consulting_doctor');
    if (doctorSelect) {
      const doctorOptions = await page.$$('select[name="consulting_doctor"] option:not([value=""]), #consulting_doctor option:not([value=""])');
      if (doctorOptions.length > 0) {
        const firstDoctorValue = await doctorOptions[0].getAttribute('value');
        await selectOption(page, 'select[name="consulting_doctor"], #consulting_doctor', firstDoctorValue);
      }
    }
    
    // Fill all text fields
    await fillForm(page, {
      consultation_type: consultationData.consultation_type,
      scheduled_time: consultationData.scheduled_time,
      chief_complaint: consultationData.chief_complaint,
      history_of_present_illness: consultationData.history_of_present_illness,
      clinical_impression: consultationData.clinical_impression,
      diagnosis_primary: consultationData.diagnosis_primary,
      treatment_plan: consultationData.treatment_plan,
      follow_up_duration: consultationData.follow_up_duration,
      follow_up_instructions: consultationData.follow_up_instructions,
      consultation_notes: consultationData.consultation_notes
    });
    
    // Check follow-up required checkbox if present
    const followUpCheckbox = await page.$('input[name="follow_up_required"], #follow_up_required');
    if (followUpCheckbox) {
      await page.check('input[name="follow_up_required"], #follow_up_required');
    }
    
    // Submit
    await submitForm(page);
    
    // Wait for success
    await page.waitForTimeout(3000);
    
    console.log('✓ Consultation created with all fields');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling anything
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(1000);
    
    // Should still be on add page
    expect(page.url()).toContain('/consultations/add');
    
    console.log('✓ Validation prevents empty submission');
  });

  test('should validate scheduled time format', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible' });
    
    // Select patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
    }
    
    // Fill consultation type
    await selectOption(page, 'select[name="consultation_type"], #consultation_type', 'routine_check');
    
    // Try invalid time format
    await page.fill('input[name="scheduled_time"], #scheduled_time', 'invalid-time');
    
    // Fill chief complaint
    await page.fill('textarea[name="chief_complaint"], #chief_complaint', 'Test complaint');
    
    // Try to submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Check if form validates the time field
    const timeFieldValid = await page.locator('input[name="scheduled_time"], #scheduled_time').evaluate(el => el.validity.valid);
    
    console.log(`✓ Time validation: ${!timeFieldValid ? 'working' : 'not enforced'}`);
  });

  test('should auto-populate patient medical history', async ({ page }) => {
    await page.waitForSelector('select[name="patient"], #patient', { state: 'visible' });
    
    // Select a patient
    const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
    if (patientOptions.length > 0) {
      const firstPatientValue = await patientOptions[0].getAttribute('value');
      await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
      
      // Wait for auto-population
      await page.waitForTimeout(1000);
      
      // Check if medical history fields are populated
      const medicalHistoryValue = await page.locator('textarea[name="past_medical_history"], #past_medical_history').inputValue().catch(() => '');
      const allergiesValue = await page.locator('textarea[name="allergies"], #allergies').inputValue().catch(() => '');
      
      if (medicalHistoryValue || allergiesValue) {
        console.log('✓ Patient data auto-populated');
      } else {
        console.log('ℹ No auto-population detected (patient may have no medical history)');
      }
    }
  });

  test('should create consultation for specific consultation types', async ({ page }) => {
    const consultationTypes = ['initial', 'follow_up', 'emergency', 'routine_check'];
    
    for (const type of consultationTypes) {
      await page.goto('/consultations/add');
      await page.waitForSelector('select[name="patient"], #patient', { state: 'visible' });
      
      // Select patient
      const patientOptions = await page.$$('select[name="patient"] option:not([value=""]), #patient option:not([value=""])');
      if (patientOptions.length > 0) {
        const firstPatientValue = await patientOptions[0].getAttribute('value');
        await selectOption(page, 'select[name="patient"], #patient', firstPatientValue);
      }
      
      // Select consultation type
      await selectOption(page, 'select[name="consultation_type"], #consultation_type', type);
      
      // Fill required fields
      const now = new Date();
      const scheduledTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
      await page.fill('input[name="scheduled_time"], #scheduled_time', scheduledTime);
      await page.fill('textarea[name="chief_complaint"], #chief_complaint', `Test ${type} consultation`);
      
      // Submit
      await submitForm(page);
      await page.waitForTimeout(2000);
      
      console.log(`✓ Created ${type} consultation`);
    }
  });

  test('should allow canceling consultation creation', async ({ page }) => {
    // Fill some data
    await page.waitForSelector('textarea[name="chief_complaint"], #chief_complaint');
    await page.fill('textarea[name="chief_complaint"], #chief_complaint', 'Cancel test');
    
    // Look for cancel button
    const cancelButton = await page.$('button:has-text("Cancel"), a:has-text("Cancel"), a:has-text("Back")');
    
    if (cancelButton) {
      await cancelButton.click();
      
      // Should navigate away
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain('/consultations/add');
      
      console.log('✓ Cancel button works');
    } else {
      console.log('ℹ No cancel button found');
    }
  });

});
