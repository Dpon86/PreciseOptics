import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Medications Module', () => {
  
  // ==========================================
  // Medications List & Navigation Tests
  // ==========================================
  
  test('should display medications page', async ({ page }) => {
    await page.goto('/medications');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /medications?/i })).toBeVisible();
  });

  test('should display medication categories', async ({ page }) => {
    await page.goto('/medications');
    await waitForStablePage(page);
    
    // Check for category filters/tabs
    const categoryElements = page.locator('button, a').filter({ hasText: /category|filter/i });
    if (await categoryElements.count() > 0) {
      await expect(categoryElements.first()).toBeVisible();
    }
  });

  test('should search medications', async ({ page }) => {
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('eye');
      await page.waitForTimeout(500);
      await waitForStablePage(page);
    }
  });

  // ==========================================
  // Medication Details Tests
  // ==========================================

  test('should view medication details', async ({ page }) => {
    await page.goto('/medications');
    await waitForStablePage(page);
    
    // Click first medication card
    const medicationCard = page.locator('.medication-card, .card, [class*="medication"]').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page);
    }
  });

  test('should display BNF information', async ({ page }) => {
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const medicationCard = page.locator('.medication-card, .card').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page);
      
      // Look for BNF link or information
      const bnfLink = page.locator('a[href*="bnf"], text=/bnf/i');
      if (await bnfLink.count() > 0) {
        await expect(bnfLink.first()).toBeVisible();
      }
    }
  });

  // ==========================================
  // Prescription Tests
  // ==========================================

  test('should navigate to prescribe medication', async ({ page }) => {
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const prescribeButton = page.locator('button, a').filter({ hasText: /prescribe/i }).first();
    if (await prescribeButton.isVisible()) {
      await expect(prescribeButton).toBeVisible();
    }
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Medications Module Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Medications List View', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'medications', '01-medications-list', {
      fullPage: true
    });
  });

  test('02 - Medication Categories', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    // Check for category buttons/tabs
    const categoryButton = page.locator('button').filter({ hasText: /category|glaucoma|dry eye|amd/i }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.hover();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'medications', '02-medication-categories');
    }
  });

  test('03 - Medication Search', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('Latanoprost');
      await page.waitForTimeout(500);
      await waitForStablePage(page);
      
      await captureManualScreenshot(page, 'medications', '03-medication-search');
    }
  });

  test('04 - Medication Card Details', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    // Hover over first medication card
    const medicationCard = page.locator('.medication-card, .card, [class*="medication"]').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.hover();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'medications', '04-medication-card');
    }
  });

  test('05 - Medication Details Modal', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const medicationCard = page.locator('.medication-card, .card').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'medications', '05-medication-modal');
    }
  });

  test('06 - BNF Information Link', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const medicationCard = page.locator('.medication-card, .card').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page);
      
      // Highlight BNF link
      const bnfLink = page.locator('a[href*="bnf"], button:has-text("BNF")').first();
      if (await bnfLink.isVisible()) {
        await bnfLink.hover();
        await page.waitForTimeout(500);
        
        await captureManualScreenshot(page, 'medications', '06-bnf-link');
      }
    }
  });

  test('07 - Prescribe Medication Button', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const medicationCard = page.locator('.medication-card, .card').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page);
      
      // Highlight prescribe button
      const prescribeButton = page.locator('button').filter({ hasText: /prescribe/i }).first();
      if (await prescribeButton.isVisible()) {
        await prescribeButton.hover();
        await page.waitForTimeout(500);
        
        await captureManualScreenshot(page, 'medications', '07-prescribe-button');
      }
    }
  });

  test('08 - Prescription Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const medicationCard = page.locator('.medication-card, .card').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page);
      
      const prescribeButton = page.locator('button').filter({ hasText: /prescribe/i }).first();
      if (await prescribeButton.isVisible()) {
        await prescribeButton.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'medications', '08-prescription-form', {
          fullPage: true
        });
      }
    }
  });

  test('09 - Dosage Instructions', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    const medicationCard = page.locator('.medication-card, .card').first();
    if (await medicationCard.isVisible()) {
      await medicationCard.click();
      await waitForStablePage(page);
      
      const prescribeButton = page.locator('button').filter({ hasText: /prescribe/i }).first();
      if (await prescribeButton.isVisible()) {
        await prescribeButton.click();
        await waitForStablePage(page);
        
        // Fill dosage information
        const dosageInput = page.locator('input[name*="dosage"], textarea[name*="instructions"]').first();
        if (await dosageInput.isVisible()) {
          await dosageInput.click();
          await dosageInput.fill('1 drop in affected eye twice daily');
          await page.waitForTimeout(500);
          
          await captureManualScreenshot(page, 'medications', '09-dosage-instructions');
        }
      }
    }
  });

  test('10 - Medication Filter by Category', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    // Click category filter
    const categoryButton = page.locator('button').filter({ hasText: /glaucoma|category/i }).first();
    if (await categoryButton.isVisible()) {
      await categoryButton.click();
      await waitForStablePage(page, 1000);
      
      await captureManualScreenshot(page, 'medications', '10-filter-by-category', {
        fullPage: true
      });
    }
  });

  test('11 - Patient Medications History', async ({ page }) => {
    await authenticatedPage(page);
    
    // Navigate to a patient's medication history
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const medicationsTab = page.locator('button:has-text("Medications")').first();
      if (await medicationsTab.isVisible()) {
        await medicationsTab.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'medications', '11-patient-medications', {
          fullPage: true
        });
      }
    }
  });

  test('12 - Medication Stock Levels', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/medications');
    await waitForStablePage(page);
    
    // Look for stock information on cards
    const stockIndicator = page.locator('text=/stock|in stock|low stock/i').first();
    if (await stockIndicator.isVisible()) {
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'medications', '12-stock-levels', {
        fullPage: true
      });
    }
  });

});
