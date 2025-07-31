export interface DistanceCalculationResult {
  totalDistance: number;
  pairs: Array<{
    position: number;
    list1Value: number;
    list2Value: number;
    distance: number;
  }>;
  metadata: {
    originalList1Length: number;
    originalList2Length: number;
    processingTimeMs: number;
    memoryUsedMB?: number;
    algorithmComplexity?: string;
  };
}

export class DistanceCalculationEngine {
  /**
   * Calculate Manhattan distance between two lists after sorting them independently
   * @param list1 First array of numbers
   * @param list2 Second array of numbers
   * @returns DistanceCalculationResult with total distance, pairs, and metadata
   */
  static calculateDistance(list1: number[], list2: number[]): DistanceCalculationResult {
    // Input validation (not timed)
    DistanceCalculationEngine.validateInputs(list1, list2);

    // Store original lengths
    const originalList1Length = list1.length;
    const originalList2Length = list2.length;

    // Start timing only the core algorithm
    const startTime = performance.now();
    const startMemory = DistanceCalculationEngine.getCurrentMemoryUsage();

    // Sort both lists independently (O(n log n))
    const [sortedList1, sortedList2] = DistanceCalculationEngine.sortLists(list1, list2);

    // Create pairs and calculate distances (O(n))
    const pairs = DistanceCalculationEngine.createPairs(sortedList1, sortedList2);

    // Calculate total distance efficiently
    const totalDistance = pairs.reduce((sum, pair) => sum + pair.distance, 0);

    // End timing immediately after core algorithm
    const endTime = performance.now();
    const endMemory = DistanceCalculationEngine.getCurrentMemoryUsage();
    const processingTimeMs = Number((endTime - startTime).toFixed(3));
    const memoryUsedMB = Number(((endMemory - startMemory) / 1024 / 1024).toFixed(3));

    return {
      totalDistance,
      pairs,
      metadata: {
        originalList1Length,
        originalList2Length,
        processingTimeMs,
        memoryUsedMB,
        algorithmComplexity: 'O(n log n) time, O(n) space'
      }
    };
  }

  /**
   * Validate input arrays
   * @param list1 First array
   * @param list2 Second array
   */
  private static validateInputs(list1: number[], list2: number[]): void {
    // Check for null/undefined inputs
    if (!Array.isArray(list1) || !Array.isArray(list2)) {
      throw new Error('Both inputs must be arrays');
    }

    // Check for equal lengths
    if (list1.length !== list2.length) {
      throw new Error('Input arrays must have equal length');
    }

    // Validate that all elements are numbers
    for (let i = 0; i < list1.length; i++) {
      if (typeof list1[i] !== 'number' || isNaN(list1[i])) {
        throw new Error(`Invalid number in list1 at position ${i}: ${list1[i]}`);
      }
      if (typeof list2[i] !== 'number' || isNaN(list2[i])) {
        throw new Error(`Invalid number in list2 at position ${i}: ${list2[i]}`);
      }
    }
  }

  /**
   * Sort both lists independently
   * @param list1 First array
   * @param list2 Second array
   * @returns Tuple of sorted arrays
   */
  private static sortLists(list1: number[], list2: number[]): [number[], number[]] {
    // Create copies to avoid modifying original arrays
    const sortedList1 = [...list1].sort((a, b) => a - b);
    const sortedList2 = [...list2].sort((a, b) => a - b);

    return [sortedList1, sortedList2];
  }

  /**
   * Create pairs from sorted lists and calculate Manhattan distances
   * @param sortedList1 First sorted array
   * @param sortedList2 Second sorted array
   * @returns Array of pairs with calculated distances
   */
  private static createPairs(
    sortedList1: number[], 
    sortedList2: number[]
  ): Array<{
    position: number;
    list1Value: number;
    list2Value: number;
    distance: number;
  }> {
    const pairs = [];

    for (let i = 0; i < sortedList1.length; i++) {
      const list1Value = sortedList1[i];
      const list2Value = sortedList2[i];
      const distance = DistanceCalculationEngine.calculateManhattanDistance(list1Value, list2Value);

      pairs.push({
        position: i,
        list1Value,
        list2Value,
        distance
      });
    }

    return pairs;
  }

  /**
   * Calculate Manhattan distance between two numbers
   * @param a First number
   * @param b Second number
   * @returns Absolute difference between the numbers
   */
  private static calculateManhattanDistance(a: number, b: number): number {
    return Math.abs(a - b);
  }

  /**
   * Get current memory usage in bytes
   * @returns Memory usage in bytes, 0 if unavailable
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
}