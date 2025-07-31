/**
 * @fileoverview Tests for useFormValidation React hook
 * Tests form state management, validation, and user interaction patterns
 */

// import React from 'react'; // TODO: Use React for component testing
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { ValidationRule } from '../../../utils/ValidationEngine';

describe('useFormValidation', () => {
  const mockValidationRules = {
    name: [
      { required: true, message: 'Name is required' },
      { minLength: 2, message: 'Name must be at least 2 characters' }
    ] as ValidationRule[],
    email: [
      { required: true, message: 'Email is required' },
      { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
    ] as ValidationRule[]
  };

  const initialData = {
    name: '',
    email: ''
  };

  describe('initialization', () => {
    it('should initialize with provided data and empty errors', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      expect(result.current.data).toEqual(initialData);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isValid).toBe(false);
    });

    it('should initialize with custom initial data', () => {
      const customData = { name: 'John', email: 'john@example.com' };
      const { result } = renderHook(() => 
        useFormValidation(customData, mockValidationRules)
      );

      expect(result.current.data).toEqual(customData);
    });
  });

  describe('setValue', () => {
    it('should update field value', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.setValue('name', 'John Doe');
      });

      expect(result.current.data.name).toBe('John Doe');
    });

    it('should not validate untouched fields', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.setValue('name', '');
      });

      expect(result.current.errors.name).toBeUndefined();
    });

    it('should validate touched fields on value change', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      // First touch the field
      act(() => {
        result.current.setTouched('name');
      });

      // Then change value
      act(() => {
        result.current.setValue('name', '');
      });

      expect(result.current.errors.name).toContain('Name is required');
    });

    it('should clear errors when field becomes valid', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      // Touch field and set invalid value
      act(() => {
        result.current.setTouched('name');
        result.current.setValue('name', '');
      });

      expect(result.current.errors.name).toContain('Name is required');

      // Set valid value
      act(() => {
        result.current.setValue('name', 'John Doe');
      });

      expect(result.current.errors.name).toHaveLength(0);
    });
  });

  describe('setTouched', () => {
    it('should mark field as touched', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.setTouched('name');
      });

      expect(result.current.touched.name).toBe(true);
    });

    it('should validate field when marked as touched', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.setTouched('name');
      });

      expect(result.current.errors.name).toContain('Name is required');
    });

    it('should validate current field value when touched', () => {
      const { result } = renderHook(() => 
        useFormValidation({ name: 'Valid Name', email: '' }, mockValidationRules)
      );

      act(() => {
        result.current.setTouched('name');
      });

      expect(result.current.errors.name).toHaveLength(0);
    });
  });

  describe('validateField', () => {
    it('should validate single field and return result', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateField('name', 'John Doe');
      });

      expect(isValid!).toBe(true);
    });

    it('should validate single field and update errors', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.validateField('name', '');
      });

      expect(result.current.errors.name).toContain('Name is required');
    });

    it('should return false for invalid field', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateField('email', 'invalid-email');
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.email).toContain('Invalid email format');
    });
  });

  describe('validateAll', () => {
    it('should validate all fields and return overall result', () => {
      const { result } = renderHook(() => 
        useFormValidation({ name: 'John Doe', email: 'john@example.com' }, mockValidationRules)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid!).toBe(true);
      expect(result.current.isValid).toBe(true);
    });

    it('should mark all fields as touched', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.touched.name).toBe(true);
      expect(result.current.touched.email).toBe(true);
    });

    it('should collect all validation errors', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid!).toBe(false);
      expect(result.current.errors.name).toContain('Name is required');
      expect(result.current.errors.email).toContain('Email is required');
    });
  });

  describe('reset', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      // Make changes
      act(() => {
        result.current.setValue('name', 'John');
        result.current.setTouched('name');
        result.current.validateAll();
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual(initialData);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isValid).toBe(false);
    });

    it('should reset to custom data when provided', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      const newData = { name: 'Jane Doe', email: 'jane@example.com' };

      act(() => {
        result.current.reset(newData);
      });

      expect(result.current.data).toEqual(newData);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
    });
  });

  describe('isValid state', () => {
    it('should be false initially with empty required fields', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      expect(result.current.isValid).toBe(false);
    });

    it('should be true when all fields are valid', () => {
      const validData = { name: 'John Doe', email: 'john@example.com' };
      const { result } = renderHook(() => 
        useFormValidation(validData, mockValidationRules)
      );

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should update when field validation changes', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      // Start invalid
      expect(result.current.isValid).toBe(false);

      // Set valid values
      act(() => {
        result.current.setValue('name', 'John Doe');
        result.current.setValue('email', 'john@example.com');
        result.current.validateAll();
      });

      expect(result.current.isValid).toBe(true);

      // Make invalid
      act(() => {
        result.current.setValue('email', 'invalid-email');
        result.current.setTouched('email');
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe('getFieldProps helper', () => {
    it('should return props for form field integration', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      const props = result.current.getFieldProps('name');

      expect(props).toEqual({
        name: 'name',
        value: '',
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        errors: [],
        touched: false
      });
    });

    it('should return errors and touched state for field', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.setTouched('name');
      });

      const props = result.current.getFieldProps('name');

      expect(props.errors).toContain('Name is required');
      expect(props.touched).toBe(true);
    });

    it('should handle onChange and onBlur events', () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      const props = result.current.getFieldProps('name');

      act(() => {
        props.onChange({ target: { value: 'John' } } as any);
      });

      expect(result.current.data.name).toBe('John');

      act(() => {
        props.onBlur();
      });

      expect(result.current.touched.name).toBe(true);
    });
  });

  describe('with complex validation rules', () => {
    const complexRules = {
      password: [
        { required: true },
        { minLength: 8 },
        { 
          custom: (value: string) => {
            if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
              return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
            }
            return null;
          }
        }
      ] as ValidationRule[],
      confirmPassword: [
        { required: true },
        {
          custom: (value: string, formData: any) => {
            if (value !== formData.password) {
              return 'Passwords do not match';
            }
            return null;
          }
        }
      ] as ValidationRule[]
    };

    it('should handle custom validation with form data context', () => {
      const { result } = renderHook(() => 
        useFormValidation({ password: '', confirmPassword: '' }, complexRules, { validateOnChange: true })
      );

      act(() => {
        result.current.setValue('password', 'SecurePass1');
        result.current.setValue('confirmPassword', 'DifferentPass1');
      });

      expect(result.current.errors.confirmPassword).toContain('Passwords do not match');

      act(() => {
        result.current.setValue('confirmPassword', 'SecurePass1');
      });

      expect(result.current.errors.confirmPassword).toHaveLength(0);
    });

    it('should handle multiple validation errors on single field', () => {
      const { result } = renderHook(() => 
        useFormValidation({ password: '', confirmPassword: '' }, complexRules, { validateOnChange: true })
      );

      act(() => {
        result.current.setValue('password', 'weak');
      });

      expect(result.current.errors.password).toHaveLength(2);
      expect(result.current.errors.password).toContain('Must be at least 8 characters long');
      expect(result.current.errors.password).toContain('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    });
  });

  describe('performance and optimization', () => {
    it('should not trigger unnecessary re-renders', () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useFormValidation(initialData, mockValidationRules);
      });

      // Capture initial render count for comparison  
      const baseRenderCount = renderCount; // eslint-disable-line testing-library/render-result-naming-convention

      // Setting the same value should not trigger re-render
      act(() => {
        result.current.setValue('name', '');
      });

      expect(renderCount).toBe(baseRenderCount);
    });

    it('should debounce validation for performance', async () => {
      const { result } = renderHook(() => 
        useFormValidation(initialData, mockValidationRules)
      );

      act(() => {
        result.current.setTouched('name');
      });

      // Rapid value changes
      act(() => {
        result.current.setValue('name', 'J');
        result.current.setValue('name', 'Jo');
        result.current.setValue('name', 'Joh');
        result.current.setValue('name', 'John');
      });

      // Should only validate the final value
      expect(result.current.errors.name).toHaveLength(0);
    });
  });
});