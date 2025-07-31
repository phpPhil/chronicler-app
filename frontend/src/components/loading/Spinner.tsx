import React, { useEffect, useState } from 'react';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  'aria-label'?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = '#007bff',
  className = '',
  'aria-label': ariaLabel = 'Loading'
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (media) {
        setPrefersReducedMotion(media.matches || false);
        
        const handleChange = () => setPrefersReducedMotion(media.matches || false);
        media.addEventListener('change', handleChange);
        
        return () => media.removeEventListener('change', handleChange);
      }
    }
  }, []);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  const spinnerClasses = [
    'spinner',
    sizeClasses[size],
    prefersReducedMotion ? 'reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={spinnerClasses}
      style={{ borderTopColor: color }}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};