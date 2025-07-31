/**
 * MobileNavigation Component
 * Feature: F09 - Responsive Design System
 * 
 * Touch-optimized mobile navigation with hamburger menu.
 * Follows WCAG AA accessibility standards and Chronicler brand guidelines.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useResponsive } from '../hooks/useResponsive';

export interface MobileNavigationProps {
  /** Callback when navigation item is selected */
  onNavigate?: (section: string) => void;
  
  /** Additional CSS class name */
  className?: string;
  
  /** Custom navigation items */
  items?: Array<{
    id: string;
    label: string;
    onClick?: () => void;
  }>;
}

/**
 * MobileNavigation - Professional mobile navigation component
 * 
 * Features:
 * - Touch-optimized 44px minimum touch targets
 * - Hamburger menu with smooth animations
 * - Keyboard navigation support
 * - Outside click/tap to close
 * - WCAG AA compliant accessibility
 * - Chronicler brand styling
 * 
 * @example
 * ```tsx
 * <MobileNavigation 
 *   onNavigate={(section) => scrollToSection(section)}
 * />
 * ```
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onNavigate,
  className = '',
  items
}) => {
  const responsiveData = useResponsive();
  const isMobile = responsiveData?.isMobile || false;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  
  // Default navigation items
  const defaultItems = [
    { id: 'upload', label: 'Submit Chronicle Lists', onClick: undefined },
    { id: 'results', label: 'View Results', onClick: undefined },
    { id: 'documentation', label: 'Documentation', onClick: undefined }
  ];
  
  const navigationItems = items || defaultItems;
  
  // Generate unique ID for ARIA attributes
  const menuId = `mobile-nav-menu-${Math.random().toString(36).substr(2, 9)}`;
  
  // Toggle menu open/closed state
  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  // Close menu
  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);
  
  // Handle navigation item click
  const handleNavigate = useCallback((itemId: string) => {
    // Execute custom click handler if provided
    const item = navigationItems.find(nav => nav.id === itemId);
    if (item?.onClick) {
      item.onClick();
    }
    
    // Execute navigation callback
    if (onNavigate) {
      onNavigate(itemId);
    }
    
    // Close menu after navigation
    closeMenu();
  }, [navigationItems, onNavigate, closeMenu]);
  
  // Handle keyboard events
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        closeMenu();
        toggleRef.current?.focus();
        break;
      case 'Tab':
        // Allow normal tab navigation within the menu
        break;
      default:
        break;
    }
  }, [closeMenu]);
  
  // Handle outside click to close menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current?.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
      };
    }
  }, [isOpen, closeMenu]);
  
  // Focus management when menu opens
  useEffect(() => {
    if (isOpen) {
      // Focus first menu item when menu opens
      const firstMenuItem = menuRef.current?.querySelector('.nav-item');
      if (firstMenuItem) {
        (firstMenuItem as HTMLElement).focus();
      }
    }
  }, [isOpen]);
  
  // Don't render on non-mobile devices
  if (!isMobile) {
    return null;
  }
  
  return (
    <nav 
      className={`mobile-nav ${className}`}
      aria-label="Mobile navigation"
      ref={menuRef}
      data-testid="mobile-navigation"
    >
      {/* Hamburger Toggle Button */}
      <button
        ref={toggleRef}
        className="nav-toggle"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label="Toggle navigation menu"
        type="button"
      >
        <span 
          className="hamburger-line" 
          data-testid="hamburger-line-1"
        />
        <span 
          className="hamburger-line" 
          data-testid="hamburger-line-2"
        />
        <span 
          className="hamburger-line" 
          data-testid="hamburger-line-3"
        />
      </button>
      
      {/* Navigation Menu */}
      <div
        id={menuId}
        className={`nav-menu ${isOpen ? 'open' : ''}`}
        data-testid="nav-menu"
        onKeyDown={handleKeyDown}
        role="menu"
        aria-hidden={!isOpen}
      >
        {navigationItems.map((item, index) => (
          <button
            key={item.id}
            className="nav-item"
            onClick={() => handleNavigate(item.id)}
            role="menuitem"
            tabIndex={isOpen ? 0 : -1}
            aria-label={`Navigate to ${item.label}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;