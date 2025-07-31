import React, { useEffect } from 'react';
import { Spinner } from './Spinner';
import { ProgressBar } from './ProgressBar';
import './LoadingOverlay.css';

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  cancellable?: boolean;
  onCancel?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'modal' | 'inline';
  backdrop?: 'blur' | 'solid';
  zIndex?: number;
  allowEscapeCancel?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  progress,
  cancellable = false,
  onCancel,
  children,
  className = '',
  variant = 'modal',
  backdrop = 'solid',
  zIndex = 50,
  allowEscapeCancel = false
}) => {
  // Handle escape key for cancellation
  useEffect(() => {
    if (!isLoading || !cancellable || !allowEscapeCancel || !onCancel) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, cancellable, allowEscapeCancel, onCancel]);

  const overlayClasses = [
    'loading-overlay',
    variant === 'modal' ? 'loading-overlay-modal' : 'loading-overlay-inline',
    backdrop === 'blur' ? 'backdrop-blur-sm' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div 
          className={overlayClasses}
          style={{ zIndex }}
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="loading-content">
            {typeof progress === 'number' ? (
              <ProgressBar 
                progress={progress} 
                message={message}
                cancellable={cancellable}
                onCancel={onCancel}
              />
            ) : (
              <Spinner size="lg" aria-label={message} />
            )}
            
            {typeof progress !== 'number' && (
              <div className="loading-message">
                {message}
              </div>
            )}
            
            {cancellable && onCancel && typeof progress !== 'number' && (
              <button
                onClick={onCancel}
                className="loading-cancel-btn"
                aria-label="Cancel current operation"
                type="button"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};