import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  id: string;
  isLoading: boolean;
  progress?: number;
  stage?: string;
  message?: string;
  startTime: number;
  cancellable?: boolean;
  onCancel?: () => void;
  timeout?: number;
  onTimeout?: () => void;
}

export interface LoadingOptions {
  cancellable?: boolean;
  onCancel?: () => void;
  timeout?: number;
  onTimeout?: () => void;
}

interface LoadingContextType {
  // Global loading state
  globalOperations: LoadingState[];
  isGlobalLoading: boolean;
  
  // Global loading management
  startGlobalLoading: (id: string, message: string, options?: LoadingOptions) => void;
  updateGlobalProgress: (id: string, progress: number, message?: string, stage?: string) => void;
  completeGlobalLoading: (id: string) => void;
  cancelGlobalLoading: (id: string) => void;
  resetGlobalLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalOperations, setGlobalOperations] = useState<LoadingState[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const isGlobalLoading = globalOperations.length > 0;

  const startGlobalLoading = useCallback((id: string, message: string, options?: LoadingOptions) => {
    const newOperation: LoadingState = {
      id,
      isLoading: true,
      message,
      startTime: Date.now(),
      progress: 0,
      stage: '',
      ...options
    };

    setGlobalOperations(prev => {
      // Remove existing operation with same ID
      const filtered = prev.filter(op => op.id !== id);
      return [...filtered, newOperation];
    });

    // Set up timeout if specified
    if (options?.timeout && options?.onTimeout) {
      const timeoutId = setTimeout(() => {
        options.onTimeout!();
        completeGlobalLoading(id);
      }, options.timeout);
      
      timeoutsRef.current.set(id, timeoutId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateGlobalProgress = useCallback((id: string, progress: number, message?: string, stage?: string) => {
    setGlobalOperations(prev => 
      prev.map(op => 
        op.id === id 
          ? { 
              ...op, 
              progress: Math.max(0, Math.min(100, progress)),
              ...(message && { message }),
              ...(stage && { stage })
            }
          : op
      )
    );
  }, []);

  const completeGlobalLoading = useCallback((id: string) => {
    // Clear timeout if exists
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setGlobalOperations(prev => prev.filter(op => op.id !== id));
  }, []);

  const cancelGlobalLoading = useCallback((id: string) => {
    setGlobalOperations(prev => {
      const operation = prev.find(op => op.id === id);
      if (operation?.onCancel) {
        operation.onCancel();
      }
      return prev;
    });
    completeGlobalLoading(id);
  }, [completeGlobalLoading]);

  const resetGlobalLoading = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutsRef.current.clear();
    
    setGlobalOperations([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, []);

  const value: LoadingContextType = {
    globalOperations,
    isGlobalLoading,
    startGlobalLoading,
    updateGlobalProgress,
    completeGlobalLoading,
    cancelGlobalLoading,
    resetGlobalLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

/**
 * Hook for managing global loading states
 */
export const useGlobalLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within a LoadingStateProvider');
  }
  return context;
};

/**
 * Hook for managing component-level loading states
 */
export const useLoading = (operationId?: string) => {
  const [state, setState] = useState<{
    loading: boolean;
    progress: number;
    message: string;
    stage: string;
    cancellable: boolean;
    onCancel?: () => void;
  }>({
    loading: false,
    progress: 0,
    message: '',
    stage: '',
    cancellable: false
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startLoading = useCallback((
    message: string, 
    cancellable: boolean = false, 
    onCancel?: () => void,
    options?: { timeout?: number; onTimeout?: () => void }
  ) => {
    startTimeRef.current = Date.now();
    setState({
      loading: true,
      progress: 0,
      message,
      stage: '',
      cancellable,
      onCancel
    });

    // Set up timeout if specified
    if (options?.timeout && options?.onTimeout) {
      const timeoutCallback = options.onTimeout;
      timeoutRef.current = setTimeout(() => {
        timeoutCallback();
        completeLoading();
      }, options.timeout);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProgress = useCallback((progress: number, message?: string, stage?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      ...(message && { message }),
      ...(stage && { stage })
    }));
  }, []);

  const completeLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      progress: 100,
      message: 'Complete'
    }));
  }, []);

  const cancelLoading = useCallback(() => {
    setState(prev => {
      if (prev.onCancel) {
        prev.onCancel();
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      return {
        loading: false,
        progress: 0,
        message: '',
        stage: '',
        cancellable: false
      };
    });
  }, []);

  const resetLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState({
      loading: false,
      progress: 0,
      message: '',
      stage: '',
      cancellable: false
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startTime: startTimeRef.current,
    startLoading,
    updateProgress,
    completeLoading,
    cancelLoading,
    resetLoading
  };
};