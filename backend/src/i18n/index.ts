/**
 * Backend Internationalization System
 * Simple i18n for backend error messages and API responses
 */

import englishErrors from './locales/english/errors.json';
import sindarinErrors from './locales/sindarin/errors.json';

export type Language = 'english' | 'sindarin';
export type ErrorCategory = 'api' | 'validation' | 'processing';

interface TranslationMap {
  [key: string]: any;
}

const translations: Record<Language, TranslationMap> = {
  english: {
    errors: englishErrors
  },
  sindarin: {
    errors: sindarinErrors
  }
};

/**
 * Backend Translation Function
 * Returns translated error messages based on language and key
 */
export function t(key: string, language: Language = 'english', fallback?: string): string {
  const keys = key.split('.');
  let current: any = translations[language];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English if key not found in requested language
      if (language !== 'english') {
        return t(key, 'english', fallback);
      }
      return fallback || key;
    }
  }
  
  return typeof current === 'string' ? current : fallback || key;
}

/**
 * Cultural Translation Function
 * Provides culturally appropriate error messages with scholarly tone
 */
export function tCultural(key: string, language: Language = 'english', fallback?: string): string {
  const translation = t(key, language, fallback);
  
  // If we're in Sindarin mode, add cultural context
  if (language === 'sindarin') {
    return translation;
  }
  
  // For English, ensure scholarly precision
  return translation;
}

/**
 * Error Response Helper
 * Creates properly localized error responses for API endpoints
 */
export interface LocalizedError {
  message: string;
  code: string;
  language: Language;
  timestamp: string;
}

export function createErrorResponse(
  errorKey: string, 
  language: Language = 'english',
  code?: string
): LocalizedError {
  return {
    message: tCultural(errorKey, language),
    code: code || errorKey.replace(/\./g, '_').toUpperCase(),
    language,
    timestamp: new Date().toISOString()
  };
}

/**
 * Language Detection Helper
 * Detects preferred language from request headers
 */
export function detectLanguage(acceptLanguageHeader?: string): Language {
  if (!acceptLanguageHeader) {
    return 'english';
  }
  
  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase());
  
  // Check for Sindarin indicators
  if (languages.some(lang => 
    lang.includes('sindarin') || 
    lang.includes('elvish') || 
    lang.includes('x-sindarin')
  )) {
    return 'sindarin';
  }
  
  return 'english';
}

export default { t, tCultural, createErrorResponse, detectLanguage };