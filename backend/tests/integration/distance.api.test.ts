import request from 'supertest';
import express from 'express';
import { distanceRouter } from '../../src/routes/distance';

const app = express();
app.use(express.json());
app.use('/api/distance', distanceRouter);

describe('Distance Calculation API', () => {
  describe('POST /api/distance/calculate', () => {
    test('calculates distance successfully', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [3, 4, 2, 1, 3, 3],
          list2: [4, 3, 5, 3, 9, 3]
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('totalDistance', 11);
      expect(response.body.data).toHaveProperty('pairs');
      expect(response.body.data.pairs).toHaveLength(6);
      expect(response.body.data).toHaveProperty('metadata');
      expect(response.body.data.metadata).toHaveProperty('processingTimeMs');
    });

    test('handles empty arrays', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [],
          list2: []
        })
        .expect(200);

      expect(response.body.data.totalDistance).toBe(0);
      expect(response.body.data.pairs).toHaveLength(0);
    });

    test('returns 400 for mismatched array lengths', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1, 2, 3],
          list2: [1, 2]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('equal length');
    });

    test('returns 400 for missing list1', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list2: [1, 2, 3]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('list1');
    });

    test('returns 400 for missing list2', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1, 2, 3]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('list2');
    });

    test('returns 400 for invalid list1 type', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: 'not an array',
          list2: [1, 2, 3]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('returns 400 for invalid list2 type', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1, 2, 3],
          list2: 'not an array'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('returns 400 for non-numeric values in list1', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1, 'not a number', 3],
          list2: [1, 2, 3]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('returns 400 for non-numeric values in list2', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1, 2, 3],
          list2: [1, 'not a number', 3]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('handles negative numbers correctly', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [-3, -1, 2],
          list2: [1, -2, 4]
        })
        .expect(200);

      expect(response.body.data.totalDistance).toBe(5);
    });

    test('handles large numbers correctly', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1000000, 999999],
          list2: [999999, 1000000]
        })
        .expect(200);

      expect(response.body.data.totalDistance).toBe(0);
    });

    test('returns detailed pair breakdown', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [3, 1],
          list2: [1, 2]
        })
        .expect(200);

      // Sorted: [1, 3] and [1, 2]
      // Pairs: (1,1)=0, (3,2)=1
      // Total: 1

      expect(response.body.data.totalDistance).toBe(1);
      expect(response.body.data.pairs).toEqual([
        { position: 0, list1Value: 1, list2Value: 1, distance: 0 },
        { position: 1, list1Value: 3, list2Value: 2, distance: 1 }
      ]);
    });

    test('includes processing metadata', async () => {
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: [1, 2, 3],
          list2: [4, 5, 6]
        })
        .expect(200);

      expect(response.body.data.metadata).toHaveProperty('originalList1Length', 3);
      expect(response.body.data.metadata).toHaveProperty('originalList2Length', 3);
      expect(response.body.data.metadata).toHaveProperty('processingTimeMs');
      expect(response.body.data.metadata.processingTimeMs).toBeGreaterThan(0);
    });

    test('handles performance requirements for larger datasets', async () => {
      const largeList1 = Array.from({ length: 1000 }, (_, i) => Math.floor(Math.random() * 1000));
      const largeList2 = Array.from({ length: 1000 }, (_, i) => Math.floor(Math.random() * 1000));

      const startTime = Date.now();
      const response = await request(app)
        .post('/api/distance/calculate')
        .send({
          list1: largeList1,
          list2: largeList2
        })
        .expect(200);
      const endTime = Date.now();

      expect(response.body.data).toHaveProperty('totalDistance');
      expect(response.body.data.pairs).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});