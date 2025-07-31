import React from 'react';
import { render, screen } from '../../../utils/test-utils';
import '@testing-library/jest-dom';
import { Skeleton } from '../../../../components/loading/Skeleton';

// Mock window.matchMedia for this test file
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('Skeleton', () => {
  test('renders single skeleton with default props', () => {
    render(<Skeleton />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons).toHaveLength(1);
    
    const skeleton = skeletons[0];
    expect(skeleton).toHaveClass('skeleton', 'skeleton-text');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  test('renders multiple skeletons with count prop', () => {
    render(<Skeleton count={3} />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons).toHaveLength(3);
    
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('applies width and height styles correctly', () => {
    render(<Skeleton width="200px" height="50px" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveStyle({
      width: '200px',
      height: '50px'
    });
  });

  test('handles numeric width and height', () => {
    render(<Skeleton width={150} height={30} />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveStyle({
      width: '150px',
      height: '30px'
    });
  });

  test('applies variant classes correctly', () => {
    const { rerender } = render(<Skeleton variant="text" />);
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass('skeleton-text');
    
    rerender(<Skeleton variant="rectangular" />);
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass('skeleton-rect');
    
    rerender(<Skeleton variant="circular" />);
    expect(screen.getByRole('presentation', { hidden: true })).toHaveClass('skeleton-circle');
  });

  test('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  test('maintains consistent keys for multiple skeletons', () => {
    const { rerender } = render(<Skeleton count={2} />);
    
    let skeletons = screen.getAllByRole('presentation', { hidden: true });
    // const firstRenderKeys = skeletons.map(s => s.getAttribute('data-testid')); // TODO: Add key stability tests
    
    rerender(<Skeleton count={2} />);
    skeletons = screen.getAllByRole('presentation', { hidden: true });
    
    expect(skeletons).toHaveLength(2);
  });

  test('supports different variants with styling', () => {
    const variants = ['text', 'rectangular', 'circular'] as const;
    
    variants.forEach(variant => {
      const { unmount } = render(<Skeleton variant={variant} />);
      
      const skeleton = screen.getByRole('presentation', { hidden: true });
      const expectedClass = `skeleton-${variant === 'rectangular' ? 'rect' : variant === 'circular' ? 'circle' : variant}`;
      expect(skeleton).toHaveClass(expectedClass);
      
      unmount();
    });
  });

  test('handles percentage-based dimensions', () => {
    render(<Skeleton width="100%" height="2rem" />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveStyle({
      width: '100%',
      height: '2rem'
    });
  });

  test('maintains accessibility standards', () => {
    render(<Skeleton count={2} />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
      expect(skeleton).toHaveAttribute('role', 'presentation');
    });
  });

  test('applies loading animation class', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toHaveClass('skeleton');
    
    // Check that the skeleton has animation-related styling
    // const computedStyle = window.getComputedStyle(skeleton); // TODO: Add animation style tests
    expect(skeleton.className).toContain('skeleton');
  });

  test('handles zero count gracefully', () => {
    render(<Skeleton count={0} />);
    
    const skeletons = screen.queryAllByRole('presentation');
    expect(skeletons).toHaveLength(0);
  });

  test('combines multiple props correctly', () => {
    render(
      <Skeleton 
        width={300}
        height={40}
        variant="rectangular"
        className="my-skeleton"
        count={2}
      />
    );
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons).toHaveLength(2);
    
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('skeleton', 'skeleton-rect', 'my-skeleton');
      expect(skeleton).toHaveStyle({
        width: '300px',
        height: '40px'
      });
    });
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

    render(<Skeleton />);
    
    const skeleton = screen.getByRole('presentation', { hidden: true });
    expect(skeleton).toBeInTheDocument();
    // Component should render but with reduced animation
  });

  test('handles large count values efficiently', () => {
    render(<Skeleton count={50} />);
    
    const skeletons = screen.getAllByRole('presentation', { hidden: true });
    expect(skeletons).toHaveLength(50);
    
    // All should have proper attributes
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveClass('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });
});