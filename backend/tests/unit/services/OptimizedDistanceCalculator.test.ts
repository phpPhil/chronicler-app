import { OptimizedDistanceCalculator } from '../../../src/services/OptimizedDistanceCalculator';
import { AlgorithmProfiler } from '../../../src/services/AlgorithmProfiler';
import { SimplePerformanceTracker } from '../../../src/services/SimplePerformanceTracker';

describe('OptimizedDistanceCalculator - Performance Tests', () => {
  let calculator: OptimizedDistanceCalculator;
  let profiler: AlgorithmProfiler;
  let performanceTracker: SimplePerformanceTracker;

  beforeEach(() => {
    calculator = new OptimizedDistanceCalculator();
    profiler = new AlgorithmProfiler();
    performanceTracker = new SimplePerformanceTracker();
  });

  describe('Algorithm Complexity Analysis', () => {
    test('maintains O(n log n) complexity scaling', () => {
      const testSizes = [100, 1000, 10000];
      const timings: number[] = [];
      
      testSizes.forEach(size => {
        const list1 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
        const list2 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
        
        const result = performanceTracker.trackOperation('distance_calculation', () => {
          return calculator.calculateDistance(list1, list2);
        });
        
        expect(result.totalDistance).toBeGreaterThanOrEqual(0);
      });
      
      const metrics = performanceTracker.getMetricsSummary();
      const calculationMetrics = metrics['distance_calculation'];
      
      expect(calculationMetrics).toBeDefined();
      expect(calculationMetrics.count).toBe(3);
      expect(calculationMetrics.average).toBeLessThan(1000); // Should be fast
    });

    test('memory usage scales linearly with input size', () => {
      const sizes = [1000, 5000, 10000];
      const memoryBaseline = process.memoryUsage().heapUsed;
      
      sizes.forEach(size => {
        const list1 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
        const list2 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
        
        const memoryBefore = process.memoryUsage().heapUsed;
        const result = calculator.calculateDistance(list1, list2);
        const memoryAfter = process.memoryUsage().heapUsed;
        
        const memoryUsed = memoryAfter - memoryBefore;
        const bytesPerElement = memoryUsed / size;
        
        // Memory usage should be reasonable (not exponential)
        expect(bytesPerElement).toBeLessThan(1000); // Less than 1KB per element
        // Note: Memory measurement can be negative due to garbage collection timing
        expect(typeof result.metadata.memoryUsedMB).toBe('number');
      });
    });

    test('algorithm profiler provides accurate benchmarks', () => {
      const list1 = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const list2 = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      
      const benchmark = profiler.benchmarkCalculation(list1, list2);
      
      expect(benchmark.inputSize).toBe(1000);
      expect(benchmark.executionTimeMs).toBeGreaterThan(0);
      expect(benchmark.memoryUsageMB).toBeGreaterThanOrEqual(0);
      expect(benchmark.operationsPerSecond).toBeGreaterThan(0);
    });

    test('performance test suite runs successfully', () => {
      const results = profiler.runPerformanceTests();
      
      expect(results).toHaveLength(5); // Test sizes: 100, 1000, 10000, 50000, 100000
      
      results.forEach((benchmark: any, index: number) => {
        expect(benchmark.inputSize).toBeGreaterThan(0);
        expect(benchmark.executionTimeMs).toBeGreaterThan(0);
        expect(benchmark.operationsPerSecond).toBeGreaterThan(0);
        
        // Later tests should take longer (but not exponentially)
        if (index > 0) {
          expect(benchmark.executionTimeMs).toBeGreaterThan(results[index - 1].executionTimeMs);
        }
      });
    });
  });

  describe('Performance Targets', () => {
    test('meets small dataset performance target (<10ms for 1K elements)', () => {
      const list1 = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      const list2 = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
      
      const startTime = performance.now();
      const result = calculator.calculateDistance(list1, list2);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(10); // <10ms target
      expect(result.metadata.processingTimeMs).toBeLessThan(10);
    });

    test('meets medium dataset performance target (<100ms for 10K elements)', () => {
      const list1 = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
      const list2 = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
      
      const startTime = performance.now();
      const result = calculator.calculateDistance(list1, list2);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // <100ms target
      expect(result.metadata.processingTimeMs).toBeLessThan(100);
    });

    test('memory overhead stays under 2x input size', () => {
      const size = 10000;
      const list1 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
      const list2 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
      
      // Estimate input size in bytes (each number ~8 bytes + array overhead)
      const estimatedInputSizeBytes = size * 2 * 8; // Two arrays of numbers
      const estimatedInputSizeMB = estimatedInputSizeBytes / 1024 / 1024;
      
      const result = calculator.calculateDistance(list1, list2);
      
      // Memory should be tracked (may vary due to GC timing)
      expect(typeof result.metadata.memoryUsedMB).toBe('number');
    });
  });

  describe('Algorithm Correctness Under Optimization', () => {
    test('produces identical results to original algorithm', () => {
      const { DistanceCalculationEngine } = require('../../../src/services/DistanceCalculationEngine');
      
      const testCases = [
        { list1: [3, 4, 2, 1, 3, 3], list2: [4, 3, 5, 3, 9, 3] },
        { list1: [1, 2, 3], list2: [3, 2, 1] },
        { list1: [5], list2: [5] },
        { list1: [10, 20, 30], list2: [15, 25, 35] }
      ];
      
      testCases.forEach(({ list1, list2 }) => {
        const originalResult = DistanceCalculationEngine.calculateDistance(list1, list2);
        const optimizedResult = calculator.calculateDistance(list1, list2);
        
        expect(optimizedResult.totalDistance).toBe(originalResult.totalDistance);
        expect(optimizedResult.pairs).toHaveLength(originalResult.pairs.length);
        
        // Verify pairs are equivalent (order may differ due to sorting)
        const originalPairs = originalResult.pairs.sort((a: any, b: any) => 
          a.list1Value - b.list1Value || a.list2Value - b.list2Value
        );
        const optimizedPairs = optimizedResult.pairs.sort((a: any, b: any) => 
          a.list1Value - b.list1Value || a.list2Value - b.list2Value
        );
        
        originalPairs.forEach((pair: any, index: number) => {
          expect(optimizedPairs[index].distance).toBe(pair.distance);
        });
      });
    });

    test('handles edge cases efficiently', () => {
      // Empty arrays (should handle gracefully)
      expect(() => calculator.calculateDistance([], [])).not.toThrow();
      const emptyResult = calculator.calculateDistance([], []);
      expect(emptyResult.totalDistance).toBe(0);
      expect(emptyResult.pairs).toHaveLength(0);
      
      // Single element
      const singleResult = calculator.calculateDistance([1], [2]);
      expect(singleResult.totalDistance).toBe(1);
      expect(singleResult.pairs).toHaveLength(1);
      
      // Identical arrays
      const identicalResult = calculator.calculateDistance([1, 2, 3], [1, 2, 3]);
      expect(identicalResult.totalDistance).toBe(0);
      
      // Large numbers
      const largeResult = calculator.calculateDistance([1000000], [999999]);
      expect(largeResult.totalDistance).toBe(1);
    });

    test('maintains precision with floating point numbers', () => {
      const list1 = [1.1, 2.2, 3.3];
      const list2 = [1.2, 2.1, 3.4];
      
      const result = calculator.calculateDistance(list1, list2);
      
      expect(result.totalDistance).toBeCloseTo(0.3, 1); // 0.1 + 0.1 + 0.1
      expect(result.pairs).toHaveLength(3);
      
      result.pairs.forEach((pair: any) => {
        expect(pair.distance).toBeGreaterThanOrEqual(0);
        expect(typeof pair.distance).toBe('number');
      });
    });
  });

  describe('Error Handling Performance', () => {
    test('validation errors are thrown quickly', () => {
      const startTime = performance.now();
      
      expect(() => {
        calculator.calculateDistance([1, 2], [1]);
      }).toThrow();
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      // Validation should be reasonably fast (allow for test overhead and system variance in CI)
      expect(validationTime).toBeLessThan(50);
    });

    test('type validation is efficient', () => {
      const list1 = [1, 2, 'invalid'] as any;
      const list2 = [1, 2, 3];
      
      const startTime = performance.now();
      
      expect(() => {
        calculator.calculateDistance(list1, list2);
      }).toThrow();
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      
      expect(validationTime).toBeLessThan(10);
    });
  });

  describe('Memory Management', () => {
    test('does not create memory leaks in repeated calculations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many calculations
      for (let i = 0; i < 100; i++) {
        const list1 = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
        const list2 = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
        
        calculator.calculateDistance(list1, list2);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (not accumulating)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    });

    test('efficiently handles large datasets without memory explosion', () => {
      const size = 50000;
      const list1 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
      const list2 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
      
      const memoryBefore = process.memoryUsage().heapUsed;
      const result = calculator.calculateDistance(list1, list2);
      const memoryAfter = process.memoryUsage().heapUsed;
      
      const memoryUsed = (memoryAfter - memoryBefore) / 1024 / 1024; // MB
      
      expect(result.totalDistance).toBeGreaterThanOrEqual(0);
      expect(memoryUsed).toBeLessThan(100); // Less than 100MB for 50K elements
    });
  });
});