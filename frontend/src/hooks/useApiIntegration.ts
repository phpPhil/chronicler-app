import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChroniclerApiClient } from '../services/ChroniclerApiClient';
import { 
  UploadResult, 
  DistanceCalculationRequest, 
  DistanceCalculationResult, 
  HealthStatus,
  ApiError 
} from '../types/api';

// Singleton API client instance
const apiClient = new ChroniclerApiClient();

/**
 * Hook for file upload functionality with progress tracking
 */
export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<{
    loading: boolean;
    progress: number;
    result: UploadResult | null;
    error: Error | null;
  }>({
    loading: false,
    progress: 0,
    result: null,
    error: null
  });

  const uploadFile = useCallback(async (file: File) => {
    setUploadState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      progress: 0 
    }));
    
    try {
      const result = await apiClient.uploadFile(file, (progress) => {
        setUploadState(prev => ({ ...prev, progress }));
      });
      
      setUploadState(prev => ({ 
        ...prev, 
        loading: false, 
        result, 
        progress: 100 
      }));
      
      return result;
    } catch (error) {
      setUploadState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as Error,
        progress: 0
      }));
      throw error;
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      loading: false,
      progress: 0,
      result: null,
      error: null
    });
  }, []);

  return { 
    ...uploadState, 
    uploadFile,
    resetUpload
  };
};

/**
 * Hook for distance calculation functionality
 */
export const useDistanceCalculation = () => {
  const [calculationState, setCalculationState] = useState<{
    loading: boolean;
    result: DistanceCalculationResult | null;
    error: Error | null;
  }>({
    loading: false,
    result: null,
    error: null
  });

  const calculateDistance = useCallback(async (input: DistanceCalculationRequest) => {
    setCalculationState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));
    
    try {
      const result = await apiClient.calculateDistance(input);
      
      setCalculationState(prev => ({ 
        ...prev, 
        loading: false, 
        result 
      }));
      
      return result;
    } catch (error) {
      setCalculationState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as Error 
      }));
      throw error;
    }
  }, []);

  const resetCalculation = useCallback(() => {
    setCalculationState({
      loading: false,
      result: null,
      error: null
    });
  }, []);

  return { 
    ...calculationState, 
    calculateDistance,
    resetCalculation
  };
};

/**
 * Hook for health check functionality
 */
export const useHealthCheck = (options?: { autoCheck?: boolean }) => {
  const [healthState, setHealthState] = useState<{
    loading: boolean;
    status: HealthStatus | null;
    error: Error | null;
  }>({
    loading: false,
    status: null,
    error: null
  });

  const checkHealth = useCallback(async () => {
    setHealthState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null 
    }));
    
    try {
      const status = await apiClient.healthCheck();
      
      setHealthState(prev => ({ 
        ...prev, 
        loading: false, 
        status 
      }));
      
      return status;
    } catch (error) {
      setHealthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as Error 
      }));
      throw error;
    }
  }, []);

  // Auto-check health on mount if enabled
  useEffect(() => {
    if (options?.autoCheck) {
      checkHealth().catch(() => {
        // Silently handle auto-check errors
        // The error will be stored in state for manual inspection
      });
    }
  }, [checkHealth, options?.autoCheck]);

  return { 
    ...healthState, 
    checkHealth 
  };
};

/**
 * Combined hook for complete workflow: upload file -> calculate distance
 */
export const useCompleteWorkflow = () => {
  const uploadHook = useFileUpload();
  const calculationHook = useDistanceCalculation();
  
  const [workflowState, setWorkflowState] = useState<{
    step: 'idle' | 'uploading' | 'calculating' | 'completed' | 'error';
    overallProgress: number;
  }>({
    step: 'idle',
    overallProgress: 0
  });

  const executeWorkflow = useCallback(async (file: File) => {
    setWorkflowState({ step: 'uploading', overallProgress: 0 });
    
    try {
      // Step 1: Upload file
      const uploadResult = await uploadHook.uploadFile(file);
      
      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      setWorkflowState({ step: 'calculating', overallProgress: 50 });
      
      // Step 2: Calculate distance
      const calculationInput: DistanceCalculationRequest = {
        list1: uploadResult.data.list1,
        list2: uploadResult.data.list2
      };
      
      const calculationResult = await calculationHook.calculateDistance(calculationInput);
      
      setWorkflowState({ step: 'completed', overallProgress: 100 });
      
      return {
        uploadResult,
        calculationResult
      };
      
    } catch (error) {
      setWorkflowState({ step: 'error', overallProgress: 0 });
      throw error;
    }
  }, [uploadHook, calculationHook]);

  const resetWorkflow = useCallback(() => {
    uploadHook.resetUpload();
    calculationHook.resetCalculation();
    setWorkflowState({ step: 'idle', overallProgress: 0 });
  }, [uploadHook, calculationHook]);

  return {
    // Combined state
    step: workflowState.step,
    overallProgress: workflowState.overallProgress,
    loading: uploadHook.loading || calculationHook.loading,
    
    // Individual results
    uploadResult: uploadHook.result,
    calculationResult: calculationHook.result,
    
    // Errors
    uploadError: uploadHook.error,
    calculationError: calculationHook.error,
    
    // Progress details
    uploadProgress: uploadHook.progress,
    
    // Actions
    executeWorkflow,
    resetWorkflow,
    
    // Individual hooks for granular control
    uploadHook,
    calculationHook
  };
};

/**
 * Hook for managing API errors with user-friendly messages
 */
export const useApiError = () => {
  const { t } = useTranslation();
  
  const formatErrorMessage = useCallback((error: Error | ApiError): string => {
    if ('userMessage' in error) {
      return error.userMessage;
    }
    
    // Fallback for regular errors
    if (error.message.includes('Network Error')) {
      return t('errors:calculation.networkError', 'Network connection error');
    }
    
    if (error.message.includes('timeout')) {
      return t('errors:calculation.networkError', 'Request timeout error');
    }
    
    if (error.message.includes('500')) {
      return 'Our servers are experiencing issues. Please try again in a moment.';
    }
    
    if (error.message.includes('400')) {
      return 'Please check your input and try again.';
    }
    
    return 'Something went wrong. Please try again.';
  }, [t]);

  const isRetryableError = useCallback((error: Error | ApiError): boolean => {
    if ('retryable' in error) {
      return error.retryable;
    }
    
    // Assume network and server errors are retryable
    return error.message.includes('Network Error') || 
           error.message.includes('timeout') || 
           error.message.includes('500');
  }, []);

  return {
    formatErrorMessage,
    isRetryableError
  };
};