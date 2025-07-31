import React, { useEffect, useState } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  progress?: number;        // 0-100
  message?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
  animated?: boolean;
  cancellable?: boolean;
  onCancel?: () => void;
  className?: string;
  startTime?: number;
  showTimeEstimate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  message,
  showPercentage = true,
  color = '#007bff',
  height = 8,
  animated = true,
  cancellable = false,
  onCancel,
  className = '',
  startTime,
  showTimeEstimate = false
}) => {
  const [timeEstimate, setTimeEstimate] = useState<string>('');
  
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Calculate time estimate
  useEffect(() => {
    if (showTimeEstimate && startTime && progress > 0 && progress < 100) {
      const elapsed = Date.now() - startTime;
      const rate = progress / elapsed; // progress per ms
      const remainingProgress = 100 - progress;
      const estimatedRemaining = remainingProgress / rate; // ms
      
      if (estimatedRemaining > 0 && isFinite(estimatedRemaining)) {
        const seconds = Math.ceil(estimatedRemaining / 1000);
        if (seconds < 60) {
          setTimeEstimate(`~${seconds}s remaining`);
        } else {
          const minutes = Math.ceil(seconds / 60);
          setTimeEstimate(`~${minutes}m remaining`);
        }
      }
    } else {
      setTimeEstimate('');
    }
  }, [progress, startTime, showTimeEstimate]);

  const displayMessage = message + 
    (showPercentage ? ` (${Math.round(clampedProgress)}%)` : '') +
    (timeEstimate ? ` • ${timeEstimate}` : '');

  return (
    <div className={`progress-container ${className}`}>
      {message && (
        <div className="progress-message" aria-live="polite">
          {displayMessage}
        </div>
      )}
      <div 
        className="progress-bar"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={message || 'Loading progress'}
      >
        <div 
          className={`progress-fill ${animated ? 'animated' : ''}`}
          style={{ 
            width: `${clampedProgress}%`,
            backgroundColor: color 
          }}
        />
      </div>
      {cancellable && onCancel && (
        <button
          onClick={onCancel}
          className="progress-cancel-btn"
          aria-label="Cancel current operation"
          type="button"
        >
          Cancel
        </button>
      )}
    </div>
  );
};