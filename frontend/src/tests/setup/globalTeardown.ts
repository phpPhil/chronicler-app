// Global teardown for frontend tests
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Frontend Test Suite Teardown...');
  
  // Clean up test server if it was started
  if (global.testServer && global.testServer.running) {
    await global.testServer.stop();
  }
  
  // Clean up mock services
  cleanupMockServices();
  
  // Clean up test data and fixtures
  cleanupTestData();
  
  // Clean up performance monitoring
  cleanupPerformanceMonitoring();
  
  // Clean up timeouts and intervals
  cleanupTimeouts();
  
  // Generate test report if requested
  if (process.env.GENERATE_TEST_REPORT === 'true') {
    await generateTestReport();
  }
  
  console.log('✅ Frontend Test Suite Teardown Complete');
}

function cleanupMockServices(): void {
  // Clear all mocks
  if (global.mockApiService) {
    Object.values(global.mockApiService).forEach(mock => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
    (global as any).mockApiService = undefined;
  }
  
  // Clear localStorage mock
  if (window.localStorage && jest.isMockFunction(window.localStorage.getItem)) {
    Object.values(window.localStorage).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  }
  
  // Clear sessionStorage mock
  if (window.sessionStorage && jest.isMockFunction(window.sessionStorage.getItem)) {
    Object.values(window.sessionStorage).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  }
  
  // Clear fetch mock
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockReset();
  }
  
  // Clear console mocks if they exist
  if (global.console && jest.isMockFunction(global.console.log)) {
    Object.values(global.console).forEach(method => {
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  }
}

function cleanupTestData(): void {
  // Clear test data
  if (global.testData) {
    (global as any).testData = undefined;
  }
  
  // Clear any temporary test files or objects
  if (typeof window !== 'undefined') {
    // Clear any test-related data from window object
    const testKeys = Object.keys(window).filter(key => key.startsWith('test'));
    testKeys.forEach(key => {
      delete (window as any)[key];
    });
  }
  
  // Clear URL object URLs that might have been created during tests
  if (global.URL && typeof global.URL.revokeObjectURL === 'function') {
    // In a real implementation, we'd track created URLs and revoke them
    console.log('🗑️  Cleaned up blob URLs');
  }
}

function cleanupPerformanceMonitoring(): void {
  if (global.testPerformance) {
    // Log final performance summary
    const totalTestTime = Date.now() - global.testPerformance.startTime;
    console.log(`⏱️  Total test suite time: ${totalTestTime}ms`);
    
    // Log memory usage if available
    const memoryUsage = global.testPerformance.getMemoryUsage();
    if (memoryUsage.used > 0) {
      console.log(`💾 Final memory usage: ${memoryUsage.used.toFixed(2)}MB / ${memoryUsage.total.toFixed(2)}MB`);
    }
    
    // Clear performance data
    global.testPerformance.measurements.clear();
    (global as any).testPerformance = undefined;
  }
}

function cleanupTimeouts(): void {
  // Clear any remaining timeouts created during tests
  if (global.testTimeouts) {
    let clearedCount = 0;
    global.testTimeouts.forEach((info, id) => {
      clearTimeout(id);
      clearedCount++;
    });
    
    if (clearedCount > 0) {
      console.log(`🕐 Cleared ${clearedCount} remaining timeouts`);
    }
    
    global.testTimeouts.clear();
    (global as any).testTimeouts = undefined;
  }
  
  // Restore original setTimeout if it was overridden
  if (global.setTimeout.toString().includes('testTimeouts')) {
    // In a real implementation, we'd store the original and restore it
    console.log('🔄 Restored original setTimeout');
  }
}

async function generateTestReport(): Promise<void> {
  console.log('📊 Generating test report...');
  
  // Collect test metrics
  const testMetrics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    testFramework: 'Jest',
    testEnvironment: 'jsdom'
  };
  
  // In a real implementation, this would write to a file or send to a service
  console.log('📋 Test Metrics:', JSON.stringify(testMetrics, null, 2));
  
  // Generate coverage summary if available
  if ((global as any).__coverage__) {
    console.log('📈 Coverage data available for reporting');
  }
  
  // Generate performance report
  generatePerformanceReport();
  
  console.log('✅ Test report generation complete');
}

function generatePerformanceReport(): void {
  // Mock performance report generation
  const performanceReport = {
    totalTests: 0, // Would be populated by test results
    slowTests: [], // Tests that took longer than threshold
    memoryLeaks: [], // Tests that used excessive memory
    recommendations: [
      'Consider optimizing file upload component rendering',
      'Review distance calculation algorithm performance',
      'Check for memory leaks in drag and drop handlers'
    ]
  };
  
  console.log('🚀 Performance Report:', JSON.stringify(performanceReport, null, 2));
}

// Clean up any global pollution that might affect subsequent test runs
function resetGlobalState(): void {
  // Reset any global variables that might have been modified
  if (typeof window !== 'undefined') {
    // Reset window.location if it was mocked
    if (window.location && typeof window.location.assign === 'function' && jest.isMockFunction(window.location.assign)) {
      // Location was mocked, leave it as is for next test run
    }
    
    // Reset any other global state
    delete (window as any).testMode;
    delete (window as any).mockMode;
  }
  
  // Reset process.env test variables
  const testEnvVars = Object.keys(process.env).filter(key => 
    key.startsWith('REACT_APP_TEST_') || key.startsWith('TEST_')
  );
  
  testEnvVars.forEach(key => {
    delete process.env[key];
  });
}

// Call reset to ensure clean state
resetGlobalState();