import { describe, expect, it } from 'vitest';
import {
  calculateItemRange,
  getHostElementClasses,
  getItemRangeText,
  getPreviewClasses,
  getPreviewTextClasses,
  shouldShowFooter,
} from '../pidComponentUtils';

describe('pidComponentUtils', () => {
  describe('shouldShowFooter', () => {
    it('returns true when has actions', () => {
      expect(shouldShowFooter(true, false)).toBe(true);
    });

    it('returns true when has pagination', () => {
      expect(shouldShowFooter(false, true)).toBe(true);
    });

    it('returns true when has both', () => {
      expect(shouldShowFooter(true, true)).toBe(true);
    });

    it('returns false when has neither', () => {
      expect(shouldShowFooter(false, false)).toBe(false);
    });
  });

  describe('getPreviewClasses', () => {
    it('returns empty string for non-top-level', () => {
      expect(getPreviewClasses(false, false, false, false, false, 24)).toBe('');
    });

    it('includes base classes for top level', () => {
      const result = getPreviewClasses(true, false, false, false, true, 24);
      expect(result).toContain('group');
      expect(result).toContain('rounded-md');
      expect(result).toContain('font-mono');
      expect(result).toContain('font-bold');
    });

    it('includes emphasized styles when emphasized', () => {
      const result = getPreviewClasses(true, true, false, false, true, 24);
      expect(result).toContain('border-gray-300');
      expect(result).toContain('bg-white');
    });

    it('includes dark mode emphasized styles', () => {
      const result = getPreviewClasses(true, true, false, true, true, 24);
      expect(result).toContain('border-gray-600');
      expect(result).toContain('bg-gray-800');
    });

    it('includes height classes when not expanded', () => {
      const result = getPreviewClasses(true, false, false, false, false, 24);
      expect(result).toContain('h-[24px]');
      expect(result).toContain('leading-[24px]');
    });

    it('includes temporarily emphasized styles', () => {
      const result = getPreviewClasses(true, false, true, false, true, 24);
      expect(result).toContain('border-gray-300');
      expect(result).toContain('bg-white');
    });

    it('uses default line height of 24 when not specified', () => {
      const result = getPreviewClasses(true, false, false, false, false, 0);
      expect(result).toContain('h-[24px]');
      expect(result).toContain('leading-[24px]');
    });
  });

  describe('getPreviewTextClasses', () => {
    it('returns empty string for non-top-level', () => {
      expect(getPreviewTextClasses(false, false)).toBe('');
      expect(getPreviewTextClasses(true, false)).toBe('');
    });

    it('returns expanded classes when expanded', () => {
      const result = getPreviewTextClasses(true, true);
      expect(result).toContain('text-xs');
      expect(result).toContain('max-w-[60vw]');
      expect(result).toContain('overflow-x-auto');
      expect(result).toContain('whitespace-nowrap');
    });

    it('returns collapsed classes when not expanded', () => {
      const result = getPreviewTextClasses(false, true);
      expect(result).toContain('text-sm');
      expect(result).toContain('max-w-full');
      expect(result).toContain('truncate');
    });
  });

  describe('getHostElementClasses', () => {
    it('returns correct base classes', () => {
      expect(getHostElementClasses(true)).toBe('relative font-sans');
      expect(getHostElementClasses(false)).toBe('relative font-sans');
    });
  });

  describe('getItemRangeText', () => {
    it('returns formatted text', () => {
      expect(getItemRangeText(1, 10, 100)).toBe('Showing 1-10 of 100');
    });

    it('handles edge cases', () => {
      expect(getItemRangeText(0, 10, 10)).toBe('Showing 0-10 of 10');
      expect(getItemRangeText(90, 100, 100)).toBe('Showing 90-100 of 100');
    });
  });

  describe('calculateItemRange', () => {
    it('calculates first page range', () => {
      expect(calculateItemRange(0, 10, 100)).toEqual({ start: 0, end: 10 });
    });

    it('calculates middle page range', () => {
      expect(calculateItemRange(1, 10, 100)).toEqual({ start: 10, end: 20 });
    });

    it('calculates last page range with remainder', () => {
      expect(calculateItemRange(9, 10, 95)).toEqual({ start: 90, end: 95 });
    });

    it('handles total less than page size', () => {
      expect(calculateItemRange(0, 10, 5)).toEqual({ start: 0, end: 5 });
    });

    it('handles zero items', () => {
      expect(calculateItemRange(0, 10, 0)).toEqual({ start: 0, end: 0 });
    });
  });
});
