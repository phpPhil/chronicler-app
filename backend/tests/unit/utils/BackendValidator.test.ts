/**
 * @fileoverview Tests for BackendValidator utility
 * Tests comprehensive backend validation logic and security features
 */

import { BackendValidator } from '../../../src/utils/BackendValidator';
import { ValidationSchema, ValidationResult } from '../../../src/utils/BackendValidator';

describe('BackendValidator', () => {
  describe('validate', () => {
    describe('string validation', () => {
      const stringSchema: ValidationSchema = {
        name: {
          type: 'string',
          required: true,
          constraints: {
            min: 2,
            max: 50,
            pattern: '^[a-zA-Z\\s]+$'
          },
          sanitization: {
            trim: true,
            removeSpecialChars: false
          }
        }
      };

      it('should validate valid string data', () => {
        const data = { name: '  John Doe  ' };
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedData.name).toBe('John Doe');
      });

      it('should fail for missing required string', () => {
        const data = {};
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('name is required');
      });

      it('should fail for string below minimum length', () => {
        const data = { name: 'A' };
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('name does not meet requirements');
      });

      it('should fail for string exceeding maximum length', () => {
        const data = { 
          name: 'A'.repeat(51) 
        };
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('name does not meet requirements');
      });

      it('should fail for string not matching pattern', () => {
        const data = { name: 'John123' };
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('name does not meet requirements');
      });

      it('should handle empty string as invalid for required field', () => {
        const data = { name: '' };
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('name is required');
      });

      it('should handle null value as invalid for required field', () => {
        const data = { name: null };
        const result = BackendValidator.validate(data, stringSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('name is required');
      });
    });

    describe('number validation', () => {
      const numberSchema: ValidationSchema = {
        age: {
          type: 'number',
          required: true,
          constraints: {
            min: 0,
            max: 150
          }
        },
        score: {
          type: 'number',
          required: false,
          constraints: {
            min: 0,
            max: 100
          }
        }
      };

      it('should validate valid number data', () => {
        const data = { age: 25, score: 85 };
        const result = BackendValidator.validate(data, numberSchema);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedData).toEqual(data);
      });

      it('should fail for number below minimum', () => {
        const data = { age: -5 };
        const result = BackendValidator.validate(data, numberSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('age does not meet requirements');
      });

      it('should fail for number above maximum', () => {
        const data = { age: 200 };
        const result = BackendValidator.validate(data, numberSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('age does not meet requirements');
      });

      it('should pass number at boundary values', () => {
        const data = { age: 0, score: 100 };
        const result = BackendValidator.validate(data, numberSchema);

        expect(result.isValid).toBe(true);
      });

      it('should handle optional number fields', () => {
        const data = { age: 25 };
        const result = BackendValidator.validate(data, numberSchema);

        expect(result.isValid).toBe(true);
        expect(result.sanitizedData.score).toBeUndefined();
      });

      it('should fail for non-numeric values', () => {
        const data = { age: 'twenty-five' };
        const result = BackendValidator.validate(data, numberSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('age must be of type number');
      });
    });

    describe('array validation', () => {
      const arraySchema: ValidationSchema = {
        tags: {
          type: 'array',
          required: true,
          constraints: {
            min: 1,
            max: 10
          }
        },
        optionalList: {
          type: 'array',
          required: false,
          constraints: {
            max: 5
          }
        }
      };

      it('should validate valid array data', () => {
        const data = { 
          tags: ['javascript', 'react', 'typescript'],
          optionalList: ['a', 'b']
        };
        const result = BackendValidator.validate(data, arraySchema);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedData).toEqual(data);
      });

      it('should fail for array below minimum length', () => {
        const data = { tags: [] };
        const result = BackendValidator.validate(data, arraySchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('tags does not meet requirements');
      });

      it('should fail for array exceeding maximum length', () => {
        const data = { 
          tags: Array.from({ length: 15 }, (_, i) => `tag${i}`)
        };
        const result = BackendValidator.validate(data, arraySchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('tags does not meet requirements');
      });

      it('should handle optional array fields', () => {
        const data = { tags: ['javascript'] };
        const result = BackendValidator.validate(data, arraySchema);

        expect(result.isValid).toBe(true);
        expect(result.sanitizedData.optionalList).toBeUndefined();
      });

      it('should fail for non-array values', () => {
        const data = { tags: 'not-an-array' };
        const result = BackendValidator.validate(data, arraySchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('tags must be of type array');
      });
    });

    describe('object validation', () => {
      const objectSchema: ValidationSchema = {
        metadata: {
          type: 'object',
          required: true
        },
        config: {
          type: 'object',
          required: false
        }
      };

      it('should validate valid object data', () => {
        const data = { 
          metadata: { version: '1.0', author: 'John' },
          config: { debug: true }
        };
        const result = BackendValidator.validate(data, objectSchema);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.sanitizedData).toEqual(data);
      });

      it('should fail for missing required object', () => {
        const data = {};
        const result = BackendValidator.validate(data, objectSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('metadata is required');
      });

      it('should handle optional object fields', () => {
        const data = { metadata: { version: '1.0' } };
        const result = BackendValidator.validate(data, objectSchema);

        expect(result.isValid).toBe(true);
        expect(result.sanitizedData.config).toBeUndefined();
      });

      it('should fail for non-object values', () => {
        const data = { metadata: 'not-an-object' };
        const result = BackendValidator.validate(data, objectSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('metadata must be of type object');
      });

      it('should fail for null object values', () => {
        const data = { metadata: null };
        const result = BackendValidator.validate(data, objectSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('metadata must be of type object');
      });
    });
  });

  describe('sanitization', () => {
    describe('string sanitization', () => {
      const sanitizationSchema: ValidationSchema = {
        input: {
          type: 'string',
          required: true,
          sanitization: {
            trim: true,
            toLowerCase: true,
            removeSpecialChars: true
          }
        },
        preserveCase: {
          type: 'string',
          required: false,
          sanitization: {
            trim: true,
            removeSpecialChars: false
          }
        }
      };

      it('should trim whitespace', () => {
        const data = { input: '  hello world  ' };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData.input).toBe('hello world');
      });

      it('should convert to lowercase', () => {
        const data = { input: 'HELLO WORLD' };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData.input).toBe('hello world');
      });

      it('should remove special characters', () => {
        const data = { input: 'hello@#$%^&*()world' };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData.input).toBe('helloworld');
      });

      it('should preserve numbers and spaces with removeSpecialChars', () => {
        const data = { input: 'hello 123 world!' };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData.input).toBe('hello 123 world');
      });

      it('should apply multiple sanitization rules', () => {
        const data = { input: '  HELLO@WORLD!  ' };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData.input).toBe('helloworld');
      });

      it('should preserve content when sanitization disabled', () => {
        const data = { 
          input: 'test',  // Required field
          preserveCase: '  Hello@World!  ' 
        };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData).toBeDefined();
        expect(result.sanitizedData.preserveCase).toBe('Hello@World!');
      });

      it('should handle empty strings in sanitization', () => {
        const data = { input: '   ' };
        const result = BackendValidator.validate(data, sanitizationSchema);

        expect(result.sanitizedData.input).toBe('');
      });
    });

    describe('non-string sanitization', () => {
      const nonStringSchema: ValidationSchema = {
        number: {
          type: 'number',
          required: true,
          sanitization: {
            trim: true // Should be ignored for numbers
          }
        }
      };

      it('should ignore sanitization for non-string types', () => {
        const data = { number: 42 };
        const result = BackendValidator.validate(data, nonStringSchema);

        expect(result.sanitizedData.number).toBe(42);
      });
    });
  });

  describe('constraints validation', () => {
    describe('allowedValues constraint', () => {
      const allowedValuesSchema: ValidationSchema = {
        status: {
          type: 'string',
          required: true,
          constraints: {
            allowedValues: ['active', 'inactive', 'pending']
          }
        }
      };

      it('should pass for allowed value', () => {
        const data = { status: 'active' };
        const result = BackendValidator.validate(data, allowedValuesSchema);

        expect(result.isValid).toBe(true);
      });

      it('should fail for disallowed value', () => {
        const data = { status: 'unknown' };
        const result = BackendValidator.validate(data, allowedValuesSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('status does not meet requirements');
      });
    });

    describe('custom constraint functions', () => {
      const customSchema: ValidationSchema = {
        email: {
          type: 'string',
          required: true,
          constraints: {
            custom: (value: unknown) => {
              return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            }
          }
        },
        password: {
          type: 'string',
          required: true,
          constraints: {
            min: 8,
            custom: (value: unknown) => {
              // Password must contain at least one letter and one number
              return typeof value === 'string' && /[a-zA-Z]/.test(value) && /\d/.test(value);
            }
          }
        }
      };

      it('should pass for valid custom validation', () => {
        const data = { 
          email: 'user@example.com',
          password: 'password123'
        };
        const result = BackendValidator.validate(data, customSchema);

        expect(result.isValid).toBe(true);
      });

      it('should fail for invalid email format', () => {
        const data = { 
          email: 'invalid-email',
          password: 'password123'
        };
        const result = BackendValidator.validate(data, customSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('email does not meet requirements');
      });

      it('should fail for password without letters or numbers', () => {
        const data = { 
          email: 'user@example.com',
          password: '!@#$%^&*'
        };
        const result = BackendValidator.validate(data, customSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('password does not meet requirements');
      });

      it('should combine custom validation with other constraints', () => {
        const data = { 
          email: 'user@example.com',
          password: 'pass1' // Too short and missing letters
        };
        const result = BackendValidator.validate(data, customSchema);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('password does not meet requirements');
      });
    });
  });

  describe('complex validation scenarios', () => {
    const complexSchema: ValidationSchema = {
      user: {
        type: 'object',
        required: true
      },
      permissions: {
        type: 'array',
        required: true,
        constraints: {
          min: 1,
          allowedValues: ['read', 'write', 'admin']
        }
      },
      metadata: {
        type: 'object',
        required: false
      }
    };

    it('should validate complex nested data', () => {
      const data = {
        user: { id: 1, name: 'John' },
        permissions: ['read', 'write'],
        metadata: { created: '2023-01-01' }
      };
      const result = BackendValidator.validate(data, complexSchema);

      expect(result.isValid).toBe(true);
    });

    it('should handle multiple validation errors', () => {
      const data = {
        permissions: ['invalid', 'read']
      };
      const result = BackendValidator.validate(data, complexSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('user is required');
      expect(result.errors).toContain('permissions does not meet requirements');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle undefined input data', () => {
      const schema: ValidationSchema = {
        test: { type: 'string', required: true }
      };

      const result = BackendValidator.validate(undefined as any, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('test is required');
    });

    it('should handle null input data', () => {
      const schema: ValidationSchema = {
        test: { type: 'string', required: true }
      };

      const result = BackendValidator.validate(null as any, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('test is required');
    });

    it('should handle empty schema', () => {
      const result = BackendValidator.validate({ test: 'value' }, {});

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toEqual({ test: 'value' });
    });

    it('should handle schema with no required fields', () => {
      const schema: ValidationSchema = {
        optional: { type: 'string', required: false }
      };

      const result = BackendValidator.validate({}, schema);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData).toEqual({});
    });

    it('should preserve extra fields not in schema', () => {
      const schema: ValidationSchema = {
        name: { type: 'string', required: true }
      };

      const data = { name: 'John', extra: 'value' };
      const result = BackendValidator.validate(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedData.extra).toBe('value');
    });
  });

  describe('performance', () => {
    it('should handle large data sets efficiently', () => {
      const largeSchema: ValidationSchema = {};
      
      // Create schema with many fields
      for (let i = 0; i < 100; i++) {
        largeSchema[`field${i}`] = {
          type: 'string',
          required: i % 2 === 0,
          constraints: { min: 1, max: 100 }
        };
      }

      // Create data with all required fields
      const largeData: any = {};
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) { // Required fields
          largeData[`field${i}`] = `value${i}`;
        }
      }

      const startTime = Date.now();
      const result = BackendValidator.validate(largeData, largeSchema);
      const duration = Date.now() - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});