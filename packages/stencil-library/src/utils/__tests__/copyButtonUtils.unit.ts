import { describe, expect, it, vi } from 'vitest';
import {
  getAriaLabel,
  getButtonText,
  getButtonTitle,
  getButtonClasses,
  getHostClasses,
  getSrOnlyText,
  isDarkModeEnabled,
  DEFAULT_LABEL,
  COPY_SUCCESS_DURATION_MS,
  FALLBACK_TEXTAREA_STYLE,
} from '../copyButtonUtils';

describe('copyButtonUtils', () => {
  describe('getAriaLabel', () => {
    it('returns copied label with default content', () => {
      expect(getAriaLabel(true)).toBe('content copied to clipboard');
      expect(getAriaLabel(false)).toBe('Copy content to clipboard');
    });

    it('returns copied label with custom label', () => {
      expect(getAriaLabel(true, 'DOI')).toBe('DOI copied to clipboard');
      expect(getAriaLabel(false, 'DOI')).toBe('Copy DOI to clipboard');
    });

    it('treats empty string as falsy and uses default content', () => {
      expect(getAriaLabel(true, '')).toBe('content copied to clipboard');
      expect(getAriaLabel(false, '')).toBe('Copy content to clipboard');
    });

    it('handles special characters in label', () => {
      expect(getAriaLabel(true, 'https://doi.org/10.1234/test')).toBe('https://doi.org/10.1234/test copied to clipboard');
    });
  });

  describe('getButtonText', () => {
    it('returns "Copy" when not copied', () => {
      expect(getButtonText(false)).toBe('Copy');
    });

    it('returns checkmark and "Copied!" when copied', () => {
      expect(getButtonText(true)).toBe('✓ Copied!');
    });
  });

  describe('getButtonTitle', () => {
    it('returns same as getAriaLabel for default label', () => {
      expect(getButtonTitle(false)).toBe(getAriaLabel(false));
      expect(getButtonTitle(true)).toBe(getAriaLabel(true));
    });

    it('returns same as getAriaLabel for custom label', () => {
      expect(getButtonTitle(false, 'Link')).toBe(getAriaLabel(false, 'Link'));
      expect(getButtonTitle(true, 'Link')).toBe(getAriaLabel(true, 'Link'));
    });
  });

  describe('getButtonClasses', () => {
    it('returns correct classes when not copied in light mode', () => {
      const result = getButtonClasses(false, false);
      expect(result).toContain('bg-white');
      expect(result).toContain('text-slate-800');
      expect(result).toContain('hover:bg-blue-200');
      expect(result).toContain('focus:ring-blue-500');
    });

    it('returns correct classes when not copied in dark mode', () => {
      const result = getButtonClasses(false, true);
      expect(result).toContain('bg-gray-700');
      expect(result).toContain('text-gray-200');
      expect(result).toContain('hover:bg-gray-600');
    });

    it('returns correct classes when copied in light mode', () => {
      const result = getButtonClasses(true, false);
      expect(result).toContain('bg-green-200');
      expect(result).toContain('text-green-900');
    });

    it('returns correct classes when copied in dark mode', () => {
      const result = getButtonClasses(true, true);
      expect(result).toContain('bg-green-700');
      expect(result).toContain('text-white');
    });

    it('always includes base classes', () => {
      const result = getButtonClasses(false, false);
      expect(result).toContain('rounded-md');
      expect(result).toContain('border');
      expect(result).toContain('font-mono');
      expect(result).toContain('font-medium');
      expect(result).toContain('transition-colors');
      expect(result).toContain('duration-200');
      expect(result).toContain('focus:ring-2');
      expect(result).toContain('focus:outline-hidden');
    });
  });

  describe('constants', () => {
    it('DEFAULT_LABEL is "content"', () => {
      expect(DEFAULT_LABEL).toBe('content');
    });

    it('COPY_SUCCESS_DURATION_MS is 1500', () => {
      expect(COPY_SUCCESS_DURATION_MS).toBe(1500);
    });

    it('FALLBACK_TEXTAREA_STYLE is defined', () => {
      expect(FALLBACK_TEXTAREA_STYLE).toBeTruthy();
      expect(typeof FALLBACK_TEXTAREA_STYLE).toBe('string');
    });
  });

  describe('getHostClasses', () => {
    it('returns inline-block alignment classes', () => {
      expect(getHostClasses()).toBe('inline-block align-baseline text-xs');
    });
  });

  describe('getSrOnlyText', () => {
    it('returns screen reader only text', () => {
      expect(getSrOnlyText()).toBe('Content copied to clipboard');
    });
  });

  describe('isDarkModeEnabled', () => {
    it('returns false when parent is null', () => {
      expect(isDarkModeEnabled(null)).toBe(false);
    });

    it('returns true when parent has bg-gray-800 class', () => {
      const mockParent = {
        classList: {
          contains: vi.fn().mockReturnValue(true),
        },
      } as unknown as Element;
      expect(isDarkModeEnabled(mockParent)).toBe(true);
    });

    it('returns false when parent does not have bg-gray-800 class', () => {
      const mockParent = {
        classList: {
          contains: vi.fn().mockReturnValue(false),
        },
      } as unknown as Element;
      expect(isDarkModeEnabled(mockParent)).toBe(false);
    });
  });
});