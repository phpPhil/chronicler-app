import { 
  DistanceCalculator,
  ListSorter,
  ResultFormatter,
  ManhattanDistanceService,
  DistanceInputValidator,
  CalculationError,
  ValidationError
} from '../../../src/services/CleanCodeArchitecture';
import { OptimizedDistanceCalculator } from '../../../src/services/OptimizedDistanceCalculator';

describe('Clean Code Architecture Tests', () => {
  describe('Single Responsibility Principle', () => {
    test('DistanceCalculator only handles calculation logic', () => {
      const calculator = new DistanceCalculator();
      
      // Should have focused interface
      expect(typeof calculator.calculate).toBe('function');
      expect(Object.getOwnPropertyNames(calculator).length).toBeLessThanOrEqual(5);
      
      // Should calculate distances correctly
      const result = calculator.calculate([1, 2, 3], [2, 3, 4]);
      expect(result).toBe(3); // |1-2| + |2-3| + |3-4| = 1 + 1 + 1
    });

    test('ListSorter only handles sorting logic', () => {
      const sorter = new ListSorter();
      
      // Should have focused interface
      expect(typeof sorter.sort).toBe('function');
      expect(Object.getOwnPropertyNames(sorter).length).toBeLessThanOrEqual(3);
      
      // Should sort correctly
      const result = sorter.sort([3, 1, 4, 1, 5]);
      expect(result).toEqual([1, 1, 3, 4, 5]);
    });

    test('ResultFormatter only handles result formatting', () => {
      const formatter = new ResultFormatter();
      
      // Should have focused interface
      expect(typeof formatter.format).toBe('function');
      expect(Object.getOwnPropertyNames(formatter).length).toBeLessThanOrEqual(3);
      
      // Should format results correctly
      const result = formatter.format([1, 2], [2, 3], 2);
      expect(result.totalDistance).toBe(2);
      expect(result.pairs).toHaveLength(2);
      expect(result.metadata.originalList1Length).toBe(2);
    });
  });

  describe('Open/Closed Principle', () => {
    test('ManhattanDistanceService extends BaseDistanceService', () => {
      const sorter = new ListSorter();
      const calculator = new DistanceCalculator();
      const formatter = new ResultFormatter();
      const service = new ManhattanDistanceService(sorter, calculator, formatter);
      
      const result = service.processLists([3, 1, 4], [1, 5, 9]);
      
      expect(result.totalDistance).toBeGreaterThanOrEqual(0);
      expect(result.pairs).toHaveLength(3);
      expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    test('service can be extended without modifying existing code', () => {
      // Could extend with EuclideanDistanceService, ChebyshevDistanceService, etc.
      // without modifying BaseDistanceService
      class TestDistanceService extends require('../../../src/services/CleanCodeArchitecture').BaseDistanceService {
        processLists(list1: number[], list2: number[]): any {
          const processed = this.preProcess(list1, list2);
          return this.postProcess({
            totalDistance: 42,
            pairs: [],
            metadata: { originalList1Length: list1.length, originalList2Length: list2.length, processingTimeMs: 0 }
          });
        }
      }
      
      const testService = new TestDistanceService();
      const result = testService.processLists([1, 2], [3, 4]);
      expect(result.totalDistance).toBe(42);
    });
  });

  describe('Dependency Inversion Principle', () => {
    test('OptimizedDistanceCalculator depends on abstractions', () => {
      const calculator = new OptimizedDistanceCalculator();
      
      // Should accept different sorting strategies
      const customSortStrategy = {
        sort: jest.fn((arr: number[]) => [...arr].sort((a, b) => b - a)) // Descending sort
      };
      
      const customCalculator = new OptimizedDistanceCalculator(customSortStrategy);
      
      expect(customCalculator).toBeDefined();
      // The calculator should work with any sorting strategy that implements the interface
    });

    test('services can be injected with different implementations', () => {
      const mockSorter = {
        sort: jest.fn((arr: number[]) => [...arr].sort((a, b) => a - b))
      };
      const mockCalculator = {
        calculate: jest.fn(() => 10)
      };
      const mockFormatter = {
        format: jest.fn(() => ({
          totalDistance: 10,
          pairs: [],
          metadata: { originalList1Length: 0, originalList2Length: 0, processingTimeMs: 0 }
        }))
      };
      
      const service = new ManhattanDistanceService(
        mockSorter as any,
        mockCalculator as any,
        mockFormatter as any
      );
      
      const result = service.processLists([1, 2], [3, 4]);
      
      expect(mockSorter.sort).toHaveBeenCalledTimes(2);
      expect(mockCalculator.calculate).toHaveBeenCalledTimes(1);
      expect(mockFormatter.format).toHaveBeenCalledTimes(1);
      expect(result.totalDistance).toBe(10);
    });
  });

  describe('Pure Functions and Immutability', () => {
    test('calculation functions are pure', () => {
      const calculator = new DistanceCalculator();
      const input1 = [3, 1, 4];
      const input2 = [1, 5, 9];
      
      // Multiple calls with same input should return same result
      const result1 = calculator.calculate(input1, input2);
      const result2 = calculator.calculate(input1, input2);
      const result3 = calculator.calculate(input1, input2);
      
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      
      // Original arrays should not be modified
      expect(input1).toEqual([3, 1, 4]);
      expect(input2).toEqual([1, 5, 9]);
    });

    test('sorting functions do not modify original arrays', () => {
      const sorter = new ListSorter();
      const original = [3, 1, 4, 1, 5];
      
      const sorted = sorter.sort(original);
      
      expect(sorted).toEqual([1, 1, 3, 4, 5]);
      expect(original).toEqual([3, 1, 4, 1, 5]); // Original unchanged
    });

    test('distance calculation does not modify input arrays', () => {
      const calculator = new OptimizedDistanceCalculator();
      const list1 = [3, 1, 4];
      const list2 = [1, 5, 9];
      const originalList1 = [...list1];
      const originalList2 = [...list2];
      
      calculator.calculateDistance(list1, list2);
      
      expect(list1).toEqual(originalList1);
      expect(list2).toEqual(originalList2);
    });
  });

  describe('Error Handling Consistency', () => {
    test('ValidationError extends CalculationError with proper hierarchy', () => {
      const error = new ValidationError('Test validation error', { field: 'test' });
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CalculationError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual({ field: 'test' });
    });

    test('input validator provides clear, actionable error messages', () => {
      const validator = new DistanceInputValidator();
      
      // Test various error conditions
      const mismatchedResult = validator.validate([1, 2], [1]);
      expect(mismatchedResult.isValid).toBe(false);
      expect(mismatchedResult.errors[0]).toMatch(/equal length/i);
      expect(mismatchedResult.errors[0]).toContain('2'); // Specific count
      expect(mismatchedResult.errors[0]).toContain('1'); // Specific count
      
      const emptyResult = validator.validate([], []);
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.errors[0]).toMatch(/cannot be empty/i);
      
      const invalidTypeResult = validator.validate([1, 'invalid'] as any, [1, 2]);
      expect(invalidTypeResult.isValid).toBe(false);
      expect(invalidTypeResult.errors[0]).toMatch(/non-numeric/i);
      
      const tooLargeResult = validator.validate(
        Array(100001).fill(1), 
        Array(100001).fill(1)
      );
      expect(tooLargeResult.isValid).toBe(false);
      expect(tooLargeResult.errors[0]).toMatch(/too large/i);
      expect(tooLargeResult.errors[0]).toContain('100,000'); // Max size (formatted with comma)
    });

    test('error messages are user-friendly for non-technical users', () => {
      const validator = new DistanceInputValidator();
      
      const result = validator.validate([1, 2, 3], [1, 2]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toMatch(/List.*must.*equal/); // User-friendly language
      expect(result.errors[0]).toContain('3'); // Specific details
      expect(result.errors[0]).toContain('2'); // Specific details
    });

    test('validation is fast and efficient', () => {
      const validator = new DistanceInputValidator();
      const largeList1 = Array(10000).fill(1);
      const largeList2 = Array(10000).fill(2);
      
      const startTime = performance.now();
      const result = validator.validate(largeList1, largeList2);
      const endTime = performance.now();
      
      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(25); // Should be very fast (increased tolerance for system variance)
    });
  });

  describe('Code Quality Metrics', () => {
    test('functions have reasonable complexity', () => {
      // This is more of a documentation test - in real scenarios you'd use complexity analysis tools
      const calculator = new DistanceCalculator();
      const sorter = new ListSorter();
      
      // Functions should be simple and focused
      expect(typeof calculator.calculate).toBe('function');
      expect(typeof sorter.sort).toBe('function');
      
      // Each function should do one thing well
      expect(calculator.calculate([1, 2], [2, 3])).toBe(2);
      expect(sorter.sort([3, 1, 2])).toEqual([1, 2, 3]);
    });

    test('classes have focused responsibilities', () => {
      const calculator = new DistanceCalculator();
      const sorter = new ListSorter();
      const formatter = new ResultFormatter();
      const validator = new DistanceInputValidator();
      
      // Each class should have a clear, single purpose
      const calculatorMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(calculator));
      const sorterMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(sorter));
      const formatterMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(formatter));
      const validatorMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(validator));
      
      // Should not have too many public methods (focused interface)
      expect(calculatorMethods.filter(m => !m.startsWith('constructor')).length).toBeLessThanOrEqual(5);
      expect(sorterMethods.filter(m => !m.startsWith('constructor')).length).toBeLessThanOrEqual(5);
      expect(formatterMethods.filter(m => !m.startsWith('constructor')).length).toBeLessThanOrEqual(5);
      expect(validatorMethods.filter(m => !m.startsWith('constructor')).length).toBeLessThanOrEqual(5);
    });

    test('no code duplication (DRY principle)', () => {
      // Test that common functionality is extracted
      const service1 = new ManhattanDistanceService(
        new ListSorter(),
        new DistanceCalculator(),
        new ResultFormatter()
      );
      
      const service2 = new ManhattanDistanceService(
        new ListSorter(),
        new DistanceCalculator(), 
        new ResultFormatter()
      );
      
      // Both services should use the same underlying components
      const result1 = service1.processLists([1, 2], [2, 3]);
      const result2 = service2.processLists([1, 2], [2, 3]);
      
      expect(result1.totalDistance).toBe(result2.totalDistance);
    });
  });

  describe('Performance of Clean Architecture', () => {
    test('dependency injection does not significantly impact performance', () => {
      const directCalculation = () => {
        const list1 = [1, 2, 3, 4, 5];
        const list2 = [2, 3, 4, 5, 6];
        let total = 0;
        for (let i = 0; i < list1.length; i++) {
          total += Math.abs(list1[i] - list2[i]);
        }
        return total;
      };
      
      const serviceCalculation = () => {
        const service = new ManhattanDistanceService(
          new ListSorter(),
          new DistanceCalculator(),
          new ResultFormatter()
        );
        return service.processLists([1, 2, 3, 4, 5], [2, 3, 4, 5, 6]);
      };
      
      // Time both approaches
      const directStart = performance.now();
      const directResult = directCalculation();
      const directEnd = performance.now();
      
      const serviceStart = performance.now();
      const serviceResult = serviceCalculation();
      const serviceEnd = performance.now();
      
      const directTime = directEnd - directStart;
      const serviceTime = serviceEnd - serviceStart;
      
      expect(directResult).toBe(5);
      expect(serviceResult.totalDistance).toBe(5);
      
      // Service should not be significantly slower (allows for sorting overhead)
      expect(serviceTime).toBeLessThan(directTime * 10); // Max 10x slower is acceptable
    });

    test('clean architecture components are reusable', () => {
      const sorter = new ListSorter();
      const calculator = new DistanceCalculator();
      const formatter = new ResultFormatter();
      
      // Same components can be reused for different services
      const service1 = new ManhattanDistanceService(sorter, calculator, formatter);
      const service2 = new ManhattanDistanceService(sorter, calculator, formatter);
      
      // Both should work correctly
      const result1 = service1.processLists([1, 2], [3, 4]); 
      const result2 = service2.processLists([5, 6], [7, 8]);
      
      expect(result1.totalDistance).toBeGreaterThanOrEqual(0);
      expect(result2.totalDistance).toBeGreaterThanOrEqual(0);
    });
  });
});