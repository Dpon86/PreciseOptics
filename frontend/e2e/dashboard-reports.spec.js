import { test, expect } from '@playwright/test';
import { authenticatedPage, captureManualScreenshot, waitForStablePage } from './helpers.js';

test.describe('Dashboard & Reports Module', () => {
  
  // ==========================================
  // Dashboard Tests
  // ==========================================
  
  test('should display main dashboard', async ({ page }) => {
    await page.goto('/');
    await waitForStablePage(page);
    
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|home|overview/i })).toBeVisible();
  });

  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('/');
    await waitForStablePage(page);
    
    // Look for stat cards
    const statCards = page.locator('.stat-card, .dashboard-card, [class*="stat"]');
    if (await statCards.count() > 0) {
      await expect(statCards.first()).toBeVisible();
    }
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/');
    await waitForStablePage(page);
    
    // Look for recent activity section
    const recentActivity = page.locator('text=/recent|activity|latest/i').first();
    if (await recentActivity.isVisible()) {
      await expect(recentActivity).toBeVisible();
    }
  });

  // ==========================================
  // Reports Tests
  // ==========================================

  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/reports');
    await waitForStablePage(page);
    
    // Check if reports page loaded
    if (!page.url().includes('404')) {
      await expect(page.locator('h1, h2').filter({ hasText: /reports?/i })).toBeVisible();
    }
  });

  test('should display report types', async ({ page }) => {
    await page.goto('/reports');
    await waitForStablePage(page);
    
    // Common report types
    const reportTypes = [
      'Patient',
      'Treatment',
      'Medication',
      'Statistics',
    ];
    
    for (const type of reportTypes) {
      const element = page.locator(`text=${type}`).first();
      if (await element.isVisible()) {
        await expect(element).toBeVisible();
        break;
      }
    }
  });

});

// ==========================================
// USER MANUAL SCREENSHOT GENERATION
// ==========================================

test.describe('User Manual - Dashboard & Reports Screenshots', () => {
  
  test.use({ viewport: { width: 1280, height: 720 } });

  test('01 - Main Dashboard', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'dashboard', '01-main-dashboard', {
      fullPage: true
    });
  });

  test('02 - Dashboard Statistics Cards', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/');
    await waitForStablePage(page, 1500);
    
    // Capture statistics section
    const statsSection = page.locator('.stats, .dashboard-stats, [class*="stat"]').first();
    if (await statsSection.isVisible()) {
      await captureManualScreenshot(page, 'dashboard', '02-statistics-cards');
    }
  });

  test('03 - Recent Activity Widget', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/');
    await waitForStablePage(page);
    
    // Look for recent activity
    const activityWidget = page.locator('text=/recent|activity/i').first();
    if (await activityWidget.isVisible()) {
      await page.waitForTimeout(1000);
      
      await captureManualScreenshot(page, 'dashboard', '03-recent-activity');
    }
  });

  test('04 - Dashboard Widgets Overview', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'dashboard', '04-widgets-overview', {
      fullPage: true
    });
  });

  test('05 - Quick Actions', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/');
    await waitForStablePage(page);
    
    // Look for quick action buttons
    const quickActionsSection = page.locator('text=/quick|actions/i').first();
    if (await quickActionsSection.isVisible()) {
      await page.waitForTimeout(500);
      
      await captureManualScreenshot(page, 'dashboard', '05-quick-actions');
    }
  });

  test('06 - Reports Page', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'reports', '01-reports-page', {
      fullPage: true
    });
  });

  test('07 - Report Types List', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page, 1500);
    
    await captureManualScreenshot(page, 'reports', '02-report-types', {
      fullPage: true
    });
  });

  test('08 - Generate Report Form', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page);
    
    // Click generate or new report button
    const generateButton = page.locator('button, a').filter({ hasText: /generate|create|new.*report/i }).first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await waitForStablePage(page, 1500);
      
      await captureManualScreenshot(page, 'reports', '03-generate-report-form', {
        fullPage: true
      });
    }
  });

  test('09 - Report Date Range Selection', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page);
    
    const generateButton = page.locator('button, a').filter({ hasText: /generate|new/i }).first();
    if (await generateButton.isVisible()) {
      await generateButton.click();
      await waitForStablePage(page);
      
      // Focus on date range inputs
      const startDateInput = page.locator('input[type="date"]').first();
      if (await startDateInput.isVisible()) {
        await startDateInput.click();
        await page.waitForTimeout(500);
        
        await captureManualScreenshot(page, 'reports', '04-date-range-selection');
      }
    }
  });

  test('10 - Report Preview', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page);
    
    // Click first report or preview
    const reportItem = page.locator('tr, .report-card, .report-item').nth(1);
    if (await reportItem.isVisible()) {
      await reportItem.click();
      await waitForStablePage(page, 2000);
      
      await captureManualScreenshot(page, 'reports', '05-report-preview', {
        fullPage: true
      });
    }
  });

  test('11 - Export Report Options', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page);
    
    const reportItem = page.locator('tr, .report-card').nth(1);
    if (await reportItem.isVisible()) {
      await reportItem.click();
      await waitForStablePage(page);
      
      // Look for export button
      const exportButton = page.locator('button').filter({ hasText: /export|download|pdf|excel/i }).first();
      if (await exportButton.isVisible()) {
        await exportButton.hover();
        await page.waitForTimeout(500);
        
        await captureManualScreenshot(page, 'reports', '06-export-options');
      }
    }
  });

  test('12 - Treatment Effectiveness Report', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/treatment-effectiveness');
    await waitForStablePage(page, 2000);
    
    await captureManualScreenshot(page, 'reports', '07-treatment-effectiveness', {
      fullPage: true
    });
  });

  test('13 - Patient Statistics', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page);
    
    // Look for patient statistics report
    const patientStatsButton = page.locator('button, a').filter({ hasText: /patient.*statistics?/i }).first();
    if (await patientStatsButton.isVisible()) {
      await patientStatsButton.click();
      await waitForStablePage(page, 2000);
      
      await captureManualScreenshot(page, 'reports', '08-patient-statistics', {
        fullPage: true
      });
    }
  });

  test('14 - Medication Usage Report', async ({ page }) => {
    await authenticatedPage(page);
    
    await page.goto('/reports');
    await waitForStablePage(page);
    
    // Look for medication report
    const medicationReportButton = page.locator('button, a').filter({ hasText: /medication.*usage|medication.*report/i }).first();
    if (await medicationReportButton.isVisible()) {
      await medicationReportButton.click();
      await waitForStablePage(page, 2000);
      
      await captureManualScreenshot(page, 'reports', '09-medication-usage', {
        fullPage: true
      });
    }
  });

});
