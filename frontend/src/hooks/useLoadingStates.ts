import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingOperation {
  id: string;
  isLoading: boolean;
  progress?: number;
  stage?: string;
  message?: string;
  startTime: number;
  cancellable?: boolean;
  onCancel?: () => void;
}

export interface LoadingStateOptions {
  cancellable?: boolean;
  onCancel?: () => void;
  timeout?: number;
  onTimeout?: () => void;
}

/**
 * Hook for managing multiple loading states
 */
export const useLoadingStates = () => {
  const [operations, setOperations] = useState<Map<string, LoadingOperation>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const hasAnyLoading = Array.from(operations.values()).some(op => op.isLoading);
  const loadingOperations = Array.from(operations.values()).filter(op => op.isLoading);

  const startLoading = useCallback((id: string, message: string, options?: LoadingStateOptions) => {
    const operation: LoadingOperation = {
      id,
      isLoading: true,
      message,
      startTime: Date.now(),
      progress: 0,
      stage: '',
      ...options
    };

    setOperations(prev => new Map(prev).set(id, operation));

    // Set up timeout if specified
    if (options?.timeout && options?.onTimeout) {
      const timeoutId = setTimeout(() => {
        options.onTimeout!();
        completeLoading(id);
      }, options.timeout);
      
      timeoutsRef.current.set(id, timeoutId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProgress = useCallback((id: string, progress: number, message?: string, stage?: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      const operation = newMap.get(id);
      if (operation) {
        newMap.set(id, {
          ...operation,
          progress: Math.max(0, Math.min(100, progress)),
          ...(message && { message }),
          ...(stage && { stage })
        });
      }
      return newMap;
    });
  }, []);

  const updateStage = useCallback((id: string, stage: string, message?: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      const operation = newMap.get(id);
      if (operation) {
        newMap.set(id, {
          ...operation,
          stage,
          ...(message && { message })
        });
      }
      return newMap;
    });
  }, []);

  const completeLoading = useCallback((id: string) => {
    // Clear timeout if exists
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setOperations(prev => {
      const newMap = new Map(prev);
      const operation = newMap.get(id);
      if (operation) {
        newMap.set(id, {
          ...operation,
          isLoading: false,
          progress: 100
        });
      }
      return newMap;
    });
  }, []);

  const cancelLoading = useCallback((id: string) => {
    const operation = operations.get(id);
    if (operation?.onCancel) {
      operation.onCancel();
    }
    
    // Clear timeout if exists
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setOperations(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, [operations]);

  const resetAllLoading = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current.clear();
    
    setOperations(new Map());
  }, []);

  const isLoading = useCallback((id: string) => {
    return operations.get(id)?.isLoading ?? false;
  }, [operations]);

  const getLoadingState = useCallback((id: string) => {
    return operations.get(id) ?? null;
  }, [operations]);

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, []);

  return {
    hasAnyLoading,
    loadingOperations,
    startLoading,
    updateProgress,
    updateStage,
    completeLoading,
    cancelLoading,
    resetAllLoading,
    isLoading,
    getLoadingState
  };
};

/**
 * Hook for tracking multi-step operation progress
 */
export const useOperationProgress = (steps: string[]) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStepProgress, setCurrentStepProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentStepName = steps[currentStep] || '';
  const stepWeight = 100 / steps.length;
  const completedStepsProgress = currentStep * stepWeight;
  const currentStepContribution = (currentStepProgress / 100) * stepWeight;
  const overallProgress = Math.min(100, completedStepsProgress + currentStepContribution);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCurrentStepProgress(0);
    }
  }, [currentStep, steps.length]);

  const updateStepProgress = useCallback((progress: number) => {
    setCurrentStepProgress(Math.max(0, Math.min(100, progress)));
  }, []);

  const complete = useCallback(() => {
    setCurrentStep(steps.length - 1);
    setCurrentStepProgress(100);
    setIsComplete(true);
  }, [steps.length]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCurrentStepProgress(0);
    setIsComplete(false);
  }, []);

  return {
    currentStep,
    currentStepName,
    currentStepProgress,
    overallProgress,
    isComplete,
    stepCount: steps.length,
    nextStep,
    updateStepProgress,
    complete,
    reset
  };
};

/**
 * Hook for handling loading timeouts with elapsed time tracking
 */
export const useLoadingTimeout = (options: {
  timeout: number;
  onTimeout: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const remainingTime = Math.max(0, options.timeout - elapsedTime);

  const startTimeout = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsActive(true);
    setElapsedTime(0);

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      options.onTimeout();
      setIsActive(false);
    }, options.timeout);

    // Set up elapsed time tracking
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setElapsedTime(elapsed);
    }, 100);
  }, [options]);

  const stopTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  }, []);

  const resetTimeout = useCallback(() => {
    stopTimeout();
    startTimeout();
  }, [stopTimeout, startTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isActive,
    elapsedTime,
    remainingTime,
    startTimeout,
    stopTimeout,
    resetTimeout
  };
};