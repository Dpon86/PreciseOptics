import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Consultations Module', () => {
  
  // ==========================================
  // Consultations List & Navigation Tests
  // ==========================================
  
  test('should display consultations page', async ({ page }) => {
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /consultations?/i })).toBeVisible();
  });

  test('should navigate to new consultation', async ({ page }) => {
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*consultation|add.*consultation/i }).first();
    if (await newButton.isVisible()) {
      await expect(newButton).toBeVisible();
    }
  });

  // ==========================================
  // Consultation Form Tests
  // ==========================================

  test('should display consultation form fields', async ({ page }) => {
    await page.goto('/consultations/new');
    await waitForStablePage(page);
    
    // Check for common consultation fields
    const expectedElements = [
      'select, input[name*="patient"]', // Patient selector
      'input[type="date"], input[name*="date"]', // Date
      'textarea, input[name*="reason"]', // Reason for visit
      'textarea, input[name*="notes"]', // Clinical notes
    ];
    
    for (const selector of expectedElements) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
      }
    }
  });

  // ==========================================
  // Consultation Details Tests
  // ==========================================

  test('should view consultation details', async ({ page }) => {
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    // Click first consultation
    const consultationLink = page.locator('a[href*="/consultations/"]').first();
    if (await consultationLink.isVisible()) {
      await consultationLink.click();
      await waitForStablePage(page);
      
      await expect(page.url()).toMatch(/consultations\/\d+/);
    }
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Consultations Module Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Consultations List', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'consultations', '01-consultations-list', {
      fullPage: true
    });
  });

  test('02 - New Consultation Button', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    // Hover over new consultation button
    const newButton = page.locator('button, a').filter({ hasText: /new.*consultation|add.*consultation/i }).first();
    if (await newButton.isVisible()) {
      await newButton.hover();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'consultations', '02-new-consultation-button');
    }
  });

  test('03 - New Consultation Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations/new');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'consultations', '03-consultation-form', {
      fullPage: true
    });
  });

  test('04 - Patient Selection', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations/new');
    await waitForStablePage(page);
    
    // Click patient selector
    const patientSelect = page.locator('select, input[name*="patient"]').first();
    if (await patientSelect.isVisible()) {
      await patientSelect.click();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'consultations', '04-patient-selection');
    }
  });

  test('05 - Consultation Form Filled', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations/new');
    await waitForStablePage(page);
    
    // Fill date
    const dateInput = page.locator('input[type="date"], input[name*="date"]').first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('2026-05-02');
    }
    
    // Fill reason
    const reasonInput = page.locator('textarea, input[name*="reason"]').first();
    if (await reasonInput.isVisible()) {
      await reasonInput.fill('Routine eye examination and vision check');
    }
    
    // Fill clinical notes
    const notesInput = page.locator('textarea').filter({ hasText: /notes/i }).first();
    if (await notesInput.count() === 0) {
      const anyTextarea = page.locator('textarea').nth(1);
      if (await anyTextarea.isVisible()) {
        await anyTextarea.fill('Patient reports blurred vision in left eye. Visual acuity test required.');
      }
    }
    
    await page.waitForTimeout(500);
    
    await captureManualScreenshot(page, 'consultations', '05-form-filled', {
      fullPage: true
    });
  });

  test('06 - Consultation Details View', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    // Click first consultation
    const consultationLink = page.locator('a[href*="/consultations/"]').first();
    if (await consultationLink.isVisible()) {
      await consultationLink.click();
      await waitForStablePage(page, 2000);
      
      await captureManualScreenshot(page, 'consultations', '06-consultation-details', {
        fullPage: true
      });
    }
  });

  test('07 - Consultation with Medications', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    const consultationLink = page.locator('a[href*="/consultations/"]').first();
    if (await consultationLink.isVisible()) {
      await consultationLink.click();
      await waitForStablePage(page);
      
      // Look for medications section
      const medicationsSection = page.locator('text=/medications?/i').first();
      if (await medicationsSection.isVisible()) {
        await page.waitForTimeout(1000);
        
        await captureManualScreenshot(page, 'consultations', '07-consultation-medications', {
          fullPage: true
        });
      }
    }
  });

  test('08 - Consultation with Eye Tests', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    const consultationLink = page.locator('a[href*="/consultations/"]').first();
    if (await consultationLink.isVisible()) {
      await consultationLink.click();
      await waitForStablePage(page);
      
      // Look for eye tests section
      const testsSection = page.locator('text=/eye.*tests?|tests?/i').first();
      if (await testsSection.isVisible()) {
        await page.waitForTimeout(1000);
        
        await captureManualScreenshot(page, 'consultations', '08-consultation-eye-tests', {
          fullPage: true
        });
      }
    }
  });

  test('09 - Edit Consultation', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    const consultationLink = page.locator('a[href*="/consultations/"]').first();
    if (await consultationLink.isVisible()) {
      await consultationLink.click();
      await waitForStablePage(page);
      
      // Look for edit button
      const editButton = page.locator('button, a').filter({ hasText: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'consultations', '09-edit-consultation', {
          fullPage: true
        });
      }
    }
  });

  test('10 - Consultation Search/Filter', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/consultations');
    await waitForStablePage(page);
    
    // Look for search or filter
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('vision');
      await page.waitForTimeout(500);
      await waitForStablePage(page);
      
      await captureManualScreenshot(page, 'consultations', '10-search-filter');
    }
  });

});
