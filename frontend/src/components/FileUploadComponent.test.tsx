import React from 'react';
import { render, screen, fireEvent, waitFor } from '../tests/utils/test-utils';
import '@testing-library/jest-dom';
import { FileUploadComponent } from './FileUploadComponent';

// Mock the API client
jest.mock('../services/ChroniclerApiClient', () => ({
  ChroniclerApiClient: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockImplementation((file, onProgress) => {
      // Simulate progress
      setTimeout(() => onProgress(25), 10);
      setTimeout(() => onProgress(50), 20);
      setTimeout(() => onProgress(75), 30);
      setTimeout(() => onProgress(100), 40);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            fileId: 'test-id',
            fileName: file.name,
            fileSize: file.size,
            processedAt: new Date().toISOString()
          });
        }, 50);
      });
    })
  }))
}));

// Mock the i18n translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: string | any) => {
      const translations: Record<string, string> = {
        'fileUpload:instructions.dragDrop': 'Upload your text file',
        'fileUpload:instructions.tapToSelect': 'Tap to select your file',  
        'fileUpload:instructions.orClickHere': 'or click anywhere in this area to select a file',
        'fileUpload:fileInfo.preview': 'Preview:',
        'fileUpload:fileInfo.previewEllipsis': '...',
        'fileUpload:requirements.acceptedFormats': 'Text files ({{formats}})',
        'fileUpload:requirements.maxSize': 'Max {{size}}',
        'fileUpload:requirements.formatDescription': 'Two columns of integers separated by spaces',
        'fileUpload:status.uploadSuccess': 'File uploaded successfully!',
        'fileUpload:validation.invalidFileType': 'Invalid file type',
        'fileUpload:validation.fileTooLarge': 'File too large',
        'fileUpload:validation.invalidFormat': 'Invalid file format',
        'fileUpload:screenReader.validFile': 'File is valid',
        'fileUpload:screenReader.uploadComplete': 'Upload complete',
        'fileUpload:screenReader.uploadProgress': 'Upload progress: {{percent}}%',  
        'fileUpload:progress.uploading': 'Uploading file...',
        'common:units.bytes': 'bytes',
        'common:units.kb': 'KB',
        'common:units.mb': 'MB',
        'common:units.gb': 'GB',
        'common:buttons.chooseFile': 'Choose File',
        'common:accessibility.uploadZone': 'File upload zone',
        'common:states.validating': 'Validating...'
      };
      
      let translation = translations[key] || (typeof options === 'string' ? options : key);
      
      // Handle template interpolation
      if (typeof options === 'object' && options !== null) {
        Object.keys(options).forEach(placeholder => {
          translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), options[placeholder]);
        });
      }
      
      return translation;
    },
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock the responsive hook
jest.mock('../hooks/useResponsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: 'lg',
    screenWidth: 1024,
    screenHeight: 768,
  }),
}));

// Mock the useFileUpload hook
jest.mock('../hooks/useApiIntegration', () => ({
  useFileUpload: () => ({
    uploadFile: jest.fn().mockResolvedValue({
      fileId: 'test-id',
      fileName: 'test.txt',
      fileSize: 1000,
      processedAt: new Date().toISOString()
    }),
    progress: 0,
    error: null,
  }),
}));

// Mock file for testing
const createMockFile = (name: string, size: number, type: string, content: string = '') => {
  const file = new File([content], name, { type });
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
  });
  return file;
};

describe('FileUploadComponent', () => {
  const defaultProps = {
    onFileSelect: jest.fn(),
    onUploadStart: jest.fn(),
    onUploadProgress: jest.fn(),
    onUploadComplete: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('renders upload zone with instructions', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      expect(screen.getByText(/upload your text file/i)).toBeInTheDocument();
      expect(screen.getByText(/click anywhere in this area/i)).toBeInTheDocument();
      expect(screen.getByText(/text files/i)).toBeInTheDocument();
    });

    test('displays file format requirements', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      expect(screen.getByText(/text files/i)).toBeInTheDocument();
      expect(screen.getByText(/max.*10.*mb/i)).toBeInTheDocument();
    });

    test('shows upload zone in default state', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const uploadZone = screen.getByTestId('upload-zone');
      expect(uploadZone).toHaveClass('upload-zone');
      expect(uploadZone).not.toHaveClass('upload-zone--drag-active');
    });
  });

  describe('File Selection', () => {
    test('calls onFileSelect when valid file is selected', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      await waitFor(() => {
        expect(defaultProps.onFileSelect).toHaveBeenCalledWith(validFile);
      });
    });

    test('displays selected file information', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/1000/)).toBeInTheDocument();
    });

    test('shows file preview for valid content', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n5 6');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      await waitFor(() => {
        expect(screen.getByText(/1 2/)).toBeInTheDocument();
      });
    });
  });

  describe('File Validation', () => {
    test('rejects non-txt files', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const invalidFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          new Error('Invalid file type')
        );
      });
    });

    test('rejects files larger than 10MB', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const largeFile = createMockFile('test.txt', 11 * 1024 * 1024, 'text/plain');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [largeFile] } });
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          new Error('File too large')
        );
      });
    });

    test('validates two-column format', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const invalidContentFile = createMockFile('test.txt', 1000, 'text/plain', 'invalid content');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [invalidContentFile] } });
      
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          new Error('Invalid file format')
        );
      });
    });
  });

  describe('Drag and Drop', () => {
    test('shows active state when file is dragged over', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const uploadZone = screen.getByTestId('upload-zone');
      
      fireEvent.dragEnter(uploadZone);
      
      expect(uploadZone).toHaveClass('upload-zone--drag-active');
    });

    test('removes active state when drag leaves', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const uploadZone = screen.getByTestId('upload-zone');
      
      fireEvent.dragEnter(uploadZone);
      fireEvent.dragLeave(uploadZone);
      
      expect(uploadZone).not.toHaveClass('upload-zone--drag-active');
    });

    test('handles file drop', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n5 6');
      const uploadZone = screen.getByTestId('upload-zone');
      
      fireEvent.drop(uploadZone, {
        dataTransfer: {
          files: [validFile],
        },
      });
      
      await waitFor(() => {
        expect(defaultProps.onFileSelect).toHaveBeenCalledWith(validFile);
      });
    });
  });

  describe('Visual States', () => {
    test('shows error state for invalid files', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const invalidFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      await waitFor(() => {
        const uploadZone = screen.getByTestId('upload-zone');
        expect(uploadZone).toHaveClass('upload-zone--error');
      });
    });

    test('shows success state for valid files', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      await waitFor(() => {
        const uploadZone = screen.getByTestId('upload-zone');
        expect(uploadZone).toHaveClass('upload-zone--success');
      });
    });
  });

  describe('Persona: SeniorChroniclerElf (100, tech-challenged)', () => {
    test('displays simple, clear instructions', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      // Should use simple language
      expect(screen.getByText(/upload your text file/i)).toBeInTheDocument();
      expect(screen.getByText(/click anywhere in this area/i)).toBeInTheDocument();
      
      // Should avoid technical jargon
      expect(screen.queryByText(/bytes/i)).not.toBeInTheDocument();
    });

    test('provides helpful error messages', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const invalidFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      // Error message should be user-friendly
      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(
          new Error('Invalid file type')
        );
      });
    });

    test('shows progress clearly', async () => {
      const onUploadProgress = jest.fn();
      render(<FileUploadComponent {...defaultProps} onUploadProgress={onUploadProgress} autoUpload={true} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      // Should track progress
      await waitFor(() => {
        expect(onUploadProgress).toHaveBeenCalled();
      });
      
      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility (WCAG AA)', () => {
    test('has proper keyboard navigation', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const uploadZone = screen.getByTestId('upload-zone');
      expect(uploadZone).toHaveAttribute('tabIndex', '0');
      expect(uploadZone).toHaveAttribute('role', 'button');
    });

    test('has proper ARIA labels', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      const uploadZone = screen.getByTestId('upload-zone');
      expect(uploadZone).toHaveAttribute('aria-label');
      expect(uploadZone).toHaveAttribute('role', 'button');
      
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('aria-describedby');
    });

    test('provides screen reader announcements', () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      // Should have aria-live region for announcements
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Upload Progress', () => {
    test('shows progress bar during upload', async () => {
      const onUploadComplete = jest.fn();
      render(<FileUploadComponent {...defaultProps} onUploadComplete={onUploadComplete} autoUpload={true} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      // Wait for upload to complete
      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled();
      });
      
      // Verify success state is shown
      expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
    });

    test('calls onUploadProgress during upload', async () => {
      const onUploadProgress = jest.fn();
      render(<FileUploadComponent {...defaultProps} onUploadProgress={onUploadProgress} autoUpload={true} />);
      
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      // Progress should be called (mocked in real implementation)
      await waitFor(() => {
        expect(onUploadProgress).toHaveBeenCalled();
      });
    });
  });

  describe('Error Recovery', () => {
    test('allows retry after error', async () => {
      render(<FileUploadComponent {...defaultProps} />);
      
      // First attempt with invalid file
      const invalidFile = createMockFile('test.pdf', 1000, 'application/pdf');
      const fileInput = screen.getByTestId('file-input');
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByTestId('upload-zone')).toHaveClass('upload-zone--error');
      });
      
      // Second attempt with valid file
      const validFile = createMockFile('test.txt', 1000, 'text/plain', '1 2\n3 4\n');
      
      fireEvent.change(fileInput, { target: { files: [validFile] } });
      
      // Should recover to success state
      await waitFor(() => {
        expect(screen.getByTestId('upload-zone')).toHaveClass('upload-zone--success');
      });
    });
  });
});