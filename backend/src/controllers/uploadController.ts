import express, { Request, Response } from 'express';
import multer from 'multer';
import { FileUploadService } from '../services/FileUploadService';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Basic filename validation
    if (file.originalname.includes('\0')) {
      cb(new Error('Invalid filename'));
      return;
    }
    cb(null, true);
  }
});

export function setupUploadRoute(app: express.Application): void {
  const fileUploadService = new FileUploadService();

  /**
   * @swagger
   * /api/upload:
   *   post:
   *     tags:
   *       - File Upload
   *     summary: Upload and parse a text file containing two columns of numbers
   *     description: |
   *       Uploads a text file and parses it to extract two columns of numbers.
   *       The file should contain tab or space-separated numbers with one pair per line.
   *       
   *       Expected format:
   *       ```
   *       3 4
   *       4 3
   *       2 5
   *       1 3
   *       3 9
   *       3 3
   *       ```
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/FileUploadRequest'
   *           encoding:
   *             file:
   *               contentType: text/plain
   *     responses:
   *       200:
   *         description: File uploaded and parsed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/FileUploadResult'
   *             example:
   *               success: true
   *               data:
   *                 list1: [3, 4, 2, 1, 3, 3]
   *                 list2: [4, 3, 5, 3, 9, 3]
   *                 metadata:
   *                   filename: "data.txt"
   *                   size: 48
   *                   lines: 6
   *       400:
   *         description: Invalid file or parsing error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             examples:
   *               no_file:
   *                 summary: No file uploaded
   *                 value:
   *                   success: false
   *                   error: "No file uploaded"
   *               file_too_large:
   *                 summary: File size exceeds limit
   *                 value:
   *                   success: false
   *                   error: "File size exceeds maximum allowed size of 10MB"
   *               invalid_format:
   *                 summary: Invalid file format
   *                 value:
   *                   success: false
   *                   error: "File does not contain valid two-column number data"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *             example:
   *               success: false
   *               error: "An unexpected error occurred during file upload"
   */
  app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      // Process the file
      const result = await fileUploadService.uploadFile(req.file);

      // Return appropriate response
      if (result.success) {
        // Transform the response to match expected API format (frontend expects data.list1 and data.list2 directly)
        res.status(200).json({
          success: true,
          fileId: result.fileId,
          message: result.message,
          data: {
            list1: result.data!.list1,
            list2: result.data!.list2,
            rowCount: result.data!.rowCount,
            metadata: {
              filename: req.file.originalname,
              fileSize: req.file.size,
              validation: {
                isValid: true,
                errors: []
              }
            }
          }
        });
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'An unexpected error occurred during file upload'
      });
    }
  });

  // Error handling middleware for multer errors
  app.use((error: Error, req: Request, res: Response, next: express.NextFunction) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          error: 'File size exceeds maximum allowed size of 10MB'
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: `Upload error: ${error.message}`
      });
      return;
    }
    
    if (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'An error occurred during upload'
      });
      return;
    }
    
    next();
  });
}