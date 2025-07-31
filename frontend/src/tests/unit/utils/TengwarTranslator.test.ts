import { TengwarTranslator, TENGWAR_MAP } from '../../../utils/TengwarTranslator';

describe('TengwarTranslator', () => {
  describe('Character Mapping', () => {
    test('maps basic consonants correctly', () => {
      expect(TengwarTranslator.transliterate('t')).toBe('\uE010');
      expect(TengwarTranslator.transliterate('p')).toBe('\uE011');
      expect(TengwarTranslator.transliterate('k')).toBe('\uE012');
      expect(TengwarTranslator.transliterate('d')).toBe('\uE014');
      expect(TengwarTranslator.transliterate('b')).toBe('\uE015');
      expect(TengwarTranslator.transliterate('g')).toBe('\uE016');
    });

    test('maps basic vowels correctly', () => {
      expect(TengwarTranslator.transliterate('a')).toBe('\uE030');
      expect(TengwarTranslator.transliterate('e')).toBe('\uE031');
      expect(TengwarTranslator.transliterate('i')).toBe('\uE032');
      expect(TengwarTranslator.transliterate('o')).toBe('\uE033');
      expect(TengwarTranslator.transliterate('u')).toBe('\uE034');
    });

    test('maps digraphs correctly', () => {
      expect(TengwarTranslator.transliterate('th')).toBe('\uE018');
      expect(TengwarTranslator.transliterate('ch')).toBe('\uE01A');
      expect(TengwarTranslator.transliterate('ng')).toBe('\uE01E');
      expect(TengwarTranslator.transliterate('kw')).toBe('\uE013');
      expect(TengwarTranslator.transliterate('hw')).toBe('\uE01B');
    });

    test('handles special characters', () => {
      expect(TengwarTranslator.transliterate(' ')).toBe(' ');
      expect(TengwarTranslator.transliterate('.')).toBe('\uE040');
      expect(TengwarTranslator.transliterate(',')).toBe('\uE041');
      expect(TengwarTranslator.transliterate('?')).toBe('\uE042');
      expect(TengwarTranslator.transliterate('!')).toBe('\uE043');
    });

    test('preserves unmapped characters', () => {
      expect(TengwarTranslator.transliterate('x')).toBe('x');
      expect(TengwarTranslator.transliterate('q')).toBe('q');
      expect(TengwarTranslator.transliterate('7')).toBe('7');
    });
  });

  describe('Word Translation', () => {
    test('translates simple words correctly', () => {
      const result = TengwarTranslator.transliterate('mae');
      expect(result).toBe('\uE01D\uE030\uE031'); // m + a + e
    });

    test('translates complex words with digraphs', () => {
      const result = TengwarTranslator.transliterate('thel');
      expect(result).toBe('\uE018\uE031\uE028'); // th + e + l
    });

    test('handles capitalization appropriately', () => {
      const result = TengwarTranslator.transliterate('Mae');
      expect(result).toBe('\uE01D\uE030\uE031'); // Should convert to lowercase first
    });

    test('processes phrases with spaces', () => {
      const result = TengwarTranslator.transliterate('mae govannen');
      expect(result).toBe('\uE01D\uE030\uE031 \uE016\uE033\uE021\uE030\uE01C\uE01C\uE031\uE01C');
    });
  });

  describe('Sindarin Specific Features', () => {
    test('handles elvish diacritics', () => {
      expect(TengwarTranslator.transliterate('á')).toBe('\uE035');
      expect(TengwarTranslator.transliterate('é')).toBe('\uE036');
      expect(TengwarTranslator.transliterate('í')).toBe('\uE037');
      expect(TengwarTranslator.transliterate('ó')).toBe('\uE038');
      expect(TengwarTranslator.transliterate('ú')).toBe('\uE039');
    });

    test('processes common Sindarin words correctly', () => {
      // "govannen" (well met)
      const govannen = TengwarTranslator.transliterate('govannen');
      expect(govannen).toBe('\uE016\uE033\uE021\uE030\uE01C\uE01C\uE031\uE01C');
      
      // "mellon" (friend)
      const mellon = TengwarTranslator.transliterate('mellon');
      expect(mellon).toBe('\uE01D\uE031\uE028\uE028\uE033\uE01C');
    });

    test('handles Sindarin consonant clusters', () => {
      // Test with 'nd' cluster
      const result = TengwarTranslator.transliterate('and');
      expect(result).toBe('\uE030\uE01C\uE014'); // a + n + d
    });
  });

  describe('Vowel Positioning', () => {
    test('places vowels above consonants', () => {
      const positioned = TengwarTranslator.handleVowelPositioning('ta');
      // In proper Tengwar, vowels should be combined with consonants
      expect(positioned).toBe('\uE010\uE030'); // t with a above it
    });

    test('handles consonant-vowel-consonant patterns', () => {
      const positioned = TengwarTranslator.handleVowelPositioning('tan');
      expect(positioned).toBe('\uE010\uE030\uE01C'); // t-a-n
    });

    test('handles multiple consecutive vowels', () => {
      const positioned = TengwarTranslator.handleVowelPositioning('aer');
      expect(positioned).toBe('\uE030\uE031\uE020'); // a-e-r
    });

    test('preserves spaces in vowel positioning', () => {
      const positioned = TengwarTranslator.handleVowelPositioning('a e');
      expect(positioned).toBe('\uE030 \uE031'); // a [space] e
    });
  });

  describe('Complete Transliteration Process', () => {
    test('applies all Tengwar rules in sequence', () => {
      const result = TengwarTranslator.applyTengwarRules('mae govannen');
      // Should apply both transliteration and vowel positioning
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('handles empty string', () => {
      expect(TengwarTranslator.transliterate('')).toBe('');
      expect(TengwarTranslator.handleVowelPositioning('')).toBe('');
      expect(TengwarTranslator.applyTengwarRules('')).toBe('');
    });

    test('handles whitespace only', () => {
      expect(TengwarTranslator.transliterate('   ')).toBe('   ');
      expect(TengwarTranslator.handleVowelPositioning('   ')).toBe('   ');
      expect(TengwarTranslator.applyTengwarRules('   ')).toBe('   ');
    });

    test('processes mixed content (text and punctuation)', () => {
      const mixed = TengwarTranslator.applyTengwarRules('Mae govannen, mellon!');
      expect(mixed).toBeTruthy();
      expect(mixed).toContain('\uE041'); // comma
      expect(mixed).toContain('\uE043'); // exclamation
    });
  });

  describe('Reverse Translation (Detransliteration)', () => {
    test('converts Tengwar back to Latin script', () => {
      const tengwar = '\uE01D\uE030\uE031'; // mae
      const latin = TengwarTranslator.detransliterate(tengwar);
      expect(latin).toBe('mae');
    });

    test('handles complex Tengwar text', () => {
      const tengwar = '\uE01D\uE030\uE031 \uE016\uE033\uE021\uE030\uE01C\uE01C\uE031\uE01C'; // mae govannen
      const latin = TengwarTranslator.detransliterate(tengwar);
      expect(latin).toBe('mae govannen');
    });

    test('preserves punctuation in reverse translation', () => {
      const tengwarWithPunct = '\uE01D\uE030\uE031\uE041'; // mae,
      const latin = TengwarTranslator.detransliterate(tengwarWithPunct);
      expect(latin).toBe('mae,');
    });

    test('handles unmapped Tengwar characters gracefully', () => {
      const mixed = '\uE01D\uE030\uE031x'; // mae + unmapped character
      const latin = TengwarTranslator.detransliterate(mixed);
      expect(latin).toBe('maex');
    });
  });

  describe('Performance and Edge Cases', () => {
    test('handles very long text efficiently', () => {
      const longText = 'mae govannen mellon '.repeat(100);
      const start = performance.now();
      const result = TengwarTranslator.applyTengwarRules(longText);
      const end = performance.now();
      
      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    test('handles special Unicode characters', () => {
      const withUnicode = 'mae 🧝‍♂️ govannen';
      const result = TengwarTranslator.transliterate(withUnicode);
      expect(result).toContain('🧝‍♂️'); // Emoji should be preserved
    });

    test('handles null and undefined gracefully', () => {
      expect(() => TengwarTranslator.transliterate(null as any)).not.toThrow();
      expect(() => TengwarTranslator.transliterate(undefined as any)).not.toThrow();
    });

    test('handles non-string input gracefully', () => {
      expect(() => TengwarTranslator.transliterate(123 as any)).not.toThrow();
      expect(() => TengwarTranslator.transliterate({} as any)).not.toThrow();
    });
  });

  describe('Character Map Completeness', () => {
    test('TENGWAR_MAP contains all expected consonants', () => {
      const expectedConsonants = ['t', 'p', 'k', 'd', 'b', 'g', 'n', 'm', 'r', 'v', 'y', 'w', 's', 'h', 'l'];
      
      expectedConsonants.forEach(consonant => {
        expect(TENGWAR_MAP).toHaveProperty(consonant);
        expect(typeof TENGWAR_MAP[consonant]).toBe('string');
      });
    });

    test('TENGWAR_MAP contains all expected vowels', () => {
      const expectedVowels = ['a', 'e', 'i', 'o', 'u'];
      
      expectedVowels.forEach(vowel => {
        expect(TENGWAR_MAP).toHaveProperty(vowel);
        expect(typeof TENGWAR_MAP[vowel]).toBe('string');
      });
    });

    test('TENGWAR_MAP contains digraphs and special combinations', () => {
      const expectedDigraphs = ['th', 'ch', 'ng', 'kw', 'hw'];
      
      expectedDigraphs.forEach(digraph => {
        expect(TENGWAR_MAP).toHaveProperty(digraph);
        expect(typeof TENGWAR_MAP[digraph]).toBe('string');
      });
    });

    test('TENGWAR_MAP uses proper Unicode private use area', () => {
      // All Tengwar characters should be in the private use area (E000-F8FF)
      const nonSpaceChars = Object.values(TENGWAR_MAP).filter(char => char !== ' ');
      
      nonSpaceChars.forEach(char => {
        const codePoint = char.codePointAt(0);
        expect(codePoint).toBeGreaterThanOrEqual(0xE000);
        expect(codePoint).toBeLessThanOrEqual(0xF8FF);
      });
    });
  });
});