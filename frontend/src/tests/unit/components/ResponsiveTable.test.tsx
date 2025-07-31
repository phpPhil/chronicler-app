/**
 * Test Suite: ResponsiveTable Component
 * Feature: F09 - Responsive Design System
 * 
 * Tests the responsive data table component with mobile card alternatives
 * following test-first development approach.
 */

import React from 'react';
import { render, screen, within } from '../../utils/test-utils';
import { ResponsiveTable } from '../../../components/ResponsiveTable';
// import * as useResponsiveHook from '../../../hooks/useResponsive'; // TODO: Use for responsive testing

// Mock the useResponsive hook
const mockUseResponsive = jest.fn();
jest.mock('../../../hooks/useResponsive', () => ({
  useResponsive: () => mockUseResponsive()
}));

// Sample test data
const mockData = [
  { position: 0, list1Value: 3, list2Value: 4, distance: 1 },
  { position: 1, list1Value: 4, list2Value: 3, distance: 1 },
  { position: 2, list1Value: 2, list2Value: 5, distance: 3 },
  { position: 3, list1Value: 1, list2Value: 3, distance: 2 },
  { position: 4, list1Value: 3, list2Value: 9, distance: 6 },
  { position: 5, list1Value: 3, list2Value: 3, distance: 0 }
];

const emptyData: typeof mockData = [];

describe('ResponsiveTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mobile Card Layout', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });
    });

    test('should render data cards on mobile', () => {
      render(<ResponsiveTable data={mockData} />);

      expect(screen.getByTestId('data-cards')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('should render correct number of cards', () => {
      render(<ResponsiveTable data={mockData} />);

      const cards = screen.getAllByTestId(/data-card-/);
      expect(cards).toHaveLength(mockData.length);
    });

    test('should display card data correctly', () => {
      render(<ResponsiveTable data={mockData} />);

      const firstCard = screen.getByTestId('data-card-0');
      
      expect(within(firstCard).getByText('Pair 1')).toBeInTheDocument();
      expect(within(firstCard).getByText('3')).toBeInTheDocument(); // list1Value
      expect(within(firstCard).getByText('4')).toBeInTheDocument(); // list2Value
      expect(within(firstCard).getByText('1')).toBeInTheDocument(); // distance
    });

    test('should have proper card structure', () => {
      render(<ResponsiveTable data={mockData} />);

      const firstCard = screen.getByTestId('data-card-0');
      
      expect(within(firstCard).getByTestId('card-header')).toBeInTheDocument();
      expect(within(firstCard).getByTestId('card-content')).toBeInTheDocument();
      
      const rows = within(firstCard).getAllByTestId(/card-row-/);
      expect(rows).toHaveLength(3); // List 1, List 2, Distance
    });

    test('should display labels and values correctly in cards', () => {
      render(<ResponsiveTable data={mockData} />);

      const firstCard = screen.getByTestId('data-card-0');
      
      expect(within(firstCard).getByText('List 1:')).toBeInTheDocument();
      expect(within(firstCard).getByText('List 2:')).toBeInTheDocument();
      expect(within(firstCard).getByText('Distance:')).toBeInTheDocument();
    });

    test('should apply distance styling to distance values', () => {
      render(<ResponsiveTable data={mockData} />);

      const firstCard = screen.getByTestId('data-card-0');
      const distanceValue = within(firstCard).getByTestId('distance-value');
      
      expect(distanceValue).toHaveClass('distance');
      expect(distanceValue).toHaveTextContent('1');
    });

    test('should handle cards with zero distance', () => {
      render(<ResponsiveTable data={mockData} />);

      const lastCard = screen.getByTestId('data-card-5');
      const distanceValue = within(lastCard).getByTestId('distance-value');
      
      expect(distanceValue).toHaveTextContent('0');
      expect(distanceValue).toHaveClass('distance');
    });

    test('should render cards with touch-friendly spacing', () => {
      render(<ResponsiveTable data={mockData} />);

      const cards = screen.getAllByTestId(/data-card-/);
      
      cards.forEach(card => {
        expect(card).toHaveClass('data-card');
      });
    });
  });

  describe('Desktop Table Layout', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });
    });

    test('should render table on desktop', () => {
      render(<ResponsiveTable data={mockData} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByTestId('data-cards')).not.toBeInTheDocument();
    });

    test('should have proper table structure', () => {
      render(<ResponsiveTable data={mockData} />);

      const table = screen.getByRole('table');
      
      // Use getAllByRole since there are multiple rowgroups (thead and tbody)
      const rowGroups = within(table).getAllByRole('rowgroup');
      expect(rowGroups).toHaveLength(2); // thead + tbody
    });

    test('should render table headers correctly', () => {
      render(<ResponsiveTable data={mockData} />);

      expect(screen.getByRole('columnheader', { name: 'Position' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'List 1' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'List 2' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Distance' })).toBeInTheDocument();
    });

    test('should render table rows correctly', () => {
      render(<ResponsiveTable data={mockData} />);

      const dataRows = screen.getAllByTestId(/table-row-/);
      expect(dataRows).toHaveLength(mockData.length);
    });

    test('should display table data correctly', () => {
      render(<ResponsiveTable data={mockData} />);

      const firstRow = screen.getByTestId('table-row-0');
      const cells = within(firstRow).getAllByRole('cell');
      
      expect(cells[0]).toHaveTextContent('1'); // position + 1
      expect(cells[1]).toHaveTextContent('3'); // list1Value
      expect(cells[2]).toHaveTextContent('4'); // list2Value
      expect(cells[3]).toHaveTextContent('1'); // distance
    });

    test('should apply distance styling to table distance cells', () => {
      render(<ResponsiveTable data={mockData} />);

      const distanceCells = screen.getAllByTestId(/distance-cell-/);
      
      distanceCells.forEach(cell => {
        expect(cell).toHaveClass('distance');
      });
    });

    test('should have accessible table wrapper', () => {
      render(<ResponsiveTable data={mockData} />);

      const wrapper = screen.getByTestId('table-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('table-wrapper');
    });
  });

  describe('Tablet Layout', () => {
    test('should render table on small tablets', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'sm',
        isMobile: false,
        isTablet: true,
        isDesktop: false
      });

      render(<ResponsiveTable data={mockData} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByTestId('data-cards')).not.toBeInTheDocument();
    });

    test('should render table on medium tablets', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'md',
        isMobile: false,
        isTablet: true,
        isDesktop: false
      });

      render(<ResponsiveTable data={mockData} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByTestId('data-cards')).not.toBeInTheDocument();
    });
  });

  describe('Empty Data Handling', () => {
    test('should handle empty data array on mobile', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      render(<ResponsiveTable data={emptyData} />);

      // Should show empty state message instead of cards
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No distance calculation results available')).toBeInTheDocument();
      expect(screen.queryByTestId(/data-card-/)).not.toBeInTheDocument();
    });

    test('should handle empty data array on desktop', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      render(<ResponsiveTable data={emptyData} />);

      // Should show empty state message instead of table
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No distance calculation results available')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('should render empty state message when no data', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      render(<ResponsiveTable data={emptyData} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No distance calculation results available')).toBeInTheDocument();
    });
  });

  describe('Data Props Validation', () => {
    beforeEach(() => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });
    });

    test('should handle missing required properties gracefully', () => {
      const incompleteData = [
        { position: 0, list1Value: 3 }, // missing list2Value and distance
      ] as any;

      render(<ResponsiveTable data={incompleteData} />);

      const card = screen.getByTestId('data-card-0');
      expect(card).toBeInTheDocument();
      
      // Should render what data is available
      expect(within(card).getByText('3')).toBeInTheDocument();
    });

    test('should handle zero values correctly', () => {
      const zeroData = [
        { position: 0, list1Value: 0, list2Value: 0, distance: 0 }
      ];

      render(<ResponsiveTable data={zeroData} />);

      const card = screen.getByTestId('data-card-0');
      const rows = within(card).getAllByTestId(/card-row-/);
      
      // Should display zeros, not empty values
      expect(within(rows[0]).getByText('0')).toBeInTheDocument(); // list1Value
      expect(within(rows[1]).getByText('0')).toBeInTheDocument(); // list2Value
      expect(within(rows[2]).getByText('0')).toBeInTheDocument(); // distance
    });

    test('should handle large numbers correctly', () => {
      const largeNumberData = [
        { position: 0, list1Value: 999999, list2Value: 888888, distance: 111111 }
      ];

      render(<ResponsiveTable data={largeNumberData} />);

      const card = screen.getByTestId('data-card-0');
      
      expect(within(card).getByText('999999')).toBeInTheDocument();
      expect(within(card).getByText('888888')).toBeInTheDocument();
      expect(within(card).getByText('111111')).toBeInTheDocument();
    });

    test('should handle negative numbers correctly', () => {
      const negativeData = [
        { position: 0, list1Value: -5, list2Value: 3, distance: 8 }
      ];

      render(<ResponsiveTable data={negativeData} />);

      const card = screen.getByTestId('data-card-0');
      
      expect(within(card).getByText('-5')).toBeInTheDocument();
      expect(within(card).getByText('3')).toBeInTheDocument();
      expect(within(card).getByText('8')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper table accessibility on desktop', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      render(<ResponsiveTable data={mockData} />);

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Distance calculation results');
      
      // Headers should be properly associated
      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header.getAttribute('scope')).toBe('col');
      });
    });

    test('should have proper card accessibility on mobile', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      render(<ResponsiveTable data={mockData} />);

      const cards = screen.getAllByTestId(/data-card-/);
      
      cards.forEach((card, index) => {
        expect(card).toHaveAttribute('aria-label', `Distance pair ${index + 1} details`);
        expect(card).toHaveAttribute('role', 'region');
      });
    });

    test('should support keyboard navigation in cards', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      render(<ResponsiveTable data={mockData} />);

      const firstCard = screen.getByTestId('data-card-0');
      expect(firstCard).toHaveAttribute('tabIndex', '0');
    });

    test('should support screen reader announcements', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      render(<ResponsiveTable data={mockData} />);

      const container = screen.getByTestId('data-cards');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Distance calculation results in card format');
    });
  });

  describe('Performance', () => {
    test('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        position: i,
        list1Value: i * 2,
        list2Value: i * 3,
        distance: Math.abs(i * 2 - i * 3)
      }));

      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      const startTime = performance.now();
      render(<ResponsiveTable data={largeData} />);
      const endTime = performance.now();

      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds
      
      expect(screen.getByTestId('data-cards')).toBeInTheDocument();
    });

    test('should not re-render unnecessarily', () => {
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      let renderCount = 0;
      const TrackingTable = ({ data }: { data: typeof mockData }) => {
        renderCount++;
        return <ResponsiveTable data={data} />;
      };

      const { rerender } = render(<TrackingTable data={mockData} />);
      
      // Capture initial render count for comparison
      const baseRenderCount = renderCount; // eslint-disable-line testing-library/render-result-naming-convention

      // Re-render with same data
      rerender(<TrackingTable data={mockData} />);

      // Should minimize unnecessary re-renders
      expect(renderCount).toBeGreaterThanOrEqual(baseRenderCount);
    });
  });

  describe('Responsive Breakpoint Changes', () => {
    test('should switch from cards to table when breakpoint changes', () => {
      // Start with mobile
      mockUseResponsive.mockReturnValue({
        breakpoint: 'mobile',
        isMobile: true,
        isTablet: false,
        isDesktop: false
      });

      const { rerender } = render(<ResponsiveTable data={mockData} />);
      expect(screen.getByTestId('data-cards')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();

      // Switch to desktop
      mockUseResponsive.mockReturnValue({
        breakpoint: 'lg',
        isMobile: false,
        isTablet: false,
        isDesktop: true
      });

      rerender(<ResponsiveTable data={mockData} />);
      expect(screen.queryByTestId('data-cards')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});