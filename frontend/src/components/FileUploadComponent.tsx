import React, { useState, useCallback, useRef, DragEvent, ChangeEvent, useMemo } from 'react';
import { useFileUpload } from '../hooks/useApiIntegration';
import { UploadResult } from '../types/api';
import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useResponsive } from '../hooks/useResponsive';
import { ProgressBar } from './loading/ProgressBar';
import './FileUploadComponent.css';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (result: UploadResult) => void;
  onError: (error: Error) => void;
  
  // Configuration
  maxFileSize?: number; // Default: 10MB
  acceptedTypes?: string[]; // Default: ['.txt']
  autoUpload?: boolean; // Default: true
  multiple?: boolean; // Default: false
  
  // Styling
  className?: string;
  styles?: React.CSSProperties;
  theme?: 'light' | 'dark';
}

interface FileUploadState {
  dragActive: boolean;
  selectedFile: File | null;
  uploadProgress: number;
  validationState: 'idle' | 'validating' | 'valid' | 'invalid';
  errorMessage: string | null;
  uploadStatus: 'idle' | 'uploading' | 'complete' | 'error';
  filePreview: string | null;
}

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.txt'],
  autoUpload = true,
  multiple = false,
  className = '',
  styles,
  theme = 'light'
}) => {
  const { t } = useTranslation();
  const { shouldUseTengwar } = useLanguageContext();
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
  
  // Get preview text based on current language
  const getPreviewText = () => {
    return t('fileUpload:fileInfo.preview', 'Preview:');
  };
  
  const [state, setState] = useState<FileUploadState>({
    dragActive: false,
    selectedFile: null,
    uploadProgress: 0,
    validationState: 'idle',
    errorMessage: null,
    uploadStatus: 'idle',
    filePreview: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the real API integration hook
  const { uploadFile, progress, error: apiError } = useFileUpload();

  // Sync API progress with component state
  React.useEffect(() => {
    setState(prev => ({ ...prev, uploadProgress: progress }));
    if (onUploadProgress) {
      onUploadProgress(progress / 100);
    }
  }, [progress, onUploadProgress]);

  // Handle API errors
  React.useEffect(() => {
    if (apiError) {
      setState(prev => ({ 
        ...prev, 
        uploadStatus: 'error', 
        errorMessage: apiError.message 
      }));
      if (onError) {
        onError(apiError);
      }
    }
  }, [apiError, onError]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return `0 ${t('common:units.bytes')}`;
    const k = 1024;
    const sizes = [t('common:units.bytes'), t('common:units.kb'), t('common:units.mb'), t('common:units.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file format content
  const validateFileContent = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          resolve(false);
          return;
        }

        // Check for two-column format
        const lines = content.trim().split('\n');
        let validLines = 0;
        
        for (const line of lines.slice(0, 10)) { // Check first 10 lines
          const trimmedLine = line.trim();
          if (trimmedLine === '') continue;
          
          const parts = trimmedLine.split(/\s+/);
          if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
            validLines++;
          }
        }
        
        resolve(validLines > 0);
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  // Generate file preview
  const generateFilePreview = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          resolve('');
          return;
        }
        
        // Show first few lines
        const lines = content.trim().split('\n').slice(0, 5);
        resolve(lines.join('\n'));
      };
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  // Validate file
  const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Check file type
    if (!acceptedTypes.some(type => file.name.toLowerCase().endsWith(type.toLowerCase()))) {
      return {
        valid: false,
        error: t('fileUpload:validation.invalidFileType', { types: acceptedTypes.join(' or ') })
      };
    }

    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: t('fileUpload:validation.fileTooLarge', { maxSize: formatFileSize(maxFileSize) })
      };
    }

    // Check content format for txt files
    if (file.name.toLowerCase().endsWith('.txt')) {
      const contentValid = await validateFileContent(file);
      if (!contentValid) {
        return {
          valid: false,
          error: t('fileUpload:validation.invalidFormat')
        };
      }
    }

    return { valid: true };
  };

  // Handle real upload using API
  const handleUpload = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, uploadStatus: 'uploading', uploadProgress: 0 }));
    
    if (onUploadStart) {
      onUploadStart();
    }

    try {
      const result = await uploadFile(file);
      
      setState(prev => ({ ...prev, uploadStatus: 'complete', uploadProgress: 100 }));
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        uploadStatus: 'error', 
        errorMessage: error instanceof Error ? error.message : 'Upload failed'
      }));
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Upload failed'));
      }
    }
  }, [uploadFile, onUploadStart, onUploadComplete, onError]);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
      validationState: 'validating',
      errorMessage: null,
      uploadStatus: 'idle'
    }));

    const validation = await validateFile(file);
    
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        validationState: 'invalid',
        errorMessage: validation.error || 'Invalid file',
        uploadStatus: 'error'
      }));
      onError(new Error(validation.error || 'Invalid file'));
      return;
    }

    // Generate preview
    const preview = await generateFilePreview(file);
    
    setState(prev => ({
      ...prev,
      validationState: 'valid',
      filePreview: preview,
      uploadStatus: 'idle'
    }));

    onFileSelect(file);

    if (autoUpload) {
      handleUpload(file);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFileSelect, onError, maxFileSize, acceptedTypes, autoUpload, handleUpload]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, dragActive: true }));
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, dragActive: false }));
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setState(prev => ({ ...prev, dragActive: false }));

    const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // File input change handler
  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Click handler for upload zone
  const handleUploadZoneClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Keyboard handler for upload zone
  const handleUploadZoneKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleUploadZoneClick();
    }
  }, [handleUploadZoneClick]);

  // Get responsive upload zone classes
  const getUploadZoneClasses = useMemo((): string => {
    const baseClass = 'upload-zone';
    const classes = [baseClass];
    
    // State classes
    if (state.dragActive) classes.push(`${baseClass}--drag-active`);
    if (state.validationState === 'invalid') classes.push(`${baseClass}--error`);
    if (state.validationState === 'valid') classes.push(`${baseClass}--success`);
    if (theme === 'dark') classes.push(`${baseClass}--dark`);
    
    // Responsive classes
    if (isMobile) classes.push(`${baseClass}--mobile`);
    if (isTablet) classes.push(`${baseClass}--tablet`);
    if (isDesktop) classes.push(`${baseClass}--desktop`);
    classes.push(`${baseClass}--${breakpoint}`);
    
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [state.dragActive, state.validationState, theme, isMobile, isTablet, isDesktop, breakpoint, className]);

  return (
    <div className="file-upload-component" style={styles}>
      <div
        data-testid="upload-zone"
        className={getUploadZoneClasses}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleUploadZoneClick}
        onKeyDown={handleUploadZoneKeyDown}
        role="button"
        tabIndex={0}
        aria-label={t('common:accessibility.uploadZone', { fileTypes: acceptedTypes.join(' or ') })}
        aria-describedby="upload-instructions"
      >
        <div className={`upload-zone-content ${isMobile ? 'mobile-layout' : ''}`}>
          {state.selectedFile ? (
            <div className={`file-info ${isMobile ? 'mobile-file-info' : ''}`}>
              <div className={`file-icon ${isMobile ? 'mobile-icon' : ''}`}>📄</div>
              <div className="file-details">
                <div className={`file-name ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-text' : ''}`}>{state.selectedFile.name}</div>
                <div className={`file-size ${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-text' : ''}`}>{formatFileSize(state.selectedFile.size)}</div>
                {state.validationState === 'valid' && state.filePreview && (
                  <div className={`file-preview ${isMobile ? 'mobile-preview' : ''}`}>
                    <strong className={`${shouldUseTengwar() ? 'tengwar-text' : 'standard-text'} ${isMobile ? 'mobile-text' : ''}`}>{getPreviewText()}</strong>
                    <pre className={`${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-text' : ''}`}>{state.filePreview}{t('fileUpload:fileInfo.previewEllipsis')}</pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`upload-instructions ${isMobile ? 'mobile-instructions' : ''}`}>
              <div className={`upload-icon ${isMobile ? 'mobile-upload-icon' : ''}`}>
                {isMobile ? '📁' : '⬆️'}
              </div>
              <div className="upload-text">
                <p>
                  <strong className={`${shouldUseTengwar() ? 'tengwar-text' : ''} ${isMobile ? 'mobile-text' : ''}`}>
                    {isMobile 
                      ? t('fileUpload:instructions.tapToSelect', 'Tap to select your file')
                      : t('fileUpload:instructions.dragDrop', 'Drag and drop your file here')
                    }
                  </strong>
                </p>
                {!isMobile && (
                  <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>
                    {t('fileUpload:instructions.orClickHere', 'or click anywhere in this area to select a file')}
                  </p>
                )}
                {isMobile && (
                  <button 
                    type="button" 
                    className={`mobile-upload-button ${shouldUseTengwar() ? 'tengwar-text' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    {t('common:buttons.chooseFile', 'Choose File')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          data-testid="file-input"
          type="file"
          className="file-input"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileInputChange}
          aria-describedby="upload-instructions"
        />
      </div>

      <div id="upload-instructions" className="upload-requirements">
        <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>{t('fileUpload:requirements.acceptedFormats', { formats: acceptedTypes.join(', ') })} • {t('fileUpload:requirements.maxSize', { size: formatFileSize(maxFileSize) })}</p>
        <p className={shouldUseTengwar() ? 'tengwar-text' : ''}>{t('fileUpload:requirements.formatDescription', 'File should contain two columns of numbers separated by spaces')}</p>
      </div>

      {state.uploadStatus === 'uploading' && (
        <div className="upload-progress">
          <ProgressBar
            progress={state.uploadProgress}
            message={t('fileUpload:progress.uploading', 'Uploading file...')}
            showPercentage={true}
            animated={true}
            color="#007bff"
            height={8}
          />
        </div>
      )}

      {state.errorMessage && (
        <div className="error-message" role="alert">
          <span className="error-icon">⚠️</span>
          <span className={shouldUseTengwar() ? 'tengwar-text' : ''}>{state.errorMessage}</span>
        </div>
      )}

      {state.uploadStatus === 'complete' && (
        <div className="success-message" role="status">
          <span className="success-icon">✅</span>
          <span className={shouldUseTengwar() ? 'tengwar-text' : ''}>{t('fileUpload:status.uploadSuccess', 'File uploaded successfully!')}</span>
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {state.validationState === 'validating' && t('common:states.validating')}
        {state.validationState === 'valid' && t('fileUpload:screenReader.validFile')}
        {state.validationState === 'invalid' && t('fileUpload:status.validationFailed', { error: state.errorMessage })}
        {state.uploadStatus === 'uploading' && t('fileUpload:screenReader.uploadProgress', { percent: state.uploadProgress })}
        {state.uploadStatus === 'complete' && t('fileUpload:screenReader.uploadComplete')}
      </div>
    </div>
  );
};