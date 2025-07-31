import { FileUploadService } from '../../src/services/FileUploadService';
import { ParsedData, ValidationResult } from '../../src/types/upload.types';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(() => {
    service = new FileUploadService();
  });

  describe('parseContent', () => {
    it('should parse valid two-column content correctly', async () => {
      const content = `1 5
2 3
7 9
4 2`;
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [1, 2, 7, 4],
        list2: [5, 3, 9, 2],
        rowCount: 4
      });
    });

    it('should handle tab-separated values', async () => {
      const content = `10\t20
30\t40`;
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [10, 30],
        list2: [20, 40],
        rowCount: 2
      });
    });

    it('should handle multiple spaces between values', async () => {
      const content = `100    200
300    400`;
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [100, 300],
        list2: [200, 400],
        rowCount: 2
      });
    });

    it('should throw error for invalid number format', async () => {
      const content = `1 abc
2 3`;
      
      await expect(service.parseContent(content))
        .rejects.toThrow('Invalid number format at row 1: "abc"');
    });

    it('should throw error for missing second column', async () => {
      const content = `1 2
3
4 5`;
      
      await expect(service.parseContent(content))
        .rejects.toThrow('Invalid format at row 2: expected 2 columns, found 1');
    });

    it('should throw error for extra columns', async () => {
      const content = `1 2 3
4 5`;
      
      await expect(service.parseContent(content))
        .rejects.toThrow('Invalid format at row 1: expected 2 columns, found 3');
    });

    it('should handle empty lines gracefully', async () => {
      const content = `1 2

3 4

5 6`;
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [1, 3, 5],
        list2: [2, 4, 6],
        rowCount: 3
      });
    });

    it('should throw error for empty content', async () => {
      const content = '';
      
      await expect(service.parseContent(content))
        .rejects.toThrow('File is empty or contains no valid data');
    });
  });

  describe('validateFormat', () => {
    it('should validate correct format', async () => {
      const content = `1 2
3 4`;
      const result = await service.validateFormat(content);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect invalid characters', async () => {
      const content = `1 2
3 four`;
      const result = await service.validateFormat(content);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid number format at row 2: "four"');
    });

    it('should detect inconsistent column count', async () => {
      const content = `1 2
3 4 5`;
      const result = await service.validateFormat(content);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid format at row 2: expected 2 columns, found 3');
    });

    it('should warn about very large numbers', async () => {
      const content = `1 2
999999999999 3`;
      const result = await service.validateFormat(content);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Row 2 contains very large numbers that may cause precision issues');
    });

    it('should validate empty file as invalid', async () => {
      const content = '';
      const result = await service.validateFormat(content);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File is empty or contains no valid data');
    });

    it('should handle negative numbers', async () => {
      const content = `-1 -2
-3 -4`;
      const result = await service.validateFormat(content);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });

  describe('uploadFile', () => {
    it('should successfully process a valid file', async () => {
      const mockFile = {
        buffer: Buffer.from(`1 5
2 3
7 9
4 2`),
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 20
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile);
      
      expect(result.success).toBe(true);
      expect(result.fileId).toBeDefined();
      expect(result.data).toEqual({
        list1: [1, 2, 7, 4],
        list2: [5, 3, 9, 2],
        rowCount: 4
      });
    });

    it('should reject files that are too large', async () => {
      const mockFile = {
        buffer: Buffer.from('1 2'),
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 11 * 1024 * 1024 // 11MB
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('File size exceeds maximum allowed size');
    });

    it('should reject non-text files', async () => {
      const mockFile = {
        buffer: Buffer.from('fake binary data'),
        originalname: 'test.exe',
        mimetype: 'application/octet-stream',
        size: 1024
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should handle file parsing errors gracefully', async () => {
      const mockFile = {
        buffer: Buffer.from('not valid data'),
        originalname: 'test.txt',
        mimetype: 'text/plain',
        size: 20
      } as Express.Multer.File;

      const result = await service.uploadFile(mockFile);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long lines', async () => {
      const longLine = Array(1000).fill('1 2').join('\n');
      const result = await service.parseContent(longLine);
      
      expect(result.rowCount).toBe(1000);
      expect(result.list1.length).toBe(1000);
      expect(result.list2.length).toBe(1000);
    });

    it('should handle unicode whitespace characters', async () => {
      const content = `1${String.fromCharCode(160)}2
3 4`; // Non-breaking space
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [1, 3],
        list2: [2, 4],
        rowCount: 2
      });
    });

    it('should handle Windows line endings (CRLF)', async () => {
      const content = '1 2\r\n3 4\r\n5 6';
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [1, 3, 5],
        list2: [2, 4, 6],
        rowCount: 3
      });
    });

    it('should handle Mac line endings (CR)', async () => {
      const content = '1 2\r3 4\r5 6';
      const result = await service.parseContent(content);
      
      expect(result).toEqual({
        list1: [1, 3, 5],
        list2: [2, 4, 6],
        rowCount: 3
      });
    });
  });
});