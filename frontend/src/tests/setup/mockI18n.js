// Mock implementation of react-i18next for Jest tests
module.exports = {
  // Mock useTranslation hook
  useTranslation: () => ({
    t: (key, options) => {
      // Handle both string fallback and options object
      if (typeof options === 'string') {
        return options || key;
      }
      if (options && typeof options === 'object' && options.defaultValue !== undefined) {
        return options.defaultValue || key;
      }
      return key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en'
    }
  }),
  
  // Mock Trans component
  Trans: ({ children, i18nKey }) => children || i18nKey,
  
  // Mock Translation component
  Translation: ({ children }) => children,
  
  // Mock withTranslation HOC
  withTranslation: () => (Component) => Component,
  
  // Mock initReactI18next
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn()
  },
  
  // Mock react-i18next types
  I18nextProvider: ({ children }) => children
};