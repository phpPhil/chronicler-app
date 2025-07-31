// Shared TypeScript interfaces matching backend implementation

// Backend upload types (from backend/src/types/upload.types.ts)
export interface UploadResult {
  success: boolean;
  fileId?: string;
  message?: string;
  error?: string;
  data?: ParsedData;
}

export interface ParsedData {
  list1: number[];
  list2: number[];
  rowCount: number;
}

// Backend distance calculation types (from backend/src/services/DistanceCalculationEngine.ts)
export interface DistanceCalculationResult {
  totalDistance: number;
  pairs: Array<{
    position: number;
    list1Value: number;
    list2Value: number;
    distance: number;
  }>;
  metadata: {
    originalList1Length: number;
    originalList2Length: number;
    processingTimeMs: number;
  };
}

// API Request types
export interface DistanceCalculationRequest {
  list1: number[];
  list2: number[];
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
}

// API Error types
export interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  statusCode: number;
}

// API Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

// Retry configuration
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff: number;
}