export class FileParser {
  static sanitizeContent(content: string): string {
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }

    // Normalize line endings
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove trailing whitespace from each line
    const lines = content.split('\n');
    return lines.map(line => line.trimEnd()).join('\n');
  }

  static detectEncoding(buffer: Buffer): string {
    // Simple encoding detection
    // In production, consider using a library like 'chardet'
    
    // Check for BOM markers
    if (buffer.length >= 3) {
      if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return 'utf-8';
      }
      if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        return 'utf-16le';
      }
      if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
        return 'utf-16be';
      }
    }

    // Default to UTF-8
    return 'utf-8';
  }

  static isTextFile(buffer: Buffer): boolean {
    // Check first 1KB for binary content
    const sampleSize = Math.min(1024, buffer.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      
      // Null byte is a strong indicator of binary content
      if (byte === 0) {
        return false;
      }
      
      // Control characters (except tab, newline, carriage return)
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        return false;
      }
      
      // High bytes that don't form valid UTF-8
      if (byte > 127) {
        // Simple UTF-8 validation would go here
        // For now, we'll allow high bytes
      }
    }
    
    return true;
  }

  static countLines(content: string): number {
    if (!content) return 0;
    
    const lines = content.split(/\r?\n|\r/);
    return lines.filter(line => line.trim().length > 0).length;
  }

  static getLineEnding(content: string): 'CRLF' | 'LF' | 'CR' | 'MIXED' {
    const crlfCount = (content.match(/\r\n/g) || []).length;
    const lfCount = (content.match(/(?<!\r)\n/g) || []).length;
    const crCount = (content.match(/\r(?!\n)/g) || []).length;
    
    if (crlfCount > 0 && lfCount === 0 && crCount === 0) return 'CRLF';
    if (lfCount > 0 && crlfCount === 0 && crCount === 0) return 'LF';
    if (crCount > 0 && crlfCount === 0 && lfCount === 0) return 'CR';
    return 'MIXED';
  }
}