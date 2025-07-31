import { Router, Request, Response } from 'express';
import { DistanceCalculationEngine } from '../services/DistanceCalculationEngine';

export const distanceRouter = Router();
// DistanceCalculationEngine now uses static methods

interface DistanceCalculationRequest {
  list1: number[];
  list2: number[];
}

/**
 * @swagger
 * /api/distance/calculate:
 *   post:
 *     tags:
 *       - Distance Calculation
 *     summary: Calculate Manhattan distance between two number lists
 *     description: |
 *       Calculates the Manhattan distance between two lists of numbers by:
 *       1. Sorting both lists independently
 *       2. Pairing numbers by position after sorting
 *       3. Computing |a - b| for each pair
 *       4. Summing all individual distances
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DistanceCalculationRequest'
 *           example:
 *             list1: [3, 4, 2, 1, 3, 3]
 *             list2: [4, 3, 5, 3, 9, 3]
 *     responses:
 *       200:
 *         description: Distance calculation successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DistanceCalculationResult'
 *             example:
 *               totalDistance: 11
 *               pairs:
 *                 - position: 0
 *                   list1Value: 1
 *                   list2Value: 3
 *                   distance: 2
 *                 - position: 1
 *                   list1Value: 2
 *                   list2Value: 3
 *                   distance: 1
 *               metadata:
 *                 originalList1Length: 6
 *                 originalList2Length: 6
 *                 processingTimeMs: 2.5
 *                 memoryUsedMB: 0.1
 *                 algorithmComplexity: "O(n log n) time, O(n) space"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_lists:
 *                 summary: Missing required lists
 *                 value:
 *                   error: "Both list1 and list2 are required"
 *               invalid_format:
 *                 summary: Invalid data format
 *                 value:
 *                   error: "Both list1 and list2 must be arrays"
 *               unequal_length:
 *                 summary: Lists have different lengths
 *                 value:
 *                   error: "Input arrays must have equal length"
 *               invalid_numbers:
 *                 summary: Non-numeric values
 *                 value:
 *                   error: "Invalid number in list1 at position 2: abc"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Internal server error during distance calculation"
 */
distanceRouter.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { list1, list2 }: DistanceCalculationRequest = req.body;

    // Validate request body
    if (!list1 || !list2) {
      const missingFields = [];
      if (!list1) missingFields.push('list1');
      if (!list2) missingFields.push('list2');
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(2, 15)
      });
    }

    if (!Array.isArray(list1) || !Array.isArray(list2)) {
      return res.status(400).json({
        success: false,
        error: 'Both list1 and list2 must be arrays',
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(2, 15)
      });
    }

    // Validate that all elements are numbers
    for (let i = 0; i < list1.length; i++) {
      if (typeof list1[i] !== 'number' || isNaN(list1[i])) {
        return res.status(400).json({
          success: false,
          error: `Invalid number in list1 at position ${i}: ${list1[i]}`,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substring(2, 15)
        });
      }
    }

    for (let i = 0; i < list2.length; i++) {
      if (typeof list2[i] !== 'number' || isNaN(list2[i])) {
        return res.status(400).json({
          success: false,
          error: `Invalid number in list2 at position ${i}: ${list2[i]}`,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substring(2, 15)
        });
      }
    }

    // Calculate distance using the engine
    const result = DistanceCalculationEngine.calculateDistance(list1, list2);

    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    if (error instanceof Error) {
      // Handle known validation errors
      if (error.message.includes('equal length') || 
          error.message.includes('Invalid number') || 
          error.message.includes('must be arrays')) {
        return res.status(400).json({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substring(2, 15)
        });
      }
    }

    // Handle unexpected errors
    console.error('Distance calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error during distance calculation'
    });
  }
});