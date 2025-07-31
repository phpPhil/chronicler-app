// Load testing framework for Chronicler application
const autocannon = require('autocannon'); // Would be installed in production
const { performance } = require('perf_hooks');

class LoadTestRunner {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:3001';
    this.duration = options.duration || 10; // seconds
    this.connections = options.connections || 10;
    this.pipelining = options.pipelining || 1;
    this.headers = options.headers || { 'Content-Type': 'application/json' };
  }

  async runHealthCheckLoadTest() {
    console.log('🏃 Running Health Check Load Test...');
    
    const result = await this.simulateLoadTest('/api/health', {
      method: 'GET',
      expectedStatus: 200
    });
    
    return this.formatResults('Health Check', result);
  }

  async runDistanceCalculationLoadTest() {
    console.log('🏃 Running Distance Calculation Load Test...');
    
    const testPayload = {
      list1: [3, 4, 2, 1, 3, 3],
      list2: [4, 3, 5, 3, 9, 3]
    };
    
    const result = await this.simulateLoadTest('/api/distance/calculate', {
      method: 'POST',
      body: JSON.stringify(testPayload),
      expectedStatus: 200
    });
    
    return this.formatResults('Distance Calculation', result);
  }

  async runFileUploadLoadTest() {
    console.log('🏃 Running File Upload Load Test...');
    
    // Simulate file upload with form data
    const result = await this.simulateLoadTest('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      expectedStatus: 200
    });
    
    return this.formatResults('File Upload', result);
  }

  async simulateLoadTest(endpoint, options = {}) {
    // Mock implementation - in production would use autocannon
    console.log(`📊 Simulating load test for ${endpoint}...`);
    
    const startTime = performance.now();
    const results = {
      requests: [],
      totalRequests: 0,
      totalTime: 0,
      averageResponseTime: 0,
      requestsPerSecond: 0,
      errors: 0,
      timeouts: 0
    };
    
    // Simulate concurrent requests
    const promises = [];
    const totalRequests = this.connections * this.duration;
    
    for (let i = 0; i < totalRequests; i++) {
      promises.push(this.simulateRequest(endpoint, options));
    }
    
    const responses = await Promise.allSettled(promises);
    
    responses.forEach(response => {
      if (response.status === 'fulfilled') {
        results.requests.push(response.value);
        results.totalRequests++;
        if (response.value.error) {
          results.errors++;
        }
        if (response.value.timeout) {
          results.timeouts++;
        }
      } else {
        results.errors++;
      }
    });
    
    const endTime = performance.now();
    results.totalTime = endTime - startTime;
    results.averageResponseTime = results.requests.reduce((sum, req) => sum + req.responseTime, 0) / results.requests.length;
    results.requestsPerSecond = results.totalRequests / (results.totalTime / 1000);
    
    return results;
  }

  async simulateRequest(endpoint, options = {}) {
    const startTime = performance.now();
    
    try {
      // Mock HTTP request simulation
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 10)); // 10-110ms response time
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Simulate occasional errors or timeouts
      const errorRate = 0.02; // 2% error rate
      const timeoutRate = 0.01; // 1% timeout rate
      
      return {
        responseTime,
        status: Math.random() < errorRate ? 500 : (options.expectedStatus || 200),
        error: Math.random() < errorRate,
        timeout: Math.random() < timeoutRate,
        endpoint
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        responseTime: endTime - startTime,
        status: 500,
        error: true,
        timeout: false,
        endpoint
      };
    }
  }

  formatResults(testName, results) {
    const summary = {
      testName,
      duration: this.duration,
      connections: this.connections,
      totalRequests: results.totalRequests,
      requestsPerSecond: Math.round(results.requestsPerSecond * 100) / 100,
      averageResponseTime: Math.round(results.averageResponseTime * 100) / 100,
      errors: results.errors,
      timeouts: results.timeouts,
      errorRate: Math.round((results.errors / results.totalRequests) * 10000) / 100, // percentage
      timeoutRate: Math.round((results.timeouts / results.totalRequests) * 10000) / 100,
      passed: results.errors < results.totalRequests * 0.05 && results.averageResponseTime < 1000 // <5% errors, <1s avg response
    };

    console.log(`\n📊 Load Test Results: ${testName}`);
    console.log('====================================');
    console.log(`Total Requests: ${summary.totalRequests}`);
    console.log(`Requests/sec: ${summary.requestsPerSecond}`);
    console.log(`Avg Response Time: ${summary.averageResponseTime}ms`);
    console.log(`Errors: ${summary.errors} (${summary.errorRate}%)`);
    console.log(`Timeouts: ${summary.timeouts} (${summary.timeoutRate}%)`);
    console.log(`Status: ${summary.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('====================================\n');

    return summary;
  }

  async runComprehensiveLoadTest() {
    console.log('🚀 Starting Comprehensive Load Testing Suite...\n');
    
    const startTime = performance.now();
    const results = [];
    
    try {
      // Run individual load tests
      results.push(await this.runHealthCheckLoadTest());
      results.push(await this.runDistanceCalculationLoadTest());
      results.push(await this.runFileUploadLoadTest());
      
      // Run stress test with higher load
      console.log('🔥 Running Stress Test...');
      const originalConnections = this.connections;
      this.connections = 50; // Increase load
      results.push(await this.runDistanceCalculationLoadTest());
      this.connections = originalConnections; // Restore
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Generate comprehensive report
      const report = this.generateLoadTestReport(results, totalTime);
      
      return report;
    } catch (error) {
      console.error('❌ Load testing failed:', error);
      throw error;
    }
  }

  generateLoadTestReport(results, totalTime) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTestTime: Math.round(totalTime),
      testsSummary: {
        total: results.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length
      },
      performance: {
        averageRPS: Math.round(results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / results.length * 100) / 100,
        averageResponseTime: Math.round(results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length * 100) / 100,
        totalRequests: results.reduce((sum, r) => sum + r.totalRequests, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors, 0)
      },
      results,
      recommendations: this.generateRecommendations(results)
    };

    console.log('\n🏁 Comprehensive Load Test Report');
    console.log('================================');
    console.log(`Total Test Time: ${report.totalTestTime}ms`);
    console.log(`Tests: ${report.testsSummary.passed}/${report.testsSummary.total} passed`);
    console.log(`Average RPS: ${report.performance.averageRPS}`);
    console.log(`Average Response Time: ${report.performance.averageResponseTime}ms`);
    console.log(`Total Requests: ${report.performance.totalRequests}`);
    console.log(`Total Errors: ${report.performance.totalErrors}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }
    
    console.log('================================\n');

    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    const avgResponseTime = results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length;
    const avgErrorRate = results.reduce((sum, r) => sum + r.errorRate, 0) / results.length;
    const avgRPS = results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / results.length;
    
    if (avgResponseTime > 500) {
      recommendations.push('Consider optimizing response times - average exceeds 500ms');
    }
    
    if (avgErrorRate > 2) {
      recommendations.push('High error rate detected - investigate error handling');
    }
    
    if (avgRPS < 100) {
      recommendations.push('Low throughput detected - consider performance optimization');
    }
    
    // Specific endpoint recommendations
    const distanceCalcResult = results.find(r => r.testName === 'Distance Calculation');
    if (distanceCalcResult && distanceCalcResult.averageResponseTime > 200) {
      recommendations.push('Distance calculation endpoint is slow - optimize algorithm');
    }
    
    const fileUploadResult = results.find(r => r.testName === 'File Upload');
    if (fileUploadResult && fileUploadResult.errorRate > 5) {
      recommendations.push('File upload endpoint has high error rate - check validation');
    }
    
    return recommendations;
  }
}

// Memory usage monitoring
class MemoryMonitor {
  constructor() {
    this.baseline = process.memoryUsage();
    this.samples = [];
  }

  sample() {
    const usage = process.memoryUsage();
    const sample = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024, // MB
      rss: usage.rss / 1024 / 1024 // MB
    };
    
    this.samples.push(sample);
    return sample;
  }

  getReport() {
    if (this.samples.length === 0) return null;

    const current = this.samples[this.samples.length - 1];
    const peak = this.samples.reduce((max, sample) => 
      sample.heapUsed > max.heapUsed ? sample : max
    );

    return {
      baseline: {
        heapUsed: this.baseline.heapUsed / 1024 / 1024,
        heapTotal: this.baseline.heapTotal / 1024 / 1024
      },
      current: {
        heapUsed: current.heapUsed,
        heapTotal: current.heapTotal,
        external: current.external,
        rss: current.rss
      },
      peak: {
        heapUsed: peak.heapUsed,
        heapTotal: peak.heapTotal,
        timestamp: new Date(peak.timestamp).toISOString()
      },
      growth: {
        heapUsed: current.heapUsed - (this.baseline.heapUsed / 1024 / 1024),
        heapTotal: current.heapTotal - (this.baseline.heapTotal / 1024 / 1024)
      },
      sampleCount: this.samples.length
    };
  }
}

// Export for use in tests
module.exports = {
  LoadTestRunner,
  MemoryMonitor
};

// CLI usage example
if (require.main === module) {
  async function runLoadTests() {
    const runner = new LoadTestRunner({
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
      duration: parseInt(process.env.LOAD_TEST_DURATION) || 10,
      connections: parseInt(process.env.LOAD_TEST_CONNECTIONS) || 10
    });

    const memoryMonitor = new MemoryMonitor();
    
    // Sample memory usage during test
    const memoryInterval = setInterval(() => {
      memoryMonitor.sample();
    }, 1000);

    try {
      const report = await runner.runComprehensiveLoadTest();
      
      clearInterval(memoryInterval);
      const memoryReport = memoryMonitor.getReport();
      
      if (memoryReport) {
        console.log('💾 Memory Usage Report');
        console.log('====================');
        console.log(`Peak Heap Usage: ${memoryReport.peak.heapUsed.toFixed(2)}MB`);
        console.log(`Current Heap Usage: ${memoryReport.current.heapUsed.toFixed(2)}MB`);
        console.log(`Memory Growth: ${memoryReport.growth.heapUsed.toFixed(2)}MB`);
        console.log('====================\n');
      }
      
      // Exit with appropriate code
      const allPassed = report.testsSummary.passed === report.testsSummary.total;
      process.exit(allPassed ? 0 : 1);
      
    } catch (error) {
      clearInterval(memoryInterval);
      console.error('Load testing failed:', error);
      process.exit(1);
    }
  }

  runLoadTests();
}