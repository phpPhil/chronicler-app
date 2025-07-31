import React, { useMemo } from 'react';
import { DistanceCalculationResult } from '../types/api';
import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useResponsive } from '../hooks/useResponsive';
import { ResponsiveTable } from './ResponsiveTable';
// import { MobileOnly, TabletUp } from './ResponsiveWrapper';
import './ResultsDisplayComponent.css';

export interface ResultsDisplayProps {
  results: DistanceCalculationResult | null;
  loading: boolean;
  error: ErrorInfo | null;
  onExport?: (format: 'csv' | 'json') => void;
  onReset?: () => void;
  onRetry?: () => void;
  showDetailedBreakdown?: boolean;
}

// DistanceCalculationResult is now imported from shared types

export interface ErrorInfo {
  type: 'calculation' | 'network' | 'validation';
  message: string;
  details?: string;
  retryable: boolean;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => {
  const { shouldUseTengwar } = useLanguageContext();
  const { isMobile } = useResponsive();
  
  return (
    <div className={`summary-card ${isMobile ? 'mobile-summary-card' : ''}`} data-testid="summary-card">
      <div className={`summary-card-title ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-card-title' : ''}`}>{title}</div>
      <div className={`summary-card-value ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-card-value' : ''}`}>{value}</div>
    </div>
  );
};

const LoadingDisplay: React.FC = () => {
  const { t } = useTranslation();
  const { tCultural, shouldUseTengwar } = useLanguageContext();
  
  return (
    <div className="loading-display" aria-live="polite">
      <div className="spinner" role="status" aria-label={t('common:accessibility.calculating')}>
        <span className="sr-only">{t('common:states.calculating')}</span>
      </div>
      <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.states.processing', 'Processing your lists...')}</p>
    </div>
  );
};

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const { t } = useTranslation();
  const { shouldUseTengwar } = useLanguageContext();
  
  return (
    <div className="error-display" role="alert">
      <h2 className={shouldUseTengwar() ? 'tengwar-text' : ''}>{t('app:error.calculationError')}</h2>
      <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>{error.message}</p>
      {error.details && <details className={shouldUseTengwar() ? 'tengwar-text' : ''}>{error.details}</details>}
      {error.retryable && onRetry && (
        <button onClick={onRetry} className={`retry-button ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>
          {t('common:buttons.tryAgain')}
        </button>
      )}
    </div>
  );
};

const EmptyStateDisplay: React.FC = () => {
  const { tCultural, shouldUseTengwar } = useLanguageContext();
  
  return (
    <div className="empty-state-display">
      <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.states.noResults', 'No results available')}</p>
    </div>
  );
};

export const ResultsDisplayComponent: React.FC<ResultsDisplayProps> = ({
  results,
  loading,
  error,
  onExport,
  onReset,
  onRetry,
  showDetailedBreakdown = true
}) => {
  const { t } = useTranslation();
  const { tCultural, shouldUseTengwar, getFormattedNumber } = useLanguageContext();
  const { isMobile, isTablet } = useResponsive();
  
  // Generate CSV content
  const csvContent = useMemo(() => {
    if (!results) return '';
    
    const headers = `${t('results:export.csvHeaders.position', 'Position')},${t('results:export.csvHeaders.list1Value', 'List1Value')},${t('results:export.csvHeaders.list2Value', 'List2Value')},${t('results:export.csvHeaders.distance', 'Distance')}\n`;
    const rows = results.pairs.map(pair => 
      `${pair.position + 1},${pair.list1Value},${pair.list2Value},${pair.distance}`
    ).join('\n');
    
    return headers + rows;
  }, [results, t]);

  // Generate JSON content
  const jsonContent = useMemo(() => {
    if (!results) return '';
    
    return JSON.stringify({
      totalDistance: results.totalDistance,
      pairs: results.pairs,
      metadata: results.metadata
    }, null, 2);
  }, [results]);

  // Convert results to ResponsiveTable format
  const tableData = useMemo(() => {
    if (!results) return [];
    
    return results.pairs.map(pair => ({
      position: pair.position,
      list1Value: pair.list1Value,
      list2Value: pair.list2Value,
      distance: pair.distance
    }));
  }, [results]);

  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    if (!results || !onExport) return;
    
    // Call callback first - parent can handle actual file creation
    onExport(format);
    
    // Optional: Create download in browser environment
    if (typeof window !== 'undefined') {
      const content = format === 'csv' ? csvContent : jsonContent;
      const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
      const filename = format === 'csv' 
        ? t('results:export.csvFilename', 'distance-calculation-results.csv')
        : t('results:export.jsonFilename', 'distance-calculation-results.json');
      
      try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        // Silently fail in test environment or when DOM API is not available
      }
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingDisplay />;
  }

  // Show error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  // Show empty state
  if (!results) {
    return <EmptyStateDisplay />;
  }

  return (
    <div className={`results-display-component ${isMobile ? 'mobile-results' : ''} ${isTablet ? 'tablet-results' : ''}`}>
      {/* Results Header - Responsive */}
      <div className={`results-header ${isMobile ? 'mobile-results-header' : ''}`}>
        <div className="header-content">
          <h1 className={`total-distance ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-title' : ''}`}>
            {isMobile ? (
              <>
                <div className="mobile-total-label">{tCultural('results.totalDistance', 'Total Distance')}</div>
                <div className={`distance-value mobile-distance-value ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{getFormattedNumber(results.totalDistance)}</div>
              </>
            ) : (
              <>
                {tCultural('results.totalDistance', 'Total Distance')}: <span className={`distance-value ${shouldUseTengwar() ? 'tengwar-text' : ''}`}>{getFormattedNumber(results.totalDistance)}</span>
              </>
            )}
          </h1>
          <div className={`calculation-summary ${isMobile ? 'mobile-summary' : ''}`}>
            <span className={`processing-time ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-meta' : ''}`}>{t('results:calculatedIn', { time: results.metadata.processingTimeMs })}</span>
            <span className={`pair-count ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-meta' : ''}`}>{t('results:pairsProcessed', { count: results.pairs.length })}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards - Responsive Grid */}
      <div className={`summary-cards ${isMobile ? 'mobile-summary-cards' : ''}`}>
        <SummaryCard 
          title={tCultural('results.summaryCards.list1Length', 'List 1 Length')} 
          value={results.metadata.originalList1Length} 
        />
        <SummaryCard 
          title={tCultural('results.summaryCards.list2Length', 'List 2 Length')} 
          value={results.metadata.originalList2Length} 
        />
        <SummaryCard 
          title={tCultural('results.summaryCards.totalPairs', 'Total Pairs')} 
          value={results.pairs.length} 
        />
        <SummaryCard 
          title={tCultural('results.summaryCards.processingTime', 'Processing Time')} 
          value={`${results.metadata.processingTimeMs}${t('common:units.ms')}`} 
        />
      </div>

      {/* Action Buttons - Mobile-First Design */}
      <div className={`action-controls ${isMobile ? 'mobile-action-controls' : ''}`}>
        {onExport && (
          <div className={`export-controls ${isMobile ? 'mobile-export-controls' : ''}`}>
            <button 
              onClick={() => handleExport('csv')}
              className={`export-button ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-export-button' : ''}`}
              aria-label={`${t('common:buttons.exportCsv')} file`}
            >
              {isMobile ? '📄' : '📄 ' + t('common:buttons.exportCsv')}
            </button>
            <button 
              onClick={() => handleExport('json')}
              className={`export-button ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-export-button' : ''}`}
              aria-label={`${t('common:buttons.exportJson')} file`}
            >
              {isMobile ? '📋' : '📋 ' + t('common:buttons.exportJson')}
            </button>
          </div>
        )}
        
        {onReset && (
          <button 
            onClick={onReset}
            className={`reset-button ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-reset-button' : ''}`}
          >
            {isMobile ? t('common:buttons.newCalculation', 'New') : t('common:buttons.calculateNew')}
          </button>
        )}
      </div>

      {/* Responsive Data Table/Cards */}
      {showDetailedBreakdown && (
        <div className={`breakdown-section ${isMobile ? 'mobile-breakdown-section' : ''}`}>
          <h2 className={`${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-section-header' : ''}`}>
            {tCultural('results.table.detailedBreakdown', 'Detailed Breakdown')}
          </h2>
          
          <ResponsiveTable 
            data={tableData}
            caption={t('common:accessibility.tableBreakdown')}
            className="results-breakdown-table"
          />
        </div>
      )}

      {/* Method Explanation - Collapsible on Mobile */}
      <div className={`method-explanation ${isMobile ? 'mobile-method-explanation' : ''}`}>
        <h3 className={`${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-section-header' : ''}`}>
          {tCultural('results.methodology.title', 'Calculation Method')}
        </h3>
        
        {isMobile ? (
          <details className="mobile-methodology-details">
            <summary className={`${shouldUseTengwar() ? 'tengwar-text' : ''} mobile-methodology-summary`}>
              {tCultural('results.methodology.viewDetails', 'View calculation details')}
            </summary>
            <div className="methodology-content">
              <p className={`${shouldUseTengwar() ? 'tengwar-text' : ''} mobile-methodology-text`}>
                {tCultural('results.methodology.description', 'This result was calculated using the Manhattan distance method:')}
              </p>
              <ol className="mobile-methodology-steps">
                <li className={`${shouldUseTengwar() ? 'tengwar-text' : ''} mobile-methodology-text`}>
                  {tCultural('results.methodology.steps.0', 'Both input lists were sorted independently')}
                </li>
                <li className={`${shouldUseTengwar() ? 'tengwar-text' : ''} mobile-methodology-text`}>
                  {tCultural('results.methodology.steps.1', 'Numbers were paired by position after sorting')}
                </li>
                <li className={`${shouldUseTengwar() ? 'tengwar-text' : ''} mobile-methodology-text`}>
                  {tCultural('results.methodology.steps.2', 'Distance calculated as |List1[i] - List2[i]| for each pair')}
                </li>
                <li className={`${shouldUseTengwar() ? 'tengwar-text' : ''} mobile-methodology-text`}>
                  {tCultural('results.methodology.steps.3', 'All individual distances were summed for the total')}
                </li>
              </ol>
            </div>
          </details>
        ) : (
          <>
            <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>
              {tCultural('results.methodology.description', 'This result was calculated using the Manhattan distance method:')}
            </p>
            <ol>
              <li className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.methodology.steps.0', 'Both input lists were sorted independently')}</li>
              <li className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.methodology.steps.1', 'Numbers were paired by position after sorting')}</li>
              <li className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.methodology.steps.2', 'Distance calculated as |List1[i] - List2[i]| for each pair')}</li>
              <li className={shouldUseTengwar() ? 'tengwar-text' : ''}>{tCultural('results.methodology.steps.3', 'All individual distances were summed for the total')}</li>
            </ol>
          </>
        )}
      </div>
    </div>
  );
};