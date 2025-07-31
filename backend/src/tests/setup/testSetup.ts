// Backend test setup configuration
import { jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.MAX_FILE_SIZE = '10485760'; // 10MB
process.env.LOG_LEVEL = 'error'; // Minimize log noise during tests

// Type definitions for test mocks
type MockMiddleware = (req: Request, res: Response, next: NextFunction) => void;
type MockRequest = Partial<Request>;
type MockResponse = Partial<Response>;

// Mock external dependencies
jest.mock('helmet', () => {
  return jest.fn((): MockMiddleware => (req, res, next) => next());
});

jest.mock('express-rate-limit', () => {
  return jest.fn((): MockMiddleware => (req, res, next) => next());
});

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides: Partial<MockRequest> = {}): MockRequest => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    method: 'GET',
    url: '/',
    get: jest.fn((header: string) => {
      const headers: any = {
        'user-agent': 'test-agent',
        'content-type': 'application/json',
        ...overrides.headers
      };
      return headers[header.toLowerCase()];
    }) as any,
    ...overrides
  }),

  createMockResponse: (): MockResponse => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      locals: {}
    } as MockResponse;
    return res;
  },

  createMockNext: () => jest.fn(),

  createMockFile: (overrides: Partial<any> = {}): any => ({
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    destination: '/tmp',
    filename: 'test.txt',
    path: '/tmp/test.txt',
    buffer: Buffer.from('3 4\n4 3\n2 5\n1 3\n3 9\n3 3'),
    ...overrides
  }),

  createTestData: {
    validDistanceInput: {
      list1: [3, 4, 2, 1, 3, 3],
      list2: [4, 3, 5, 3, 9, 3]
    },
    
    invalidDistanceInput: {
      list1: [1, 2, 3],
      list2: [1, 2] // Unequal length
    },
    
    largeDataset: (size: number) => {
      const list1: number[] = [];
      const list2: number[] = [];
      for (let i = 0; i < size; i++) {
        list1.push(Math.floor(Math.random() * 1000));
        list2.push(Math.floor(Math.random() * 1000));
      }
      return { list1, list2 };
    },
    
    maliciousInput: {
      list1: ['<script>alert("xss")</script>', 'DROP TABLE users;'],
      list2: [1, 2]
    }
  },

  async measureExecutionTime<T>(fn: () => Promise<T> | T): Promise<{ result: T; timeMs: number }> {
    const startTime = process.hrtime.bigint();
    const result = await fn();
    const endTime = process.hrtime.bigint();
    const timeMs = Number(endTime - startTime) / 1000000; // Convert nanoseconds to milliseconds
    
    return { result, timeMs };
  },

  measureMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024, // MB
      rss: usage.rss / 1024 / 1024 // MB
    };
  },

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  waitForCondition: async (condition: () => boolean, timeout: number = 5000, interval: number = 100) => {
    const startTime = Date.now();
    while (!condition() && Date.now() - startTime < timeout) {
      await global.testUtils.sleep(interval);
    }
    if (!condition()) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }
  }
};

// Mock console to reduce noise during tests, but allow debug output if needed
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  };
}

// Set up test database or fixtures if needed
beforeAll(async () => {
  console.log('🚀 Setting up backend test environment...');
  
  // Initialize any test fixtures
  await initializeTestFixtures();
  
  console.log('✅ Backend test environment ready');
});

afterAll(async () => {
  console.log('🧹 Cleaning up backend test environment...');
  
  // Clean up any test resources
  await cleanupTestResources();
  
  console.log('✅ Backend test environment cleaned up');
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset any global state
  resetGlobalTestState();
});

afterEach(async () => {
  // Clean up after each test
  await cleanupAfterTest();
});

async function initializeTestFixtures(): Promise<void> {
  // Set up any test fixtures, mock data, or test services
  global.testFixtures = {
    distanceCalculationTestCases: [],
    fileUploadTestCases: [],
    performanceTestCases: [],
    securityTestCases: [],
    sampleFiles: {
      validFile: {
        name: 'test.txt',
        content: '3 4\n4 3\n2 5\n1 3\n3 9\n3 3',
        size: 24
      },
      invalidFile: {
        name: 'invalid.txt',
        content: 'not numbers',
        size: 11
      },
      emptyFile: {
        name: 'empty.txt',
        content: '',
        size: 0
      }
    }
  };
}

async function cleanupTestResources(): Promise<void> {
  // Clean up any resources created during testing
  if (global.testFixtures) {
    delete (global as any).testFixtures;
  }
  
  // Clear any temporary files
  // In a real implementation, this might clean up temp directories
  
  // Close any open connections
  // In a real implementation, this might close database connections
}

function resetGlobalTestState(): void {
  // Reset any global state that might affect tests
  if (global.testMetrics) {
    global.testMetrics = {
      testsRun: 0,
      testsFailed: 0,
      averageExecutionTime: 0,
      memoryUsage: []
    };
  }
}

async function cleanupAfterTest(): Promise<void> {
  // Clean up after individual tests
  // Clear any timers
  jest.clearAllTimers();
  
  // Reset any module mocks
  jest.resetModules();
  
  // Allow garbage collection
  if (global.gc) {
    global.gc();
  }
}

// Performance testing utilities
global.performanceTest = {
  async runBenchmark(
    name: string,
    testFn: () => Promise<unknown> | unknown,
    iterations: number = 100
  ): Promise<{ averageMs: number; minMs: number; maxMs: number; medianMs: number }> {
    const times: number[] = [];
    
    console.log(`🏃 Running benchmark: ${name} (${iterations} iterations)`);
    
    for (let i = 0; i < iterations; i++) {
      const { timeMs } = await global.testUtils.measureExecutionTime(testFn);
      times.push(timeMs);
    }
    
    times.sort((a, b) => a - b);
    
    const results = {
      averageMs: times.reduce((sum, time) => sum + time, 0) / times.length,
      minMs: times[0],
      maxMs: times[times.length - 1],
      medianMs: times[Math.floor(times.length / 2)]
    };
    
    console.log(`📊 Benchmark results for ${name}:`, results);
    
    return results;
  },
  
  async runLoadTest(
    name: string,
    testFn: () => Promise<any>,
    concurrency: number = 10,
    totalRequests: number = 100
  ): Promise<{ requestsPerSecond: number; averageResponseTime: number; errors: number }> {
    console.log(`🔥 Running load test: ${name} (${totalRequests} requests, ${concurrency} concurrent)`);
    
    const startTime = Date.now();
    const results: Array<{ success: boolean; timeMs: number }> = [];
    
    const runBatch = async (batchSize: number) => {
      const batch = Array.from({ length: batchSize }, async () => {
        try {
          const { timeMs } = await global.testUtils.measureExecutionTime(testFn);
          return { success: true, timeMs };
        } catch {
          return { success: false, timeMs: 0 };
        }
      });
      
      return Promise.all(batch);
    };
    
    // Run requests in batches
    const batches = Math.ceil(totalRequests / concurrency);
    for (let i = 0; i < batches; i++) {
      const batchSize = Math.min(concurrency, totalRequests - i * concurrency);
      const batchResults = await runBatch(batchSize);
      results.push(...batchResults);
    }
    
    const endTime = Date.now();
    const totalTimeS = (endTime - startTime) / 1000;
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const loadTestResults = {
      requestsPerSecond: successful.length / totalTimeS,
      averageResponseTime: successful.reduce((sum, r) => sum + r.timeMs, 0) / successful.length,
      errors: failed.length
    };
    
    console.log(`📊 Load test results for ${name}:`, loadTestResults);
    
    return loadTestResults;
  }
};

// Export types for global test utilities
declare global {
  var testUtils: {
    createMockRequest: (overrides?: any) => any;
    createMockResponse: () => any;
    createMockNext: () => jest.Mock;
    createMockFile: (overrides?: any) => any;
    createTestData: any;
    measureExecutionTime: <T>(fn: () => Promise<T> | T) => Promise<{ result: T; timeMs: number }>;
    measureMemoryUsage: () => { heapUsed: number; heapTotal: number; external: number; rss: number };
    sleep: (ms: number) => Promise<void>;
    waitForCondition: (condition: () => boolean, timeout?: number, interval?: number) => Promise<void>;
  };
  
  var testMetrics: any;
  
  var performanceTest: {
    runBenchmark: (name: string, testFn: () => Promise<any> | any, iterations?: number) => Promise<{
      averageMs: number;
      minMs: number;
      maxMs: number;
      medianMs: number;
    }>;
    runLoadTest: (name: string, testFn: () => Promise<any>, concurrency?: number, totalRequests?: number) => Promise<{
      requestsPerSecond: number;
      averageResponseTime: number;
      errors: number;
    }>;
  };

  // gc is already defined in Node.js global types
}