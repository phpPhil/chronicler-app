import React from 'react';
import { render, screen, fireEvent, within } from '../tests/utils/test-utils';
import '@testing-library/jest-dom';
import { ResultsDisplayComponent } from './ResultsDisplayComponent';

// Mock data matching the DistanceCalculationResult interface
const mockResults = {
  totalDistance: 11,
  pairs: [
    { position: 0, list1Value: 1, list2Value: 3, distance: 2 },
    { position: 1, list1Value: 2, list2Value: 3, distance: 1 },
    { position: 2, list1Value: 3, list2Value: 3, distance: 0 },
    { position: 3, list1Value: 3, list2Value: 4, distance: 1 },
    { position: 4, list1Value: 3, list2Value: 5, distance: 2 },
    { position: 5, list1Value: 4, list2Value: 9, distance: 5 }
  ],
  metadata: {
    originalList1Length: 6,
    originalList2Length: 6,
    processingTimeMs: 2
  }
};


const mockError = {
  type: 'calculation' as const,
  message: 'Unable to calculate distance',
  details: 'Invalid input data format',
  retryable: true
};

describe('ResultsDisplayComponent', () => {
  const defaultProps = {
    results: mockResults,
    loading: false,
    error: null,
    onExport: jest.fn(),
    onReset: jest.fn(),
    showDetailedBreakdown: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('displays loading indicator when loading is true', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={null}
          loading={true}
        />
      );
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/calculating/i)).toBeInTheDocument();
      expect(screen.getByText(/processing your lists/i)).toBeInTheDocument();
    });

    test('loading indicator has proper accessibility attributes', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={null}
          loading={true}
        />
      );
      
      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveAttribute('aria-label', 'Calculating distance');
      expect(screen.getByText('Calculating...')).toHaveClass('sr-only');
    });
  });

  describe('Error State', () => {
    test('displays error message when error is present', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={null}
          error={mockError}
        />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Calculation Error')).toBeInTheDocument();
      expect(screen.getByText(mockError.message)).toBeInTheDocument();
    });

    test('shows error details when provided', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={null}
          error={mockError}
        />
      );
      
      expect(screen.getByText(mockError.details!)).toBeInTheDocument();
    });

    test('displays retry button for retryable errors', () => {
      const onRetry = jest.fn();
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={null}
          error={mockError}
          onRetry={onRetry}
        />
      );
      
      const retryButton = screen.getByText(/try again/i);
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    test('does not show retry button for non-retryable errors', () => {
      const nonRetryableError = { ...mockError, retryable: false };
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={null}
          error={nonRetryableError}
        />
      );
      
      expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
    });
  });

  describe('Results Header', () => {
    test('displays total distance prominently', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      expect(screen.getByText('Total Distance:')).toBeInTheDocument();
      const distanceValue = screen.getByText('11');
      expect(distanceValue).toHaveClass('distance-value');
    });

    test('shows processing time and pair count', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      expect(screen.getByText(/calculated in 2ms/i)).toBeInTheDocument();
      expect(screen.getByText(/6 pairs processed/i)).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    test('displays all summary statistics', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      expect(screen.getByText('List 1 Length')).toBeInTheDocument();
      expect(screen.getByText('List 2 Length')).toBeInTheDocument();
      expect(screen.getByText('Total Pairs')).toBeInTheDocument();
      expect(screen.getByText('Processing Time')).toBeInTheDocument();
    });

    test('shows correct values in summary cards', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      // Check for the values in the context of their cards
      const cards = screen.getAllByTestId('summary-card');
      expect(cards).toHaveLength(4);
      
      // More specific assertions using getAllByText
      const sixes = screen.getAllByText('6');
      expect(sixes.length).toBeGreaterThanOrEqual(3); // List 1 Length, List 2 Length, Total Pairs
      expect(screen.getByText('2ms')).toBeInTheDocument(); // Processing time
    });
  });

  describe('Detailed Breakdown Table', () => {
    test('displays pairs table with proper headers', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('List 1')).toBeInTheDocument();
      expect(screen.getByText('List 2')).toBeInTheDocument();
      expect(screen.getByText('Distance')).toBeInTheDocument();
    });

    test('displays all pair data correctly', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      // Check that the table contains the expected number of rows
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(7); // 6 data rows + 1 header row
      
      // Check specific values are present in the table using getAllByText
      const onesInTable = screen.getAllByText('1');
      expect(onesInTable.length).toBeGreaterThan(0);
      
      const twosInTable = screen.getAllByText('2');
      expect(twosInTable.length).toBeGreaterThan(0);
      
      const fivesInTable = screen.getAllByText('5');
      expect(fivesInTable.length).toBeGreaterThan(0);
    });

    test('table has proper accessibility attributes', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
    });

    test('hides detailed breakdown when showDetailedBreakdown is false', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          showDetailedBreakdown={false}
        />
      );
      
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    test('displays export buttons', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      const csvButton = screen.getByText(/export csv/i);
      const jsonButton = screen.getByText(/export json/i);
      
      expect(csvButton).toBeInTheDocument();
      expect(jsonButton).toBeInTheDocument();
    });

    test('export buttons have proper accessibility attributes', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      const csvButton = screen.getByLabelText(/export csv file/i);
      const jsonButton = screen.getByLabelText(/export json file/i);
      
      expect(csvButton).toBeInTheDocument();
      expect(jsonButton).toBeInTheDocument();
    });

    test('calls onExport with correct format when CSV button clicked', () => {
      const onExport = jest.fn();
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          onExport={onExport}
        />
      );
      
      const csvButton = screen.getByText(/export csv/i);
      fireEvent.click(csvButton);
      
      expect(onExport).toHaveBeenCalledWith('csv');
    });

    test('calls onExport with correct format when JSON button clicked', () => {
      const onExport = jest.fn();
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          onExport={onExport}
        />
      );
      
      const jsonButton = screen.getByText(/export json/i);
      fireEvent.click(jsonButton);
      
      expect(onExport).toHaveBeenCalledWith('json');
    });

    test('does not render export buttons when onExport is not provided', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          onExport={undefined}
        />
      );
      
      expect(screen.queryByText(/export csv/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/export json/i)).not.toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    test('displays reset button when onReset is provided', () => {
      const onReset = jest.fn();
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          onReset={onReset}
        />
      );
      
      const resetButton = screen.getByText(/calculate new/i);
      expect(resetButton).toBeInTheDocument();
    });

    test('calls onReset when reset button clicked', () => {
      const onReset = jest.fn();
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          onReset={onReset}
        />
      );
      
      const resetButton = screen.getByText(/calculate new/i);
      fireEvent.click(resetButton);
      
      expect(onReset).toHaveBeenCalledTimes(1);
    });

    test('does not render reset button when onReset is not provided', () => {
      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          onReset={undefined}
        />
      );
      
      expect(screen.queryByText(/calculate new/i)).not.toBeInTheDocument();
    });
  });

  describe('Large Dataset Handling', () => {
    test('handles large number of pairs efficiently', () => {
      const largePairs = Array.from({ length: 50 }, (_, i) => ({
        position: i,
        list1Value: i + 100, // Use unique values to avoid test conflicts
        list2Value: i + 150,
        distance: 50
      }));

      const largeResults = {
        totalDistance: 2500,
        pairs: largePairs,
        metadata: {
          originalList1Length: 50,
          originalList2Length: 50,
          processingTimeMs: 5
        }
      };

      // Should render without throwing errors
      expect(() => {
        render(
          <ResultsDisplayComponent 
            {...defaultProps} 
            results={largeResults}
          />
        );
      }).not.toThrow();
      
      // Check total distance (formatted with comma)
      const distanceElement = screen.getByText('2,500');
      expect(distanceElement).toBeInTheDocument();
      
      // Should have the correct number of table rows
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(51); // 50 data rows + 1 header row
    });
  });

  describe('Keyboard Navigation', () => {
    test('export buttons are keyboard accessible', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      const csvButton = screen.getByText(/export csv/i);
      const jsonButton = screen.getByText(/export json/i);
      
      expect(csvButton).toBeVisible();
      expect(jsonButton).toBeVisible();
      
      // Focus should be possible (buttons should be in tab order)
      csvButton.focus();
      expect(csvButton).toHaveFocus();
      
      jsonButton.focus();
      expect(jsonButton).toHaveFocus();
    });

    test('table is keyboard navigable', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeVisible();
      
      // Table should have proper accessibility attributes
      expect(table).toHaveAttribute('aria-label');
      
      // Headers should be present for screen readers
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
    });
  });

  describe('Data Integrity', () => {
    test('displays exact calculation values', () => {
      render(<ResultsDisplayComponent {...defaultProps} />);
      
      // Verify total matches sum of individual distances
      const expectedTotal = mockResults.pairs.reduce((sum, pair) => sum + pair.distance, 0);
      expect(expectedTotal).toBe(11);
      expect(screen.getByText('11')).toBeInTheDocument();
    });

    test('handles missing optional data gracefully', () => {
      const minimalResults = {
        totalDistance: 999,
        pairs: [
          { position: 0, list1Value: 555, list2Value: 777, distance: 999 }
        ],
        metadata: {
          originalList1Length: 1,
          originalList2Length: 1,
          processingTimeMs: 1
        }
      };

      render(
        <ResultsDisplayComponent 
          {...defaultProps} 
          results={minimalResults}
        />
      );
      
      // Check that the component renders with minimal data
      expect(screen.getByText('Total Distance:')).toBeInTheDocument();
      // Multiple elements have "999", so check for all of them
      const distanceValues = screen.getAllByText('999');
      expect(distanceValues.length).toBeGreaterThan(0);
      
      // Check table data - should have unique values to avoid conflicts
      const table = screen.getByRole('table');
      const rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2); // 1 data row + 1 header row
      
      // Check specific values from minimal data
      expect(screen.getByText('555')).toBeInTheDocument(); // list1Value
      expect(screen.getByText('777')).toBeInTheDocument(); // list2Value
    });
  });

  describe('Component Props Validation', () => {
    test('renders without crashing with minimal props', () => {
      render(
        <ResultsDisplayComponent 
          results={mockResults}
          loading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Total Distance:')).toBeInTheDocument();
    });

    test('handles null results when not loading and no error', () => {
      render(
        <ResultsDisplayComponent 
          results={null}
          loading={false}
          error={null}
        />
      );
      
      // Should render some kind of empty state or placeholder
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });
});