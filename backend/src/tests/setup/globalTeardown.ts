// Global teardown for backend tests
export default async function globalTeardown(): Promise<void> {
  console.log('🧹 Starting Backend Test Suite Teardown...');
  
  // Stop test server if running
  if (global.testServer && global.testServer.running) {
    await global.testServer.stop();
  }
  
  // Clean up mock services
  cleanupMockServices();
  
  // Generate performance report
  generatePerformanceReport();
  
  // Clean up test fixtures
  cleanupTestFixtures();
  
  // Clean up temporary resources
  await cleanupTemporaryResources();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    console.log('🗑️  Garbage collection completed');
  }
  
  console.log('✅ Backend Test Suite Teardown Complete');
}

function cleanupMockServices(): void {
  if (global.mockServices) {
    // Reset all mock functions
    Object.values(global.mockServices).forEach(service => {
      if (typeof service === 'object') {
        Object.values(service).forEach(method => {
          if (jest.isMockFunction(method)) {
            method.mockReset();
          }
        });
      }
    });
    
    delete (global as any).mockServices;
    console.log('🔌 Mock services cleaned up');
  }
}

function generatePerformanceReport(): void {
  if (global.testPerformance) {
    const summary = global.testPerformance.getSummary();
    
    console.log('\n📊 Backend Test Performance Report');
    console.log('=====================================');
    console.log(`Total Test Suite Time: ${summary.totalTimeMs.toFixed(2)}ms`);
    console.log(`Tests Run: ${summary.testCount}`);
    console.log(`Average Test Duration: ${summary.averageDurationMs.toFixed(2)}ms`);
    console.log(`Total Memory Delta: ${summary.totalMemoryDeltaMB.toFixed(2)}MB`);
    console.log(`Final Memory Usage: ${summary.currentMemoryMB.toFixed(2)}MB`);
    
    // Log slow tests
    const slowTests = summary.tests
      .filter((test: any) => test.durationMs > 100)
      .sort((a: any, b: any) => b.durationMs - a.durationMs);
    
    if (slowTests.length > 0) {
      console.log('\n⚠️  Slow Tests (>100ms):');
      slowTests.slice(0, 5).forEach((test: any) => {
        console.log(`   ${test.name}: ${test.durationMs.toFixed(2)}ms`);
      });
    }
    
    // Log memory-intensive tests
    const memoryIntensiveTests = summary.tests
      .filter((test: any) => test.memoryDeltaMB > 10)
      .sort((a: any, b: any) => b.memoryDeltaMB - a.memoryDeltaMB);
    
    if (memoryIntensiveTests.length > 0) {
      console.log('\n💾 Memory-Intensive Tests (>10MB):');
      memoryIntensiveTests.slice(0, 5).forEach((test: any) => {
        console.log(`   ${test.name}: ${test.memoryDeltaMB.toFixed(2)}MB`);
      });
    }
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    if (summary.averageDurationMs > 50) {
      console.log('   • Consider optimizing test setup/teardown');
    }
    if (summary.totalMemoryDeltaMB > 100) {
      console.log('   • Review memory usage in tests');
    }
    if (slowTests.length > summary.testCount * 0.1) {
      console.log('   • Investigate slow test patterns');
    }
    
    console.log('=====================================\n');
    
    // Clean up performance data
    global.testPerformance.testMetrics.clear();
    delete (global as any).testPerformance;
  }
}

function cleanupTestFixtures(): void {
  if (global.testFixtures) {
    // Clean up any file fixtures
    if (global.testFixtures.fileUploadTestCases) {
      global.testFixtures.fileUploadTestCases.forEach((testCase: any) => {
        if (testCase.file && testCase.file.buffer) {
          // Clear buffer references
          testCase.file.buffer = null;
        }
      });
    }
    
    delete (global as any).testFixtures;
    console.log('📝 Test fixtures cleaned up');
  }
  
  if (global.testGenerators) {
    delete (global as any).testGenerators;
    console.log('🎲 Test generators cleaned up');
  }
}

async function cleanupTemporaryResources(): Promise<void> {
  // Clean up any temporary files that might have been created
  const fs = require('fs').promises;
  const path = require('path');
  const os = require('os');
  
  try {
    const tempDir = path.join(os.tmpdir(), 'chronicler-test');
    
    // Check if temp directory exists and clean it up
    try {
      await fs.access(tempDir);
      await fs.rmdir(tempDir, { recursive: true });
      console.log('🗂️  Temporary test directory cleaned up');
    } catch {
      // Directory doesn't exist, nothing to clean up
    }
  } catch (error) {
    console.warn('⚠️  Could not clean up temporary resources:', (error as Error).message);
  }
  
  // Clear any timers or intervals that might still be running
  const activeHandles = (process as any)._getActiveHandles?.() || [];
  const activeRequests = (process as any)._getActiveRequests?.() || [];
  
  if (activeHandles.length > 0 || activeRequests.length > 0) {
    console.log(`🕐 Active handles: ${activeHandles.length}, Active requests: ${activeRequests.length}`);
    
    // Log types of active handles for debugging
    const handleTypes = activeHandles.map((handle: any) => handle.constructor.name);
    const uniqueTypes = [...new Set(handleTypes)];
    if (uniqueTypes.length > 0) {
      console.log(`🔍 Active handle types: ${uniqueTypes.join(', ')}`);
    }
  }
}

// Reset environment variables to clean state
function resetEnvironmentVariables(): void {
  const testEnvVars = [
    'TEST_MODE',
    'ENABLE_REQUEST_LOGGING',
    'ENABLE_PERFORMANCE_MONITORING',
    'START_TEST_SERVER',
    'DEBUG_TESTS',
    'GENERATE_TEST_REPORT'
  ];
  
  testEnvVars.forEach(varName => {
    delete process.env[varName];
  });
  
  console.log('🔧 Test environment variables reset');
}

// Generate test coverage summary if available
function logCoverageSummary(): void {
  if ((global as any).__coverage__) {
    const coverage = (global as any).__coverage__;
    const files = Object.keys(coverage);
    
    if (files.length > 0) {
      console.log('\n📈 Test Coverage Summary');
      console.log('=======================');
      console.log(`Files covered: ${files.length}`);
      
      // Calculate overall coverage
      let totalStatements = 0;
      let coveredStatements = 0;
      let totalFunctions = 0;
      let coveredFunctions = 0;
      let totalBranches = 0;
      let coveredBranches = 0;
      
      files.forEach(file => {
        const fileCoverage = coverage[file];
        
        // Statements
        const statements = Object.keys(fileCoverage.s);
        totalStatements += statements.length;
        coveredStatements += statements.filter(s => fileCoverage.s[s] > 0).length;
        
        // Functions
        const functions = Object.keys(fileCoverage.f);
        totalFunctions += functions.length;
        coveredFunctions += functions.filter(f => fileCoverage.f[f] > 0).length;
        
        // Branches
        const branches = Object.keys(fileCoverage.b);
        totalBranches += branches.length;
        coveredBranches += branches.filter(b => 
          fileCoverage.b[b].some((count: number) => count > 0)
        ).length;
      });
      
      console.log(`Statements: ${((coveredStatements / totalStatements) * 100).toFixed(2)}% (${coveredStatements}/${totalStatements})`);
      console.log(`Functions: ${((coveredFunctions / totalFunctions) * 100).toFixed(2)}% (${coveredFunctions}/${totalFunctions})`);
      console.log(`Branches: ${((coveredBranches / totalBranches) * 100).toFixed(2)}% (${coveredBranches}/${totalBranches})`);
      console.log('=======================\n');
    }
  }
}

// Log final system resource usage
function logSystemResources(): void {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  console.log('\n🖥️  Final System Resources');
  console.log('=========================');
  console.log(`Memory - RSS: ${(usage.rss / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Memory - Heap Used: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Memory - Heap Total: ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Memory - External: ${(usage.external / 1024 / 1024).toFixed(2)}MB`);
  console.log(`CPU - User: ${(cpuUsage.user / 1000).toFixed(2)}ms`);
  console.log(`CPU - System: ${(cpuUsage.system / 1000).toFixed(2)}ms`);
  console.log('=========================\n');
}

// Execute additional cleanup steps
resetEnvironmentVariables();
logCoverageSummary();
logSystemResources();