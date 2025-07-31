/**
 * Simple performance tracking utility for monitoring operation performance
 * Provides basic metrics without external dependencies
 */
export class SimplePerformanceTracker {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Track the execution time of an operation
   * @param operationName Name of the operation to track
   * @param operation Function to execute and time
   * @returns Result of the operation
   */
  trackOperation<T>(operationName: string, operation: () => T): T {
    const startTime = performance.now();
    
    try {
      const result = operation();
      const duration = performance.now() - startTime;
      
      this.recordMetric(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${operationName}_error`, duration);
      throw error;
    }
  }

  /**
   * Track an async operation
   * @param operationName Name of the operation to track
   * @param operation Async function to execute and time
   * @returns Promise with the result of the operation
   */
  async trackAsyncOperation<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      
      this.recordMetric(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${operationName}_error`, duration);
      throw error;
    }
  }

  /**
   * Record a metric value
   * @param operationName Name of the operation
   * @param duration Duration in milliseconds
   */
  private recordMetric(operationName: string, duration: number): void {
    if (!this.metrics.has(operationName)) {
      this.metrics.set(operationName, []);
    }
    
    const durations = this.metrics.get(operationName)!;
    durations.push(duration);
    
    // Keep only last 1000 measurements to prevent memory growth
    if (durations.length > 1000) {
      durations.shift();
    }
  }

  /**
   * Get average execution time for an operation
   * @param operationName Name of the operation
   * @returns Average time in milliseconds
   */
  getAverageTime(operationName: string): number {
    const times = this.metrics.get(operationName) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Get comprehensive metrics summary for all tracked operations
   * @returns Object with metrics for each operation
   */
  getMetricsSummary(): Record<string, {
    count: number;
    average: number;
    median: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  }> {
    const summary: Record<string, {
      count: number;
      average: number;
      median: number;
      min: number;
      max: number;
      p95: number;
      p99: number;
    }> = {};
    
    for (const [operation, times] of this.metrics.entries()) {
      if (times.length > 0) {
        const sortedTimes = [...times].sort((a, b) => a - b);
        
        summary[operation] = {
          count: times.length,
          average: Number((times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(3)),
          median: Number(this.getPercentile(sortedTimes, 50).toFixed(3)),
          min: Number(Math.min(...times).toFixed(3)),
          max: Number(Math.max(...times).toFixed(3)),
          p95: Number(this.getPercentile(sortedTimes, 95).toFixed(3)),
          p99: Number(this.getPercentile(sortedTimes, 99).toFixed(3))
        };
      }
    }
    
    return summary;
  }

  /**
   * Calculate percentile from sorted array
   * @param sortedArray Sorted array of numbers
   * @param percentile Percentile to calculate (0-100)
   * @returns Percentile value
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Get metrics for a specific operation
   * @param operationName Name of the operation
   * @returns Metrics object or null if operation not found
   */
  getOperationMetrics(operationName: string): {
    avg: number;
    count: number;
    min: number;
    max: number;
    recent: number[];
  } | null {
    const times = this.metrics.get(operationName);
    if (!times || times.length === 0) return null;
    
    return {
      avg: times.reduce((sum, time) => sum + time, 0) / times.length,
      count: times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      recent: times.slice(-10) // Last 10 measurements
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Clear metrics for a specific operation
   * @param operationName Name of the operation to clear
   */
  clearOperationMetrics(operationName: string): void {
    this.metrics.delete(operationName);
  }

  /**
   * Get list of all tracked operations
   * @returns Array of operation names
   */
  getTrackedOperations(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Export metrics data for analysis
   * @returns Complete metrics data
   */
  exportMetrics(): Record<string, number[]> {
    const exported: Record<string, number[]> = {};
    
    for (const [operation, times] of this.metrics.entries()) {
      exported[operation] = [...times];
    }
    
    return exported;
  }

  /**
   * Import metrics data (useful for testing or data restoration)
   * @param metricsData Metrics data to import
   */
  importMetrics(metricsData: Record<string, number[]>): void {
    this.metrics.clear();
    
    for (const [operation, times] of Object.entries(metricsData)) {
      this.metrics.set(operation, [...times]);
    }
  }

  /**
   * Get performance report as formatted string
   * @returns Formatted performance report
   */
  getPerformanceReport(): string {
    const summary = this.getMetricsSummary();
    const operations = Object.keys(summary).sort();
    
    if (operations.length === 0) {
      return 'No performance metrics available.';
    }
    
    let report = '📊 Performance Report\n';
    report += '═'.repeat(80) + '\n';
    report += 'Operation'.padEnd(25) + 'Count'.padStart(8) + 'Avg(ms)'.padStart(10) + 
              'Min(ms)'.padStart(10) + 'Max(ms)'.padStart(10) + 'P95(ms)'.padStart(10) + '\n';
    report += '─'.repeat(80) + '\n';
    
    for (const operation of operations) {
      const metrics = summary[operation];
      report += operation.padEnd(25) +
                metrics.count.toString().padStart(8) +
                metrics.average.toFixed(2).padStart(10) +
                metrics.min.toFixed(2).padStart(10) +
                metrics.max.toFixed(2).padStart(10) +
                metrics.p95.toFixed(2).padStart(10) + '\n';
    }
    
    report += '═'.repeat(80);
    return report;
  }
}