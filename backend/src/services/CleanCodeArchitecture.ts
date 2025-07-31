import { DistanceCalculationResult } from './DistanceCalculationEngine';

// Error Hierarchy
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

export class ValidationError extends CalculationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

// Validation interfaces and types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Single Responsibility Principle - Each class has one job

/**
 * Distance Calculator - Only responsible for calculating distances
 * Pure function approach for testability and reliability
 */
export class DistanceCalculator {
  /**
   * Calculate total Manhattan distance between two arrays
   * @param list1 First array of numbers
   * @param list2 Second array of numbers  
   * @returns Total distance as number
   */
  calculate(list1: number[], list2: number[]): number {
    let total = 0;
    for (let i = 0; i < list1.length; i++) {
      total += Math.abs(list1[i] - list2[i]);
    }
    return total;
  }
}

/**
 * List Sorter - Only responsible for sorting arrays
 * Immutable operations to avoid side effects
 */
export class ListSorter {
  /**
   * Sort array without modifying original
   * @param list Array to sort
   * @returns New sorted array
   */
  sort(list: number[]): number[] {
    return [...list].sort((a, b) => a - b);
  }
}

/**
 * Result Formatter - Only responsible for formatting calculation results
 * Transforms raw data into structured output format
 */
export class ResultFormatter {
  /**
   * Format calculation results into standard structure
   * @param list1 First sorted array
   * @param list2 Second sorted array
   * @param totalDistance Calculated total distance
   * @returns Formatted distance calculation result
   */
  format(list1: number[], list2: number[], totalDistance: number): DistanceCalculationResult {
    const pairs = list1.map((val1, i) => ({
      position: i,
      list1Value: val1,
      list2Value: list2[i],
      distance: Math.abs(val1 - list2[i])
    }));
    
    return {
      totalDistance,
      pairs,
      metadata: {
        originalList1Length: list1.length,
        originalList2Length: list2.length,
        processingTimeMs: 0 // Will be set by caller
      }
    };
  }
}

/**
 * Input Validator - Comprehensive validation with clear error messages
 * Focuses on user-friendly messages for non-technical users
 */
export class DistanceInputValidator {
  /**
   * Validate input arrays with detailed error reporting
   * @param list1 First array to validate
   * @param list2 Second array to validate
   * @returns Validation result with detailed errors
   */
  validate(list1: number[], list2: number[]): ValidationResult {
    const errors: string[] = [];
    
    // Check if arrays exist
    if (!Array.isArray(list1) || !Array.isArray(list2)) {
      errors.push('Both inputs must be arrays of numbers');
      return { isValid: false, errors };
    }
    
    // Check array lengths
    if (list1.length !== list2.length) {
      errors.push(
        `Lists must have equal length. List 1 has ${list1.length} elements, ` +
        `List 2 has ${list2.length} elements.`
      );
    }
    
    // Check for empty arrays
    if (list1.length === 0) {
      errors.push('Lists cannot be empty');
    }
    
    // Check element types with detailed feedback
    const invalidList1Elements = list1.filter((x) => typeof x !== 'number');
    const invalidList2Elements = list2.filter((x) => typeof x !== 'number');
    
    if (invalidList1Elements.length > 0) {
      errors.push('List 1 contains non-numeric values. All elements must be numbers.');
    }
    
    if (invalidList2Elements.length > 0) {
      errors.push('List 2 contains non-numeric values. All elements must be numbers.');
    }
    
    // Check for reasonable array size (prevent DoS)
    const MAX_SIZE = 100000;
    if (list1.length > MAX_SIZE) {
      errors.push(
        `Lists are too large. Maximum supported size is ${MAX_SIZE.toLocaleString()} elements. ` +
        `Your lists have ${list1.length.toLocaleString()} elements.`
      );
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Open/Closed Principle - Open for extension, closed for modification

/**
 * Base Distance Service - Template method pattern
 * Defines algorithm structure while allowing customization
 */
export abstract class BaseDistanceService {
  /**
   * Main processing method - template method
   * @param list1 First input array
   * @param list2 Second input array
   * @returns Distance calculation result
   */
  abstract processLists(list1: number[], list2: number[]): DistanceCalculationResult;
  
  /**
   * Pre-processing hook - can be overridden by subclasses
   * @param list1 First array
   * @param list2 Second array
   * @returns Processed arrays tuple
   */
  protected preProcess(list1: number[], list2: number[]): [number[], number[]] {
    return [list1, list2]; // Default: no preprocessing
  }
  
  /**
   * Post-processing hook - can be overridden by subclasses
   * @param result Calculation result
   * @returns Modified result
   */
  protected postProcess(result: DistanceCalculationResult): DistanceCalculationResult {
    return result; // Default: no postprocessing  
  }
}

/**
 * Manhattan Distance Service - Concrete implementation
 * Implements specific algorithm while following template method pattern
 */
export class ManhattanDistanceService extends BaseDistanceService {
  constructor(
    private sorter: ListSorter,
    private calculator: DistanceCalculator,
    private formatter: ResultFormatter
  ) {
    super();
  }
  
  /**
   * Process lists using Manhattan distance algorithm
   * @param list1 First input array
   * @param list2 Second input array
   * @returns Distance calculation result with timing
   */
  processLists(list1: number[], list2: number[]): DistanceCalculationResult {
    const startTime = performance.now();
    
    // Preprocess (sort in this case)
    const [processedList1, processedList2] = this.preProcess(list1, list2);
    
    // Calculate using injected calculator
    const totalDistance = this.calculator.calculate(processedList1, processedList2);
    
    // Format using injected formatter
    const result = this.formatter.format(processedList1, processedList2, totalDistance);
    
    // Add timing metadata
    result.metadata.processingTimeMs = Number((performance.now() - startTime).toFixed(3));
    
    return this.postProcess(result);
  }
  
  /**
   * Override preprocessing to include sorting
   * @param list1 First array
   * @param list2 Second array
   * @returns Sorted arrays tuple
   */
  protected preProcess(list1: number[], list2: number[]): [number[], number[]] {
    return [this.sorter.sort(list1), this.sorter.sort(list2)];
  }
}

// Dependency Inversion Principle - High-level modules depend on abstractions

/**
 * Distance Calculation Service - High-level service depending on abstractions
 * Demonstrates dependency injection and inversion of control
 */
export class DistanceCalculationService {
  constructor(
    private calculator: DistanceCalculator,
    private validator: DistanceInputValidator,
    private logger?: Logger
  ) {}
  
  /**
   * Process calculation request with full validation and error handling
   * @param request Calculation request
   * @returns Promise with calculation response
   */
  async processCalculationRequest(request: CalculationRequest): Promise<CalculationResponse> {
    try {
      // Validate input using injected validator
      const validationResult = this.validator.validate(request.list1, request.list2);
      if (!validationResult.isValid) {
        throw new ValidationError(validationResult.errors.join(', '));
      }
      
      // Perform calculation using injected calculator
      const totalDistance = this.calculator.calculate(request.list1, request.list2);
      
      // Create result
      const result: DistanceCalculationResult = {
        totalDistance,
        pairs: request.list1.map((val1, i) => ({
          position: i,
          list1Value: val1,
          list2Value: request.list2[i],
          distance: Math.abs(val1 - request.list2[i])
        })),
        metadata: {
          originalList1Length: request.list1.length,
          originalList2Length: request.list2.length,
          processingTimeMs: 0 // Would be calculated by timing wrapper
        }
      };
      
      // Log performance metrics if logger available
      if (this.logger) {
        this.logger.logPerformanceMetric({
          operation: 'distance_calculation',
          inputSize: request.list1.length,
          executionTime: result.metadata.processingTimeMs
        });
      }
      
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      if (this.logger) {
        this.logger.logError('Distance calculation failed', error as Error, {
          inputSize: request.list1?.length || 0,
          requestId: request.id
        });
      }
      
      throw error;
    }
  }
}

// Supporting interfaces and types

export interface CalculationRequest {
  id: string;
  list1: number[];
  list2: number[];
}

export interface CalculationResponse {
  success: boolean;
  data: DistanceCalculationResult;
  timestamp: string;
}

export interface Logger {
  logPerformanceMetric(metric: {
    operation: string;
    inputSize: number;
    executionTime: number;
  }): void;
  
  logError(message: string, error: Error, context?: Record<string, unknown>): void;
}

/**
 * Simple Console Logger Implementation
 * Provides basic logging functionality for development and testing
 */
export class ConsoleLogger implements Logger {
  /**
   * Log performance metrics to console
   * @param metric Performance metric data
   */
  logPerformanceMetric(metric: {
    operation: string;
    inputSize: number;
    executionTime: number;
  }): void {
    console.log(
      `📊 Performance: ${metric.operation} | ` +
      `Size: ${metric.inputSize} | ` +
      `Time: ${metric.executionTime.toFixed(3)}ms`
    );
  }
  
  /**
   * Log errors with context to console
   * @param message Error message
   * @param error Error object
   * @param context Additional context data
   */
  logError(message: string, error: Error, context?: Record<string, unknown>): void {
    console.error(`❌ ${message}:`, error.message);
    if (context) {
      console.error('Context:', context);
    }
  }
}

// All components are already exported individually above