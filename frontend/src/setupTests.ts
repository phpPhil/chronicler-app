// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder in Node.js < 16
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill for File constructor
if (typeof File === 'undefined') {
  class File extends Blob {
    name: string;
    lastModified: number;
    
    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      super(bits, options);
      this.name = name;
      this.lastModified = options?.lastModified || Date.now();
    }
  }
  (global as any).File = File;
}

// Mock i18next modules to prevent initialization issues
jest.mock('i18next', () => ({
  default: {
    init: jest.fn(),
    use: jest.fn().mockReturnThis(),
    t: jest.fn((key: string) => key),
    changeLanguage: jest.fn(),
    language: 'en'
  }
}));

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn()
  },
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Comprehensive key-to-English mapping for tests
      const translations: Record<string, string> = {
        // App translations
        'app:title': 'Chronicler',
        'app:subtitle': 'Distance Calculation Tool',
        'app:welcome': 'Welcome to Chronicler',
        'app:error.title': 'Error',
        'app:error.calculationError': 'Calculation Error',
        
        // Common translations
        'common:chronicler': 'Chronicler',
        'common:loading': 'Loading...',
        'common:loadingText.processing': 'Processing...',
        'common:loadingText.calculating': 'Calculating...',
        'common:loadingText.uploading': 'Uploading...',
        'common:loadingText.validating': 'Validating...',
        'common:loadingText.analyzing': 'Analyzing...',
        'common:submit': 'Submit',
        'common:cancel': 'Cancel',
        'common:close': 'Close',
        'common:back': 'Back',
        'common:next': 'Next',
        'common:previous': 'Previous',
        'common:buttons.browse': 'browse',
        'common:buttons.tryAgain': 'Try Again',
        'common:buttons.exportCsv': 'Export CSV',
        'common:buttons.exportJson': 'Export JSON',
        'common:buttons.newCalculation': 'New',
        'common:buttons.calculateNew': 'Calculate New',
        'common:accessibility.uploadZone': 'File upload zone',
        'common:accessibility.calculating': 'Calculating distance',
        'common:accessibility.tableBreakdown': 'Distance calculation breakdown',
        'common:states.calculating': 'Calculating...',
        'common:states.validating': 'Validating...',
        'common:units.bytes': 'bytes',
        'common:units.kb': 'KB',
        'common:units.mb': 'MB',
        'common:units.gb': 'GB',
        'common:units.ms': 'ms',
        
        // File upload translations
        'fileUpload:title': 'Upload File',
        'fileUpload:instructions': 'Upload a file',
        'fileUpload:instructions.dragDrop': 'Upload your text file',
        'fileUpload:instructions.orText': 'or',
        'fileUpload:instructions.toSelect': 'to select',
        'fileUpload:instructions.tapToSelect': 'Tap to select your file',
        'fileUpload:requirements.acceptedFormats': 'Text files (.txt)',
        'fileUpload:requirements.maxSize': 'Max 10MB',
        'fileUpload:requirements.formatDescription': 'Two columns of integers separated by spaces',
        'fileUpload:dropZone': 'Drop files here or click to select',
        'fileUpload:processing': 'Processing file...',
        'fileUpload:success': 'File uploaded successfully',
        'fileUpload:fileInfo.preview': 'Preview:',
        'fileUpload:fileInfo.previewEllipsis': '...',
        'fileUpload:validation.invalidFileType': 'Invalid file type',
        'fileUpload:validation.fileTooLarge': 'File too large',
        'fileUpload:validation.invalidFormat': 'Invalid file format',
        'fileUpload:progress.uploading': 'Uploading file...',
        'fileUpload:status.uploadSuccess': 'File uploaded successfully!',
        'fileUpload:status.validationFailed': 'Validation failed',
        'fileUpload:screenReader.validFile': 'File is valid',
        'fileUpload:screenReader.uploadProgress': 'Upload progress',
        'fileUpload:screenReader.uploadComplete': 'Upload complete',
        
        // Results translations
        'results:title': 'Results',
        'results:total': 'Total Distance',
        'results:pairs': 'Distance Pairs',
        'results:noData': 'No data to display',
        'results:calculatedIn': 'Calculated in {{time}}ms',
        'results:pairsProcessed': '{{count}} pairs processed',
        'results.totalDistance': 'Total Distance',
        'results.totalDistanceScholar': 'Total Distance',
        'results.totalDistanceElvish': 'Palan Ilya',
        'results.summaryCards.totalPairs': 'Total Pairs',
        'results.summaryCards.totalPairsScholar': 'Total Pairs',
        'results.summaryCards.totalPairsElvish': 'Ilya Anar',
        'results.summaryCards.list1Length': 'List 1 Length',
        'results.summaryCards.list1LengthScholar': 'List 1 Length',
        'results.summaryCards.list1LengthElvish': 'Ando List 1',
        'results.summaryCards.list2Length': 'List 2 Length',
        'results.summaryCards.list2LengthScholar': 'List 2 Length',
        'results.summaryCards.list2LengthElvish': 'Ando List 2',
        'results.summaryCards.processingTime': 'Processing Time',
        'results.summaryCards.processingTimeScholar': 'Processing Time',
        'results.summaryCards.processingTimeElvish': 'Lú Tangwa',
        'results.states.processing': 'Processing your lists...',
        'results.states.processingScholar': 'Processing your lists...',
        'results.states.processingElvish': 'Tangwanda le lists...',
        'results.states.noResults': 'No results available',
        'results.states.noResultsScholar': 'No results available',
        'results.states.noResultsElvish': 'Ú-ennas únad',
        'results.table.headers.pairNumber': 'Pair',
        'results.table.headers.pairNumberScholar': 'Pair',
        'results.table.headers.pairNumberElvish': 'Anar',
        'results.table.headers.position': 'Position',
        'results.table.headers.positionScholar': 'Position',
        'results.table.headers.positionElvish': 'Sad',
        'results.table.headers.list1Sorted': 'List 1',
        'results.table.headers.list1SortedScholar': 'List 1',
        'results.table.headers.list1SortedElvish': 'List 1',
        'results.table.headers.list2Sorted': 'List 2',
        'results.table.headers.list2SortedScholar': 'List 2',
        'results.table.headers.list2SortedElvish': 'List 2',
        'results.table.headers.distance': 'Distance',
        'results.table.headers.distanceScholar': 'Distance',
        'results.table.headers.distanceElvish': 'Palan',
        'results.methodology.title': 'Calculation Method',
        'results.methodology.titleScholar': 'Calculation Method',
        'results.methodology.titleElvish': 'Thang Nothrim',
        'results.methodology.viewDetails': 'View calculation details',
        'results.methodology.viewDetailsScholar': 'View calculation details',
        'results.methodology.viewDetailsElvish': 'Cen thang sui',
        'results.methodology.description': 'This result was calculated using the Manhattan distance method:',
        'results.methodology.descriptionScholar': 'This result was calculated using the Manhattan distance method:',
        'results.methodology.descriptionElvish': 'I únad tangant an Manhattan palan thang:',
        'results.methodology.steps.0': 'Both input lists were sorted independently',
        'results.methodology.steps.0Scholar': 'Both input lists were sorted independently',
        'results.methodology.steps.0Elvish': 'I lists yuln tangant erui',
        'results.methodology.steps.1': 'Numbers were paired by position after sorting',
        'results.methodology.steps.1Scholar': 'Numbers were paired by position after sorting',
        'results.methodology.steps.1Elvish': 'I nothrim gwannant ab sad ed tangad',
        'results.methodology.steps.2': 'Distance calculated as |List1[i] - List2[i]| for each pair',
        'results.methodology.steps.2Scholar': 'Distance calculated as |List1[i] - List2[i]| for each pair',
        'results.methodology.steps.2Elvish': 'Palan nothant sui |List1[i] - List2[i]| an ilya gwan',
        'results.methodology.steps.3': 'All individual distances were summed for the total',
        'results.methodology.steps.3Scholar': 'All individual distances were summed for the total',
        'results.methodology.steps.3Elvish': 'Ilya erui palan gwannant an i ilya',
        
        // Error translations
        'errors:network': 'Please check your internet connection and try again.',
        'errors:fileUpload': 'Failed to upload file',
        'errors:processing': 'Error processing request',
        'errors:generic': 'An error occurred',
        'errors:tryAgain': 'Please try again',
        'errors.boundary.title': 'Something went wrong',
        'errors.boundary.titleScholar': 'An unexpected error has occurred',
        'errors.boundary.titleElvish': 'Man agorech',
        'errors.boundary.message': 'We encountered an unexpected problem. Your data is safe.',
        'errors.boundary.messageScholar': 'An unforeseen circumstance has arisen. Your data remains secure.',
        'errors.boundary.messageElvish': 'Únad cenin. I ñold lín belain.',
        'errors.boundary.action': 'Try again',
        'errors.boundary.actionScholar': 'Attempt recovery',
        'errors.boundary.actionElvish': 'Ada-cened',
        'errors.boundary.reload': 'Reload page',
        'errors.boundary.reloadScholar': 'Refresh application',
        'errors.boundary.reloadElvish': 'Ada-ortho i balch',
        
        // Backend translations
        'backend:calculating': 'Calculating distances...',
        'backend:complete': 'Calculation complete',
        
        // Legacy keys for backward compatibility
        'upload.instructions': 'Upload a file',
        'chronicler': 'Chronicler',
        'results.title': 'Results'
      };
      
      // Handle interpolation for translations with parameters
      let translation = translations[key] || key;
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(param => {
          translation = translation.replace(`{{${param}}}`, options[param]);
        });
      }
      
      return translation;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en'
    }
  }),
  Trans: ({ children }: any) => children
}));

jest.mock('i18next-browser-languagedetector', () => ({
  default: {
    type: 'languageDetector',
    init: jest.fn(),
    detect: jest.fn(() => 'en'),
    cacheUserLanguage: jest.fn()
  }
}));

// Mock the i18n module
jest.mock('./i18n', () => ({
  default: {
    init: jest.fn(),
    use: jest.fn().mockReturnThis(),
    t: jest.fn((key: string) => key),
    changeLanguage: jest.fn(),
    language: 'en'
  },
  ChroniclerLanguageUtils: {
    getCurrentLanguage: jest.fn(() => 'english'),
    switchLanguage: jest.fn(),
    isElvishMode: jest.fn(() => false),
    getCulturalGreeting: jest.fn(() => 'Welcome'),
    formatWithCulture: jest.fn((text: string) => text)
  }
}));

// Mock axios at the top level for all tests
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  isAxiosError: jest.fn(),
}));

// Mock environment variables for tests
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
process.env.REACT_APP_API_TIMEOUT = '30000';
process.env.REACT_APP_API_RETRY_ATTEMPTS = '3';
process.env.REACT_APP_API_RETRY_DELAY = '1000';

// Mock window.matchMedia with proper JSDOM compatibility
const mockMatchMedia = jest.fn((query: string): MediaQueryList => ({
  matches: false, // Always return false for simplicity in tests  
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Assign directly to window - this works better with JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia
});

// Mock document.fonts API for Tengwar font loading
if (!document.fonts) {
  (document as any).fonts = {
    add: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    ready: Promise.resolve(),
    check: jest.fn(() => true),
    load: jest.fn(() => Promise.resolve([])),
    has: jest.fn(() => false),
    size: 0,
    forEach: jest.fn(),
    entries: jest.fn(() => [].entries()),
    keys: jest.fn(() => [].keys()),
    values: jest.fn(() => [].values()),
  };
}

// Mock FontFace constructor
if (typeof FontFace === 'undefined') {
  (global as any).FontFace = class MockFontFace {
    family: string;
    source: string;
    descriptors: any;
    
    constructor(family: string, source: string, descriptors?: any) {
      this.family = family;
      this.source = source;
      this.descriptors = descriptors;
    }
    
    load() {
      return Promise.resolve(this);
    }
  };
}

// Mock window.requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};
