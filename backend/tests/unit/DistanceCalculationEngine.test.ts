import { DistanceCalculationEngine } from '../../src/services/DistanceCalculationEngine';

describe('DistanceCalculationEngine', () => {
  // No need for instance since methods are static

  describe('calculateDistance', () => {
    test('calculates simple distance correctly', () => {
      const result = DistanceCalculationEngine.calculateDistance([3, 4, 2, 1, 3, 3], [4, 3, 5, 3, 9, 3]);
      
      expect(result.totalDistance).toBe(11);
      expect(result.pairs).toHaveLength(6);
      expect(result.metadata.originalList1Length).toBe(6);
      expect(result.metadata.originalList2Length).toBe(6);
      expect(result.metadata.processingTimeMs).toBeGreaterThan(0);
    });

    test('handles empty lists', () => {
      const result = DistanceCalculationEngine.calculateDistance([], []);
      
      expect(result.totalDistance).toBe(0);
      expect(result.pairs).toHaveLength(0);
      expect(result.metadata.originalList1Length).toBe(0);
      expect(result.metadata.originalList2Length).toBe(0);
    });

    test('handles single element lists', () => {
      const result = DistanceCalculationEngine.calculateDistance([5], [3]);
      
      expect(result.totalDistance).toBe(2);
      expect(result.pairs).toHaveLength(1);
      expect(result.pairs[0]).toEqual({
        position: 0,
        list1Value: 5,
        list2Value: 3,
        distance: 2
      });
    });

    test('handles identical lists', () => {
      const result = DistanceCalculationEngine.calculateDistance([1, 2, 3], [1, 2, 3]);
      
      expect(result.totalDistance).toBe(0);
      expect(result.pairs).toHaveLength(3);
      result.pairs.forEach(pair => {
        expect(pair.distance).toBe(0);
      });
    });

    test('validates equal lengths', () => {
      expect(() => DistanceCalculationEngine.calculateDistance([1, 2], [1])).toThrow('Input arrays must have equal length');
      expect(() => DistanceCalculationEngine.calculateDistance([1], [1, 2, 3])).toThrow('Input arrays must have equal length');
    });

    test('calculates distances correctly with detailed breakdown', () => {
      const result = DistanceCalculationEngine.calculateDistance([3, 4, 2, 1, 3, 3], [4, 3, 5, 3, 9, 3]);
      
      // Expected sorted lists: [1, 2, 3, 3, 3, 4] and [3, 3, 3, 4, 5, 9]
      // Expected pairs: (1,3)=2, (2,3)=1, (3,3)=0, (3,4)=1, (3,5)=2, (4,9)=5
      // Total: 2 + 1 + 0 + 1 + 2 + 5 = 11
      
      expect(result.pairs[0]).toEqual({
        position: 0,
        list1Value: 1,
        list2Value: 3,
        distance: 2
      });
      expect(result.pairs[1]).toEqual({
        position: 1,
        list1Value: 2,
        list2Value: 3,
        distance: 1
      });
      expect(result.pairs[2]).toEqual({
        position: 2,
        list1Value: 3,
        list2Value: 3,
        distance: 0
      });
      expect(result.pairs[3]).toEqual({
        position: 3,
        list1Value: 3,
        list2Value: 4,
        distance: 1
      });
      expect(result.pairs[4]).toEqual({
        position: 4,
        list1Value: 3,
        list2Value: 5,
        distance: 2
      });
      expect(result.pairs[5]).toEqual({
        position: 5,
        list1Value: 4,
        list2Value: 9,
        distance: 5
      });
    });

    test('handles negative numbers correctly', () => {
      const result = DistanceCalculationEngine.calculateDistance([-3, -1, 2], [1, -2, 4]);
      
      // Sorted: [-3, -1, 2] and [-2, 1, 4]
      // Pairs: (-3,-2)=1, (-1,1)=2, (2,4)=2
      // Total: 1 + 2 + 2 = 5
      
      expect(result.totalDistance).toBe(5);
      expect(result.pairs[0]).toEqual({
        position: 0,
        list1Value: -3,
        list2Value: -2,
        distance: 1
      });
      expect(result.pairs[1]).toEqual({
        position: 1,
        list1Value: -1,
        list2Value: 1,
        distance: 2
      });
      expect(result.pairs[2]).toEqual({
        position: 2,
        list1Value: 2,
        list2Value: 4,
        distance: 2
      });
    });

    test('handles large numbers correctly', () => {
      const result = DistanceCalculationEngine.calculateDistance([1000000, 999999], [999999, 1000000]);
      
      // Sorted: [999999, 1000000] and [999999, 1000000]
      // Pairs: (999999,999999)=0, (1000000,1000000)=0
      // Total: 0
      
      expect(result.totalDistance).toBe(0);
    });

    test('calculates Manhattan distance correctly', () => {
      // Test the Manhattan distance formula |a - b|
      const result = DistanceCalculationEngine.calculateDistance([10, 5], [3, 15]);
      
      // Sorted: [5, 10] and [3, 15]
      // Pairs: (5,3)=2, (10,15)=5
      // Total: 2 + 5 = 7
      
      expect(result.totalDistance).toBe(7);
    });
  });

  describe('performance', () => {
    test('handles 1000 elements efficiently', () => {
      const largeList1 = Array.from({ length: 1000 }, (_, i) => Math.floor(Math.random() * 1000));
      const largeList2 = Array.from({ length: 1000 }, (_, i) => Math.floor(Math.random() * 1000));
      
      const startTime = performance.now();
      const result = DistanceCalculationEngine.calculateDistance(largeList1, largeList2);
      const endTime = performance.now();
      
      expect(result.totalDistance).toBeGreaterThanOrEqual(0);
      expect(result.pairs).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(50); // Should be less than 50ms
    });

    test('processing time metadata is accurate', () => {
      const startTime = performance.now();
      const result = DistanceCalculationEngine.calculateDistance([1, 2, 3], [3, 2, 1]);
      const endTime = performance.now();
      const actualTime = endTime - startTime;
      
      // Processing time should be reasonably close to actual time (within 10ms)
      expect(result.metadata.processingTimeMs).toBeLessThanOrEqual(actualTime + 10);
      expect(result.metadata.processingTimeMs).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    test('handles arrays with duplicate values', () => {
      const result = DistanceCalculationEngine.calculateDistance([1, 1, 1], [2, 2, 2]);
      
      expect(result.totalDistance).toBe(3); // 3 pairs, each with distance 1
      expect(result.pairs).toHaveLength(3);
      result.pairs.forEach(pair => {
        expect(pair.list1Value).toBe(1);
        expect(pair.list2Value).toBe(2);
        expect(pair.distance).toBe(1);
      });
    });

    test('handles zero values', () => {
      const result = DistanceCalculationEngine.calculateDistance([0, -1, 1], [1, 0, -1]);
      
      // Sorted: [-1, 0, 1] and [-1, 0, 1]
      // All pairs have distance 0
      expect(result.totalDistance).toBe(0);
    });

    test('validates input types', () => {
      expect(() => DistanceCalculationEngine.calculateDistance(null as any, [1, 2])).toThrow();
      expect(() => DistanceCalculationEngine.calculateDistance([1, 2], null as any)).toThrow();
      expect(() => DistanceCalculationEngine.calculateDistance(undefined as any, [1, 2])).toThrow();
    });
  });
});