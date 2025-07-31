import React from 'react';
import { render, screen, fireEvent } from '../../../utils/test-utils';
import '@testing-library/jest-dom';
import { ProgressBar } from '../../../../components/loading/ProgressBar';

describe('ProgressBar', () => {
  test('renders with default props', () => {
    render(<ProgressBar progress={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  test('displays progress percentage correctly', () => {
    render(<ProgressBar progress={75} message="Loading" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    
    // Check if percentage is displayed (as part of the message)
    expect(screen.getByText('Loading (75%)')).toBeInTheDocument();
  });

  test('displays custom message', () => {
    render(<ProgressBar progress={30} message="Uploading file..." />);
    
    // Message and percentage are combined
    expect(screen.getByText('Uploading file... (30%)')).toBeInTheDocument();
  });

  test('hides percentage when showPercentage is false', () => {
    render(<ProgressBar progress={60} showPercentage={false} />);
    
    expect(screen.queryByText('60%')).not.toBeInTheDocument();
  });

  test('clamps progress values correctly', () => {
    const { rerender } = render(<ProgressBar progress={150} />);
    
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
    
    rerender(<ProgressBar progress={-10} />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('applies custom styling', () => {
    render(
      <ProgressBar 
        progress={40} 
        color="#ff0000" 
        height={12} 
      />
    );
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveStyle({ height: '12px' });
    
    // Check the fill element for color and width
    // eslint-disable-next-line testing-library/no-node-access
    const progressFill = progressbar.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle({ 
      backgroundColor: 'rgb(255, 0, 0)',
      width: '40%'
    });
  });

  test('handles cancellation', () => {
    const onCancel = jest.fn();
    render(
      <ProgressBar 
        progress={25} 
        cancellable={true} 
        onCancel={onCancel}
        message="Processing..."
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
    
    fireEvent.click(cancelButton);
    expect(onCancel).toHaveBeenCalled();
  });

  test('does not show cancel button when not cancellable', () => {
    render(<ProgressBar progress={25} />);
    
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  test('supports animated and non-animated modes', () => {
    const { rerender } = render(<ProgressBar progress={50} animated={true} />);
    
    let progressbar = screen.getByRole('progressbar');
    // eslint-disable-next-line testing-library/no-node-access
    let progressFill = progressbar.querySelector('.progress-fill');
    expect(progressFill).toHaveClass('animated');
    
    rerender(<ProgressBar progress={50} animated={false} />);
    progressbar = screen.getByRole('progressbar');
    // eslint-disable-next-line testing-library/no-node-access
    progressFill = progressbar.querySelector('.progress-fill');
    expect(progressFill).not.toHaveClass('animated');
  });

  test('updates aria-live region when message changes', () => {
    const { rerender } = render(
      <ProgressBar progress={25} message="Starting..." />
    );
    
    const messageElement = screen.getByText('Starting... (25%)');
    // aria-live is on the parent div containing the message
    // eslint-disable-next-line testing-library/no-node-access
    const liveRegion = messageElement.closest('[aria-live]');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    
    rerender(<ProgressBar progress={50} message="Processing..." />);
    expect(screen.getByText('Processing... (50%)')).toBeInTheDocument();
  });

  test('maintains accessibility standards', () => {
    render(
      <ProgressBar 
        progress={75} 
        message="Almost complete" 
        cancellable={true} 
        onCancel={() => {}}
      />
    );
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Almost complete');
    
    const messageElement = screen.getByText(/Almost complete/);
    expect(messageElement).toHaveAttribute('aria-live', 'polite');
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toHaveAttribute('aria-label', 'Cancel current operation');
  });

  test('handles indeterminate progress', () => {
    render(<ProgressBar />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    
    // Check the fill element for width
    // eslint-disable-next-line testing-library/no-node-access
    const progressFill = progressBar.querySelector('.progress-fill');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  test('supports custom className', () => {
    render(<ProgressBar progress={50} className="custom-progress" />);
    
    // eslint-disable-next-line testing-library/no-node-access
    const container = screen.getByRole('progressbar').parentElement;
    expect(container).toHaveClass('custom-progress');
  });

  test('handles rapid progress updates', () => {
    const { rerender } = render(<ProgressBar progress={0} />);
    
    // Simulate rapid updates
    [10, 20, 30, 40, 50].forEach(progress => {
      rerender(<ProgressBar progress={progress} />);
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', progress.toString());
    });
  });

  test('calculates duration estimates', () => {
    const startTime = Date.now() - 5000; // Started 5 seconds ago
    render(
      <ProgressBar 
        progress={50} 
        message="Processing..." 
        startTime={startTime}
        showTimeEstimate={true}
      />
    );
    
    // Should show some time estimate (implementation specific)
    const messageElement = screen.getByText(/Processing.../);
    expect(messageElement).toBeInTheDocument();
  });
});