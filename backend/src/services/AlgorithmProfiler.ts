import { DistanceCalculationEngine } from './DistanceCalculationEngine';

export interface PerformanceBenchmark {
  inputSize: number;
  executionTimeMs: number;
  memoryUsageMB: number;
  operationsPerSecond: number;
}

/**
 * Algorithm profiler for benchmarking distance calculation performance
 * Provides detailed performance analysis and complexity validation
 */
export class AlgorithmProfiler {
  /**
   * Benchmark a single distance calculation operation
   * @param list1 First input list
   * @param list2 Second input list
   * @returns Performance benchmark with timing and memory metrics
   */
  static benchmarkCalculation(list1: number[], list2: number[]): PerformanceBenchmark {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();
    
    // Run the calculation using existing engine
    DistanceCalculationEngine.calculateDistance(list1, list2);
    
    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    
    const executionTimeMs = Math.max(0.001, endTime - startTime); // Ensure positive minimum
    const memoryUsageMB = Math.max(0, (endMemory - startMemory) / 1024 / 1024); // Ensure non-negative
    const operationsPerSecond = executionTimeMs > 0 ? list1.length / (executionTimeMs / 1000) : 0;
    
    return {
      inputSize: list1.length,
      executionTimeMs: Number(executionTimeMs.toFixed(3)),
      memoryUsageMB: Number(memoryUsageMB.toFixed(3)),
      operationsPerSecond: Number(operationsPerSecond.toFixed(0))
    };
  }

  /**
   * Run comprehensive performance tests across multiple input sizes
   * @returns Array of benchmarks showing scaling characteristics
   */
  static runPerformanceTests(): PerformanceBenchmark[] {
    const testSizes = [100, 1000, 10000, 50000, 100000];
    const results: PerformanceBenchmark[] = [];
    
    console.log('🚀 Running Algorithm Performance Tests...');
    console.log('═'.repeat(50));
    
    for (const size of testSizes) {
      // Generate random test data
      const list1 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
      const list2 = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
      
      const benchmark = this.benchmarkCalculation(list1, list2);
      results.push(benchmark);
      
      console.log(
        `Size ${size.toLocaleString().padStart(7)}: ` +
        `${benchmark.executionTimeMs.toFixed(2).padStart(8)}ms | ` +
        `${benchmark.memoryUsageMB.toFixed(2).padStart(8)}MB | ` +
        `${benchmark.operationsPerSecond.toLocaleString().padStart(10)} ops/sec`
      );
    }
    
    console.log('═'.repeat(50));
    this.analyzeComplexityScaling(results);
    
    return results;
  }

  /**
   * Analyze scaling characteristics to verify O(n log n) complexity
   * @param results Array of benchmark results
   */
  private static analyzeComplexityScaling(results: PerformanceBenchmark[]): void {
    console.log('📊 Complexity Analysis:');
    
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const curr = results[i];
      
      const sizeRatio = curr.inputSize / prev.inputSize;
      const timeRatio = curr.executionTimeMs / prev.executionTimeMs;
      const expectedNLogNRatio = sizeRatio * Math.log2(curr.inputSize) / Math.log2(prev.inputSize);
      
      const efficiency = expectedNLogNRatio / timeRatio;
      
      console.log(
        `${prev.inputSize} → ${curr.inputSize}: ` +
        `${timeRatio.toFixed(2)}x time | ` +
        `Expected O(n log n): ${expectedNLogNRatio.toFixed(2)}x | ` +
        `Efficiency: ${efficiency.toFixed(2)}`
      );
    }
  }

  /**
   * Get current memory usage in bytes
   * @returns Memory usage in bytes
   */
  private static getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    
    // Fallback for browser environments with memory API
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const perfMemory = performance as typeof performance & { memory: { usedJSHeapSize: number } };
      return perfMemory.memory.usedJSHeapSize || 0;
    }
    
    return 0;
  }

  /**
   * Benchmark calculation operation (instance method for test compatibility)
   */
  benchmarkCalculation(list1: number[], list2: number[]): PerformanceBenchmark {
    return AlgorithmProfiler.benchmarkCalculation(list1, list2);
  }

  /**
   * Run performance tests (instance method for test compatibility)
   */
  runPerformanceTests(): PerformanceBenchmark[] {
    return AlgorithmProfiler.runPerformanceTests();
  }
}