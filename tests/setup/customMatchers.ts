import { expect } from '@jest/globals';

// Custom Jest matchers for Chronicler application testing
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDistanceResult(): R;
      toHaveValidCalculationMetrics(): R;
      toBeWithinPerformanceThreshold(thresholdMs: number): R;
      toHaveAccessibilityCompliance(): R;
      toBeValidFileUploadResponse(): R;
      toHaveProperErrorStructure(): R;
      toMatchChroniclerBrandGuidelines(): R;
      toBeValidTengwarTranslation(): R;
    }
  }
}

// Distance calculation result validation
expect.extend({
  toBeValidDistanceResult(received: any) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.totalDistance === 'number' &&
      received.totalDistance >= 0 &&
      Array.isArray(received.pairs) &&
      received.pairs.every((pair: any) => 
        typeof pair.left === 'number' &&
        typeof pair.right === 'number' &&
        typeof pair.distance === 'number' &&
        pair.distance >= 0
      ) &&
      received.metadata &&
      typeof received.metadata.leftListSize === 'number' &&
      typeof received.metadata.rightListSize === 'number' &&
      typeof received.metadata.processingTimeMs === 'number'
    );

    return {
      message: () => pass 
        ? `expected ${JSON.stringify(received)} not to be a valid distance result`
        : `expected ${JSON.stringify(received)} to be a valid distance result with totalDistance, pairs array, and metadata`,
      pass
    };
  },

  toHaveValidCalculationMetrics(received: any) {
    const pass = (
      received &&
      received.metadata &&
      typeof received.metadata.processingTimeMs === 'number' &&
      received.metadata.processingTimeMs >= 0 &&
      received.metadata.processingTimeMs < 10000 && // Should complete in under 10 seconds
      typeof received.metadata.leftListSize === 'number' &&
      typeof received.metadata.rightListSize === 'number' &&
      received.metadata.leftListSize > 0 &&
      received.metadata.rightListSize > 0
    );

    return {
      message: () => pass
        ? `expected calculation metrics to be invalid`
        : `expected valid calculation metrics with reasonable processing time and positive list sizes`,
      pass
    };
  },

  toBeWithinPerformanceThreshold(received: number, thresholdMs: number) {
    const pass = received <= thresholdMs;

    return {
      message: () => pass
        ? `expected ${received}ms to exceed performance threshold of ${thresholdMs}ms`
        : `expected ${received}ms to be within performance threshold of ${thresholdMs}ms`,
      pass
    };
  },

  toHaveAccessibilityCompliance(received: any) {
    // Mock accessibility validation - in real implementation would use axe-core
    const hasAriaLabels = received.querySelector && received.querySelector('[aria-label]');
    const hasSemanticHTML = received.querySelector && (
      received.querySelector('main') ||
      received.querySelector('section') ||
      received.querySelector('article')
    );
    const hasKeyboardNavigation = received.tabIndex !== undefined || received.getAttribute?.('tabindex');

    const pass = !!(hasAriaLabels || hasSemanticHTML || hasKeyboardNavigation);

    return {
      message: () => pass
        ? `expected element to fail accessibility compliance`
        : `expected element to have accessibility features (ARIA labels, semantic HTML, or keyboard navigation)`,
      pass
    };
  },

  toBeValidFileUploadResponse(received: any) {
    const pass = (
      received &&
      typeof received === 'object' &&
      (received.success === true || received.success === false) &&
      (received.success ? received.data : received.error) &&
      typeof received.timestamp === 'string'
    );

    return {
      message: () => pass
        ? `expected ${JSON.stringify(received)} not to be a valid file upload response`
        : `expected ${JSON.stringify(received)} to be a valid file upload response with success flag, data/error, and timestamp`,
      pass
    };
  },

  toHaveProperErrorStructure(received: any) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.message === 'string' &&
      received.message.length > 0 &&
      (received.code === undefined || typeof received.code === 'string') &&
      (received.timestamp === undefined || typeof received.timestamp === 'string')
    );

    return {
      message: () => pass
        ? `expected error object to have improper structure`
        : `expected error object to have message string and optional code/timestamp`,
      pass
    };
  },

  toMatchChroniclerBrandGuidelines(received: any) {
    // Mock brand guideline validation
    const hasProperColors = received.style?.color && (
      received.style.color.includes('#4169E1') || // Rivendell Blue
      received.style.color.includes('#C0C0C0') || // Elrond Silver
      received.style.color.includes('#B8860B')    // Mallorn Gold
    );

    const hasProperFonts = received.style?.fontFamily && (
      received.style.fontFamily.includes('Tengwar') ||
      received.style.fontFamily.includes('Times New Roman') ||
      received.style.fontFamily.includes('Segoe UI')
    );

    const hasScholarlyTone = received.textContent && (
      received.textContent.includes('reconciliation') ||
      received.textContent.includes('scholarly') ||
      received.textContent.includes('precision')
    );

    const pass = !!(hasProperColors || hasProperFonts || hasScholarlyTone);

    return {
      message: () => pass
        ? `expected element not to match Chronicler brand guidelines`
        : `expected element to match Chronicler brand guidelines (colors, fonts, or scholarly tone)`,
      pass
    };
  },

  toBeValidTengwarTranslation(received: string) {
    // Mock Tengwar validation - check for Unicode private use area characters
    const hasTengwarChars = /[\uE000-\uF8FF]/.test(received);
    const hasReasonableLength = received.length > 0 && received.length < 1000;

    const pass = hasTengwarChars && hasReasonableLength;

    return {
      message: () => pass
        ? `expected "${received}" not to be a valid Tengwar translation`
        : `expected "${received}" to be a valid Tengwar translation with Unicode private use area characters`,
      pass
    };
  }
});

// Export for module usage
export {};