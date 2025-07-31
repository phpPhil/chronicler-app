// Distance calculation types defined below

// Re-export upload types
export { 
  UploadResult, 
  ParsedData, 
  ValidationResult, 
  FileUploadOptions, 
  ProcessingStatus 
} from './upload.types';

// Standard API response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

// Health check response
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version?: string;
  services?: {
    [key: string]: 'operational' | 'degraded' | 'down';
  };
  metrics?: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    processedRequests: number;
  };
}

// Distance calculation API request/response types
export interface CalculateDistanceRequest {
  list1: number[];
  list2: number[];
}

export interface DistanceCalculationResult {
  totalDistance: number;
  pairCount: number;
  pairs: Array<{
    list1Value: number;
    list2Value: number;
    distance: number;
  }>;
}

export interface CalculateDistanceResponse extends ApiResponse<DistanceCalculationResult> {
  success: true;
  data: DistanceCalculationResult;
}

// File upload API response types
export interface FileUploadResponse extends ApiResponse {
  success: true;
  data: {
    filename: string;
    fileSize: number;
    parsedLists: {
      list1: number[];
      list2: number[];
    };
    validation: {
      isValid: boolean;
      errors: string[];
    };
  };
}