// playwright.config.js - Playwright Configuration for PreciseOptics
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 10000 // 10 seconds for assertions
  },
  fullyParallel: false, // Run tests sequentially to avoid data conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker to maintain test order
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.HEADLESS !== 'false',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Web server configuration
  // Option 1: Auto-start servers (recommended for CI/automated testing)
  // Uncomment the webServer section below to auto-start backend and frontend
  
  // webServer: [
  //   {
  //     // Backend Django server
  //     command: process.platform === 'win32' 
  //       ? 'cd ..\\..\\Backend && python manage.py runserver 8000'
  //       : 'cd ../../Backend && python manage.py runserver 8000',
  //     url: 'http://localhost:8000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //     stdout: 'pipe',
  //     stderr: 'pipe',
  //   },
  //   {
  //     // Frontend React server
  //     command: process.platform === 'win32'
  //       ? 'cd ..\\..\\frontend && npm start'
  //       : 'cd ../../frontend && npm start',
  //     url: 'http://localhost:3000',
  //     reuseExistingServer: !process.env.CI,
  //     timeout: 120000,
  //     stdout: 'pipe',
  //     stderr: 'pipe',
  //   }
  // ],

  // Option 2: Manual server startup (recommended for development)
  // Start servers manually before running tests:
  // Terminal 1: cd Backend && python manage.py runserver 8000
  // Terminal 2: cd frontend && npm start
  // Then run: npm test
});
