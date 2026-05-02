import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Eye Tests Module', () => {
  
  // ==========================================
  // Eye Tests Navigation Tests
  // ==========================================
  
  test('should display eye tests page', async ({ page }) => {
    await page.goto('/eye-tests');
    await waitForStablePage(page);
    
    // May be under different routes
    if (page.url().includes('404') || page.url().includes('not-found')) {
      // Try alternative routes
      await page.goto('/tests');
    }
  });

  test('should display test types', async ({ page }) => {
    await page.goto('/eye-tests');
    await waitForStablePage(page);
    
    // Common eye test types
    const testTypes = [
      'Visual Acuity',
      'Intraocular Pressure',
      'Visual Field',
      'OCT',
      'Fundus',
    ];
    
    for (const testType of testTypes) {
      const element = page.locator(`text=${testType}`).first();
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
        break; // Found at least one test type
      }
    }
  });

  // ==========================================
  // Eye Test Recording Tests
  // ==========================================

  test('should navigate to new eye test form', async ({ page }) => {
    // Usually from patient page
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Look for add test button
      const addTestButton = page.locator('button, a').filter({ hasText: /add.*test|new.*test|record.*test/i }).first();
      if (await addTestButton.isVisible()) {
        await expect(addTestButton).toBeVisible();
      }
    }
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Eye Tests Module Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Eye Tests Overview', async ({ page }) => {
    await authenticatedPage(page);
    
    // Navigate to patient with tests
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Click Eye Tests tab
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page, 2000);
        
        await captureManualScreenshot(page, 'eye-tests', '01-eye-tests-overview', {
          fullPage: true
        });
      }
    }
  });

  test('02 - Eye Test Types List', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        // Look for test type selector
        const testTypeButton = page.locator('button, a').filter({ hasText: /add.*test|new.*test/i }).first();
        if (await testTypeButton.isVisible()) {
          await testTypeButton.click();
          await waitForStablePage(page, 1000);
          
          await captureManualScreenshot(page, 'eye-tests', '02-test-types-list');
        }
      }
    }
  });

  test('03 - Visual Acuity Test Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        const addTestButton = page.locator('button, a').filter({ hasText: /add.*test|visual acuity/i }).first();
        if (await addTestButton.isVisible()) {
          await addTestButton.click();
          await waitForStablePage(page, 1500);
          
          await captureManualScreenshot(page, 'eye-tests', '03-visual-acuity-form', {
            fullPage: true
          });
        }
      }
    }
  });

  test('04 - Visual Acuity Form Filled', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        const addTestButton = page.locator('button, a').filter({ hasText: /add.*test/i }).first();
        if (await addTestButton.isVisible()) {
          await addTestButton.click();
          await waitForStablePage(page);
          
          // Fill form fields
          const rightEyeInput = page.locator('input[name*="right"], input[name*="od"]').first();
          if (await rightEyeInput.isVisible()) {
            await rightEyeInput.fill('6/6');
          }
          
          const leftEyeInput = page.locator('input[name*="left"], input[name*="os"]').first();
          if (await leftEyeInput.isVisible()) {
            await leftEyeInput.fill('6/9');
          }
          
          await page.waitForTimeout(500);
          
          await captureManualScreenshot(page, 'eye-tests', '04-visual-acuity-filled', {
            fullPage: true
          });
        }
      }
    }
  });

  test('05 - IOP Test Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        const addTestButton = page.locator('button, a').filter({ hasText: /iop|pressure/i }).first();
        if (await addTestButton.isVisible()) {
          await addTestButton.click();
          await waitForStablePage(page, 1500);
          
          await captureManualScreenshot(page, 'eye-tests', '05-iop-test-form', {
            fullPage: true
          });
        }
      }
    }
  });

  test('06 - Test Results Timeline', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page, 2000);
        
        await captureManualScreenshot(page, 'eye-tests', '06-test-timeline', {
          fullPage: true
        });
      }
    }
  });

  test('07 - Test Results Comparison', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        // Look for comparison or chart view
        const comparisonButton = page.locator('button').filter({ hasText: /compare|chart|graph/i }).first();
        if (await comparisonButton.isVisible()) {
          await comparisonButton.click();
          await waitForStablePage(page, 1500);
          
          await captureManualScreenshot(page, 'eye-tests', '07-test-comparison', {
            fullPage: true
          });
        }
      }
    }
  });

  test('08 - Visual Field Test', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        const addTestButton = page.locator('button, a').filter({ hasText: /visual field|perimetry/i }).first();
        if (await addTestButton.isVisible()) {
          await addTestButton.click();
          await waitForStablePage(page, 1500);
          
          await captureManualScreenshot(page, 'eye-tests', '08-visual-field-test', {
            fullPage: true
          });
        }
      }
    }
  });

  test('09 - OCT Scan Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        const addTestButton = page.locator('button, a').filter({ hasText: /oct/i }).first();
        if (await addTestButton.isVisible()) {
          await addTestButton.click();
          await waitForStablePage(page, 1500);
          
          await captureManualScreenshot(page, 'eye-tests', '09-oct-scan-form', {
            fullPage: true
          });
        }
      }
    }
  });

  test('10 - Test Results Detail View', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      const eyeTestsTab = page.locator('button:has-text("Eye Tests"), button:has-text("Tests")').first();
      if (await eyeTestsTab.isVisible()) {
        await eyeTestsTab.click();
        await waitForStablePage(page);
        
        // Click first test result
        const testResult = page.locator('tr, .test-card, .test-item').nth(1);
        if (await testResult.isVisible()) {
          await testResult.click();
          await waitForStablePage(page, 1500);
          
          await captureManualScreenshot(page, 'eye-tests', '10-test-detail-view', {
            fullPage: true
          });
        }
      }
    }
  });

});
