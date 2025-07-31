// Global setup for frontend tests
// import type { Config } from '@jest/types'; // TODO: Add test configuration types

export default async function globalSetup(): Promise<void> {
  console.log('🚀 Starting Frontend Test Suite Setup...');
  
  // Set up test environment variables
  if (!process.env.NODE_ENV) {
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
  }
  process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
  process.env.REACT_APP_ENVIRONMENT = 'test';
  
  // Mock external services
  setupMockServices();
  
  // Initialize test databases or fixtures if needed
  await initializeTestData();
  
  // Set up performance monitoring for tests
  setupPerformanceMonitoring();
  
  console.log('✅ Frontend Test Suite Setup Complete');
}

function setupMockServices(): void {
  // Mock external API services (simplified for globalSetup)
  (global as any).mockApiService = {
    calculateDistance: () => {},
    uploadFile: () => {},
    checkHealth: () => {}
  };
  
  // Set up global mocks that don't require window/DOM
  (global as any).mockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  };
  
  // Mock process.env for frontend
  if (!process.env.REACT_APP_VERSION) {
    process.env.REACT_APP_VERSION = '1.0.0-test';
  }
}

async function initializeTestData(): Promise<void> {
  // Initialize test fixtures
  (global as any).testData = {
    sampleDistanceCalculation: {
      list1: [3, 4, 2, 1, 3, 3],
      list2: [4, 3, 5, 3, 9, 3],
      expectedResult: {
        totalDistance: 11,
        pairs: [
          { left: 1, right: 3, distance: 2 },
          { left: 2, right: 3, distance: 1 },
          { left: 3, right: 4, distance: 1 },
          { left: 3, right: 5, distance: 2 },
          { left: 3, right: 9, distance: 6 },
          { left: 4, right: 3, distance: 1 }
        ]
      }
    },
    
    sampleFiles: {
      validTextFile: new File(['3 4\n4 3\n2 5\n1 3\n3 9\n3 3'], 'test.txt', { type: 'text/plain' }),
      invalidFile: new File(['not numbers'], 'invalid.txt', { type: 'text/plain' }),
      oversizedFile: new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' })
    },
    
    translations: {
      english: {
        'upload.title': 'Submit Chronicle Lists',
        'results.totalDistance': 'Total Distance'
      },
      sindarin: {
        'upload.title': 'Orthad i Glîn',
        'results.totalDistance': 'Aphadon Iaur'
      }
    }
  };
  
  // Set up test server if needed (for integration tests)
  if (process.env.START_TEST_SERVER === 'true') {
    await startTestServer();
  }
}

function setupPerformanceMonitoring(): void {
  // Set up performance measurement for tests
  (global as any).testPerformance = {
    startTime: Date.now(),
    measurements: new Map(),
    
    startMeasurement: (name: string) => {
      (global as any).testPerformance.measurements.set(name, performance.now());
    },
    
    endMeasurement: (name: string) => {
      const startTime = (global as any).testPerformance.measurements.get(name);
      if (startTime) {
        const duration = performance.now() - startTime;
        console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
        return duration;
      }
      return 0;
    },
    
    getMemoryUsage: () => {
      if ('memory' in performance) {
        return {
          used: (performance as any).memory.usedJSHeapSize / 1024 / 1024,
          total: (performance as any).memory.totalJSHeapSize / 1024 / 1024
        };
      }
      return { used: 0, total: 0 };
    }
  };
  
  // Set up test timeout monitoring
  (global as any).testTimeouts = new Map();
  
  // Override setTimeout to track test timeouts
  const originalSetTimeout = global.setTimeout;
  global.setTimeout = ((callback: any, delay: number = 0, ...args: any[]) => {
    const id = originalSetTimeout(callback, delay, ...args);
    (global as any).testTimeouts.set(id, { delay, created: Date.now() });
    return id;
  }) as any;
  
  const originalClearTimeout = global.clearTimeout;
  global.clearTimeout = (id: any) => {
    (global as any).testTimeouts.delete(id);
    originalClearTimeout(id);
  };
}

async function startTestServer(): Promise<void> {
  // Mock test server setup
  console.log('🖥️  Starting test server...');
  
  // In a real implementation, this would start a test instance of the backend
  // For now, we'll just set up the mock
  (global as any).testServer = {
    port: 3001,
    running: true,
    
    stop: async () => {
      if ((global as any).testServer) {
        (global as any).testServer.running = false;
      }
      console.log('🛑 Test server stopped');
    }
  };
  
  console.log('✅ Test server started on port 3001');
}

// Export type definitions for global test variables
declare global {
  var mockApiService: {
    calculateDistance: () => any;
    uploadFile: () => any;
    checkHealth: () => any;
  };
  
  var testData: {
    sampleDistanceCalculation: any;
    sampleFiles: any;
    translations: any;
  };
  
  var testPerformance: {
    startTime: number;
    measurements: Map<string, number>;
    startMeasurement: (name: string) => void;
    endMeasurement: (name: string) => number;
    getMemoryUsage: () => { used: number; total: number };
  };
  
  var testTimeouts: Map<any, { delay: number; created: number }>;
  
  var testServer: {
    port: number;
    running: boolean;
    stop: () => Promise<void>;
  } | undefined;
}