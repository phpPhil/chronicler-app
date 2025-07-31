import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import commonEn from './locales/english/common.json';
import appEn from './locales/english/app.json';
import fileUploadEn from './locales/english/fileUpload.json';
import resultsEn from './locales/english/results.json';
import errorsEn from './locales/english/errors.json';
import backendEn from './locales/english/backend.json';

import commonSindarin from './locales/sindarin/common.json';
import appSindarin from './locales/sindarin/app.json';
import fileUploadSindarin from './locales/sindarin/fileUpload.json';
import resultsSindarin from './locales/sindarin/results.json';
import errorsSindarin from './locales/sindarin/errors.json';
import backendSindarin from './locales/sindarin/backend.json';

// Chronicler i18n configuration for elvish professional standards
const i18nConfig = {
  fallbackLng: 'english',
  lng: 'sindarin', // Start with Sindarin as default
  defaultNS: 'common',
  ns: ['common', 'app', 'fileUpload', 'results', 'errors', 'backend'],
  
  interpolation: {
    escapeValue: false
  },
  
  // Support colon-based namespace syntax (app:title)
  nsSeparator: ':',
  
  resources: {
    english: {
      common: commonEn,
      app: appEn,
      fileUpload: fileUploadEn,
      results: resultsEn,
      errors: errorsEn,
      backend: backendEn
    },
    sindarin: {
      common: commonSindarin,
      app: appSindarin,
      fileUpload: fileUploadSindarin,
      results: resultsSindarin,
      errors: errorsSindarin,
      backend: backendSindarin
    }
  },
  
  debug: false
};

// Initialize i18n with elvish cultural configuration
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(i18nConfig);

// Custom language utilities for elvish cultural integration
export const ChroniclerLanguageUtils = {
  // Get current language in elvish cultural terms
  getCurrentLanguage(): 'sindarin' | 'english' {
    const currentLang = i18n.language;
    return currentLang === 'sindarin' ? 'sindarin' : 'english';
  },
  
  // Switch language with elvish courtesy
  async switchLanguage(language: 'sindarin' | 'english'): Promise<void> {
    await i18n.changeLanguage(language);
    
    // Emit custom event for cultural UI updates
    window.dispatchEvent(new CustomEvent('chronicler-language-changed', {
      detail: { language, isElvish: language === 'sindarin' }
    }));
  },
  
  // Check if current language is elvish
  isElvishMode(): boolean {
    return this.getCurrentLanguage() === 'sindarin';
  },
  
  // Get appropriate cultural greeting
  getCulturalGreeting(): string {
    return this.isElvishMode() 
      ? 'Mae govannen' // Well met (Sindarin)
      : 'Welcome';
  },
  
  // Format text with cultural context
  formatWithCulture(text: string, cultural: boolean = false): string {
    if (cultural && this.isElvishMode()) {
      return `${text} — with elvish precision`;
    }
    return text;
  }
};

export default i18n;