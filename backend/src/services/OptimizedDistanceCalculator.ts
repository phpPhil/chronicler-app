import { DistanceCalculationResult } from './DistanceCalculationEngine';

/**
 * Sorting strategy interface for dependency injection
 */
export interface SortingStrategy {
  sort(arr: number[]): number[];
}

/**
 * Distance calculator interface for clean architecture
 */
export interface DistanceCalculator {
  calculateDistance(list1: number[], list2: number[]): DistanceCalculationResult;
}

/**
 * Optimized sorting strategy using native JavaScript sort (TimSort)
 * Provides excellent performance for real-world data patterns
 */
export class QuickSortStrategy implements SortingStrategy {
  /**
   * Sort array using optimized native sort
   * @param arr Array to sort
   * @returns New sorted array (immutable)
   */
  sort(arr: number[]): number[] {
    // Use spread operator to create copy, then native sort which is highly optimized
    return [...arr].sort((a, b) => a - b);
  }
}

/**
 * Custom error class for calculation-related errors
 */
export class CalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends CalculationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Memory-efficient, optimized distance calculator following SOLID principles
 * - Single Responsibility: Only handles distance calculation
 * - Open/Closed: Extensible through sorting strategy injection
 * - Dependency Inversion: Depends on SortingStrategy abstraction
 */
export class OptimizedDistanceCalculator implements DistanceCalculator {
  constructor(
    private sortingStrategy: SortingStrategy = new QuickSortStrategy()
  ) {}

  /**
   * Calculate Manhattan distance between two lists with performance optimization
   * @param list1 First array of numbers
   * @param list2 Second array of numbers
   * @returns Distance calculation result with metadata
   */
  calculateDistance(list1: number[], list2: number[]): DistanceCalculationResult {
    // Input validation with clear error messages
    this.validateInput(list1, list2);
    
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();
    
    // Sort lists using injected strategy
    const sortedList1 = this.sortingStrategy.sort(list1);
    const sortedList2 = this.sortingStrategy.sort(list2);
    
    // Calculate distance with minimal object creation
    const result = this.computeDistanceSum(sortedList1, sortedList2);
    
    const endTime = performance.now();
    const endMemory = this.getCurrentMemoryUsage();
    
    return {
      ...result,
      metadata: {
        originalList1Length: list1.length,
        originalList2Length: list2.length,
        processingTimeMs: Number((endTime - startTime).toFixed(3)),
        memoryUsedMB: Number(((endMemory - startMemory) / 1024 / 1024).toFixed(3)),
        algorithmComplexity: 'O(n log n) time, O(n) space'
      }
    };
  }

  /**
   * Validate input arrays with comprehensive error checking
   * @param list1 First array
   * @param list2 Second array
   * @throws ValidationError with specific error details
   */
  private validateInput(list1: number[], list2: number[]): void {
    if (!Array.isArray(list1) || !Array.isArray(list2)) {
      throw new ValidationError('Both inputs must be arrays of numbers');
    }
    
    if (list1.length !== list2.length) {
      throw new ValidationError(
        `Lists must have equal length. List 1 has ${list1.length} elements, ` +
        `List 2 has ${list2.length} elements.`
      );
    }
    
    // Validate array content types efficiently
    for (let i = 0; i < list1.length; i++) {
      if (typeof list1[i] !== 'number' || isNaN(list1[i])) {
        throw new ValidationError(
          `List 1 contains non-numeric value at position ${i}: ${list1[i]}`
        );
      }
      if (typeof list2[i] !== 'number' || isNaN(list2[i])) {
        throw new ValidationError(
          `List 2 contains non-numeric value at position ${i}: ${list2[i]}`
        );
      }
    }
    
    // Prevent DoS attacks with reasonable size limits
    const MAX_SIZE = 100000;
    if (list1.length > MAX_SIZE) {
      throw new ValidationError(
        `Lists are too large. Maximum supported size is ${MAX_SIZE.toLocaleString()} elements. ` +
        `Your lists have ${list1.length.toLocaleString()} elements.`
      );
    }
  }

  /**
   * Compute distance sum with memory optimization
   * @param sortedList1 First sorted array
   * @param sortedList2 Second sorted array  
   * @returns Distance result without metadata
   */
  private computeDistanceSum(
    sortedList1: number[], 
    sortedList2: number[]
  ): Omit<DistanceCalculationResult, 'metadata'> {
    let totalDistance = 0;
    
    // Pre-allocate pairs array for better memory performance
    const pairs = new Array(sortedList1.length);
    
    // Single pass calculation - O(n) time complexity
    for (let i = 0; i < sortedList1.length; i++) {
      const val1 = sortedList1[i];
      const val2 = sortedList2[i];
      const distance = Math.abs(val1 - val2);
      
      totalDistance += distance;
      
      // Minimize object creation in hot path
      pairs[i] = {
        position: i,
        list1Value: val1,
        list2Value: val2,
        distance
      };
    }
    
    return { totalDistance, pairs };
  }

  /**
   * Get current memory usage in bytes
   * @returns Memory usage in bytes, 0 if unavailable
   */
  private getCurrentMemoryUsage(): number {
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
}

/**
 * Performance-focused array operations utility
 * Provides memory-efficient operations for large datasets
 */
export class OptimizedArrayOperations {
  /**
   * Sort array in-place for maximum memory efficiency
   * @param arr Array to sort (will be modified)
   * @returns Sorted array (same reference)
   */
  static sortInPlace(arr: number[]): number[] {
    return arr.sort((a, b) => a - b);
  }

  /**
   * Calculate distances efficiently with minimal allocations
   * @param list1 First sorted array
   * @param list2 Second sorted array
   * @returns Distance calculation result
   */
  static calculateDistancesEfficiently(
    list1: number[], 
    list2: number[]
  ): {
    totalDistance: number;
    pairs: Array<{
      position: number;
      list1Value: number;
      list2Value: number;
      distance: number;
    }>;
  } {
    let totalDistance = 0;
    const pairs = new Array(list1.length); // Pre-allocate for performance
    
    // Single loop with minimal allocations
    for (let i = 0; i < list1.length; i++) {
      const distance = Math.abs(list1[i] - list2[i]);
      totalDistance += distance;
      
      // Reuse object structure pattern
      pairs[i] = {
        position: i,
        list1Value: list1[i],
        list2Value: list2[i],
        distance
      };
    }
    
    return { totalDistance, pairs };
  }

  /**
   * Generate random test data for performance testing
   * @param size Array size
   * @param max Maximum value (default 1000)
   * @returns Array of random integers
   */
  static generateTestData(size: number, max: number = 1000): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * max));
  }

  /**
   * Validate array contains only numbers efficiently
   * @param arr Array to validate
   * @returns True if all elements are numbers
   */
  static isNumericArray(arr: unknown[]): arr is number[] {
    for (let i = 0; i < arr.length; i++) {
      const element = arr[i];
      if (typeof element !== 'number' || isNaN(element)) {
        return false;
      }
    }
    return true;
  }
}