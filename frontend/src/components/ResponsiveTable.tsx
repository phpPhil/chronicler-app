/**
 * ResponsiveTable Component
 * Feature: F09 - Responsive Design System
 * 
 * Responsive data table that switches between table layout (desktop/tablet)
 * and card layout (mobile) for optimal user experience across devices.
 */

import React from 'react';
import { useResponsive } from '../hooks/useResponsive';
// import { useTranslation } from 'react-i18next'; // TODO: Add table translations
import { useLanguageContext } from '../contexts/LanguageContext';

export interface ResponsiveTableData {
  position: number;
  list1Value: number;
  list2Value: number;
  distance: number;
}

export interface ResponsiveTableProps {
  /** Data array to display */
  data: ResponsiveTableData[];
  
  /** Additional CSS class name */
  className?: string;
  
  /** Caption for accessibility */
  caption?: string;
  
  /** Custom empty state message */
  emptyStateMessage?: string;
}

/**
 * ResponsiveTable - Adaptive data table component
 * 
 * Features:
 * - Mobile: Card-based layout with clear labels
 * - Tablet/Desktop: Traditional table layout
 * - WCAG AA compliant accessibility
 * - Touch-friendly mobile interactions
 * - Professional Chronicler styling
 * 
 * @example
 * ```tsx
 * const data = [
 *   { position: 0, list1Value: 3, list2Value: 4, distance: 1 },
 *   { position: 1, list1Value: 2, list2Value: 5, distance: 3 }
 * ];
 * 
 * <ResponsiveTable 
 *   data={data}
 *   caption="Distance calculation results"
 * />
 * ```
 */
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  className = '',
  caption = 'Distance calculation results',
  emptyStateMessage = 'No distance calculation results available'
}) => {
  const { isMobile } = useResponsive();
  // const { t } = useTranslation(); // TODO: Add table translations
  const { tCultural, shouldUseTengwar } = useLanguageContext();
  
  // Handle empty data
  if (data.length === 0) {
    return (
      <div className={`responsive-table-empty ${className}`} data-testid="empty-state">
        <div className="empty-state-content">
          <p className="empty-state-message">{emptyStateMessage}</p>
        </div>
      </div>
    );
  }
  
  // Mobile card layout
  if (isMobile) {
    return (
      <div 
        className={`responsive-table ${className}`}
        role="region"
        aria-label={caption}
      >
        <div 
          className="data-cards"
          data-testid="data-cards"
          aria-live="polite"
          aria-label="Distance calculation results in card format"
        >
          {data.map((row, index) => (
            <div
              key={`${row.position}-${index}`}
              className="data-card"
              data-testid={`data-card-${index}`}
              role="region"
              aria-label={`Distance pair ${index + 1} details`}
              tabIndex={0}
            >
              <div className={`card-header ${shouldUseTengwar() ? 'tengwar-text' : ''}`} data-testid="card-header">
                <strong>{tCultural('results.table.headers.pairNumber', 'Pair')} {row.position + 1}</strong>
              </div>
              
              <div className="card-content" data-testid="card-content">
                <div className="card-row" data-testid={`card-row-${index}-0`}>
                  <span className={`label ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{tCultural('results.table.headers.list1Sorted', 'List 1')}:</span>
                  <span className={`value ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{row.list1Value}</span>
                </div>
                
                <div className="card-row" data-testid={`card-row-${index}-1`}>
                  <span className={`label ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{tCultural('results.table.headers.list2Sorted', 'List 2')}:</span>
                  <span className={`value ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{row.list2Value}</span>
                </div>
                
                <div className="card-row" data-testid={`card-row-${index}-2`}>
                  <span className={`label ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{tCultural('results.table.headers.distance', 'Distance')}:</span>
                  <span 
                    className={`value distance ${shouldUseTengwar() ? 'tengwar-text' : ''}`}
                    data-testid="distance-value"
                  >
                    {row.distance}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop/tablet table layout
  return (
    <div className={`responsive-table ${className}`}>
      <div className="table-wrapper" data-testid="table-wrapper">
        <table 
          className="data-table"
          role="table"
          aria-label={caption}
        >
          <caption className="sr-only">{caption}</caption>
          
          <thead>
            <tr>
              <th scope="col" className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.table.headers.position', 'Position')}</th>
              <th scope="col" className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.table.headers.list1Sorted', 'List 1')}</th>
              <th scope="col" className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.table.headers.list2Sorted', 'List 2')}</th>
              <th scope="col" className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.table.headers.distance', 'Distance')}</th>
            </tr>
          </thead>
          
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={`${row.position}-${index}`}
                data-testid={`table-row-${index}`}
              >
                <td className={shouldUseTengwar() ? 'tengwar-text' : ''}>{row.position + 1}</td>
                <td className={shouldUseTengwar() ? 'tengwar-text' : ''}>{row.list1Value}</td>
                <td className={shouldUseTengwar() ? 'tengwar-text' : ''}>{row.list2Value}</td>
                <td 
                  className={`distance ${shouldUseTengwar() ? 'tengwar-text' : ''}`}
                  data-testid={`distance-cell-${index}`}
                >
                  {row.distance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * ResponsiveTableSkeleton - Loading skeleton for table
 */
export const ResponsiveTableSkeleton: React.FC<{
  rows?: number;
  className?: string;
}> = ({
  rows = 3,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    return (
      <div className={`responsive-table-skeleton ${className}`}>
        <div className="data-cards">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="data-card skeleton">
              <div className="card-header skeleton-text"></div>
              <div className="card-content">
                <div className="card-row">
                  <span className="skeleton-text short"></span>
                  <span className="skeleton-text short"></span>
                </div>
                <div className="card-row">
                  <span className="skeleton-text short"></span>
                  <span className="skeleton-text short"></span>
                </div>
                <div className="card-row">
                  <span className="skeleton-text short"></span>
                  <span className="skeleton-text short"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`responsive-table-skeleton ${className}`}>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th><span className="skeleton-text"></span></th>
              <th><span className="skeleton-text"></span></th>
              <th><span className="skeleton-text"></span></th>
              <th><span className="skeleton-text"></span></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, index) => (
              <tr key={index}>
                <td><span className="skeleton-text short"></span></td>
                <td><span className="skeleton-text short"></span></td>
                <td><span className="skeleton-text short"></span></td>
                <td><span className="skeleton-text short"></span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponsiveTable;