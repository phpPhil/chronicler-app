// Global setup for backend tests
export default async function globalSetup(): Promise<void> {
  console.log('🚀 Starting Backend Test Suite Setup...');
  
  // Set up test environment
  setupTestEnvironment();
  
  // Initialize test services
  await initializeTestServices();
  
  // Set up performance monitoring
  setupPerformanceMonitoring();
  
  // Initialize test database/fixtures
  await initializeTestDatabase();
  
  console.log('✅ Backend Test Suite Setup Complete');
}

function setupTestEnvironment(): void {
  // Ensure test environment variables are set
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.CORS_ORIGIN = 'http://localhost:3000';
  process.env.RATE_LIMIT_WINDOW_MS = '60000';
  process.env.RATE_LIMIT_MAX_REQUESTS = '100';
  process.env.MAX_FILE_SIZE = '10485760'; // 10MB
  process.env.MAX_ARRAY_SIZE = '100000';
  process.env.LOG_LEVEL = 'error';
  
  // Set test-specific configurations
  process.env.ENABLE_REQUEST_LOGGING = 'false';
  process.env.ENABLE_PERFORMANCE_MONITORING = 'true';
  process.env.TEST_MODE = 'true';
  
  console.log('🔧 Test environment configured');
}

async function initializeTestServices(): Promise<void> {
  // Mock external services (simplified for globalSetup)
  (global as typeof global & { mockServices: unknown }).mockServices = {
    fileUploadService: {
      processFile: () => {},
      validateFile: () => {},
      cleanup: () => {}
    },
    
    distanceCalculationService: {
      calculate: () => {},
      validateInput: () => {},
      getMetrics: () => {}
    },
    
    rateLimiter: {
      checkLimit: () => {},
      reset: () => {},
      getStats: () => {}
    },
    
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {}
    }
  };
  
  // Set up test server if needed
  if (process.env.START_TEST_SERVER === 'true') {
    await startTestServer();
  }
  
  console.log('🔌 Test services initialized');
}

function setupPerformanceMonitoring(): void {
  (global as typeof global & { testPerformance: unknown }).testPerformance = {
    startTime: process.hrtime.bigint(),
    testMetrics: new Map(),
    memoryBaseline: process.memoryUsage(),
    
    startMeasurement: (name: string) => {
      const perf = (global as typeof global & { testPerformance: { testMetrics: Map<string, unknown> } }).testPerformance;
      perf.testMetrics.set(name, {
        startTime: process.hrtime.bigint(),
        startMemory: process.memoryUsage()
      });
    },
    
    endMeasurement: (name: string) => {
      const startData = (global as any).testPerformance.testMetrics.get(name);
      if (startData) {
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        
        const durationMs = Number(endTime - startData.startTime) / 1000000;
        const memoryDelta = endMemory.heapUsed - startData.startMemory.heapUsed;
        
        const metrics = {
          durationMs,
          memoryDeltaMB: memoryDelta / 1024 / 1024,
          finalMemoryMB: endMemory.heapUsed / 1024 / 1024
        };
        
        console.log(`⏱️  ${name}: ${durationMs.toFixed(2)}ms, Memory: ${metrics.memoryDeltaMB.toFixed(2)}MB delta`);
        
        (global as any).testPerformance.testMetrics.set(name, {
          ...startData,
          ...metrics,
          completed: true
        });
        
        return metrics;
      }
      return null;
    },
    
    getMemoryUsage: () => {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed / 1024 / 1024,
        heapTotal: usage.heapTotal / 1024 / 1024,
        external: usage.external / 1024 / 1024,
        rss: usage.rss / 1024 / 1024
      };
    },
    
    getSummary: () => {
      const metricEntries = (global as any).testPerformance.testMetrics.entries();
      const metricsArray: any[] = [];
      
      for (const [name, data] of metricEntries) {
        if (data.completed) {
          metricsArray.push({
            name,
            durationMs: data.durationMs,
            memoryDeltaMB: data.memoryDeltaMB
          });
        }
      }
      
      const totalTime = Number(process.hrtime.bigint() - (global as any).testPerformance.startTime) / 1000000;
      const currentMemory = (global as any).testPerformance.getMemoryUsage();
      
      return {
        totalTimeMs: totalTime,
        testCount: metricsArray.length,
        averageDurationMs: metricsArray.length > 0 ? 
          metricsArray.reduce((sum, m) => sum + m.durationMs, 0) / metricsArray.length : 0,
        totalMemoryDeltaMB: metricsArray.reduce((sum, m) => sum + m.memoryDeltaMB, 0),
        currentMemoryMB: currentMemory.heapUsed,
        tests: metricsArray
      };
    }
  };
  
  console.log('📊 Performance monitoring enabled');
}

async function initializeTestDatabase(): Promise<void> {
  // For this application, we don't have a persistent database
  // But we can set up test fixtures and data
  
  (global as any).testFixtures = {
    distanceCalculationTestCases: [
      {
        name: 'basic_calculation',
        input: {
          list1: [3, 4, 2, 1, 3, 3],
          list2: [4, 3, 5, 3, 9, 3]
        },
        expected: {
          totalDistance: 11,
          pairCount: 6
        }
      },
      {
        name: 'identical_lists',
        input: {
          list1: [1, 2, 3, 4],
          list2: [1, 2, 3, 4]
        },
        expected: {
          totalDistance: 0,
          pairCount: 4
        }
      },
      {
        name: 'reverse_order',
        input: {
          list1: [1, 2, 3, 4],
          list2: [4, 3, 2, 1]
        },
        expected: {
          totalDistance: 0, // After sorting
          pairCount: 4
        }
      }
    ],
    
    fileUploadTestCases: [
      {
        name: 'valid_file',
        file: {
          originalname: 'test.txt',
          mimetype: 'text/plain',
          size: 24,
          buffer: Buffer.from('3 4\n4 3\n2 5\n1 3\n3 9\n3 3')
        },
        shouldSucceed: true
      },
      {
        name: 'invalid_mimetype',
        file: {
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          buffer: Buffer.from('%PDF-1.4 binary content')
        },
        shouldSucceed: false,
        expectedError: 'Invalid file type'
      },
      {
        name: 'oversized_file',
        file: {
          originalname: 'large.txt',
          mimetype: 'text/plain',
          size: 11 * 1024 * 1024, // 11MB
          buffer: Buffer.alloc(11 * 1024 * 1024, 'x')
        },
        shouldSucceed: false,
        expectedError: 'File too large'
      }
    ],
    
    performanceTestCases: [
      { size: 100, expectedMaxMs: 10 },
      { size: 1000, expectedMaxMs: 50 },
      { size: 10000, expectedMaxMs: 500 },
      { size: 100000, expectedMaxMs: 5000 }
    ],
    
    securityTestCases: [
      {
        name: 'xss_attempt',
        input: '<script>alert("xss")</script>',
        shouldBeBlocked: true
      },
      {
        name: 'sql_injection_attempt',
        input: 'DROP TABLE users;',
        shouldBeBlocked: true
      },
      {
        name: 'path_traversal_attempt',
        input: '../../../etc/passwd',
        shouldBeBlocked: true
      },
      {
        name: 'null_byte_injection',
        input: 'test\x00.txt',
        shouldBeBlocked: true
      }
    ]
  };
  
  // Set up test data generators
  (global as any).testGenerators = {
    generateLargeDataset: (size: number) => {
      const list1: number[] = [];
      const list2: number[] = [];
      
      for (let i = 0; i < size; i++) {
        list1.push(Math.floor(Math.random() * 1000000));
        list2.push(Math.floor(Math.random() * 1000000));
      }
      
      return { list1, list2 };
    },
    
    generateSortedDataset: (size: number) => {
      const list1: number[] = [];
      const list2: number[] = [];
      
      for (let i = 0; i < size; i++) {
        list1.push(i);
        list2.push(i + Math.floor(Math.random() * 10));
      }
      
      return { list1, list2 };
    },
    
    generateWorstCaseDataset: (size: number) => {
      const list1: number[] = [];
      const list2: number[] = [];
      
      for (let i = 0; i < size; i++) {
        list1.push(i);
        list2.push(size - i - 1);
      }
      
      return { list1, list2 };
    }
  };
  
  console.log('📝 Test fixtures initialized');
}

async function startTestServer(): Promise<void> {
  // Mock test server for integration tests
  console.log('🖥️  Starting test server...');
  
  // In a real implementation, this would start an actual server instance
  // For now, we'll create a mock server
  (global as any).testServer = {
    port: 3001,
    running: true,
    requestCount: 0,
    
    async stop() {
      this.running = false;
      console.log('🛑 Test server stopped');
    },
    
    reset() {
      this.requestCount = 0;
    },
    
    getStats() {
      return {
        port: this.port,
        running: this.running,
        requestCount: this.requestCount,
        uptime: Date.now() - Number((global as any).testPerformance.startTime / BigInt(1000000))
      };
    }
  };
  
  console.log('✅ Test server started on port 3001');
}

// Export type definitions
declare global {
  var mockServices: {
    fileUploadService: any;
    distanceCalculationService: any;
    rateLimiter: any;
    logger: any;
  };
  
  var testPerformance: {
    startTime: bigint;
    testMetrics: Map<string, any>;
    memoryBaseline: NodeJS.MemoryUsage;
    startMeasurement: (name: string) => void;
    endMeasurement: (name: string) => any;
    getMemoryUsage: () => any;
    getSummary: () => any;
  };
  
  var testFixtures: {
    distanceCalculationTestCases: any[];
    fileUploadTestCases: any[];
    performanceTestCases: any[];
    securityTestCases: any[];
    sampleFiles?: any;
  } | undefined;
  
  var testGenerators: {
    generateLargeDataset: (size: number) => { list1: number[]; list2: number[] };
    generateSortedDataset: (size: number) => { list1: number[]; list2: number[] };
    generateWorstCaseDataset: (size: number) => { list1: number[]; list2: number[] };
  };
  
  var testServer: {
    port: number;
    running: boolean;
    requestCount: number;
    stop: () => Promise<void>;
    reset: () => void;
    getStats: () => any;
  };
}