/**
 * @fileoverview Validation System Usage Examples
 * Demonstrates how to use the comprehensive Input Validation System
 * Part of Feature 08: Input Validation System
 */

import { ValidationEngine, ValidationRule } from './ValidationEngine';
import { useFormValidation, useFieldValidation } from '../hooks';

// Example 1: Basic Form Validation
export function useUserRegistrationExample() {
  const validationRules = {
    email: [
      { required: true, message: 'Email is required' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    ] as ValidationRule[],
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      { 
        custom: (value: string) => {
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return 'Password must contain uppercase, lowercase, and number';
          }
          return null;
        }
      }
    ] as ValidationRule[],
    confirmPassword: [
      { required: true, message: 'Please confirm your password' },
      {
        custom: (value: string, formData: any) => {
          if (value !== formData?.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      }
    ] as ValidationRule[]
  };

  const formValidation = useFormValidation(
    { email: '', password: '', confirmPassword: '' },
    validationRules,
    { validateOnChange: true, debounceMs: 300 }
  );

  return {
    ...formValidation,
    validationRules
  };
}

// Example 2: Single Field Validation
export function useEmailFieldExample() {
  const emailRules: ValidationRule[] = [
    { required: true, message: 'Email address is required' },
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
  ];

  const emailField = useFieldValidation('', emailRules, {
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 500
  });

  return emailField;
}

// Example 3: File Upload Validation
export function fileValidationExample() {
  // Client-side file validation
  const validateFile = (file: File) => {
    const fileSizeResult = ValidationEngine.validateFileSize(file.size, 10 * 1024 * 1024);
    const fileTypeResult = ValidationEngine.validateFileType(file.type, ['text/plain', 'text/csv']);
    const extensionResult = ValidationEngine.validateFileExtension(file.name, ['.txt', '.csv']);

    const allErrors = [
      ...fileSizeResult.errors,
      ...fileTypeResult.errors,
      ...extensionResult.errors
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  };

  return { validateFile };
}

// Example 4: Complex Form with Custom Validation
export function useProfileFormExample() {
  const profileRules = {
    firstName: [
      { required: true, message: 'First name is required' },
      { minLength: 2, message: 'First name must be at least 2 characters' },
      { maxLength: 50, message: 'First name must be no more than 50 characters' }
    ] as ValidationRule[],
    lastName: [
      { required: true, message: 'Last name is required' },
      { minLength: 2, message: 'Last name must be at least 2 characters' },
      { maxLength: 50, message: 'Last name must be no more than 50 characters' }
    ] as ValidationRule[],
    age: [
      { required: true, message: 'Age is required' },
      {
        custom: (value: string) => {
          const age = parseInt(value);
          if (isNaN(age) || age < 13 || age > 120) {
            return 'Age must be between 13 and 120';
          }
          return null;
        }
      }
    ] as ValidationRule[],
    website: [
      {
        custom: (value: string) => {
          if (value && !ValidationEngine.validateUrl(value).isValid) {
            return 'Please enter a valid website URL';
          }
          return null;
        }
      }
    ] as ValidationRule[],
    phoneNumber: [
      {
        custom: (value: string) => {
          if (value && !ValidationEngine.validatePhoneNumber(value).isValid) {
            return 'Please enter a valid phone number';
          }
          return null;
        }
      }
    ] as ValidationRule[]
  };

  return useFormValidation(
    {
      firstName: '',
      lastName: '',
      age: '',
      website: '',
      phoneNumber: ''
    },
    profileRules,
    { validateOnBlur: true }
  );
}

// Example 5: Reusable Validation Schema
export const CommonValidationSchemas = {
  email: ValidationEngine.createValidationSchema({
    email: [
      { required: true, message: 'Email is required' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    ]
  }),

  password: ValidationEngine.createValidationSchema({
    password: [
      { required: true, message: 'Password is required' },
      { minLength: 8, message: 'Password must be at least 8 characters' },
      {
        custom: (value: string) => {
          const result = ValidationEngine.validatePasswordStrength(value);
          return result.isValid ? null : result.errors[0];
        }
      }
    ]
  }),

  contactInfo: ValidationEngine.createValidationSchema({
    name: [
      { required: true, message: 'Name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters' }
    ],
    email: [
      { required: true, message: 'Email is required' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    ],
    phone: [
      {
        custom: (value: string) => {
          if (value && !ValidationEngine.validatePhoneNumber(value).isValid) {
            return 'Invalid phone number format';
          }
          return null;
        }
      }
    ]
  })
};

// Example 6: Security Sanitization
export function securityExample() {
  const sanitizeUserInput = (input: string) => {
    // Remove HTML and encode entities
    const sanitized = ValidationEngine.sanitizeInput(input);
    
    // Additional HTML sanitization
    const htmlSanitized = ValidationEngine.sanitizeHtml(input);
    
    return {
      basic: sanitized,
      html: htmlSanitized
    };
  };

  const sanitizeFilename = (filename: string) => {
    return ValidationEngine.sanitizeFilename(filename);
  };

  return {
    sanitizeUserInput,
    sanitizeFilename
  };
}

// Example 7: Batch Validation
export function batchValidationExample() {
  const validateMultipleFields = (data: Record<string, any>) => {
    const validations = [
      {
        value: data.email,
        rules: [
          { required: true, message: 'Email is required' },
          { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
        ] as ValidationRule[],
        fieldName: 'email'
      },
      {
        value: data.age,
        rules: [
          { required: true, message: 'Age is required' },
          {
            custom: (value: string) => {
              const age = parseInt(value);
              return !isNaN(age) && age >= 18 ? null : 'Must be 18 or older';
            }
          }
        ] as ValidationRule[],
        fieldName: 'age'
      }
    ];

    return ValidationEngine.validateBatch(validations);
  };

  return { validateMultipleFields };
}