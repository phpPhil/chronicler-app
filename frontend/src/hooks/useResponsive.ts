/**
 * useResponsive Hook
 * Feature: F09 - Responsive Design System
 * 
 * Provides responsive breakpoint detection and screen size tracking
 * for conditional rendering and responsive behavior.
 */

import { useState, useEffect, useMemo } from 'react';

// Breakpoint values matching CSS custom properties
const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
} as const;

export type Breakpoint = 'mobile' | 'sm' | 'md' | 'lg' | 'xl';

export interface ResponsiveState {
  breakpoint: Breakpoint;
  screenSize: {
    width: number;
    height: number;
  };
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook for responsive breakpoint detection and screen size tracking
 * 
 * @returns ResponsiveState object containing current breakpoint and device type flags
 * 
 * @example
 * ```tsx
 * const { isMobile, isDesktop, breakpoint, screenSize } = useResponsive();
 * 
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * 
 * return <DesktopLayout />;
 * ```
 */
export const useResponsive = (): ResponsiveState => {
  // Initialize with current window size or default values for SSR
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Calculate breakpoint based on screen width
  const breakpoint = useMemo((): Breakpoint => {
    const { width } = screenSize;
    
    if (width < BREAKPOINTS.sm) return 'mobile';
    if (width < BREAKPOINTS.md) return 'sm';
    if (width < BREAKPOINTS.lg) return 'md';
    if (width < BREAKPOINTS.xl) return 'lg';
    return 'xl';
  }, [screenSize]);

  // Calculate device type flags
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'sm' || breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';

  useEffect(() => {
    // Early return if window is not available (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const updateScreenSize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      // Only update if dimensions actually changed to prevent unnecessary re-renders
      setScreenSize(current => {
        if (current.width !== newWidth || current.height !== newHeight) {
          return { width: newWidth, height: newHeight };
        }
        return current;
      });
    };

    // Set initial size only if it hasn't been set yet
    // This allows tests to pre-set window size before the hook runs
    updateScreenSize();

    // Add resize listener
    window.addEventListener('resize', updateScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateScreenSize);
    };
  }, []);

  return {
    breakpoint,
    screenSize,
    isMobile,
    isTablet,
    isDesktop
  };
};

/**
 * Utility function to check if current breakpoint is above a given threshold
 * 
 * @param currentBreakpoint - The current breakpoint
 * @param threshold - The threshold breakpoint to compare against
 * @returns boolean indicating if current breakpoint is above threshold
 */
export const isBreakpointAbove = (
  currentBreakpoint: Breakpoint, 
  threshold: Breakpoint
): boolean => {
  const breakpointOrder: Breakpoint[] = ['mobile', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const thresholdIndex = breakpointOrder.indexOf(threshold);
  
  return currentIndex > thresholdIndex;
};

/**
 * Utility function to check if current breakpoint is below a given threshold
 * 
 * @param currentBreakpoint - The current breakpoint
 * @param threshold - The threshold breakpoint to compare against
 * @returns boolean indicating if current breakpoint is below threshold
 */
export const isBreakpointBelow = (
  currentBreakpoint: Breakpoint, 
  threshold: Breakpoint
): boolean => {
  const breakpointOrder: Breakpoint[] = ['mobile', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  const thresholdIndex = breakpointOrder.indexOf(threshold);
  
  return currentIndex < thresholdIndex;
};

/**
 * Utility function to get responsive value based on current breakpoint
 * 
 * @param values - Object with breakpoint keys and corresponding values
 * @param currentBreakpoint - The current breakpoint
 * @returns The value for the current breakpoint, falling back to mobile if not found
 * 
 * @example
 * ```tsx
 * const columns = getResponsiveValue({
 *   mobile: 1,
 *   md: 2,
 *   lg: 3
 * }, breakpoint);
 * ```
 */
export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>, 
  currentBreakpoint: Breakpoint
): T | undefined => {
  // Try exact match first
  if (values[currentBreakpoint] !== undefined) {
    return values[currentBreakpoint];
  }
  
  // Fallback logic: find the largest breakpoint that has a value and is <= current
  const breakpointOrder: Breakpoint[] = ['mobile', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);
  
  // Look backwards from current breakpoint to find a value
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
};

export default useResponsive;