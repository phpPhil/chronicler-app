/**
 * @fileoverview useFieldValidation hook - Single field validation state management
 * Provides focused validation for individual form fields with real-time feedback
 * Part of Feature 08: Input Validation System
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { ValidationEngine, ValidationRule } from '../utils/ValidationEngine';

export interface UseFieldValidationOptions {
  validateOnMount?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseFieldValidationReturn {
  value: string;
  errors: string[];
  touched: boolean;
  isValid: boolean;
  setValue: (value: string) => void;
  setTouched: () => void;
  validate: (value?: string) => boolean;
  reset: (value?: string) => void;
  getProps: () => {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    errors: string[];
    touched: boolean;
    isValid: boolean;
  };
}

/**
 * Single field validation hook with comprehensive validation options
 */
export function useFieldValidation(
  initialValue: string | undefined = '',
  validationRules: ValidationRule[],
  options: UseFieldValidationOptions = {}
): UseFieldValidationReturn {
  const {
    validateOnMount = false,
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 0
  } = options;

  // Memoize validation rules to prevent infinite re-renders
  const memoizedValidationRules = useMemo(() => validationRules, [
    JSON.stringify(validationRules)
  ]);

  // Field state
  const [value, setValue] = useState<string>(initialValue || '');
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<boolean>(false);

  // Debounce ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialValueRef = useRef(initialValue || '');

  /**
   * Validate the field value
   */
  const validate = useCallback((valueToValidate?: string) => {
    const targetValue = valueToValidate !== undefined ? valueToValidate : value;
    const result = ValidationEngine.validateField(targetValue, memoizedValidationRules);
    
    setErrors(result.errors);
    return result.isValid;
  }, [value, memoizedValidationRules]);

  /**
   * Update field value with optional validation
   */
  const updateValue = useCallback((newValue: string) => {
    setValue(newValue);

    // Validate on change if enabled or field is touched
    if ((validateOnChange || touched) && memoizedValidationRules.length > 0) {
      if (debounceMs > 0) {
        // Clear existing timeout
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // Set new debounced validation
        debounceRef.current = setTimeout(() => {
          validate(newValue);
        }, debounceMs);
      } else {
        validate(newValue);
      }
    }
  }, [validateOnChange, touched, validationRules.length, debounceMs, validate]);

  /**
   * Mark field as touched and validate if enabled
   */
  const markTouched = useCallback(() => {
    setTouched(true);

    if (validateOnBlur && memoizedValidationRules.length > 0) {
      validate();
    }
  }, [validateOnBlur, memoizedValidationRules.length, validate]);

  /**
   * Reset field to initial state
   */
  const reset = useCallback((newValue?: string) => {
    const resetValue = newValue !== undefined ? newValue : initialValueRef.current;
    setValue(resetValue);
    setErrors([]);
    setTouched(false);

    // Clear debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  /**
   * Get props for input integration
   */
  const getProps = useCallback(() => {
    return {
      value,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateValue(event.target.value);
      },
      onBlur: () => {
        markTouched();
      },
      errors,
      touched,
      isValid: errors.length === 0
    };
  }, [value, errors, touched, updateValue, markTouched]);

  /**
   * Validate on mount if enabled
   */
  useEffect(() => {
    if (validateOnMount && memoizedValidationRules.length > 0) {
      const result = ValidationEngine.validateField(value, memoizedValidationRules);
      setErrors(result.errors);
    }
  }, [validateOnMount, memoizedValidationRules.length, value]);

  /**
   * Cleanup debounce timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  /**
   * Compute field validity
   * For required fields, empty values are always invalid
   */
  const isValid = useMemo(() => {
    // If there are errors, it's invalid
    if (errors.length > 0) {
      return false;
    }
    
    // Check if field is required and empty
    const hasRequiredRule = memoizedValidationRules.some(rule => rule.required);
    if (hasRequiredRule) {
      const isEmpty = value === '' || value === undefined || value === null || 
                     (typeof value === 'string' && value.trim() === '');
      if (isEmpty) {
        return false;
      }
    }
    
    return true;
  }, [errors, value, memoizedValidationRules]);

  return {
    value,
    errors,
    touched,
    isValid,
    setValue: updateValue,
    setTouched: markTouched,
    validate,
    reset,
    getProps
  };
}