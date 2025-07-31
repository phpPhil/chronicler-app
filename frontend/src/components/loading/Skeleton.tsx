import React, { useEffect, useState } from 'react';
import './Skeleton.css';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  count = 1,
  variant = 'text'
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

  const skeletonStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const variantClasses = {
    text: 'skeleton-text',
    rectangular: 'skeleton-rect',
    circular: 'skeleton-circle'
  };

  const skeletonClasses = [
    'skeleton',
    variantClasses[variant],
    prefersReducedMotion ? 'reduced-motion' : '',
    className
  ].filter(Boolean).join(' ');

  if (count === 0) {
    return null;
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={skeletonClasses}
          style={skeletonStyle}
          role="presentation"
          aria-hidden="true"
        />
      ))}
    </>
  );
};