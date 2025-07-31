/**
 * @fileoverview Validation middleware for Express routes
 * Provides comprehensive request validation and sanitization
 * Part of Feature 08: Input Validation System
 */

import { Request, Response, NextFunction } from 'express';
import { BackendValidator, ValidationSchema } from '../utils/BackendValidator';

/**
 * Create validation middleware for Express routes
 */
export function validationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = BackendValidator.validate(req.body, schema);

      if (!result.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: result.errors
        });
      }

      // Replace request body with sanitized data
      req.body = result.sanitizedData;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: 'Validation processing failed'
      });
    }
  };
}

/**
 * Create reusable validation schema with middleware
 */
export function createValidationSchema(schema: ValidationSchema) {
  return {
    validate: (data: Record<string, unknown>) => BackendValidator.validate(data, schema),
    middleware: validationMiddleware(schema)
  };
}

/**
 * File upload validation middleware
 */
export function fileUploadValidationMiddleware(options?: {
  maxSize?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          error: 'Validation failed',
          details: ['No file uploaded']
        });
      }

      const result = BackendValidator.validateFileUpload(req.file, options);

      if (!result.isValid) {
        return res.status(400).json({
          error: 'File validation failed',
          details: result.errors
        });
      }

      // Add sanitized file metadata to request
      if (req.file && 'originalname' in req.file) {
        const sanitizedData = result.sanitizedData as { originalname?: string } | undefined;
        const newName = sanitizedData?.originalname || (req.file as Express.Multer.File).originalname;
        (req.file as Express.Multer.File).originalname = newName;
      }
      next();
    } catch (error) {
      console.error('File validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: 'File validation processing failed'
      });
    }
  };
}

/**
 * Query parameter validation middleware
 */
export function queryValidationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = BackendValidator.validate(req.query, schema);

      if (!result.isValid) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: result.errors
        });
      }

      // Replace query with sanitized data
      req.query = result.sanitizedData as any;
      next();
    } catch (error) {
      console.error('Query validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: 'Query validation processing failed'
      });
    }
  };
}

/**
 * Path parameter validation middleware
 */
export function paramsValidationMiddleware(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = BackendValidator.validate(req.params, schema);

      if (!result.isValid) {
        return res.status(400).json({
          error: 'Parameter validation failed',
          details: result.errors
        });
      }

      // Replace params with sanitized data
      req.params = result.sanitizedData as any;
      next();
    } catch (error) {
      console.error('Parameter validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: 'Parameter validation processing failed'
      });
    }
  };
}

/**
 * Combined validation middleware (body, query, params)
 */
export function combinedValidationMiddleware(schemas: {
  body?: ValidationSchema;
  query?: ValidationSchema;
  params?: ValidationSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: string[] = [];

      // Validate body
      if (schemas.body) {
        const bodyResult = BackendValidator.validate(req.body, schemas.body);
        if (!bodyResult.isValid) {
          errors.push(...bodyResult.errors.map(err => `Body: ${err}`));
        } else {
          req.body = bodyResult.sanitizedData;
        }
      }

      // Validate query
      if (schemas.query) {
        const queryResult = BackendValidator.validate(req.query, schemas.query);
        if (!queryResult.isValid) {
          errors.push(...queryResult.errors.map(err => `Query: ${err}`));
        } else {
          req.query = queryResult.sanitizedData as any;
        }
      }

      // Validate params
      if (schemas.params) {
        const paramsResult = BackendValidator.validate(req.params, schemas.params);
        if (!paramsResult.isValid) {
          errors.push(...paramsResult.errors.map(err => `Params: ${err}`));
        } else {
          req.params = paramsResult.sanitizedData as any;
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      next();
    } catch (error) {
      console.error('Combined validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
        message: 'Validation processing failed'
      });
    }
  };
}

/**
 * Pre-defined validation schemas for common use cases
 */
export const commonValidationSchemas = {
  // User registration
  userRegistration: {
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
    password: {
      type: 'string' as const,
      required: true,
      constraints: {
        min: 8,
        custom: (value: string) => /[a-zA-Z]/.test(value) && /\d/.test(value)
      }
    },
    name: {
      type: 'string' as const,
      required: true,
      constraints: {
        min: 2,
        max: 100
      },
      sanitization: {
        trim: true
      }
    }
  },

  // File upload metadata
  fileUploadMetadata: {
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
  },

  // Distance calculation request
  distanceCalculation: {
    list1: {
      type: 'array' as const,
      required: true,
      constraints: {
        min: 1,
        max: 100000
      }
    },
    list2: {
      type: 'array' as const,
      required: true,
      constraints: {
        min: 1,
        max: 100000
      }
    }
  },

  // Pagination
  pagination: {
    page: {
      type: 'number' as const,
      required: false,
      constraints: {
        min: 1,
        max: 1000
      }
    },
    limit: {
      type: 'number' as const,
      required: false,
      constraints: {
        min: 1,
        max: 100
      }
    }
  }
};