// utils/form-helpers.js - Form Interaction Helper Functions
import { expect } from '@playwright/test';

/**
 * Fill text input field
 */
export async function fillInput(page, selector, value) {
  if (!value) return;
  
  await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
  await page.fill(selector, String(value));
}

/**
 * Select option from dropdown
 */
export async function selectOption(page, selector, value) {
  if (!value) return;
  
  await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
  await page.selectOption(selector, value);
}

/**
 * Check/uncheck checkbox
 */
export async function setCheckbox(page, selector, checked = true) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
  
  if (checked) {
    await page.check(selector);
  } else {
    await page.uncheck(selector);
  }
}

/**
 * Fill entire form based on data object
 * Automatically handles different input types
 */
export async function fillForm(page, formData, fieldMapping = {}) {
  for (const [key, value] of Object.entries(formData)) {
    if (!value && value !== false && value !== 0) continue;
    
    // Get the selector (either from mapping or use default)
    const selector = fieldMapping[key] || `[name="${key}"], #${key}`;
    
    try {
      // Check if element exists
      const element = await page.$(selector);
      if (!element) {
        console.warn(`Field not found: ${key} (selector: ${selector})`);
        continue;
      }
      
      // Get element type
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const inputType = await element.evaluate(el => el.type);
      
      // Handle different input types
      if (tagName === 'select') {
        await selectOption(page, selector, value);
      } else if (inputType === 'checkbox') {
        await setCheckbox(page, selector, value);
      } else if (inputType === 'radio') {
        await page.check(`${selector}[value="${value}"]`);
      } else {
        await fillInput(page, selector, value);
      }
      
      console.log(`Filled ${key}: ${value}`);
    } catch (error) {
      console.error(`Error filling ${key}:`, error.message);
    }
  }
}

/**
 * Submit form and wait for response
 */
export async function submitForm(page, submitButtonSelector = 'button[type="submit"]', waitForNavigation = true) {
  console.log('Submitting form...');
  
  // Wait for submit button to be enabled
  await page.waitForSelector(submitButtonSelector, { state: 'visible', timeout: 5000 });
  
  if (waitForNavigation) {
    // Wait for navigation or network request
    await Promise.all([
      page.waitForResponse(response => response.status() === 200 || response.status() === 201, { timeout: 15000 }).catch(() => null),
      page.click(submitButtonSelector)
    ]);
  } else {
    await page.click(submitButtonSelector);
  }
  
  console.log('Form submitted');
}

/**
 * Wait for success message or notification
 */
export async function waitForSuccessMessage(page, message = 'success', timeout = 10000) {
  try {
    // Check for alert dialog
    page.once('dialog', async dialog => {
      console.log(`Success dialog: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Wait for success message in DOM
    await page.waitForSelector(`.success-message, .alert-success, :has-text("${message}")`, { 
      state: 'visible',
      timeout 
    });
    
    console.log('Success message detected');
    return true;
  } catch (error) {
    console.warn('No success message found');
    return false;
  }
}

/**
 * Check for form validation errors
 */
export async function checkForErrors(page) {
  const errors = await page.$$('.error-message, .field-error, .alert-danger, .text-danger');
  
  if (errors.length > 0) {
    const errorTexts = await Promise.all(errors.map(el => el.textContent()));
    console.error('Form validation errors found:', errorTexts);
    return errorTexts;
  }
  
  return [];
}

/**
 * Clear all form fields
 */
export async function clearForm(page, formSelector = 'form') {
  const inputs = await page.$$(`${formSelector} input[type="text"], ${formSelector} input[type="email"], ${formSelector} input[type="tel"], ${formSelector} textarea`);
  
  for (const input of inputs) {
    await input.fill('');
  }
  
  console.log('Form cleared');
}

/**
 * Get form values
 */
export async function getFormValues(page, formSelector = 'form') {
  return await page.evaluate((selector) => {
    const form = document.querySelector(selector);
    if (!form) return {};
    
    const formData = new FormData(form);
    const values = {};
    
    for (const [key, value] of formData.entries()) {
      values[key] = value;
    }
    
    return values;
  }, formSelector);
}

/**
 * Wait for form to be ready (all required fields loaded)
 */
export async function waitForFormReady(page, requiredFields = [], timeout = 10000) {
  console.log('Waiting for form to be ready...');
  
  for (const field of requiredFields) {
    await page.waitForSelector(`[name="${field}"], #${field}`, { 
      state: 'visible',
      timeout 
    });
  }
  
  console.log('Form is ready');
}
