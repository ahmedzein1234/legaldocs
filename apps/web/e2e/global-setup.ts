import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for Playwright tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Create .auth directory if it doesn't exist
  const authDir = path.join(__dirname, '..', '.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('✅ Created .auth directory');
  }

  // Create test-results directory if it doesn't exist
  const resultsDir = path.join(__dirname, '..', 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    console.log('✅ Created test-results directory');
  }

  // Create playwright-report directory if it doesn't exist
  const reportDir = path.join(__dirname, '..', 'playwright-report');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
    console.log('✅ Created playwright-report directory');
  }

  console.log('✅ Global setup completed successfully');
}

export default globalSetup;
