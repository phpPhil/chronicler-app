import { chromium, FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global setup for Playwright E2E tests
 * 
 * Sets up test data, creates necessary directories,
 * and prepares environment for persona testing
 */
async function globalSetup(config: FullConfig) {
  console.log('Setting up E2E test environment...');
  
  // Create test data directory
  const testDataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  // Create test files for file upload testing
  const testFiles = [
    {
      name: 'valid-test.txt',
      content: '3 4\n4 3\n2 5\n1 3\n3 9\n3 3'
    },
    {
      name: 'invalid-test.txt', 
      content: 'not a valid format\ninvalid data'
    },
    {
      name: 'large-test.txt',
      content: Array(1000).fill('1 2').join('\n')
    },
    {
      name: 'elvish-test.txt',
      content: '1 5\n2 4\n3 6\n7 8\n9 10'
    },
    {
      name: 'hobbit-test.txt',
      content: '10 20\n30 40\n50 60'
    }
  ];
  
  // Write test files
  testFiles.forEach(file => {
    const filePath = path.join(testDataDir, file.name);
    fs.writeFileSync(filePath, file.content, 'utf-8');
  });
  
  console.log(`Created ${testFiles.length} test files in ${testDataDir}`);
  
  // Warm up browsers to avoid timeout issues
  const browser = await chromium.launch();
  await browser.close();
  
  console.log('E2E test environment setup complete');
}

export default globalSetup;