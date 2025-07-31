import React from 'react';
import { render, screen } from '../../../utils/test-utils';
import '@testing-library/jest-dom';
import { Spinner } from '../../../../components/loading/Spinner';

// Mock window.matchMedia for this test file - create a simple function that returns an object
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Assign directly to window
(window as any).matchMedia = mockMatchMedia;

describe('Spinner', () => {
  beforeEach(() => {
    // Ensure matchMedia is properly mocked before each test
    (window as any).matchMedia = mockMatchMedia;
  });

  test('renders with default props', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
    expect(spinner).toHaveClass('spinner');
  });

  test('renders with custom aria-label', () => {
    render(<Spinner aria-label="Processing data" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing data');
    
    const srText = screen.getByText('Processing data');
    expect(srText).toHaveClass('sr-only');
  });

  test('applies size classes correctly', () => {
    const { rerender } = render(<Spinner size="sm" />);
    expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4');
    
    rerender(<Spinner size="md" />);
    expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6');
    
    rerender(<Spinner size="lg" />);
    expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8');
  });

  test('applies custom color style', () => {
    render(<Spinner color="#ff0000" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveStyle({ borderTopColor: '#ff0000' });
  });

  test('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-spinner');
  });

  test('has spinning animation', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('spinner');
    
    // Check that CSS animation is applied (class-based check)
    // const computedStyle = window.getComputedStyle(spinner); // TODO: Add animation style tests
    expect(spinner.className).toContain('spinner');
  });

  test('maintains accessibility standards', () => {
    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label');
    
    // Should have screen reader text
    const srText = screen.getByText('Loading');
    expect(srText).toHaveClass('sr-only');
  });

  test('respects prefers-reduced-motion', () => {
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<Spinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    // Component should render but with reduced animation
  });

  test('handles all size variants', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { unmount } = render(<Spinner size={size} />);
      const spinner = screen.getByRole('status');
      
      const expectedClasses = {
        sm: ['w-4', 'h-4'],
        md: ['w-6', 'h-6'],
        lg: ['w-8', 'h-8']
      };
      
      expectedClasses[size].forEach(expectedClass => {
        expect(spinner).toHaveClass(expectedClass);
      });
      
      unmount();
    });
  });

  test('combines multiple props correctly', () => {
    render(
      <Spinner 
        size="lg" 
        color="#00ff00" 
        className="my-custom-class" 
        aria-label="Custom loading message"
      />
    );
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('w-8', 'h-8', 'my-custom-class');
    expect(spinner).toHaveStyle({ borderTopColor: '#00ff00' });
    expect(spinner).toHaveAttribute('aria-label', 'Custom loading message');
  });
});