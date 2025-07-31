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

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface FileUploadOptions {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export interface ProcessingStatus {
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: UploadResult;
}