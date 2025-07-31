/**
 * @fileoverview ValidationEngine - Comprehensive client-side validation utility
 * Provides type-safe validation rules, form validation, and security sanitization
 * Part of Feature 08: Input Validation System
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, formData?: any) => string | boolean | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FormValidationResult extends ValidationResult {
  fieldErrors: Record<string, string[]>;
}

export interface FormValidation {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationSchema {
  validate: (data: Record<string, any>) => FormValidationResult;
}

/**
 * Central validation engine providing comprehensive client-side validation
 */
export class ValidationEngine {
  /**
   * Validate a single field against a set of validation rules
   */
  static validateField(value: any, rules: ValidationRule[], formData?: any): ValidationResult {
    return this.validateFieldWithContext(value, rules, formData);
  }

  /**
   * Validate a single field with form context for custom rules
   */
  static validateFieldWithContext(value: any, rules: ValidationRule[], formData?: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let hasRequiredError = false;

    for (const rule of rules) {
      // Required validation
      if (rule.required && this.isEmpty(value)) {
        errors.push(rule.message || 'This field is required');
        hasRequiredError = true;
        continue; // Continue to check other rules, but don't run validations on empty value
      }

      // Skip non-required validations for empty values, but still run custom validation
      if (this.isEmpty(value) && !rule.custom) {
        continue;
      }

      // String length validations
      if (rule.minLength !== undefined && typeof value === 'string' && !hasRequiredError) {
        if (value.length < rule.minLength) {
          errors.push(rule.message || `Must be at least ${rule.minLength} characters long`);
        }
      }

      if (rule.maxLength !== undefined && typeof value === 'string' && !hasRequiredError) {
        if (value.length > rule.maxLength) {
          errors.push(rule.message || `Must be no more than ${rule.maxLength} characters long`);
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !hasRequiredError) {
        if (!rule.pattern.test(value)) {
          errors.push(rule.message || 'Format is invalid');
        }
      }

      // Custom validation (always runs, even for empty values)
      if (rule.custom) {
        const customResult = rule.custom(value, formData);
        if (typeof customResult === 'string') {
          errors.push(customResult);
        } else if (customResult === false) {
          errors.push(rule.message || 'Invalid value');
        }
        // true or null means validation passed
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Validate an entire form against validation rules
   */
  static validateForm(data: Record<string, any>, rules: FormValidation): FormValidationResult {
    const fieldErrors: Record<string, string[]> = {};
    let overallValid = true;

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const fieldValue = data[fieldName];
      const result = this.validateFieldWithContext(fieldValue, fieldRules, data);

      if (!result.isValid) {
        fieldErrors[fieldName] = result.errors;
        overallValid = false;
      } else {
        fieldErrors[fieldName] = [];
      }
    }

    return {
      isValid: overallValid,
      errors: Object.values(fieldErrors).flat(),
      fieldErrors
    };
  }

  /**
   * Sanitize input to prevent XSS and clean data
   */
  static sanitizeInput(input: any): string {
    if (input === null || input === undefined) {
      return '';
    }

    let str = String(input).trim();
    
    // First encode HTML entities to prevent double encoding
    str = str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Then remove any remaining HTML-like tags
    str = str.replace(/&lt;[^&]*&gt;/g, '');

    return str;
  }

  /**
   * Create a reusable validation schema
   */
  static createValidationSchema(rules: FormValidation): ValidationSchema {
    return {
      validate: (data: Record<string, any>) => {
        return this.validateForm(data, rules);
      }
    };
  }

  /**
   * File validation helpers
   */
  static validateFileSize(fileSize: number, maxSize: number): ValidationResult {
    const isValid = fileSize <= maxSize;
    const errors: string[] = [];

    if (!isValid) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      errors.push(`File size exceeds maximum limit of ${maxSizeMB} MB`);
    }

    return { isValid, errors };
  }

  static validateFileType(mimeType: string, allowedTypes: string[]): ValidationResult {
    const isValid = allowedTypes.includes(mimeType);
    const errors: string[] = [];

    if (!isValid) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return { isValid, errors };
  }

  static validateFileExtension(filename: string, allowedExtensions: string[]): ValidationResult {
    const extension = filename.includes('.') 
      ? '.' + filename.split('.').pop()?.toLowerCase() 
      : '';
    
    const isValid = allowedExtensions.includes(extension);
    const errors: string[] = [];

    if (!isValid) {
      errors.push(`File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    return { isValid, errors };
  }

  /**
   * Number validation helpers
   */
  static validateInteger(value: string): ValidationResult {
    const errors: string[] = [];
    const trimmed = value.trim();

    if (trimmed === '') {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    const num = parseFloat(trimmed);
    const isInteger = !isNaN(num) && isFinite(num) && num === Math.floor(num);

    if (!isInteger) {
      errors.push('Must be a whole number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateNumberRange(value: number, min: number, max: number): ValidationResult {
    const errors: string[] = [];
    const isValid = value >= min && value <= max;

    if (!isValid) {
      errors.push(`Must be between ${min} and ${max}`);
    }

    return { isValid, errors };
  }

  /**
   * Email validation helper
   */
  static validateEmail(email: string): ValidationResult {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors: string[] = [];

    if (!email.trim()) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    if (!emailPattern.test(email)) {
      errors.push('Must be a valid email address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * URL validation helper
   */
  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];

    if (!url.trim()) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    try {
      new URL(url);
    } catch {
      errors.push('Must be a valid URL');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Password strength validation
   */
  static validatePasswordStrength(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!password) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check for required character types
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLowercase) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!hasUppercase) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!hasNumber) {
      errors.push('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      warnings.push('Consider adding special characters for stronger security');
    }

    // Check for common weak patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        warnings.push('Avoid common password patterns');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Phone number validation (US format)
   */
  static validatePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = [];

    if (!phone.trim()) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');

    // Check for valid US phone number (10 or 11 digits)
    if (digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'))) {
      return { isValid: true, errors };
    }

    errors.push('Must be a valid phone number');
    return { isValid: false, errors };
  }

  /**
   * Credit card validation (basic Luhn algorithm)
   */
  static validateCreditCard(cardNumber: string): ValidationResult {
    const errors: string[] = [];

    if (!cardNumber.trim()) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    // Remove spaces and dashes
    const cleaned = cardNumber.replace(/[\s-]/g, '');

    // Check if all characters are digits
    if (!/^\d+$/.test(cleaned)) {
      errors.push('Credit card number must contain only digits');
      return { isValid: false, errors };
    }

    // Check length
    if (cleaned.length < 13 || cleaned.length > 19) {
      errors.push('Credit card number must be between 13 and 19 digits');
      return { isValid: false, errors };
    }

    // Luhn algorithm validation
    let sum = 0;
    let alternate = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i));

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit = (digit % 10) + 1;
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    const isValid = sum % 10 === 0;
    if (!isValid) {
      errors.push('Invalid credit card number');
    }

    return { isValid, errors };
  }

  /**
   * Date validation helpers
   */
  static validateDate(dateString: string): ValidationResult {
    const errors: string[] = [];

    if (!dateString.trim()) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    const date = new Date(dateString);
    const isValid = date instanceof Date && !isNaN(date.getTime());

    if (!isValid) {
      errors.push('Must be a valid date');
    }

    return { isValid, errors };
  }

  static validateDateRange(dateString: string, minDate?: Date, maxDate?: Date): ValidationResult {
    const errors: string[] = [];

    if (!dateString.trim()) {
      return { isValid: true, errors }; // Empty is valid for optional fields
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      errors.push('Must be a valid date');
      return { isValid: false, errors };
    }

    if (minDate && date < minDate) {
      errors.push(`Date must be after ${minDate.toDateString()}`);
    }

    if (maxDate && date > maxDate) {
      errors.push(`Date must be before ${maxDate.toDateString()}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Utility methods
   */
  private static isEmpty(value: any): boolean {
    return value === undefined || 
           value === null || 
           value === '' || 
           (typeof value === 'string' && value.trim() === '');
  }

  /**
   * Advanced security sanitization
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

    // Remove path traversal attempts and dangerous characters
    return filename
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '') // eslint-disable-line no-control-regex
      .replace(/^\.+/, '') // Remove leading dots
      .trim();
  }

  /**
   * Batch validation for multiple fields
   */
  static validateBatch(validations: Array<{
    value: any;
    rules: ValidationRule[];
    fieldName?: string;
  }>): { isValid: boolean; results: Array<ValidationResult & { fieldName?: string }> } {
    const results = validations.map(({ value, rules, fieldName }) => ({
      ...this.validateField(value, rules),
      fieldName
    }));

    const isValid = results.every(result => result.isValid);

    return { isValid, results };
  }
}