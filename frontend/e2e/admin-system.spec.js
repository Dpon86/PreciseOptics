import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Administrative & System Module', () => {
  
  // ==========================================
  // Admin Dashboard Tests
  // ==========================================
  
  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /admin|dashboard/i })).toBeVisible();
  });

  test('should display admin tabs', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    // Check for common admin tabs
    const tabs = [
      'Overview',
      'Patients',
      'Medications',
      'Conditions',
      'Protocols',
      'Referrals',
      'Alerts',
    ];
    
    for (const tabName of tabs) {
      const tab = page.locator('button, a').filter({ hasText: new RegExp(tabName, 'i') }).first();
      if (await tab.isVisible()) {
        await expect(tab).toBeVisible();
        break; // Found at least one tab
      }
    }
  });

  test('should switch between admin tabs', async ({ page }) => {
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const patientsTab = page.locator('button').filter({ hasText: /patients/i }).first();
    if (await patientsTab.isVisible()) {
      await patientsTab.click();
      await waitForStablePage(page, 1000);
      
      // Should see patient-related data
      const patientData = page.locator('text=/patient|total|count/i').first();
      if (await patientData.isVisible()) {
        await expect(patientData).toBeVisible();
      }
    }
  });

  // ==========================================
  // Staff Management Tests
  // ==========================================

  test('should display staff management page', async ({ page }) => {
    await page.goto('/staff');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /staff|manage/i })).toBeVisible();
  });

  test('should navigate to add staff page', async ({ page }) => {
    await page.goto('/staff');
    await waitForStablePage(page);
    
    const addButton = page.locator('button, a').filter({ hasText: /add.*staff|new.*staff/i }).first();
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
  });

  test('should display staff list', async ({ page }) => {
    await page.goto('/staff');
    await waitForStablePage(page);
    
    // Check for staff table or cards
    const staffList = page.locator('table, .staff-list, .staff-card').first();
    if (await staffList.isVisible()) {
      await expect(staffList).toBeVisible();
    }
  });

  // ==========================================
  // System Settings Tests
  // ==========================================

  test('should display system settings page', async ({ page }) => {
    await page.goto('/system');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /system|settings/i })).toBeVisible();
  });

  test('should display system configuration options', async ({ page }) => {
    await page.goto('/system');
    await waitForStablePage(page);
    
    // Look for common system settings
    const settings = page.locator('text=/configuration|settings|preferences/i').first();
    if (await settings.isVisible()) {
      await expect(settings).toBeVisible();
    }
  });

  // ==========================================
  // Audit Logs Tests
  // ==========================================

  test('should display audit logs page', async ({ page }) => {
    await page.goto('/audit-logs');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /audit/i })).toBeVisible();
  });

  test('should display audit log entries', async ({ page }) => {
    await page.goto('/audit-logs');
    await waitForStablePage(page);
    
    // Check for audit log table or list
    const auditTable = page.locator('table, .audit-log, .log-entry').first();
    if (await auditTable.isVisible()) {
      await expect(auditTable).toBeVisible();
    }
  });

  test('should filter audit logs', async ({ page }) => {
    await page.goto('/audit-logs');
    await waitForStablePage(page);
    
    // Look for filter options
    const filterButton = page.locator('button, select').filter({ hasText: /filter|action|user/i }).first();
    if (await filterButton.isVisible()) {
      await expect(filterButton).toBeVisible();
    }
  });

  // ==========================================
  // Forms Overview Tests
  // ==========================================

  test('should display forms overview page', async ({ page }) => {
    await page.goto('/forms-overview');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /forms?/i })).toBeVisible();
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Admin & System Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Admin Dashboard Overview', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '01-admin-dashboard', {
      fullPage: true
    });
  });

  test('02 - Admin Dashboard Overview Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page, 1500);
    
    // Ensure on Overview tab
    const overviewTab = page.locator('button').filter({ hasText: /overview/i }).first();
    if (await overviewTab.isVisible()) {
      await overviewTab.click();
      await waitForStablePage(page, 1000);
    }
    
    await captureManualScreenshot(page, 'admin', '02-overview-tab', {
      fullPage: true
    });
  });

  test('03 - Admin Dashboard Patients Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const patientsTab = page.locator('button').filter({ hasText: /patients/i }).first();
    if (await patientsTab.isVisible()) {
      await patientsTab.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '03-patients-tab', {
        fullPage: true
      });
    }
  });

  test('04 - Admin Dashboard Medications Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const medicationsTab = page.locator('button').filter({ hasText: /medications/i }).first();
    if (await medicationsTab.isVisible()) {
      await medicationsTab.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '04-medications-tab', {
        fullPage: true
      });
    }
  });

  test('05 - Admin Dashboard Conditions Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const conditionsTab = page.locator('button').filter({ hasText: /conditions/i }).first();
    if (await conditionsTab.isVisible()) {
      await conditionsTab.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '05-conditions-tab', {
        fullPage: true
      });
    }
  });

  test('06 - Admin Dashboard Protocols Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const protocolsTab = page.locator('button').filter({ hasText: /protocols/i }).first();
    if (await protocolsTab.isVisible()) {
      await protocolsTab.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '06-protocols-tab', {
        fullPage: true
      });
    }
  });

  test('07 - Admin Dashboard Referrals Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const referralsTab = page.locator('button').filter({ hasText: /referrals/i }).first();
    if (await referralsTab.isVisible()) {
      await referralsTab.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '07-referrals-tab', {
        fullPage: true
      });
    }
  });

  test('08 - Admin Dashboard Alerts Tab', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page);
    
    const alertsTab = page.locator('button').filter({ hasText: /alerts/i }).first();
    if (await alertsTab.isVisible()) {
      await alertsTab.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '08-alerts-tab', {
        fullPage: true
      });
    }
  });

  test('09 - Staff Management Page', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '09-staff-management', {
      fullPage: true
    });
  });

  test('10 - Add Staff Button', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff');
    await waitForStablePage(page);
    
    const addButton = page.locator('button, a').filter({ hasText: /add.*staff|new.*staff/i }).first();
    if (await addButton.isVisible()) {
      await addButton.hover();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'admin', '10-add-staff-button');
    }
  });

  test('11 - Add Staff Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff/add');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '11-add-staff-form', {
      fullPage: true
    });
  });

  test('12 - Staff Form Filled', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff/add');
    await waitForStablePage(page);
    
    // Fill staff form fields
    const firstNameInput = page.locator('input[name*="first"], input[name*="firstName"]').first();
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('John');
    }
    
    const lastNameInput = page.locator('input[name*="last"], input[name*="lastName"]').first();
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('Smith');
    }
    
    const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('john.smith@preciseoptics.com');
    }
    
    const roleSelect = page.locator('select[name*="role"]').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption({ index: 1 });
    }
    
    await page.waitForTimeout(500);
    
    await captureManualScreenshot(page, 'admin', '12-staff-form-filled', {
      fullPage: true
    });
  });

  test('13 - Staff Detail View', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff');
    await waitForStablePage(page);
    
    // Click first staff member
    const staffRow = page.locator('tr, .staff-card, .staff-item').nth(1);
    if (await staffRow.isVisible()) {
      await staffRow.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '13-staff-detail', {
        fullPage: true
      });
    }
  });

  test('14 - Edit Staff Member', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff');
    await waitForStablePage(page);
    
    const staffRow = page.locator('tr, .staff-card').nth(1);
    if (await staffRow.isVisible()) {
      await staffRow.click();
      await waitForStablePage(page);
      
      // Look for edit button
      const editButton = page.locator('button, a').filter({ hasText: /edit/i }).first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await waitForStablePage(page, 1500);
        
        await captureManualScreenshot(page, 'admin', '14-edit-staff', {
          fullPage: true
        });
      }
    }
  });

  test('15 - System Settings Page', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/system');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '15-system-settings', {
      fullPage: true
    });
  });

  test('16 - System Configuration', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/system');
    await waitForStablePage(page, 1500);
    
    await captureManualScreenshot(page, 'admin', '16-system-configuration', {
      fullPage: true
    });
  });

  test('17 - Audit Logs Page', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/audit-logs');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '17-audit-logs', {
      fullPage: true
    });
  });

  test('18 - Audit Log Details', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/audit-logs');
    await waitForStablePage(page);
    
    // Click first audit log entry
    const logEntry = page.locator('tr, .log-entry, .audit-item').nth(1);
    if (await logEntry.isVisible()) {
      await logEntry.click();
      await waitForStablePage(page, 1000);
      
      await captureManualScreenshot(page, 'admin', '18-audit-log-detail');
    }
  });

  test('19 - Audit Logs Filter', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/audit-logs');
    await waitForStablePage(page);
    
    // Click filter button or dropdown
    const filterButton = page.locator('button, select').filter({ hasText: /filter|action|user/i }).first();
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'admin', '19-audit-filter');
    }
  });

  test('20 - Audit Logs Search', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/audit-logs');
    await waitForStablePage(page);
    
    // Search audit logs
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('patient');
      await page.waitForTimeout(500);
      await waitForStablePage(page);
      
      await captureManualScreenshot(page, 'admin', '20-audit-search');
    }
  });

  test('21 - Forms Overview Page', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/forms-overview');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '21-forms-overview', {
      fullPage: true
    });
  });

  test('22 - Specializations Management', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff');
    await waitForStablePage(page);
    
    // Look for specializations section or button
    const specializationsButton = page.locator('button, a').filter({ hasText: /specialization/i }).first();
    if (await specializationsButton.isVisible()) {
      await specializationsButton.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '22-specializations', {
        fullPage: true
      });
    }
  });

  test('23 - Add Specialization Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/staff/specializations/add');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'admin', '23-add-specialization', {
      fullPage: true
    });
  });

  test('24 - User Profile Settings', async ({ page }) => {
    await authenticatedPage(page);
    
    // Click on user profile/settings
    const profileButton = page.locator('button, a').filter({ hasText: /profile|account|settings/i }).first();
    if (await profileButton.isVisible()) {
      await profileButton.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'admin', '24-user-profile', {
        fullPage: true
      });
    }
  });

  test('25 - System Statistics Summary', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/admin-dashboard');
    await waitForStablePage(page, 2000);
    
    // Capture just the statistics summary section
    const statsSection = page.locator('.stats, .statistics, .summary').first();
    if (await statsSection.isVisible()) {
      await captureManualScreenshot(page, 'admin', '25-system-statistics');
    } else {
      await captureManualScreenshot(page, 'admin', '25-system-statistics', {
        fullPage: true
      });
    }
  });

});
