import React, { ReactElement, useEffect } from 'react';
import { render, RenderOptions, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguageContext } from '../../contexts/LanguageContext';

// Component to set language to English for tests
const TestLanguageSetter = ({ children }: { children: React.ReactNode }) => {
  const { setLanguage, setCulturalMode } = useLanguageContext();
  
  useEffect(() => {
    // Set to English and standard mode for consistent test behavior
    const setTestLanguage = async () => {
      setLanguage('english');
      setCulturalMode('standard');
    };
    setTestLanguage();
  }, [setLanguage, setCulturalMode]);
  
  return <>{children}</>;
};

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageProvider>
      <TestLanguageSetter>
        {children}
      </TestLanguageSetter>
    </LanguageProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };