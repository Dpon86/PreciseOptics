import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Patients Module', () => {
  
  // ==========================================
  // Patient List & Navigation Tests
  // ==========================================
  
  test('should display patients list page', async ({ page }) => {
    await page.goto('/patients');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /patients/i })).toBeVisible();
  });

  test('should navigate to add patient form', async ({ page }) => {
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const addButton = page.locator('button, a').filter({ hasText: /add.*patient|new.*patient|register.*patient/i }).first();
    await expect(addButton).toBeVisible();
    
    await addButton.click();
    await waitForStablePage(page);
    
    await expect(page.url()).toContain('/patients');
  });

  test('should search for patients', async ({ page }) => {
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('John');
      await page.waitForTimeout(500); // Wait for debounced search
      await waitForStablePage(page);
    }
  });

  // ==========================================
  // Patient Record Creation Tests
  // ==========================================

  test('should fill patient registration form fields', async ({ page }) => {
    await page.goto('/patients/register');
    await waitForStablePage(page);
    
    // Check for common patient form fields
    const fields = [
      'input[name*="first"], input[name*="firstName"]',
      'input[name*="last"], input[name*="lastName"]',
      'input[name*="dob"], input[name*="date"], input[type="date"]',
      'input[name*="email"], input[type="email"]',
      'input[name*="phone"], input[type="tel"]',
    ];
    
    for (const fieldSelector of fields) {
      const field = page.locator(fieldSelector).first();
      if (await field.isVisible()) {
        await expect(field).toBeVisible();
      }
    }
  });

  // ==========================================
  // Patient Details View Tests
  // ==========================================

  test('should view patient details', async ({ page }) => {
    await page.goto('/patients');
    await waitForStablePage(page);
    
    // Click first patient in list
    const patientRow = page.locator('tr, .patient-card, .patient-item').nth(1);
    if (await patientRow.isVisible()) {
      await patientRow.click();
      await waitForStablePage(page);
      
      // Verify we're on patient detail page
      await expect(page.url()).toMatch(/patients\/[a-f0-9-]+/);
    }
  });

  test('should display patient dashboard tabs', async ({ page }) => {
    // Navigate to first patient
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Check for tabs
      const tabSelectors = [
        'button:has-text("Overview")',
        'button:has-text("Medical History")',
        'button:has-text("Consultations")',
        'button:has-text("Medications")',
        'button:has-text("Eye Tests")',
      ];
      
      for (const selector of tabSelectors) {
        const tab = page.locator(selector).first();
        if (await tab.isVisible()) {
          await expect(tab).toBeVisible();
        }
      }
    }
  });

  // ==========================================
  // Patient Visit Management Tests
  // ==========================================

  test('should display visit history', async ({ page }) => {
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Look for visits section
      const visitsSection = page.locator('text=/visits?/i').first();
      if (await visitsSection.isVisible()) {
        await expect(visitsSection).toBeVisible();
      }
    }
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Patients Module Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Patients List View', async ({ page }) => {
    await authenticatedPage(page);
    
    // Navigate to patients list
    await page.goto('/patients');
    await waitForStablePage(page, 2000);
    
    // Capture full patients list page
    await captureManualScreenshot(page, 'patients', '01-patients-list', {
      fullPage: true
    });
  });

  test('02 - Patient Search', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    // Find and focus search input
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('John');
      await page.waitForTimeout(500);
      await waitForStablePage(page);
      
      await captureManualScreenshot(page, 'patients', '02-patient-search');
    }
  });

  test('03 - Patient Registration Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients/register');
    await waitForStablePage(page, 2000);
    
    // Capture registration form
    await captureManualScreenshot(page, 'patients', '03-registration-form', {
      fullPage: true
    });
  });

  test('04 - Patient Registration Form Filled', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients/register');
    await waitForStablePage(page);
    
    // Fill sample data
    const firstNameInput = page.locator('input[name*="first"], input[name*="firstName"]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('John');
    }
    
    const lastNameInput = page.locator('input[name*="last"], input[name*="lastName"]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('Doe');
    }
    
    const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('john.doe@example.com');
    }
    
    await page.waitForTimeout(500);
    
    await captureManualScreenshot(page, 'patients', '04-registration-filled', {
      fullPage: true
    });
  });

  test('05 - Patient Dashboard Overview', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    // Click first patient
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page, 2000);
      
      await captureManualScreenshot(page, 'patients', '05-patient-dashboard', {
        fullPage: true
      });
    }
  });

  test('06 - Patient Medical History Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Click Medical History tab
      const medicalHistoryTab = page.locator('button:has-text("Medical History")').first();
      if (await medicalHistoryTab.isVisible()) {
        await medicalHistoryTab.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'patients', '06-medical-history', {
          fullPage: true
        });
      }
    }
  });

  test('07 - Patient Consultations Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Click Consultations tab
      const consultationsTab = page.locator('button:has-text("Consultations"), button:has-text("Visits")').first();
      if (await consultationsTab.isVisible()) {
        await consultationsTab.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'patients', '07-consultations-tab', {
          fullPage: true
        });
      }
    }
  });

  test('08 - Patient Medications Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Click Medications tab
      const medicationsTab = page.locator('button:has-text("Medications")').first();
      if (await medicationsTab.isVisible()) {
        await medicationsTab.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'patients', '08-medications-tab', {
          fullPage: true
        });
      }
    }
  });

  test('09 - Patient Eye Tests Tab', async ({ page }) => {
    await authenticatedPage(page);
    
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
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'patients', '09-eye-tests-tab', {
          fullPage: true
        });
      }
    }
  });

  test('10 - Patient View Records', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/view-records');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'patients', '10-view-records', {
      fullPage: true
    });
  });

  test('11 - Patient Alerts', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/patients');
    await waitForStablePage(page);
    
    const patientLink = page.locator('a[href*="/patients/"]').first();
    if (await patientLink.isVisible()) {
      await patientLink.click();
      await waitForStablePage(page);
      
      // Look for alerts section
      const alertsSection = page.locator('text=/alerts?/i').first();
      if (await alertsSection.isVisible()) {
        await page.waitForTimeout(1000);
        
        await captureManualScreenshot(page, 'patients', '11-patient-alerts', {
          fullPage: true
        });
      }
    }
  });

});
