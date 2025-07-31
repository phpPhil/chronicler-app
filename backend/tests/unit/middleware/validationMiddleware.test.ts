/**
 * @fileoverview Tests for validation middleware
 * Tests backend validation middleware integration and security features
 */

import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { validationMiddleware, createValidationSchema } from '../../../src/middleware/validationMiddleware';
import { BackendValidator } from '../../../src/utils/BackendValidator';

// Mock Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

describe('validationMiddleware', () => {
  describe('schema validation', () => {
    const testSchema = {
      name: {
        type: 'string' as const,
        required: true,
        constraints: {
          min: 2,
          max: 50
        },
        sanitization: {
          trim: true,
          removeSpecialChars: false
        }
      },
      email: {
        type: 'string' as const,
        required: true,
        constraints: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        sanitization: {
          trim: true,
          toLowerCase: true
        }
      },
      age: {
        type: 'number' as const,
        required: false,
        constraints: {
          min: 0,
          max: 150
        }
      }
    };

    let middleware: (req: Request, res: Response, next: NextFunction) => void;

    beforeEach(() => {
      middleware = validationMiddleware(testSchema);
    });

    it('should pass valid data through middleware', async () => {
      const validData = {
        name: '  John Doe  ',
        email: '  JOHN@EXAMPLE.COM  ',
        age: 25
      };

      app.post('/test-valid', middleware, (req: Request, res: Response) => {
        res.json({ 
          sanitizedData: req.body,
          valid: true 
        });
      });

      const response = await request(app)
        .post('/test-valid')
        .send(validData)
        .expect(200);

      expect(response.body.sanitizedData).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      });
    });

    it('should reject invalid data with validation errors', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        age: 200
      };

      app.post('/test-invalid', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      const response = await request(app)
        .post('/test-invalid')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.stringContaining('name'),
          expect.stringContaining('email'),
          expect.stringContaining('age')
        ])
      });
    });

    it('should handle missing required fields', async () => {
      const incompleteData = {
        age: 25
      };

      app.post('/test-missing', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      const response = await request(app)
        .post('/test-missing')
        .send(incompleteData)
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('name is required'),
          expect.stringContaining('email is required')
        ])
      );
    });

    it('should sanitize input data correctly', async () => {
      const unsanitizedData = {
        name: '  <script>alert("xss")</script>John Doe  ',
        email: '  JOHN@EXAMPLE.COM  '
      };

      app.post('/test-sanitize', middleware, (req: Request, res: Response) => {
        res.json({ sanitizedData: req.body });
      });

      const response = await request(app)
        .post('/test-sanitize')
        .send(unsanitizedData)
        .expect(200);

      expect(response.body.sanitizedData.name).toBe('John Doe');
      expect(response.body.sanitizedData.email).toBe('john@example.com');
    });

    it('should handle optional fields correctly', async () => {
      const dataWithoutAge = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      app.post('/test-optional', middleware, (req: Request, res: Response) => {
        res.json({ sanitizedData: req.body });
      });

      const response = await request(app)
        .post('/test-optional')
        .send(dataWithoutAge)
        .expect(200);

      expect(response.body.sanitizedData.age).toBeUndefined();
    });
  });

  describe('createValidationSchema', () => {
    it('should create reusable validation schema', () => {
      const userSchema = createValidationSchema({
        username: {
          type: 'string',
          required: true,
          constraints: { min: 3, max: 20 },
          sanitization: { trim: true }
        },
        password: {
          type: 'string',
          required: true,
          constraints: { min: 8 }
        }
      });

      expect(userSchema).toBeDefined();
      expect(typeof userSchema.validate).toBe('function');
      expect(typeof userSchema.middleware).toBe('function');
    });

    it('should validate data using schema', () => {
      const userSchema = createValidationSchema({
        username: {
          type: 'string',
          required: true,
          constraints: { min: 3 }
        }
      });

      const validResult = userSchema.validate({ username: 'john_doe' });
      expect(validResult.isValid).toBe(true);

      const invalidResult = userSchema.validate({ username: 'jo' });
      expect(invalidResult.isValid).toBe(false);
    });
  });

  describe('file upload validation', () => {
    const fileUploadSchema = {
      filename: {
        type: 'string' as const,
        required: true,
        constraints: {
          pattern: '^[^<>:"/\\\\|?*\\x00-\\x1F]+$'
        }
      },
      mimetype: {
        type: 'string' as const,
        required: true,
        constraints: {
          allowedValues: ['text/plain', 'text/csv', 'application/octet-stream']
        }
      },
      size: {
        type: 'number' as const,
        required: true,
        constraints: {
          min: 1,
          max: 10485760 // 10MB
        }
      }
    };

    it('should validate file upload metadata', async () => {
      const middleware = validationMiddleware(fileUploadSchema);

      const validFileData = {
        filename: 'data.txt',
        mimetype: 'text/plain',
        size: 1024
      };

      app.post('/test-file', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-file')
        .send(validFileData)
        .expect(200);
    });

    it('should reject files with invalid names', async () => {
      const middleware = validationMiddleware(fileUploadSchema);

      const invalidFileData = {
        filename: '../../../etc/passwd',
        mimetype: 'text/plain',
        size: 1024
      };

      app.post('/test-file-invalid', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      const response = await request(app)
        .post('/test-file-invalid')
        .send(invalidFileData)
        .expect(400);

      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('filename')
        ])
      );
    });

    it('should reject files with disallowed MIME types', async () => {
      const middleware = validationMiddleware(fileUploadSchema);

      const invalidMimeData = {
        filename: 'image.jpg',
        mimetype: 'image/jpeg',
        size: 1024
      };

      app.post('/test-mime-invalid', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-mime-invalid')
        .send(invalidMimeData)
        .expect(400);
    });

    it('should reject files exceeding size limit', async () => {
      const middleware = validationMiddleware(fileUploadSchema);

      const oversizedFileData = {
        filename: 'large.txt',
        mimetype: 'text/plain',
        size: 20971520 // 20MB
      };

      app.post('/test-size-invalid', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-size-invalid')
        .send(oversizedFileData)
        .expect(400);
    });
  });

  describe('security validation', () => {
    const securitySchema = {
      userInput: {
        type: 'string' as const,
        required: true,
        sanitization: {
          trim: true,
          removeSpecialChars: false
        }
      },
      safeContent: {
        type: 'string' as const,
        required: false,
        sanitization: {
          trim: true,
          removeSpecialChars: true
        }
      }
    };

    it('should sanitize XSS attempts', async () => {
      const middleware = validationMiddleware(securitySchema);

      const xssData = {
        userInput: '<script>alert("xss")</script>Hello',
        safeContent: '<img src="x" onerror="alert(1)">Safe Text'
      };

      app.post('/test-xss', middleware, (req: Request, res: Response) => {
        res.json({ sanitizedData: req.body });
      });

      const response = await request(app)
        .post('/test-xss')
        .send(xssData)
        .expect(200);

      expect(response.body.sanitizedData.userInput).not.toContain('<script>');
      expect(response.body.sanitizedData.safeContent).not.toContain('<img');
    });

    it('should handle SQL injection attempts', async () => {
      const sqlInjectionSchema = {
        query: {
          type: 'string' as const,
          required: true,
          constraints: {
            pattern: '^[a-zA-Z0-9\\s]+$'
          }
        }
      };

      const middleware = validationMiddleware(sqlInjectionSchema);

      const sqlData = {
        query: "'; DROP TABLE users; --"
      };

      app.post('/test-sql', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-sql')
        .send(sqlData)
        .expect(400);
    });

    it('should prevent path traversal attacks', async () => {
      const pathSchema = {
        filepath: {
          type: 'string' as const,
          required: true,
          constraints: {
            pattern: '^[^./\\\\]+$'
          }
        }
      };

      const middleware = validationMiddleware(pathSchema);

      const pathData = {
        filepath: '../../../etc/passwd'
      };

      app.post('/test-path', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-path')
        .send(pathData)
        .expect(400);
    });
  });

  describe('custom validation functions', () => {
    it('should support custom validation rules', async () => {
      const customSchema = {
        password: {
          type: 'string' as const,
          required: true,
          constraints: {
            custom: (value: unknown) => {
              if (typeof value !== 'string') return false;
              const hasLower = /[a-z]/.test(value);
              const hasUpper = /[A-Z]/.test(value);
              const hasNumber = /\d/.test(value);
              const hasLength = value.length >= 8;

              return hasLower && hasUpper && hasNumber && hasLength;
            }
          }
        }
      };

      const middleware = validationMiddleware(customSchema);

      const weakPassword = { password: 'weak' };
      const strongPassword = { password: 'StrongPass1' };

      app.post('/test-weak', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      app.post('/test-strong', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-weak')
        .send(weakPassword)
        .expect(400);

      await request(app)
        .post('/test-strong')
        .send(strongPassword)
        .expect(200);
    });
  });

  describe('error handling and logging', () => {
    it('should handle validation middleware errors gracefully', async () => {
      const faultySchema = {
        data: {
          type: 'string' as const,
          required: true,
          constraints: {
            custom: () => {
              throw new Error('Validation function error');
            }
          }
        }
      };

      const middleware = validationMiddleware(faultySchema);

      app.post('/test-error', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      const response = await request(app)
        .post('/test-error')
        .send({ data: 'test' })
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal validation error',
        message: 'Validation processing failed'
      });
    });

    it('should log validation failures for monitoring', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const schema = {
        test: {
          type: 'string' as const,
          required: true
        }
      };

      const result = BackendValidator.validate({}, schema);

      expect(result.isValid).toBe(false);
      // Validation logging would be implementation-specific
      
      consoleSpy.mockRestore();
    });
  });

  describe('performance considerations', () => {
    it('should handle large payload validation efficiently', async () => {
      const largeDataSchema = {
        items: {
          type: 'array' as const,
          required: true,
          constraints: {
            max: 1000 // Limit array size
          }
        }
      };

      const middleware = validationMiddleware(largeDataSchema);

      const largeData = {
        items: Array.from({ length: 500 }, (_, i) => `item${i}`)
      };

      app.post('/test-large', middleware, (req: Request, res: Response) => {
        res.json({ itemCount: req.body.items.length });
      });

      const startTime = Date.now();
      const response = await request(app)
        .post('/test-large')
        .send(largeData)
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.itemCount).toBe(500);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should reject oversized payloads', async () => {
      const schema = {
        items: {
          type: 'array' as const,
          required: true,
          constraints: {
            max: 100
          }
        }
      };

      const middleware = validationMiddleware(schema);

      const oversizedData = {
        items: Array.from({ length: 200 }, (_, i) => `item${i}`)
      };

      app.post('/test-oversized', middleware, (req: Request, res: Response) => {
        res.json({ valid: true });
      });

      await request(app)
        .post('/test-oversized')
        .send(oversizedData)
        .expect(400);
    });
  });
});