// Performance benchmarking tests for Chronicler application
const { performance } = require('perf_hooks');

// Import our services - in a real environment these would be actual imports
const mockDistanceCalculationEngine = {
  calculateDistance: (list1, list2) => {
    // Mock calculation with realistic timing
    const start = performance.now();
    
    // Simulate sorting (O(n log n))
    const sortedList1 = [...list1].sort((a, b) => a - b);
    const sortedList2 = [...list2].sort((a, b) => a - b);
    
    // Calculate distances
    let totalDistance = 0;
    const pairs = [];
    
    for (let i = 0; i < sortedList1.length; i++) {
      const distance = Math.abs(sortedList1[i] - sortedList2[i]);
      totalDistance += distance;
      pairs.push({
        left: sortedList1[i],
        right: sortedList2[i],
        distance
      });
    }
    
    const end = performance.now();
    
    return {
      totalDistance,
      pairs,
      metadata: {
        leftListSize: list1.length,
        rightListSize: list2.length,
        processingTimeMs: end - start
      }
    };
  }
};

describe('Performance Benchmarks', () => {
  let performanceResults = [];
  
  beforeAll(() => {
    console.log('🏃 Starting Performance Benchmark Suite...');
  });
  
  afterAll(() => {
    // Generate performance report
    generatePerformanceReport(performanceResults);
  });
  
  describe('Distance Calculation Performance', () => {
    const testCases = [
      { size: 10, name: 'Small dataset' },
      { size: 100, name: 'Medium dataset' },
      { size: 1000, name: 'Large dataset' },
      { size: 10000, name: 'Very large dataset' },
      { size: 100000, name: 'Massive dataset' }
    ];
    
    testCases.forEach(({ size, name }) => {
      it(`should handle ${name} (${size} elements) within performance threshold`, async () => {
        const testData = generateTestData(size);
        const iterations = size > 1000 ? 1 : 10; // Fewer iterations for large datasets
        
        const benchmarkResult = await runBenchmark(
          `Distance Calculation - ${name}`,
          () => mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2),
          iterations
        );
        
        performanceResults.push(benchmarkResult);
        
        // Performance thresholds based on dataset size
        const expectedMaxTime = getExpectedMaxTime(size);
        
        expect(benchmarkResult.averageTime).toBeLessThan(expectedMaxTime);
        expect(benchmarkResult.result.totalDistance).toBeGreaterThanOrEqual(0);
        
        console.log(`✅ ${name}: ${benchmarkResult.averageTime.toFixed(2)}ms (expected <${expectedMaxTime}ms)`);
      });
    });
    
    it('should demonstrate O(n log n) complexity scaling', async () => {
      const dataSizes = [100, 200, 400, 800, 1600];
      const timings = [];
      
      for (const size of dataSizes) {
        const testData = generateTestData(size);
        const start = performance.now();
        
        mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2);
        
        const end = performance.now();
        timings.push({ size, time: end - start });
      }
      
      // Verify that timing grows approximately as O(n log n)
      // We'll check that larger datasets don't grow exponentially
      let complexityValid = true;
      for (let i = 1; i < timings.length - 1; i++) {
        const current = timings[i];
        const next = timings[i + 1];
        
        // Expected ratio for doubling size in O(n log n): approximately 2.1
        const actualRatio = next.time / current.time;
        const expectedRatio = (next.size * Math.log2(next.size)) / (current.size * Math.log2(current.size));
        
        // Allow for variance in measurement
        if (actualRatio > expectedRatio * 3) {
          complexityValid = false;
          break;
        }
      }
      
      expect(complexityValid).toBe(true);
      
      console.log('📊 Complexity Analysis:');
      timings.forEach(({ size, time }) => {
        console.log(`   Size ${size}: ${time.toFixed(3)}ms`);
      });
    });
  });
  
  describe('Memory Usage Benchmarks', () => {
    it('should use memory efficiently for large datasets', async () => {
      const size = 50000;
      const testData = generateTestData(size);
      
      const initialMemory = process.memoryUsage();
      
      // Run calculation
      const result = mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2);
      
      const finalMemory = process.memoryUsage();
      const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryDeltaMB = memoryDelta / 1024 / 1024;
      
      // Memory usage should be reasonable (linear with input size)
      const expectedMaxMemoryMB = (size * 8 * 2) / 1024 / 1024 * 2; // Double the theoretical minimum
      
      expect(memoryDeltaMB).toBeLessThan(expectedMaxMemoryMB);
      expect(result.totalDistance).toBeGreaterThanOrEqual(0);
      
      console.log(`💾 Memory usage for ${size} elements: ${memoryDeltaMB.toFixed(2)}MB (expected <${expectedMaxMemoryMB.toFixed(2)}MB)`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });
    
    it('should not have memory leaks during repeated calculations', async () => {
      const iterations = 100;
      const size = 1000;
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < iterations; i++) {
        const testData = generateTestData(size);
        mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2);
        
        // Occasional garbage collection
        if (i % 10 === 0 && global.gc) {
          global.gc();
        }
      }
      
      // Final garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowthMB = (finalMemory - initialMemory) / 1024 / 1024;
      
      // Memory growth should be minimal (less than 10MB for 100 iterations)
      expect(memoryGrowthMB).toBeLessThan(10);
      
      console.log(`🔄 Memory growth after ${iterations} iterations: ${memoryGrowthMB.toFixed(2)}MB`);
    });
  });
  
  describe('Concurrent Processing Benchmarks', () => {
    it('should handle concurrent calculations efficiently', async () => {
      const concurrency = 10;
      const size = 1000;
      
      const testData = Array.from({ length: concurrency }, () => generateTestData(size));
      
      const start = performance.now();
      
      const promises = testData.map(data => 
        Promise.resolve(mockDistanceCalculationEngine.calculateDistance(data.list1, data.list2))
      );
      
      const results = await Promise.all(promises);
      
      const end = performance.now();
      const totalTime = end - start;
      const averageTimePerCalculation = totalTime / concurrency;
      
      // Concurrent processing should be efficient
      expect(averageTimePerCalculation).toBeLessThan(100); // Less than 100ms per calculation
      expect(results).toHaveLength(concurrency);
      results.forEach(result => {
        expect(result.totalDistance).toBeGreaterThanOrEqual(0);
      });
      
      console.log(`⚡ Concurrent processing (${concurrency} operations): ${totalTime.toFixed(2)}ms total, ${averageTimePerCalculation.toFixed(2)}ms average`);
    });
  });
  
  describe('Edge Case Performance', () => {
    it('should handle identical lists quickly', async () => {
      const size = 10000;
      const identicalValue = 42;
      const testData = {
        list1: Array(size).fill(identicalValue),
        list2: Array(size).fill(identicalValue)
      };
      
      const benchmarkResult = await runBenchmark(
        'Identical Lists',
        () => mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2),
        5
      );
      
      expect(benchmarkResult.result.totalDistance).toBe(0);
      expect(benchmarkResult.averageTime).toBeLessThan(50); // Should be very fast
      
      console.log(`🎯 Identical lists performance: ${benchmarkResult.averageTime.toFixed(2)}ms`);
    });
    
    it('should handle sorted lists efficiently', async () => {
      const size = 10000;
      const testData = {
        list1: Array.from({ length: size }, (_, i) => i),
        list2: Array.from({ length: size }, (_, i) => i + 1)
      };
      
      const benchmarkResult = await runBenchmark(
        'Pre-sorted Lists',
        () => mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2),
        5
      );
      
      expect(benchmarkResult.result.totalDistance).toBe(size); // Each pair has distance 1
      expect(benchmarkResult.averageTime).toBeLessThan(100);
      
      console.log(`📈 Pre-sorted lists performance: ${benchmarkResult.averageTime.toFixed(2)}ms`);
    });
    
    it('should handle reverse-sorted lists efficiently', async () => {
      const size = 5000;
      const testData = {
        list1: Array.from({ length: size }, (_, i) => i),
        list2: Array.from({ length: size }, (_, i) => size - i - 1)
      };
      
      const benchmarkResult = await runBenchmark(
        'Reverse-sorted Lists',
        () => mockDistanceCalculationEngine.calculateDistance(testData.list1, testData.list2),
        5
      );
      
      expect(benchmarkResult.result.totalDistance).toBe(0); // After sorting, they should be identical
      expect(benchmarkResult.averageTime).toBeLessThan(100);
      
      console.log(`🔄 Reverse-sorted lists performance: ${benchmarkResult.averageTime.toFixed(2)}ms`);
    });
  });
});

// Utility functions
function generateTestData(size) {
  return {
    list1: Array.from({ length: size }, () => Math.floor(Math.random() * 1000000)),
    list2: Array.from({ length: size }, () => Math.floor(Math.random() * 1000000))
  };
}

function getExpectedMaxTime(size) {
  // Expected maximum times based on complexity analysis
  const thresholds = {
    10: 5,      // 5ms
    100: 10,    // 10ms
    1000: 50,   // 50ms
    10000: 500, // 500ms
    100000: 5000 // 5s
  };
  
  // Find the closest threshold
  const sizes = Object.keys(thresholds).map(Number).sort((a, b) => a - b);
  for (const thresholdSize of sizes) {
    if (size <= thresholdSize) {
      return thresholds[thresholdSize];
    }
  }
  
  // For sizes larger than our thresholds, extrapolate
  return Math.max(5000, size * 0.05); // 0.05ms per element as upper bound
}

async function runBenchmark(name, testFunction, iterations = 10) {
  const times = [];
  let result = null;
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    result = await testFunction();
    const end = performance.now();
    times.push(end - start);
  }
  
  times.sort((a, b) => a - b);
  
  return {
    name,
    iterations,
    result,
    averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    medianTime: times[Math.floor(times.length / 2)],
    minTime: times[0],
    maxTime: times[times.length - 1],
    standardDeviation: calculateStandardDeviation(times)
  };
}

function calculateStandardDeviation(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / values.length;
  return Math.sqrt(variance);
}

function generatePerformanceReport(results) {
  console.log('\n📊 Performance Benchmark Report');
  console.log('================================');
  
  if (results.length === 0) {
    console.log('No benchmark results available');
    return;
  }
  
  const totalTests = results.length;
  const averageTime = results.reduce((sum, r) => sum + r.averageTime, 0) / totalTests;
  const fastestTest = results.reduce((fastest, current) => 
    current.averageTime < fastest.averageTime ? current : fastest
  );
  const slowestTest = results.reduce((slowest, current) => 
    current.averageTime > slowest.averageTime ? current : slowest
  );
  
  console.log(`Total Benchmarks: ${totalTests}`);
  console.log(`Average Time: ${averageTime.toFixed(2)}ms`);
  console.log(`Fastest: ${fastestTest.name} (${fastestTest.averageTime.toFixed(2)}ms)`);
  console.log(`Slowest: ${slowestTest.name} (${slowestTest.averageTime.toFixed(2)}ms)`);
  
  console.log('\n📈 Detailed Results:');
  results.forEach(result => {
    console.log(`   ${result.name}:`);
    console.log(`     Average: ${result.averageTime.toFixed(3)}ms`);
    console.log(`     Median: ${result.medianTime.toFixed(3)}ms`);
    console.log(`     Min/Max: ${result.minTime.toFixed(3)}ms / ${result.maxTime.toFixed(3)}ms`);
    console.log(`     Std Dev: ${result.standardDeviation.toFixed(3)}ms`);
  });
  
  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  if (averageTime > 100) {
    console.log('   - Consider algorithm optimization for better average performance');
  }
  if (slowestTest.averageTime > 1000) {
    console.log(`   - Investigate ${slowestTest.name} for potential optimization`);
  }
  
  const highVarianceTests = results.filter(r => r.standardDeviation > r.averageTime * 0.5);
  if (highVarianceTests.length > 0) {
    console.log('   - High variance detected in some tests - consider more stable algorithms');
  }
  
  console.log('================================\n');
}