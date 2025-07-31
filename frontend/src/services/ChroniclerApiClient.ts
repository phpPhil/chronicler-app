import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { 
  ApiClientConfig, 
  ApiError, 
  UploadResult, 
  DistanceCalculationRequest, 
  DistanceCalculationResult, 
  HealthStatus,
  RetryConfig
} from '../types/api';

export class ChroniclerApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private retryConfig: RetryConfig;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = this.createConfig(config);
    this.retryConfig = {
      attempts: this.config.retryAttempts,
      delay: this.config.retryDelay,
      backoff: 2 // Exponential backoff multiplier
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Upload a file to the server with optional progress tracking
   */
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      };
    }

    return this.executeWithRetry(async () => {
      const response = await this.client.post<UploadResult>('/api/upload', formData, config);
      return response.data;
    });
  }

  /**
   * Calculate distance between two lists
   */
  async calculateDistance(input: DistanceCalculationRequest): Promise<DistanceCalculationResult> {
    return this.executeWithRetry(async () => {
      const response = await this.client.post<{success: boolean, data: DistanceCalculationResult}>('/api/distance/calculate', input);
      // The backend returns { success: true, data: DistanceCalculationResult }
      // We need to extract the data part
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error('Distance calculation failed');
      }
    });
  }

  /**
   * Check the health status of the server
   */
  async healthCheck(): Promise<HealthStatus> {
    return this.executeWithRetry(async () => {
      const response = await this.client.get<HealthStatus>('/api/health');
      return response.data;
    });
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, attempt: number = 1): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const apiError = this.handleError(error);
      
      // Only retry if the error is retryable and we haven't exceeded max attempts
      if (apiError.retryable && attempt <= this.retryConfig.attempts) {
        const delay = this.retryConfig.delay * Math.pow(this.retryConfig.backoff, attempt - 1);
        
        if (this.config.enableLogging) {
          console.log(`Retrying request (attempt ${attempt}/${this.retryConfig.attempts}) after ${delay}ms`);
        }
        
        await this.sleep(delay);
        return this.executeWithRetry(fn, attempt + 1);
      }
      
      throw apiError;
    }
  }

  /**
   * Handle and transform errors into a consistent format
   */
  private handleError(error: any): ApiError {
    if (error instanceof AxiosError) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        return {
          code: 'NETWORK_ERROR',
          message: error.message,
          userMessage: 'Please check your internet connection and try again.',
          retryable: true,
          statusCode: 0
        };
      }

      if (error.code === 'ECONNABORTED') {
        return {
          code: 'TIMEOUT_ERROR',
          message: error.message,
          userMessage: 'The request took too long. Please try again.',
          retryable: true,
          statusCode: 0
        };
      }

      const statusCode = error.response?.status || 0;
      
      // Server errors (5xx) - retryable
      if (statusCode >= 500) {
        return {
          code: 'SERVER_ERROR',
          message: error.response?.data?.error || error.message,
          userMessage: 'Our servers are experiencing issues. Please try again in a moment.',
          retryable: true,
          statusCode
        };
      }
      
      // Client errors (4xx) - not retryable
      if (statusCode >= 400 && statusCode < 500) {
        return {
          code: 'VALIDATION_ERROR',
          message: error.response?.data?.error || error.message,
          userMessage: error.response?.data?.userMessage || 'Please check your input and try again.',
          retryable: false,
          statusCode
        };
      }
    }

    // Default error handling
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
      userMessage: 'Something went wrong. Please try again.',
      retryable: true,
      statusCode: 0
    };
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();
        
        // Log request in development
        if (this.config.enableLogging) {
          console.log('API Request:', config.method?.toUpperCase(), config.url);
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response
        if (this.config.enableLogging) {
          console.log('API Response:', response.status, response.config.url);
        }
        
        return response;
      },
      (error) => {
        // Log error in development
        if (this.config.enableLogging) {
          console.error('API Error:', error.response?.status, error.response?.data || error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create configuration with defaults and environment variables
   */
  private createConfig(userConfig?: Partial<ApiClientConfig>): ApiClientConfig {
    const defaults: ApiClientConfig = {
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.REACT_APP_API_RETRY_DELAY || '1000'),
      enableLogging: process.env.NODE_ENV === 'development'
    };

    return { ...defaults, ...userConfig };
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current configuration (for testing purposes)
   */
  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}