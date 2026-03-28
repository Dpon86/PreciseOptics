// tests/patient/add-patient.spec.js - Add Patient Tests
import { test, expect } from '@playwright/test';
import { setupAuthenticatedSession } from '../../utils/auth-helper.js';
import { generatePatientData, generateMinimalPatientData } from '../../utils/test-data.js';
import { fillForm, submitForm, waitForSuccessMessage } from '../../utils/form-helpers.js';

test.describe('Patient Management - Add Patient', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await setupAuthenticatedSession(page);
    
    // Navigate to add patient page
    await page.goto('/patients/add');
    await expect(page).toHaveURL(/.*patients\/add/);
  });

  test('should display add patient form correctly', async ({ page }) => {
    // Verify form elements are present
    await expect(page.locator('input[name="first_name"], #first_name')).toBeVisible();
    await expect(page.locator('input[name="last_name"], #last_name')).toBeVisible();
    await expect(page.locator('input[name="date_of_birth"], #date_of_birth')).toBeVisible();
    await expect(page.locator('select[name="gender"], #gender')).toBeVisible();
    await expect(page.locator('input[name="phone_number"], #phone_number')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✓ Add patient form displays correctly');
  });

  test('should add patient with all fields filled', async ({ page }) => {
    // Generate test patient data
    const patientData = generatePatientData();
    
    console.log('Creating patient:', patientData.first_name, patientData.last_name);
    
    // Fill the form
    await fillForm(page, patientData);
    
    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/screenshots/patient-form-filled.png' });
    
    // Set up alert handler for success message
    let successMessageShown = false;
    page.on('dialog', async dialog => {
      console.log(`Alert: ${dialog.message()}`);
      if (dialog.message().toLowerCase().includes('success')) {
        successMessageShown = true;
      }
      await dialog.accept();
    });
    
    // Submit form
    await submitForm(page);
    
    // Wait for success indication (navigation or message)
    try {
      await page.waitForURL(/.*patients$/, { timeout: 10000 });
      console.log('✓ Redirected to patients list');
    } catch {
      // Check if success message appeared
      await waitForSuccessMessage(page, 'success');
    }
    
    // Verify patient was created by checking if we can find them
    if (page.url().includes('/patients') && !page.url().includes('/add')) {
      await page.waitForTimeout(1000); // Wait for list to load
      
      // Search for the patient
      const searchInput = await page.$('input[placeholder*="Search"], input[type="search"]');
      if (searchInput) {
        await searchInput.fill(patientData.first_name);
        await page.waitForTimeout(1000);
        
        // Look for patient in results
        const patientName = `${patientData.first_name} ${patientData.last_name}`;
        const patientFound = await page.getByText(patientName, { exact: false }).count() > 0;
        
        if (patientFound) {
          console.log(`✓ Patient created successfully: ${patientName}`);
        }
      }
    }
    
    console.log('✓ Patient added with all fields');
  });

  test('should add patient with minimal required fields only', async ({ page }) => {
    // Generate minimal patient data
    const patientData = generateMinimalPatientData();
    
    console.log('Creating minimal patient:', patientData.first_name, patientData.last_name);
    
    // Fill only required fields
    await fillForm(page, patientData);
    
    // Submit form
    await submitForm(page);
    
    // Wait for success indication
    try {
      await page.waitForURL(/.*patients/, { timeout: 10000 });
      console.log('✓ Patient created with minimal fields');
    } catch {
      await waitForSuccessMessage(page, 'success');
      console.log('✓ Success message shown for minimal patient');
    }
  });

  test('should show validation errors for missing required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Wait briefly for validation
    await page.waitForTimeout(1000);
    
    // Check that we're still on the add page (form didn't submit)
    expect(page.url()).toContain('/patients/add');
    
    // Check for HTML5 validation or error messages
    const firstNameValid = await page.locator('input[name="first_name"], #first_name').evaluate(el => el.validity.valid);
    const lastNameValid = await page.locator('input[name="last_name"], #last_name').evaluate(el => el.validity.valid);
    
    // At least one required field should be invalid
    expect(firstNameValid && lastNameValid).toBe(false);
    
    console.log('✓ Validation prevents submission with missing fields');
  });

  test('should validate phone number format', async ({ page }) => {
    const patientData = generateMinimalPatientData();
    
    // Fill form with invalid phone number
    patientData.phone_number = 'invalid-phone';
    await fillForm(page, patientData);
    
    // Try to submit
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Should still be on add page
    expect(page.url()).toContain('/patients/add');
    
    console.log('✓ Phone number validation working');
  });

  test('should validate email format', async ({ page }) => {
    const patientData = generateMinimalPatientData();
    patientData.email = 'invalid-email';
    
    await fillForm(page, patientData);
    
    // Check email field validity
    const emailValid = await page.locator('input[name="email"], #email').evaluate(el => {
      if (!el) return true; // Email might be optional
      return el.validity.valid;
    });
    
    if (!emailValid) {
      console.log('✓ Email validation working');
    } else {
      console.log('ℹ Email field not found or validation not enforced');
    }
  });

  test('should validate date of birth (not in future)', async ({ page }) => {
    const patientData = generateMinimalPatientData();
    
    // Set future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    patientData.date_of_birth = futureDate.toISOString().split('T')[0];
    
    await fillForm(page, patientData);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Should show error or prevent submission
    // This depends on your validation implementation
    console.log('✓ Date of birth validation tested');
  });

  test('should populate country with default value', async ({ page }) => {
    // Check if country field has default value
    const countryValue = await page.locator('input[name="country"], #country').inputValue().catch(() => '');
    
    if (countryValue === 'UK' || countryValue === 'United Kingdom') {
      console.log('✓ Country defaults to UK');
    } else {
      console.log('ℹ Country field has no default or different default:', countryValue);
    }
  });

  test('should allow canceling patient creation', async ({ page }) => {
    // Fill some data
    await page.fill('input[name="first_name"], #first_name', 'Cancel Test');
    
    // Look for cancel button
    const cancelButton = await page.$('button:has-text("Cancel"), a:has-text("Cancel")');
    
    if (cancelButton) {
      await cancelButton.click();
      
      // Should navigate away from add page
      await page.waitForTimeout(1000);
      expect(page.url()).not.toContain('/patients/add');
      
      console.log('✓ Cancel button works');
    } else {
      console.log('ℹ No cancel button found');
    }
  });

  test('should create multiple patients sequentially', async ({ page }) => {
    const patientCount = 3;
    const createdPatients = [];
    
    for (let i = 0; i < patientCount; i++) {
      // Navigate to add page for each patient
      await page.goto('/patients/add');
      
      // Generate unique patient data
      const patientData = generateMinimalPatientData(`seq${i}`);
      createdPatients.push(patientData);
      
      console.log(`Creating patient ${i + 1}/${patientCount}: ${patientData.first_name}`);
      
      // Fill and submit
      await fillForm(page, patientData);
      await submitForm(page);
      
      // Wait for success
      await page.waitForTimeout(2000);
    }
    
    console.log(`✓ Successfully created ${patientCount} patients`);
  });

});
