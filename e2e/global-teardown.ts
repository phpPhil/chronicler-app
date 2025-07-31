import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global teardown for Playwright E2E tests
 * 
 * Cleans up test data and temporary files
 */
async function globalTeardown(config: FullConfig) {
  console.log('Cleaning up E2E test environment...');
  
  // Clean up test data directory (optional - keep for debugging)
  const testDataDir = path.join(__dirname, 'test-data');
  if (fs.existsSync(testDataDir)) {
    // Uncomment to clean up test files after tests
    // fs.rmSync(testDataDir, { recursive: true, force: true });
    console.log(`Test data preserved in ${testDataDir} for debugging`);
  }
  
  console.log('E2E test environment cleanup complete');
}

export default globalTeardown;