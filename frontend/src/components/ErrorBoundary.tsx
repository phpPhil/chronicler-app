import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguageContext, ErrorTranslation } from '../contexts/LanguageContext';

interface ErrorBoundaryProps {
  children: ReactNode;
  retryable?: boolean;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryKey: number; // Used to force re-render on retry
}

// Error display component that uses the language context
const ErrorDisplay: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryable: boolean;
  showErrorDetails: boolean;
  onRetry: () => void;
  onReload: () => void;
}> = ({ error, errorInfo, retryable, showErrorDetails, onRetry, onReload }) => {
  const { tError, shouldUseTengwar, culturalMode } = useLanguageContext();

  // Get culturally appropriate error messages
  const errorTranslation: ErrorTranslation = tError('boundary', 'system');

  return (
    <div 
      className={`error-boundary ${shouldUseTengwar() ? 'tengwar-text' : ''}`}
      role="alert"
      style={{
        padding: '2rem',
        margin: '1rem',
        border: '2px solid #dc3545',
        borderRadius: '8px',
        backgroundColor: '#f8f8ff',
        color: '#4169e1',
        fontFamily: shouldUseTengwar() ? 'Tengwar Annatar, serif' : 'inherit'
      }}
    >
      <h2 style={{ 
        color: '#dc3545', 
        marginBottom: '1rem',
        fontSize: culturalMode === 'scholarly' ? '1.5rem' : '1.25rem'
      }}>
        {errorTranslation.title}
      </h2>
      
      <p style={{ 
        marginBottom: '1.5rem',
        lineHeight: '1.6',
        fontSize: culturalMode === 'scholarly' ? '1.1rem' : '1rem'
      }}>
        {errorTranslation.message}
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <strong style={{ color: '#b8860b' }}>
          {errorTranslation.action}
        </strong>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {retryable && (
          <button
            onClick={onRetry}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4169e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#365bb0';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#4169e1';
            }}
          >
            {culturalMode === 'scholarly' ? 'Attempt Recovery' : 'Try Again'}
          </button>
        )}

        <button
          onClick={onReload}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
          onMouseOver={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#5a6268';
          }}
          onMouseOut={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#6c757d';
          }}
        >
          {culturalMode === 'scholarly' ? 'Refresh Application' : 'Reload Page'}
        </button>
      </div>

      {/* Development error details */}
      {showErrorDetails && error && process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '2rem', fontSize: '0.875rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Technical Details (Development Only)
          </summary>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            <strong>Error:</strong> {error.message}
            {errorInfo && (
              <>
                <br /><br />
                <strong>Component Stack:</strong>
                {errorInfo.componentStack}
              </>
            )}
          </div>
        </details>
      )}
    </div>
  );
};

/**
 * Multi-language React Error Boundary with cultural error handling
 * Integrates with the Chronicler language system for elvish cultural standards
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryKey: 0
    };
  }

  /**
   * Static method to update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Lifecycle method called when an error is caught
   * Handles error reporting and logging with cultural context
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error with cultural context
    this.logErrorWithCulturalContext(error, errorInfo);

    // Report to error monitoring service if available
    this.reportError(error, errorInfo);
  }

  /**
   * Log error with appropriate cultural context
   */
  private logErrorWithCulturalContext(error: Error, errorInfo: ErrorInfo) {
    const timestamp = new Date().toISOString();
    const userAgent = navigator.userAgent;
    
    console.group('🛡️ Chronicler Error Boundary');
    console.error('Timestamp:', timestamp);
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('User Agent:', userAgent);
    console.error('Retryable:', this.props.retryable ?? true);
    console.groupEnd();

    // Log to local storage for potential debugging
    try {
      const errorLog = {
        timestamp,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent,
        retryable: this.props.retryable ?? true
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('chronicler-error-log') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('chronicler-error-log', JSON.stringify(recentLogs));
    } catch (logError) {
      console.warn('Failed to log error to localStorage:', logError);
    }
  }

  /**
   * Report error to monitoring service with privacy protection
   */
  private reportError(error: Error, errorInfo: ErrorInfo) {
    // In a real application, you would send this to your error monitoring service
    // (Sentry, LogRocket, etc.) with user privacy considerations
    
    // For now, just emit a custom event that can be listened to
    window.dispatchEvent(new CustomEvent('chronicler-error', {
      detail: {
        message: error.message,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        retryable: this.props.retryable ?? true
      }
    }));
  }

  /**
   * Reset error state to attempt recovery
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryKey: this.state.retryKey + 1 // Force re-render
    });
  };

  /**
   * Reload the entire page as a last resort
   */
  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryable={this.props.retryable ?? true}
          showErrorDetails={this.props.showErrorDetails ?? process.env.NODE_ENV === 'development'}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    // Use retryKey to force re-render after retry
    return (
      <div key={this.state.retryKey}>
        {this.props.children}
      </div>
    );
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

export default ErrorBoundary;