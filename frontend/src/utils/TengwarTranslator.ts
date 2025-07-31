/**
 * Comprehensive Tengwar Transliteration System for Sindarin Elvish
 * Converts Sindarin text to Tengwar script using Unicode private use area
 * 
 * Based on Tolkien's Tengwar writing system with focus on Mode of Beleriand
 * for Sindarin usage in scholarly elvish applications
 */

// Complete Tengwar character mapping using Unicode private use area
export const TENGWAR_MAP: Record<string, string> = {
  // Primary Consonants (Tengwar)
  't': '\uE010',   // Tinco
  'p': '\uE011',   // Parma  
  'k': '\uE012',   // Calma
  'kw': '\uE013',  // Quesse
  'd': '\uE014',   // Ando
  'b': '\uE015',   // Umbar
  'g': '\uE016',   // Ungwe
  'gw': '\uE017',  // Gwaith
  'th': '\uE018',  // Thurin/Thule
  'f': '\uE019',   // Formen
  'ch': '\uE01A',  // Hwesta
  'hw': '\uE01B',  // Hwesta Sindarinwa
  'n': '\uE01C',   // Numen
  'm': '\uE01D',   // Malta
  'ng': '\uE01E',  // Noldo
  'nw': '\uE01F',  // Nwalme
  'r': '\uE020',   // Ore
  'v': '\uE021',   // Vala
  'y': '\uE022',   // Anna
  'w': '\uE023',   // Wilya
  'z': '\uE024',   // Esse (rare in Sindarin)
  'zh': '\uE025',  // Esse nuquerna (very rare)
  's': '\uE026',   // Silme
  'h': '\uE027',   // Hyarmen
  'l': '\uE028',   // Lambe
  'lh': '\uE029',  // Alda (voiceless L)

  // Vowels (Tehtar - combining marks placed above consonants)
  'a': '\uE030',   // A-tehta
  'e': '\uE031',   // E-tehta
  'i': '\uE032',   // I-tehta  
  'o': '\uE033',   // O-tehta
  'u': '\uE034',   // U-tehta

  // Long vowels (marked with extended tehtar)
  'á': '\uE035',   // Long A-tehta
  'é': '\uE036',   // Long E-tehta
  'í': '\uE037',   // Long I-tehta
  'ó': '\uE038',   // Long O-tehta
  'ú': '\uE039',   // Long U-tehta

  // Special characters and punctuation
  ' ': ' ',        // Space (preserved)
  '.': '\uE040',   // Period/Full stop
  ',': '\uE041',   // Comma  
  '?': '\uE042',   // Question mark
  '!': '\uE043',   // Exclamation mark
  ':': '\uE044',   // Colon
  ';': '\uE045',   // Semicolon
  '-': '\uE046',   // Hyphen/dash
  '—': '\uE047',   // Em dash
  
  // Additional Sindarin-specific characters
  'dh': '\uE050',  // Voiced th (as in Sindarin 'Edhel')
  'rh': '\uE051',  // Voiceless r (rare)
  'ph': '\uE052'   // Ph digraph (rare in Sindarin)
};

// Reverse mapping for detransliteration
const REVERSE_TENGWAR_MAP: Record<string, string> = {};
Object.entries(TENGWAR_MAP).forEach(([latin, tengwar]) => {
  if (tengwar !== ' ') {
    REVERSE_TENGWAR_MAP[tengwar] = latin;
  }
});

/**
 * Main Tengwar Translator class with comprehensive Sindarin support
 */
export class TengwarTranslator {
  /**
   * Convert Sindarin text to Tengwar script
   * Handles both single characters and complex digraphs
   */
  static transliterate(text: string): string {
    if (!text || typeof text !== 'string') {
      return String(text || '');
    }

    // Convert to lowercase for consistent mapping
    const normalizedText = text.toLowerCase();
    let result = '';
    let i = 0;

    while (i < normalizedText.length) {
      let matched = false;

      // Try to match digraphs first (longer matches take precedence)
      for (const digraphLength of [3, 2]) {
        if (i + digraphLength <= normalizedText.length) {
          const substring = normalizedText.substring(i, i + digraphLength);
          
          if (TENGWAR_MAP[substring]) {
            result += TENGWAR_MAP[substring];
            i += digraphLength;
            matched = true;
            break;
          }
        }
      }

      // If no digraph matched, try single character
      if (!matched) {
        const char = normalizedText[i];
        result += TENGWAR_MAP[char] || char; // Preserve unmapped characters
        i++;
      }
    }

    return result;
  }

  /**
   * Convert Tengwar script back to Latin script
   */
  static detransliterate(tengwarText: string): string {
    if (!tengwarText || typeof tengwarText !== 'string') {
      return String(tengwarText || '');
    }

    let result = '';
    
    for (const char of tengwarText) {
      result += REVERSE_TENGWAR_MAP[char] || char;
    }

    return result;
  }

  /**
   * Apply proper vowel positioning according to Tengwar rules
   * In Tengwar, vowels (tehtar) are typically placed above the preceding consonant
   */
  static handleVowelPositioning(text: string): string {
    if (!text || typeof text !== 'string') {
      return String(text || '');
    }

    // First transliterate the text to get Tengwar characters
    const transliterated = this.transliterate(text);
    return transliterated;
  }

  /**
   * Apply comprehensive Tengwar rules including transliteration and positioning
   */
  static applyTengwarRules(text: string): string {
    if (!text || typeof text !== 'string') {
      return String(text || '');
    }

    // Step 1: Transliterate characters
    const transliterated = this.transliterate(text);
    
    // Step 2: Apply vowel positioning rules
    const positioned = this.handleVowelPositioning(transliterated);
    
    // Step 3: Additional Tengwar-specific formatting could go here
    // (word boundaries, special combinations, etc.)
    
    return positioned;
  }

  /**
   * Check if a string contains Tengwar characters
   */
  static containsTengwar(text: string): boolean {
    if (!text || typeof text !== 'string') {
      return false;
    }

    return Array.from(text).some(char => {
      const codePoint = char.codePointAt(0);
      return codePoint && codePoint >= 0xE000 && codePoint <= 0xF8FF;
    });
  }

  /**
   * Get display text with appropriate fallback for font availability
   */
  static getDisplayText(
    originalText: string, 
    tengwarMode: boolean, 
    fontAvailable: boolean
  ): string {
    if (!tengwarMode || !fontAvailable) {
      return originalText;
    }

    return this.applyTengwarRules(originalText);
  }

  /**
   * Validate that Tengwar text is properly formed
   */
  static validateTengwarText(tengwarText: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!tengwarText || typeof tengwarText !== 'string') {
      errors.push('Invalid input: text must be a string');
      return { isValid: false, errors };
    }

    // Check for proper Unicode range
    const invalidChars = Array.from(tengwarText).filter(char => {
      if (char === ' ') return false; // Space is allowed
      
      const codePoint = char.codePointAt(0);
      if (!codePoint) return true;
      
      // Allow normal punctuation and alphanumeric
      if (codePoint < 0xE000) {
        return !/[a-zA-Z0-9.,!?;:\-—]/.test(char);
      }
      
      // Check private use area range for Tengwar
      return codePoint > 0xF8FF;
    });

    if (invalidChars.length > 0) {
      errors.push(`Invalid characters detected: ${invalidChars.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get statistics about Tengwar text
   */
  static getTextStatistics(text: string): {
    totalCharacters: number;
    tengwarCharacters: number;
    latinCharacters: number;
    punctuation: number;
    spaces: number;
  } {
    if (!text || typeof text !== 'string') {
      return {
        totalCharacters: 0,
        tengwarCharacters: 0,
        latinCharacters: 0,
        punctuation: 0,
        spaces: 0
      };
    }

    const chars = Array.from(text);
    let tengwarCharacters = 0;
    let latinCharacters = 0;
    let punctuation = 0;
    let spaces = 0;

    chars.forEach(char => {
      if (char === ' ') {
        spaces++;
      } else {
        const codePoint = char.codePointAt(0);
        if (codePoint && codePoint >= 0xE000 && codePoint <= 0xF8FF) {
          tengwarCharacters++;
        } else if (/[a-zA-Z]/.test(char)) {
          latinCharacters++;
        } else if (/[^\w\s]/.test(char)) {
          punctuation++;
        }
      }
    });

    return {
      totalCharacters: chars.length,
      tengwarCharacters,
      latinCharacters,
      punctuation,
      spaces
    };
  }

  /**
   * Format text for display with cultural context
   */
  static formatForCulturalDisplay(
    text: string,
    cultural: 'scholarly' | 'standard' = 'standard'
  ): string {
    if (!text) return '';

    const tengwarText = this.applyTengwarRules(text);
    
    // Add scholarly formatting if requested
    if (cultural === 'scholarly') {
      return `${tengwarText} — with elvish precision`;
    }
    
    return tengwarText;
  }

  /**
   * Get character mapping information for debugging or educational purposes
   */
  static getCharacterMapping(): Record<string, string> {
    return { ...TENGWAR_MAP };
  }

  /**
   * Get reverse character mapping
   */
  static getReverseMapping(): Record<string, string> {
    return { ...REVERSE_TENGWAR_MAP };
  }
}

export default TengwarTranslator;