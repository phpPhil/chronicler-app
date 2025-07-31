/**
 * ResponsiveWrapper Component
 * Feature: F09 - Responsive Design System
 * 
 * Conditional rendering wrapper that shows/hides content based on breakpoints.
 * Provides flexible responsive behavior with professional UX patterns.
 */

import React, { useMemo } from 'react';
import { useResponsive, type Breakpoint, isBreakpointAbove, isBreakpointBelow } from '../hooks/useResponsive';

export interface ResponsiveWrapperProps {
  children: React.ReactNode;
  
  /** Show content only on specific device type */
  showOnly?: 'mobile' | 'tablet' | 'desktop';
  
  /** Hide content below specified breakpoint (exclusive) */
  hideBelow?: Breakpoint;
  
  /** Hide content above specified breakpoint (exclusive) */
  hideAbove?: Breakpoint;
  
  /** Custom CSS class name */
  className?: string;
  
  /** HTML element type to render as wrapper */
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * ResponsiveWrapper - Conditionally renders children based on breakpoint rules
 * 
 * Follows the principle of progressive disclosure for optimal UX across devices.
 * Supports multiple visibility patterns for flexible responsive design.
 * 
 * @example
 * ```tsx
 * // Show only on mobile devices
 * <ResponsiveWrapper showOnly="mobile">
 *   <MobileNavigation />
 * </ResponsiveWrapper>
 * 
 * // Hide below tablet breakpoint
 * <ResponsiveWrapper hideBelow="md">
 *   <DesktopFeatures />
 * </ResponsiveWrapper>
 * 
 * // Hide above small tablet breakpoint
 * <ResponsiveWrapper hideAbove="sm">
 *   <MobileOptimizedContent />
 * </ResponsiveWrapper>
 * ```
 */
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  showOnly,
  hideBelow,
  hideAbove,
  className,
  as: Element = 'div'
}) => {
  const responsiveState = useResponsive();
  
  // Determine if content should be hidden based on responsive rules
  const shouldHide = useMemo(() => {
    // Handle case where useResponsive returns undefined/null (error state)
    if (!responsiveState) {
      return true; // Hide content when responsive state is unavailable
    }
    
    const { breakpoint, isMobile, isTablet, isDesktop } = responsiveState;
    
    // Priority 1: showOnly prop takes precedence over hide props
    if (showOnly) {
      switch (showOnly) {
        case 'mobile':
          return !isMobile;
        case 'tablet':
          return !isTablet;
        case 'desktop':
          return !isDesktop;
        default:
          return false;
      }
    }
    
    // Priority 2: Check hideBelow rule
    if (hideBelow) {
      // Hide if current breakpoint is below the specified threshold
      if (isBreakpointBelow(breakpoint, hideBelow)) {
        return true;
      }
    }
    
    // Priority 3: Check hideAbove rule
    if (hideAbove) {
      // Hide if current breakpoint is above the specified threshold
      if (isBreakpointAbove(breakpoint, hideAbove)) {
        return true;
      }
    }
    
    // Default: show content
    return false;
  }, [responsiveState, showOnly, hideBelow, hideAbove]);
  
  // Don't render anything if content should be hidden
  if (shouldHide) {
    return null;
  }
  
  // Render the wrapper element with children
  return (
    <Element className={className}>
      {children}
    </Element>
  );
};

/**
 * Pre-configured responsive wrapper components for common use cases
 */

export const MobileOnly: React.FC<Omit<ResponsiveWrapperProps, 'showOnly'>> = (props) => (
  <ResponsiveWrapper {...props} showOnly="mobile" />
);

export const TabletOnly: React.FC<Omit<ResponsiveWrapperProps, 'showOnly'>> = (props) => (
  <ResponsiveWrapper {...props} showOnly="tablet" />
);

export const DesktopOnly: React.FC<Omit<ResponsiveWrapperProps, 'showOnly'>> = (props) => (
  <ResponsiveWrapper {...props} showOnly="desktop" />
);

export const TabletUp: React.FC<Omit<ResponsiveWrapperProps, 'hideBelow'>> = (props) => (
  <ResponsiveWrapper {...props} hideBelow="md" />
);

export const DesktopUp: React.FC<Omit<ResponsiveWrapperProps, 'hideBelow'>> = (props) => (
  <ResponsiveWrapper {...props} hideBelow="lg" />
);

export const MobileDown: React.FC<Omit<ResponsiveWrapperProps, 'hideAbove'>> = (props) => (
  <ResponsiveWrapper {...props} hideAbove="sm" />
);

export const TabletDown: React.FC<Omit<ResponsiveWrapperProps, 'hideAbove'>> = (props) => (
  <ResponsiveWrapper {...props} hideAbove="md" />
);

export default ResponsiveWrapper;