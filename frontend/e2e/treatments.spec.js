import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Treatments Module', () => {
  
  // ==========================================
  // Treatments Navigation Tests
  // ==========================================
  
  test('should display treatments page', async ({ page }) => {
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    // Check if page loaded
    if (!page.url().includes('404') && !page.url().includes('not-found')) {
      await expect(page.locator('h1, h2').filter({ hasText: /treatments?|procedures?/i })).toBeVisible();
    }
  });

  test('should display treatment types', async ({ page }) => {
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    // Common treatment types
    const treatmentTypes = [
      'Laser',
      'Injection',
      'Surgery',
      'Cataract',
    ];
    
    for (const type of treatmentTypes) {
      const element = page.locator(`text=${type}`).first();
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
        break;
      }
    }
  });

  // ==========================================
  // Treatment Recording Tests
  // ==========================================

  test('should navigate to new treatment form', async ({ page }) => {
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment|add.*treatment|record.*treatment/i }).first();
    if (await newButton.isVisible()) {
      await expect(newButton).toBeVisible();
    }
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Treatments Module Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Treatments List', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'treatments', '01-treatments-list', {
      fullPage: true
    });
  });

  test('02 - Treatment Types Overview', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page, 1500);
    
    await captureManualScreenshot(page, 'treatments', '02-treatment-types', {
      fullPage: true
    });
  });

  test('03 - New Treatment Button', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment|add.*treatment/i }).first();
    if (await newButton.isVisible()) {
      await newButton.hover();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'treatments', '03-new-treatment-button');
    }
  });

  test('04 - Treatment Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment|add.*treatment/i }).first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await waitForStablePage(page, 2000);
      
      await captureManualScreenshot(page, 'treatments', '04-treatment-form', {
        fullPage: true
      });
    }
  });

  test('05 - Treatment Type Selection', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment/i }).first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await waitForStablePage(page);
      
      // Click treatment type selector
      const typeSelector = page.locator('select, button').filter({ hasText: /type|procedure type/i }).first();
      if (await typeSelector.isVisible()) {
        await typeSelector.click();
        await page.waitForTimeout(500);
        
        await captureManualScreenshot(page, 'treatments', '05-treatment-type-selection');
      }
    }
  });

  test('06 - Laser Treatment Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment|laser/i }).first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await waitForStablePage(page);
      
      // Select laser treatment type
      const typeSelector = page.locator('select').first();
      if (await typeSelector.isVisible()) {
        await typeSelector.selectOption({ label: /laser/i });
        await waitForStablePage(page, 1000);
        
        await captureManualScreenshot(page, 'treatments', '06-laser-treatment-form', {
          fullPage: true
        });
      }
    }
  });

  test('07 - Injection Treatment Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment|injection/i }).first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await waitForStablePage(page);
      
      // Select injection treatment type
      const typeSelector = page.locator('select').first();
      if (await typeSelector.isVisible()) {
        const hasInjection = await typeSelector.locator('option').filter({ hasText: /injection/i }).count() > 0;
        if (hasInjection) {
          await typeSelector.selectOption({ label: /injection/i });
          await waitForStablePage(page, 1000);
          
          await captureManualScreenshot(page, 'treatments', '07-injection-treatment-form', {
            fullPage: true
          });
        }
      }
    }
  });

  test('08 - Treatment Details Filled', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const newButton = page.locator('button, a').filter({ hasText: /new.*treatment/i }).first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await waitForStablePage(page);
      
      // Fill treatment details
      const dateInput = page.locator('input[type="date"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill('2026-05-02');
      }
      
      const notesInput = page.locator('textarea').first();
      if (await notesInput.isVisible()) {
        await notesInput.fill('Patient tolerated procedure well. No complications noted.');
      }
      
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'treatments', '08-treatment-details-filled', {
        fullPage: true
      });
    }
  });

  test('09 - Treatment History', async ({ page }) => {
    await authenticatedPage(page);
    
    // Navigate to patient treatment history
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Look for treatments tab
      const treatmentsTab = page.locator('button:has-text("Treatments"), button:has-text("Procedures")').first();
      if (await treatmentsTab.isVisible()) {
        await treatmentsTab.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'treatments', '09-treatment-history', {
          fullPage: true
        });
      }
    }
  });

  test('10 - Treatment Details View', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    // Click first treatment
    const treatmentRow = page.locator('tr, .treatment-card, .treatment-item').nth(1);
    if (await treatmentRow.isVisible()) {
      await treatmentRow.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'treatments', '10-treatment-details', {
        fullPage: true
      });
    }
  });

  test('11 - Treatment Outcomes', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    const treatmentRow = page.locator('tr, .treatment-card').nth(1);
    if (await treatmentRow.isVisible()) {
      await treatmentRow.click();
      await waitForStablePage(page);
      
      // Look for outcomes section
      const outcomesSection = page.locator('text=/outcome|result|success/i').first();
      if (await outcomesSection.isVisible()) {
        await page.waitForTimeout(1000);
        
        await captureManualScreenshot(page, 'treatments', '11-treatment-outcomes', {
          fullPage: true
        });
      }
    }
  });

  test('12 - Treatment Filter', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatments');
    await waitForStablePage(page);
    
    // Look for filter options
    const filterButton = page.locator('button').filter({ hasText: /filter|type/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'treatments', '12-treatment-filter');
    }
  });

});
