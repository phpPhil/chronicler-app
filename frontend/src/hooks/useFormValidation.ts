/**
 * @fileoverview useFormValidation hook - Complete form validation state management
 * Provides comprehensive form validation with real-time feedback and state management
 * Part of Feature 08: Input Validation System
 */

import { useState, useCallback, useMemo } from 'react';
import { ValidationEngine, FormValidation } from '../utils/ValidationEngine';
// import { ValidationRule } from '../utils/ValidationEngine'; // TODO: Implement validation rules

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  data: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isValid: boolean;
  setValue: (name: keyof T, value: any) => void;
  setTouched: (name: keyof T) => void;
  validateField: (name: keyof T, value?: any) => boolean;
  validateAll: () => boolean;
  reset: (newData?: T) => void;
  getFieldProps: (name: keyof T) => {
    name: string;
    value: any;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    errors: string[];
    touched: boolean;
  };
}

/**
 * Comprehensive form validation hook with real-time validation and state management
 */
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: FormValidation,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 0
  } = options;

  // Form state
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});

  // Debounce timeout ref
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  /**
   * Validate a single field
   */
  const validateField = useCallback((name: keyof T, value?: any) => {
    const fieldValue = value !== undefined ? value : data[name];
    const fieldRules = validationRules[name as string] || [];
    
    // Create updated data context for validation
    const formContext = value !== undefined ? { ...data, [name]: value } : data;
    
    const result = ValidationEngine.validateField(fieldValue, fieldRules, formContext);
    
    setErrors(prev => ({
      ...prev,
      [name]: result.errors
    }));
    
    return result.isValid;
  }, [data, validationRules]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback(() => {
    const result = ValidationEngine.validateForm(data, validationRules);
    
    setErrors(result.fieldErrors);
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(validationRules).forEach(fieldName => {
      allTouched[fieldName] = true;
    });
    setTouchedState(allTouched);
    
    return result.isValid;
  }, [data, validationRules]);

  /**
   * Set field value with optional validation
   */
  const setValue = useCallback((name: keyof T, value: any) => {
    // Don't update if value is the same
    if (data[name] === value) {
      return;
    }

    setData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate if field is touched and validateOnChange is enabled
    if ((touched[name as string] || validateOnChange) && validationRules[name as string]) {
      if (debounceMs > 0) {
        // Clear existing timeout
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
          validateField(name, value);
        }, debounceMs);

        setDebounceTimeout(timeout);
      } else {
        validateField(name, value);
      }
    }
  }, [data, touched, validateOnChange, validationRules, debounceMs, debounceTimeout, validateField]);

  /**
   * Mark field as touched and validate if enabled
   */
  const setTouched = useCallback((name: keyof T) => {
    setTouchedState(prev => ({
      ...prev,
      [name]: true
    }));

    if (validateOnBlur && validationRules[name as string]) {
      validateField(name);
    }
  }, [validateOnBlur, validationRules, validateField]);

  /**
   * Reset form to initial state or new data
   */
  const reset = useCallback((newData?: T) => {
    const resetData = newData || initialData;
    setData(resetData);
    setErrors({});
    setTouchedState({});
    
    // Clear any pending debounce
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
  }, [initialData, debounceTimeout]);

  /**
   * Get props for form field integration
   */
  const getFieldProps = useCallback((name: keyof T) => {
    return {
      name: name as string,
      value: data[name] || '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValue(name, event.target.value);
      },
      onBlur: () => {
        setTouched(name);
      },
      errors: errors[name as string] || [],
      touched: touched[name as string] || false
    };
  }, [data, errors, touched, setValue, setTouched]);

  /**
   * Compute overall form validity
   */
  const isValid = useMemo(() => {
    // Check if all required fields are valid
    const result = ValidationEngine.validateForm(data, validationRules);
    return result.isValid;
  }, [data, validationRules]);

  // Cleanup debounce timeout on unmount
  useState(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  });

  return {
    data,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    validateField,
    validateAll,
    reset,
    getFieldProps
  };
}