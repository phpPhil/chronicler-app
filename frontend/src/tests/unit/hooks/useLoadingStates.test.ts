import { renderHook, act } from '@testing-library/react';
import { useLoadingStates, useOperationProgress, useLoadingTimeout } from '../../../hooks/useLoadingStates';

describe('useLoadingStates', () => {
  test('manages multiple loading states', () => {
    const { result } = renderHook(() => useLoadingStates());
    
    expect(result.current.hasAnyLoading).toBe(false);
    expect(result.current.loadingOperations).toHaveLength(0);
    
    act(() => {
      result.current.startLoading('op1', 'Operation 1');
      result.current.startLoading('op2', 'Operation 2');
    });
    
    expect(result.current.hasAnyLoading).toBe(true);
    expect(result.current.loadingOperations).toHaveLength(2);
    expect(result.current.isLoading('op1')).toBe(true);
    expect(result.current.isLoading('op2')).toBe(true);
  });

  test('updates loading progress', () => {
    const { result } = renderHook(() => useLoadingStates());
    
    act(() => {
      result.current.startLoading('upload', 'Uploading file');
    });
    
    act(() => {
      result.current.updateProgress('upload', 50, 'Half uploaded');
    });
    
    const operation = result.current.getLoadingState('upload');
    expect(operation?.progress).toBe(50);
    expect(operation?.message).toBe('Half uploaded');
  });

  test('completes loading operations', () => {
    const { result } = renderHook(() => useLoadingStates());
    
    act(() => {
      result.current.startLoading('test', 'Testing');
    });
    
    expect(result.current.isLoading('test')).toBe(true);
    
    act(() => {
      result.current.completeLoading('test');
    });
    
    expect(result.current.isLoading('test')).toBe(false);
    expect(result.current.hasAnyLoading).toBe(false);
  });

  test('cancels loading operations', () => {
    const onCancel = jest.fn();
    const { result } = renderHook(() => useLoadingStates());
    
    act(() => {
      result.current.startLoading('cancel-test', 'Cancellable operation', { 
        cancellable: true, 
        onCancel 
      });
    });
    
    act(() => {
      result.current.cancelLoading('cancel-test');
    });
    
    expect(onCancel).toHaveBeenCalled();
    expect(result.current.isLoading('cancel-test')).toBe(false);
  });

  test('handles operation stages', () => {
    const { result } = renderHook(() => useLoadingStates());
    
    act(() => {
      result.current.startLoading('staged-op', 'Starting operation');
    });
    
    act(() => {
      result.current.updateStage('staged-op', 'processing', 'Processing data');
    });
    
    const operation = result.current.getLoadingState('staged-op');
    expect(operation?.stage).toBe('processing');
    expect(operation?.message).toBe('Processing data');
  });

  test('resets all loading states', () => {
    const { result } = renderHook(() => useLoadingStates());
    
    act(() => {
      result.current.startLoading('op1', 'Operation 1');
      result.current.startLoading('op2', 'Operation 2');
    });
    
    expect(result.current.hasAnyLoading).toBe(true);
    
    act(() => {
      result.current.resetAllLoading();
    });
    
    expect(result.current.hasAnyLoading).toBe(false);
    expect(result.current.loadingOperations).toHaveLength(0);
  });
});

describe('useOperationProgress', () => {
  test('tracks multi-step operation progress', () => {
    const steps = ['upload', 'validate', 'process', 'complete'];
    const { result } = renderHook(() => useOperationProgress(steps));
    
    expect(result.current.currentStep).toBe(0);
    expect(result.current.currentStepName).toBe('upload');
    expect(result.current.overallProgress).toBe(0);
    
    act(() => {
      result.current.nextStep();
    });
    
    expect(result.current.currentStep).toBe(1);
    expect(result.current.currentStepName).toBe('validate');
    expect(result.current.overallProgress).toBe(25);
  });

  test('updates step progress', () => {
    const steps = ['step1', 'step2'];
    const { result } = renderHook(() => useOperationProgress(steps));
    
    act(() => {
      result.current.updateStepProgress(50);
    });
    
    expect(result.current.currentStepProgress).toBe(50);
    // Overall progress should be 25% (50% of first 50% segment)
    expect(result.current.overallProgress).toBe(25);
  });

  test('completes operation', () => {
    const steps = ['step1'];
    const { result } = renderHook(() => useOperationProgress(steps));
    
    act(() => {
      result.current.complete();
    });
    
    expect(result.current.isComplete).toBe(true);
    expect(result.current.overallProgress).toBe(100);
  });

  test('resets operation progress', () => {
    const steps = ['step1', 'step2'];
    const { result } = renderHook(() => useOperationProgress(steps));
    
    act(() => {
      result.current.nextStep();
      result.current.updateStepProgress(75);
    });
    
    expect(result.current.currentStep).toBe(1);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.currentStep).toBe(0);
    expect(result.current.currentStepProgress).toBe(0);
    expect(result.current.overallProgress).toBe(0);
  });
});

describe('useLoadingTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('calls timeout callback after specified duration', () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() => useLoadingTimeout({
      timeout: 5000,
      onTimeout
    }));
    
    act(() => {
      result.current.startTimeout();
    });
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    expect(onTimeout).toHaveBeenCalled();
  });

  test('clears timeout when stopped', () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() => useLoadingTimeout({
      timeout: 5000,
      onTimeout
    }));
    
    act(() => {
      result.current.startTimeout();
    });
    
    act(() => {
      result.current.stopTimeout();
    });
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    expect(onTimeout).not.toHaveBeenCalled();
  });

  test('resets timeout when restarted', () => {
    const onTimeout = jest.fn();
    const { result } = renderHook(() => useLoadingTimeout({
      timeout: 5000,
      onTimeout
    }));
    
    act(() => {
      result.current.startTimeout();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    act(() => {
      result.current.resetTimeout();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Should not have timed out yet
    expect(onTimeout).not.toHaveBeenCalled();
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Now should timeout
    expect(onTimeout).toHaveBeenCalled();
  });

  test('tracks elapsed time', () => {
    const { result } = renderHook(() => useLoadingTimeout({
      timeout: 10000,
      onTimeout: () => {}
    }));
    
    act(() => {
      result.current.startTimeout();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(result.current.elapsedTime).toBe(3000);
    
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(result.current.elapsedTime).toBe(5000);
  });

  test('calculates remaining time', () => {
    const { result } = renderHook(() => useLoadingTimeout({
      timeout: 10000,
      onTimeout: () => {}
    }));
    
    act(() => {
      result.current.startTimeout();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(result.current.remainingTime).toBe(7000);
  });
});