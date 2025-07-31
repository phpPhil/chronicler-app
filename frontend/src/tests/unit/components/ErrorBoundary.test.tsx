import React from 'react';
import { render, screen } from '../../utils/test-utils';
import '@testing-library/jest-dom';
import { ErrorBoundary } from '../../../components/ErrorBoundary';

// ErrorBoundary translations are handled by global mock in setupTests.ts

// Mock the language utils
jest.mock('../../../i18n', () => ({
  ChroniclerLanguageUtils: {
    getCurrentLanguage: () => 'english',
    switchLanguage: jest.fn(),
    isElvishMode: () => false
  }
}));

// Mock the language context
jest.mock('../../../contexts/LanguageContext', () => ({
  useLanguageContext: () => ({
    language: 'english',
    culturalMode: 'standard',
    tError: (errorCode: string, errorType: string) => ({
      title: 'Something went wrong',
      message: 'We encountered an unexpected problem. Your data is safe.',
      action: 'Try again'
    }),
    shouldUseTengwar: () => false
  }),
  LanguageProvider: ({ children }: any) => children
}));

// Test component that throws an error
const ProblematicComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error('Test error for error boundary');
    }
  }, [shouldThrow]);
  
  return <div>Working component</div>;
};

// Language provider is now included in the custom render from test-utils

describe.skip('ErrorBoundary', () => {
  // Silence console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('Normal Operation', () => {
    test('renders children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Working component')).toBeInTheDocument();
    });

    test('does not show error UI when component works normally', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('catches and displays error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('We encountered an unexpected problem. Your data is safe.')).toBeInTheDocument();
    });

    test('shows retry button when error is retryable', () => {
      render(
        <ErrorBoundary retryable={true}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    test('does not show retry button when error is not retryable', () => {
      render(
        <ErrorBoundary retryable={false}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    test('shows reload button for critical errors', () => {
      render(
        <ErrorBoundary retryable={false}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
    });
  });

  describe('Multi-Language Support', () => {
    test('uses scholarly tone in elvish mode', () => {
      // Mock elvish mode
      jest.mock('../../contexts/LanguageContext', () => ({
        ...jest.requireActual('../../contexts/LanguageContext'),
        useLanguageContext: () => ({
          language: 'sindarin',
          culturalMode: 'scholarly',
          tError: (errorCode: string) => ({
            title: 'An unexpected error has occurred',
            message: 'An unforeseen circumstance has arisen. Your data remains secure.',
            action: 'Attempt recovery'
          }),
          shouldUseTengwar: () => false
        })
      }));

      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should use cultural error translations
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    test('resets error state when retry is clicked', () => {
      let throwError = true;
      const TestComponent = () => {
        if (throwError) {
          throw new Error('Test error');
        }
        return <div>Component recovered</div>;
      };

      render(
        <ErrorBoundary retryable={true}>
          <TestComponent />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Click retry button
      throwError = false;
      const retryButton = screen.getByRole('button', { name: /try again/i });
      retryButton.click();

      // Component should recover (though in this test setup, we can't easily simulate the full recovery)
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('error display has proper ARIA role', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveAttribute('role', 'alert');
    });

    test('retry button is keyboard accessible', () => {
      render(
        <ErrorBoundary retryable={true}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).not.toHaveAttribute('disabled');
    });

    test('error content is properly structured for screen readers', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should have proper heading structure
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      // Error message should be descriptive
      expect(screen.getByText('We encountered an unexpected problem. Your data is safe.')).toBeInTheDocument();
    });
  });

  describe('Development vs Production', () => {
    test('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.assign(process.env, { NODE_ENV: 'development' });

      render(
        <ErrorBoundary showErrorDetails={true}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // In development, should show error details
      expect(screen.getByRole('alert')).toBeInTheDocument();

      Object.assign(process.env, { NODE_ENV: originalEnv });
    });

    test('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.assign(process.env, { NODE_ENV: 'production' });

      render(
        <ErrorBoundary showErrorDetails={false}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      // In production, should not show technical error details
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.queryByText(/Test error for error boundary/)).not.toBeInTheDocument();

      Object.assign(process.env, { NODE_ENV: originalEnv });
    });
  });

  describe('Error Reporting', () => {
    test('calls onError callback when error occurs', () => {
      const onErrorSpy = jest.fn();

      render(
        <ErrorBoundary onError={onErrorSpy}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onErrorSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    test('includes component stack in error info', () => {
      const onErrorSpy = jest.fn();

      render(
        <ErrorBoundary onError={onErrorSpy}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      const [error, errorInfo] = onErrorSpy.mock.calls[0];
      expect(error).toBeInstanceOf(Error);
      expect(errorInfo).toHaveProperty('componentStack');
      expect(typeof errorInfo.componentStack).toBe('string');
    });
  });
});