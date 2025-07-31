import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BackendValidator } from '../utils/BackendValidator';
import { fileUploadValidationMiddleware } from './validationMiddleware';

// Legacy Joi schema for file upload validation (maintaining backwards compatibility)
const uploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  // eslint-disable-next-line no-control-regex
  originalname: Joi.string().required().regex(/^[^<>:"/\\|?*\x00-\x1F]+$/),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid('text/plain', 'text/csv', 'application/octet-stream').required(),
  size: Joi.number().max(10 * 1024 * 1024).required()
});

/**
 * Legacy file validation middleware using Joi (backwards compatibility)
 * @deprecated Use fileUploadValidationMiddleware from validationMiddleware instead
 */
export function validateFileUpload(req: Request, res: Response, next: NextFunction): void {
  if (!req.file) {
    next();
    return;
  }

  const { error } = uploadSchema.validate({
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  if (error) {
    res.status(400).json({
      success: false,
      error: `Invalid file: ${error.details[0].message}`
    });
    return;
  }

  next();
}

/**
 * Enhanced file validation middleware using new validation system
 * Provides comprehensive validation and sanitization
 */
export const enhancedFileValidation = fileUploadValidationMiddleware({
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['text/plain', 'text/csv', 'application/octet-stream'],
  allowedExtensions: ['.txt', '.csv', '.dat']
});

/**
 * Combined file validation middleware that uses both Joi and enhanced validation
 * Provides maximum compatibility and comprehensive validation
 */
export function comprehensiveFileValidation(req: Request, res: Response, next: NextFunction): void {
  if (!req.file) {
    res.status(400).json({
      error: 'Validation failed',
      details: ['No file uploaded']
    });
    return;
  }

  // First run legacy Joi validation for backwards compatibility
  const { error: joiError } = uploadSchema.validate({
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  if (joiError) {
    res.status(400).json({
      success: false,
      error: `Invalid file: ${joiError.details[0].message}`
    });
    return;
  }

  // Then run enhanced validation for additional security
  const validationResult = BackendValidator.validateFileUpload(req.file, {
    maxSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['text/plain', 'text/csv', 'application/octet-stream'],
    allowedExtensions: ['.txt', '.csv', '.dat']
  });

  if (!validationResult.isValid) {
    res.status(400).json({
      error: 'File validation failed',
      details: validationResult.errors
    });
    return;
  }

  // Apply sanitization to filename
  if (validationResult.sanitizedData && req.file && 'originalname' in req.file) {
    const sanitizedData = validationResult.sanitizedData as { originalname?: string };
    if (sanitizedData.originalname) {
      (req.file as Express.Multer.File).originalname = sanitizedData.originalname;
    }
  }

  next();
}