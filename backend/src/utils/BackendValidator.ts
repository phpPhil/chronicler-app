/**
 * @fileoverview BackendValidator - Comprehensive server-side validation utility
 * Provides schema validation, sanitization, and security features for backend
 * Part of Feature 08: Input Validation System
 */

import type { Request, Response, NextFunction } from 'express';

export interface ValidationSchema {
  [field: string]: {
    type: 'string' | 'number' | 'array' | 'object';
    required: boolean;
    constraints?: {
      min?: number;
      max?: number;
      pattern?: string;
      allowedValues?: unknown[];
      custom?: (value: unknown) => boolean;
    };
    sanitization?: {
      trim?: boolean;
      toLowerCase?: boolean;
      removeSpecialChars?: boolean;
      allowHtmlTags?: boolean;
    };
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Comprehensive backend validation utility
 */
export class BackendValidator {
  /**
   * Validate data against a schema
   */
  static validate(data: unknown, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const sanitizedData: Record<string, unknown> = {};

    // Handle null/undefined data
    if (!data || typeof data !== 'object') {
      data = {};
    }

    // Copy non-schema fields (preserve extra data)
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (!schema[key]) {
        sanitizedData[key] = value;
      }
    }

    // Validate schema fields
    for (const [field, rules] of Object.entries(schema)) {
      const value = (data as any)[field];

      // Required field check - treat as missing if undefined, or for strings also empty/null
      if (rules.required && (
        value === undefined || 
        (rules.type === 'string' && (value === '' || value === null))
      )) {
        errors.push(`${field} is required`);
        continue;
      }

      // For required non-string fields, null should be a type error rather than missing field error
      if (rules.required && value === null && rules.type !== 'string') {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }

      // Skip validation for optional undefined fields
      if (!rules.required && value === undefined) {
        continue;
      }

      // Type validation (validate all non-undefined values)
      if (value !== undefined && !this.validateType(value, rules.type)) {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }

      // Apply sanitization
      const sanitizedValue = this.sanitizeValue(value, rules.sanitization);

      // Constraint validation
      if (rules.constraints && !this.validateConstraints(sanitizedValue, rules.constraints)) {
        errors.push(`${field} does not meet requirements`);
        continue;
      }

      sanitizedData[field] = sanitizedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }

  /**
   * Validate data type
   */
  private static validateType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Sanitize value based on rules
   */
  private static sanitizeValue(value: unknown, sanitization?: ValidationSchema[string]['sanitization']): unknown {
    if (!sanitization || typeof value !== 'string') {
      return value;
    }

    let sanitized = value;

    // Always remove HTML/XML tags and their content for security (unless explicitly disabled)
    if (sanitization.allowHtmlTags !== true) {
      // Remove script tags and their content
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // Remove other HTML tags (but keep their content)
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    if (sanitization.trim) {
      sanitized = sanitized.trim();
    }

    if (sanitization.toLowerCase) {
      sanitized = sanitized.toLowerCase();
    }

    if (sanitization.removeSpecialChars) {
      // Keep alphanumeric characters, spaces, and basic punctuation
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    return sanitized;
  }

  /**
   * Validate constraints
   */
  private static validateConstraints(value: unknown, constraints?: ValidationSchema[string]['constraints']): boolean {
    if (!constraints) return true;
    // Minimum constraint (length for strings/arrays, value for numbers)
    if (constraints.min !== undefined) {
      if (typeof value === 'string' || Array.isArray(value)) {
        if (value.length < constraints.min) return false;
      } else if (typeof value === 'number') {
        if (value < constraints.min) return false;
      }
    }

    // Maximum constraint (length for strings/arrays, value for numbers)
    if (constraints.max !== undefined) {
      if (typeof value === 'string' || Array.isArray(value)) {
        if (value.length > constraints.max) return false;
      } else if (typeof value === 'number') {
        if (value > constraints.max) return false;
      }
    }

    // Pattern validation for strings
    if (constraints.pattern && typeof value === 'string') {
      const regex = new RegExp(constraints.pattern);
      if (!regex.test(value)) return false;
    }

    // Allowed values validation
    if (constraints.allowedValues && Array.isArray(constraints.allowedValues)) {
      if (Array.isArray(value)) {
        // For arrays, check that all elements are in allowedValues
        for (const item of value) {
          if (!constraints.allowedValues.includes(item)) return false;
        }
      } else {
        // For single values, check directly
        if (!constraints.allowedValues.includes(value)) return false;
      }
    }

    // Custom validation function
    if (constraints.custom && typeof constraints.custom === 'function') {
      if (!constraints.custom(value)) return false;
    }

    return true;
  }

  /**
   * Security validation helpers
   */
  static sanitizeHtml(input: string): string {
    if (!input) return '';

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static sanitizeFilename(filename: string): string {
    if (!filename) return '';

    // Remove dangerous characters and path traversal attempts
    return filename
      // eslint-disable-next-line no-control-regex
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/^\.+/, '') // Remove leading dots
      .trim();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * File validation helpers
   */
  static validateFileUpload(file: {
    originalname: string;
    mimetype: string;
    size: number;
  }, options: {
    maxSize?: number;
    allowedMimeTypes?: string[];
    allowedExtensions?: string[];
  } = {}): ValidationResult {
    const errors: string[] = [];
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes = ['text/plain', 'text/csv', 'application/octet-stream'],
      allowedExtensions = ['.txt', '.csv', '.dat']
    } = options;

    // File size validation
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`File size exceeds maximum limit of ${maxSizeMB}MB`);
    }

    // MIME type validation
    if (!allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // File extension validation
    const extension = file.originalname.includes('.') 
      ? '.' + file.originalname.split('.').pop()?.toLowerCase() 
      : '';
    
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    // Filename security validation
    // eslint-disable-next-line no-control-regex
    if (!/^[^<>:"/\\|?*\x00-\x1F]+$/.test(file.originalname)) {
      errors.push('Filename contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? {
        originalname: this.sanitizeFilename(file.originalname),
        mimetype: file.mimetype,
        size: file.size
      } : undefined
    };
  }

  /**
   * Common validation schemas
   */
  static getCommonSchemas() {
    return {
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
          custom: (value: string) => {
            // Must contain at least one letter and one number
            return /[a-zA-Z]/.test(value) && /\d/.test(value);
          }
        }
      },

      name: {
        type: 'string' as const,
        required: true,
        constraints: {
          min: 2,
          max: 100,
          pattern: '^[a-zA-Z\\s-\']+$'
        },
        sanitization: {
          trim: true
        }
      },

      phoneNumber: {
        type: 'string' as const,
        required: false,
        constraints: {
          pattern: '^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,15}$'
        },
        sanitization: {
          trim: true
        }
      },

      url: {
        type: 'string' as const,
        required: false,
        constraints: {
          custom: (value: string) => {
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          }
        },
        sanitization: {
          trim: true
        }
      }
    };
  }

  /**
   * Create validation middleware for Express
   */
  static createMiddleware(schema: ValidationSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = this.validate(req.body, schema);

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
}