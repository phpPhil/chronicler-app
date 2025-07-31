#!/usr/bin/env ts-node

/**
 * Performance Benchmark Script for Distance Calculation Algorithm
 * 
 * This script runs comprehensive performance tests to validate:
 * - Algorithm complexity scaling (O(n log n))
 * - Memory usage patterns (linear scaling)
 * - Performance targets for different dataset sizes
 * - Optimization effectiveness
 */

import { DistanceCalculationEngine } from '../services/DistanceCalculationEngine';
import { OptimizedDistanceCalculator } from '../services/OptimizedDistanceCalculator';
import { AlgorithmProfiler } from '../services/AlgorithmProfiler';
import { SimplePerformanceTracker } from '../services/SimplePerformanceTracker';

interface BenchmarkResult {
  original: number;
  optimized: number;
  improvement: number;
  size: number;
}

class PerformanceBenchmarkSuite {
  private originalEngine = new DistanceCalculationEngine();
  private optimizedCalculator = new OptimizedDistanceCalculator();
  private performanceTracker = new SimplePerformanceTracker();

  /**
   * Run comprehensive benchmark suite
   */
  async runBenchmarkSuite(): Promise<void> {
    console.log('🚀 Starting Performance Benchmark Suite');
    console.log('═'.repeat(80));
    
    // Algorithm complexity analysis
    console.log('\n📊 Algorithm Complexity Analysis');
    console.log('─'.repeat(50));
    AlgorithmProfiler.runPerformanceTests();
    
    // Comparative performance analysis
    console.log('\n⚡ Comparative Performance Analysis');
    console.log('─'.repeat(50));
    await this.runComparativeTests();
    
    // Memory usage analysis
    console.log('\n🧠 Memory Usage Analysis');
    console.log('─'.repeat(50));
    this.runMemoryTests();
    
    // Edge case performance
    console.log('\n🔍 Edge Case Performance');
    console.log('─'.repeat(50));
    this.runEdgeCaseTests();
    
    // Performance target validation
    console.log('\n🎯 Performance Target Validation');
    console.log('─'.repeat(50));
    this.validatePerformanceTargets();
    
    // Final report
    console.log('\n📋 Final Performance Report');
    console.log('─'.repeat(50));
    console.log(this.performanceTracker.getPerformanceReport());
  }

  /**
   * Compare original vs optimized implementation performance
   */
  private async runComparativeTests(): Promise<void> {
    const testSizes = [1000, 5000, 10000, 25000];
    const results: BenchmarkResult[] = [];
    
    console.log('Size'.padEnd(10) + 'Original'.padStart(12) + 'Optimized'.padStart(12) + 'Improvement'.padStart(12));
    console.log('─'.repeat(50));
    
    for (const size of testSizes) {
      const list1 = this.generateTestData(size);
      const list2 = this.generateTestData(size);
      
      // Benchmark original implementation
      this.performanceTracker.trackOperation('original_calculation', () => {
        return DistanceCalculationEngine.calculateDistance(list1, list2);
      });
      
      // Benchmark optimized implementation  
      this.performanceTracker.trackOperation('optimized_calculation', () => {
        return this.optimizedCalculator.calculateDistance(list1, list2);
      });
      
      const originalMetrics = this.performanceTracker.getOperationMetrics('original_calculation');
      const optimizedMetrics = this.performanceTracker.getOperationMetrics('optimized_calculation');
      
      if (originalMetrics && optimizedMetrics) {
        const improvement = ((originalMetrics.recent[originalMetrics.recent.length - 1] - 
                            optimizedMetrics.recent[optimizedMetrics.recent.length - 1]) / 
                           originalMetrics.recent[originalMetrics.recent.length - 1]) * 100;
        
        results.push({
          original: originalMetrics.recent[originalMetrics.recent.length - 1],
          optimized: optimizedMetrics.recent[optimizedMetrics.recent.length - 1],
          improvement,
          size
        });
        
        console.log(
          size.toLocaleString().padEnd(10) +
          `${originalMetrics.recent[originalMetrics.recent.length - 1].toFixed(2)}ms`.padStart(12) +
          `${optimizedMetrics.recent[optimizedMetrics.recent.length - 1].toFixed(2)}ms`.padStart(12) +
          `${improvement.toFixed(1)}%`.padStart(12)
        );
      }
    }
    
    // Verify results are identical
    this.verifyResultCorrectness();
  }

  /**
   * Analyze memory usage patterns
   */
  private runMemoryTests(): void {
    const testSizes = [1000, 5000, 10000, 25000];
    
    console.log('Size'.padEnd(10) + 'Memory (MB)'.padStart(15) + 'Per Element'.padStart(15) + 'Efficiency'.padStart(12));
    console.log('─'.repeat(55));
    
    for (const size of testSizes) {
      const list1 = this.generateTestData(size);
      const list2 = this.generateTestData(size);
      
      const memoryBefore = this.getCurrentMemoryUsage();
      this.optimizedCalculator.calculateDistance(list1, list2);
      const memoryAfter = this.getCurrentMemoryUsage();
      
      const memoryUsedMB = (memoryAfter - memoryBefore) / 1024 / 1024;
      const memoryPerElement = memoryUsedMB / size * 1024; // KB per element
      const efficiency = size / memoryUsedMB; // Elements per MB
      
      console.log(
        size.toLocaleString().padEnd(10) +
        `${memoryUsedMB.toFixed(2)}`.padStart(15) +
        `${memoryPerElement.toFixed(2)} KB`.padStart(15) +
        `${efficiency.toFixed(0)} el/MB`.padStart(12)
      );
    }
  }

  /**
   * Test performance on edge cases
   */
  private runEdgeCaseTests(): void {
    const edgeCases = [
      { name: 'Empty arrays', list1: [], list2: [] },
      { name: 'Single element', list1: [1], list2: [2] },
      { name: 'Identical arrays', list1: [1, 2, 3, 4, 5], list2: [1, 2, 3, 4, 5] },
      { name: 'Reverse sorted', list1: [5, 4, 3, 2, 1], list2: [1, 2, 3, 4, 5] },
      { name: 'Already sorted', list1: [1, 2, 3, 4, 5], list2: [2, 3, 4, 5, 6] },
      { name: 'Large numbers', list1: [1000000, 2000000], list2: [1500000, 2500000] },
      { name: 'Decimal numbers', list1: [1.1, 2.2, 3.3], list2: [1.2, 2.1, 3.4] }
    ];
    
    console.log('Test Case'.padEnd(20) + 'Time (ms)'.padStart(12) + 'Result'.padStart(15) + 'Status'.padStart(10));
    console.log('─'.repeat(60));
    
    for (const testCase of edgeCases) {
      try {
        const executionTime = this.performanceTracker.trackOperation(
          `edge_case_${testCase.name}`,
          () => this.optimizedCalculator.calculateDistance(testCase.list1, testCase.list2)
        );
        
        const metrics = this.performanceTracker.getOperationMetrics(`edge_case_${testCase.name}`);
        const time = metrics?.recent[metrics.recent.length - 1] || 0;
        
        console.log(
          testCase.name.padEnd(20) +
          `${time.toFixed(3)}`.padStart(12) +
          `${executionTime.totalDistance}`.padStart(15) +
          '✅ PASS'.padStart(10)
        );
      } catch {
        console.log(
          testCase.name.padEnd(20) +
          'ERROR'.padStart(12) +
          'N/A'.padStart(15) +
          '❌ FAIL'.padStart(10)
        );
      }
    }
  }

  /**
   * Validate performance targets are met
   */
  private validatePerformanceTargets(): void {
    const targets = [
      { size: 1000, maxTime: 10, description: 'Small dataset (<10ms)' },
      { size: 10000, maxTime: 100, description: 'Medium dataset (<100ms)' },
      { size: 50000, maxTime: 1000, description: 'Large dataset (<1s)' }
    ];
    
    console.log('Target'.padEnd(25) + 'Size'.padStart(10) + 'Time (ms)'.padStart(12) + 'Limit (ms)'.padStart(12) + 'Status'.padStart(10));
    console.log('─'.repeat(70));
    
    for (const target of targets) {
      const list1 = this.generateTestData(target.size);
      const list2 = this.generateTestData(target.size);
      
      this.performanceTracker.trackOperation(
        `target_${target.size}`,
        () => this.optimizedCalculator.calculateDistance(list1, list2)
      );
      
      const metrics = this.performanceTracker.getOperationMetrics(`target_${target.size}`);
      const actualTime = metrics?.recent[metrics.recent.length - 1] || 0;
      
      const status = actualTime <= target.maxTime ? '✅ PASS' : '❌ FAIL';
      
      console.log(
        target.description.padEnd(25) +
        target.size.toLocaleString().padStart(10) +
        `${actualTime.toFixed(2)}`.padStart(12) +
        `${target.maxTime}`.padStart(12) +
        status.padStart(10)
      );
    }
  }

  /**
   * Verify that optimized results match original results
   */
  private verifyResultCorrectness(): void {
    console.log('\n🔍 Result Correctness Verification');
    console.log('─'.repeat(40));
    
    const testCases = [
      { list1: [3, 4, 2, 1, 3, 3], list2: [4, 3, 5, 3, 9, 3] },
      { list1: [1, 2, 3], list2: [3, 2, 1] },
      { list1: [5, 5, 5], list2: [5, 5, 5] },
      { list1: [10, 20, 30], list2: [15, 25, 35] }
    ];
    
    let allCorrect = true;
    
    for (let i = 0; i < testCases.length; i++) {
      const { list1, list2 } = testCases[i];
      
      const originalResult = DistanceCalculationEngine.calculateDistance(list1, list2);
      const optimizedResult = this.optimizedCalculator.calculateDistance(list1, list2);
      
      const isCorrect = originalResult.totalDistance === optimizedResult.totalDistance;
      
      console.log(
        `Test ${i + 1}:`.padEnd(10) +
        `Original: ${originalResult.totalDistance}`.padEnd(15) +
        `Optimized: ${optimizedResult.totalDistance}`.padEnd(15) +
        (isCorrect ? '✅ MATCH' : '❌ MISMATCH')
      );
      
      if (!isCorrect) {
        allCorrect = false;
      }
    }
    
    console.log(`\nOverall correctness: ${allCorrect ? '✅ PASS' : '❌ FAIL'}`);
  }

  /**
   * Generate random test data
   */
  private generateTestData(size: number, max: number = 1000): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * max));
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }
}

// Run benchmark if script is executed directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmarkSuite();
  benchmark.runBenchmarkSuite()
    .then(() => {
      console.log('\n✅ Benchmark suite completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Benchmark suite failed:', error);
      process.exit(1);
    });
}

export { PerformanceBenchmarkSuite };