import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { setupUploadRoute } from '../../src/controllers/uploadController';

describe('Upload API Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    setupUploadRoute(app);
  });

  describe('POST /api/upload', () => {
    it('should successfully upload a valid text file', async () => {
      const validContent = `1 5
2 3
7 9
4 2`;
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(validContent), 'test.txt')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          list1: [1, 2, 7, 4],
          list2: [5, 3, 9, 2],
          rowCount: 4,
          metadata: {
            filename: 'test.txt',
            fileSize: expect.any(Number),
            validation: {
              isValid: true,
              errors: []
            }
          }
        }
      });
      expect(response.body.data.metadata.filename).toBe('test.txt');
    });

    it('should return 400 for missing file', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'No file uploaded'
      });
    });

    it('should return 400 for invalid file format', async () => {
      const invalidContent = `1 abc
2 3`;
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(invalidContent), 'test.txt')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false
      });
      expect(response.body.error).toContain('Invalid number format');
    });

    it('should return 400 for files that are too large', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024, '1 2\n');
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', largeBuffer, 'large.txt')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'File size exceeds maximum allowed size of 10MB'
      });
    });

    it('should reject non-text files', async () => {
      // Create a fake binary file
      const binaryBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xFF]);
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', binaryBuffer, 'binary.exe')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid file type. Only text files are allowed'
      });
    });

    it('should handle empty files', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(''), 'empty.txt')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'File is empty or contains no valid data'
      });
    });

    it('should handle files with only whitespace', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('   \n\n  \t  \n'), 'whitespace.txt')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'File is empty or contains no valid data'
      });
    });

    it('should handle different line endings correctly', async () => {
      // Test with Windows line endings
      const windowsContent = '1 2\r\n3 4\r\n5 6';
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(windowsContent), 'windows.txt')
        .expect(200);

      expect(response.body.data).toMatchObject({
        list1: [1, 3, 5],
        list2: [2, 4, 6],
        rowCount: 3,
        metadata: {
          filename: 'windows.txt',
          fileSize: expect.any(Number),
          validation: {
            isValid: true,
            errors: []
          }
        }
      });
    });

    it('should provide clear error messages for format issues', async () => {
      const invalidFormat = `1 2 3
4 5`;
      
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(invalidFormat), 'invalid.txt')
        .expect(400);

      expect(response.body.error).toContain('Invalid format at row 1: expected 2 columns, found 3');
    });

    it('should handle concurrent uploads', async () => {
      const content1 = '1 2\n3 4';
      const content2 = '5 6\n7 8';
      
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/upload')
          .attach('file', Buffer.from(content1), 'file1.txt'),
        request(app)
          .post('/api/upload')
          .attach('file', Buffer.from(content2), 'file2.txt')
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.data.metadata.filename).toBe('file1.txt');
      expect(response2.body.data.metadata.filename).toBe('file2.txt');
    });
  });

  describe('Security Tests', () => {
    it('should reject files with suspicious extensions', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('1 2'), 'test.exe')
        .expect(400);

      expect(response.body.error).toContain('Invalid file type');
    });

    it('should reject files with null bytes in filename', async () => {
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from('1 2'), 'test\x00.txt')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle malformed multipart requests gracefully', async () => {
      const response = await request(app)
        .post('/api/upload')
        .set('Content-Type', 'multipart/form-data')
        .send('malformed data')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should process reasonably sized files quickly', async () => {
      // Generate a file with 1000 rows
      const rows = Array(1000).fill(null).map((_, i) => `${i} ${i + 1000}`);
      const content = rows.join('\n');
      
      const startTime = Date.now();
      const response = await request(app)
        .post('/api/upload')
        .attach('file', Buffer.from(content), 'large.txt')
        .expect(200);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
      expect(response.body.data.list1).toHaveLength(1000);
      expect(response.body.data.list2).toHaveLength(1000);
    });
  });
});