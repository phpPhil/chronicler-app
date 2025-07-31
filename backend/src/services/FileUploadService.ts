import { ParsedData, UploadResult, ValidationResult, FileUploadOptions } from '../types/upload.types';
import crypto from 'crypto';

export class FileUploadService {
  private readonly options: FileUploadOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['text/plain', 'text/csv', 'application/octet-stream'],
    allowedExtensions: ['.txt', '.csv', '.dat']
  };

  async uploadFile(file: Express.Multer.File): Promise<UploadResult> {
    try {
      // Validate file size
      if (file.size > this.options.maxFileSize) {
        return {
          success: false,
          error: `File size exceeds maximum allowed size of ${this.options.maxFileSize / 1024 / 1024}MB`
        };
      }

      // Validate file type
      const extension = this.getFileExtension(file.originalname);
      if (!this.isValidFileType(file, extension)) {
        return {
          success: false,
          error: 'Invalid file type. Only text files are allowed'
        };
      }

      // Convert buffer to string
      const content = file.buffer.toString('utf-8');

      // Validate format before parsing
      const validation = await this.validateFormat(content);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.[0] || 'Invalid file format'
        };
      }

      // Parse the content
      const data = await this.parseContent(content);

      // Generate file ID
      const fileId = this.generateFileId();

      return {
        success: true,
        fileId,
        message: 'File uploaded and processed successfully',
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  async parseContent(content: string): Promise<ParsedData> {
    const lines = content.split(/\r?\n|\r/).filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      throw new Error('File is empty or contains no valid data');
    }

    const list1: number[] = [];
    const list2: number[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Split by any whitespace (spaces, tabs, non-breaking spaces)
      const values = line.split(/\s+/);

      if (values.length !== 2) {
        throw new Error(`Invalid format at row ${i + 1}: expected 2 columns, found ${values.length}`);
      }

      const num1 = this.parseNumber(values[0], i + 1, 'first');
      const num2 = this.parseNumber(values[1], i + 1, 'second');

      list1.push(num1);
      list2.push(num2);
    }

    if (list1.length === 0) {
      throw new Error('File is empty or contains no valid data');
    }

    return {
      list1,
      list2,
      rowCount: list1.length
    };
  }

  async validateFormat(content: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const lines = content.split(/\r?\n|\r/).filter(line => line.trim().length > 0);

      if (lines.length === 0) {
        errors.push('File is empty or contains no valid data');
        return { valid: false, errors };
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(/\s+/);

        if (values.length !== 2) {
          errors.push(`Invalid format at row ${i + 1}: expected 2 columns, found ${values.length}`);
          continue;
        }

        // Check if values are valid numbers
        for (let j = 0; j < values.length; j++) {
          const value = values[j];
          if (!/^-?\d+$/.test(value)) {
            errors.push(`Invalid number format at row ${i + 1}: "${value}"`);
          } else {
            const num = parseInt(value, 10);
            if (Math.abs(num) > 999999999) {
              warnings.push(`Row ${i + 1} contains very large numbers that may cause precision issues`);
            }
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Validation failed');
      return { valid: false, errors };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private parseNumber(value: string, row: number, _column: string): number {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error(`Invalid number format at row ${row}: "${value}"`);
    }
    return num;
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
  }

  private isValidFileType(file: Express.Multer.File, extension: string): boolean {
    // Check extension
    if (!this.options.allowedExtensions.includes(extension)) {
      return false;
    }

    // Additional security check: ensure the file content looks like text
    try {
      const sample = file.buffer.slice(0, Math.min(1000, file.buffer.length));
      const text = sample.toString('utf-8');
      
      // Check for binary content (null bytes or other control characters)
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        if (charCode === 0 || (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13)) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  private generateFileId(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}