import { describe, expect, it } from 'vitest';
import {
  calculateContentDimensions,
  CONSTANTS,
  getChevronColorClass,
  getChevronRotationClasses,
  getContentClasses,
  getDetailsClasses,
  getFooterActionsClasses,
  getFooterClasses,
  getHostClasses,
  getResponsiveDefaultWidth,
  getSummaryClasses,
  isInteractiveElement,
  isSafariBrowser,
  shouldSkipClick,
  Z_INDICES,
} from '../collapsibleUtils';

describe('collapsibleUtils', () => {
  describe('CONSTANTS', () => {
    it('has correct default values', () => {
      expect(CONSTANTS.DEFAULT_WIDTH).toBe('500px');
      expect(CONSTANTS.DEFAULT_HEIGHT).toBe('300px');
      expect(CONSTANTS.MIN_WIDTH).toBe(300);
      expect(CONSTANTS.MIN_HEIGHT).toBe(200);
      expect(CONSTANTS.PADDING_WIDTH).toBe(40);
      expect(CONSTANTS.PADDING_HEIGHT).toBe(60);
      expect(CONSTANTS.FOOTER_HEIGHT).toBe(60);
    });
  });

  describe('Z_INDICES', () => {
    it('has correct z-index values', () => {
      expect(Z_INDICES.RESIZE_HANDLE).toBe(10);
      expect(Z_INDICES.COPY_BUTTON).toBe(20);
      expect(Z_INDICES.FOOTER_CONTENT).toBe(30);
      expect(Z_INDICES.PAGINATION).toBe(40);
      expect(Z_INDICES.STICKY_ELEMENTS).toBe(50);
    });
  });

  describe('getResponsiveDefaultWidth', () => {
    it('returns 100% for narrow viewports', () => {
      expect(getResponsiveDefaultWidth(300)).toBe('100%');
      expect(getResponsiveDefaultWidth(599)).toBe('100%');
    });

    it('returns 70% for medium viewports', () => {
      expect(getResponsiveDefaultWidth(600)).toBe('70%');
      expect(getResponsiveDefaultWidth(800)).toBe('70%');
      expect(getResponsiveDefaultWidth(1024)).toBe('70%');
    });

    it('returns 50% for wide viewports', () => {
      expect(getResponsiveDefaultWidth(1025)).toBe('50%');
      expect(getResponsiveDefaultWidth(1920)).toBe('50%');
      expect(getResponsiveDefaultWidth(2560)).toBe('50%');
    });
  });

  describe('calculateContentDimensions', () => {
    it('returns default dimensions when no element provided', () => {
      const result = calculateContentDimensions(null, false);
      expect(result.contentWidth).toBe(CONSTANTS.MIN_WIDTH);
      expect(result.contentHeight).toBe(CONSTANTS.MIN_HEIGHT);
      expect(result.maxWidth).toBe(CONSTANTS.MIN_WIDTH + CONSTANTS.PADDING_WIDTH);
      expect(result.maxHeight).toBe(CONSTANTS.MIN_HEIGHT + CONSTANTS.PADDING_HEIGHT);
    });

    it('calculates dimensions from element', () => {
      const mockElement = {
        scrollWidth: 400,
        scrollHeight: 200,
      } as HTMLElement;
      const result = calculateContentDimensions(mockElement, false);
      expect(result.contentWidth).toBe(400);
      expect(result.contentHeight).toBe(200);
      expect(result.maxWidth).toBe(440);
      expect(result.maxHeight).toBe(260);
    });

    it('adds footer height when showFooter is true', () => {
      const mockElement = {
        scrollWidth: 400,
        scrollHeight: 200,
      } as HTMLElement;
      const result = calculateContentDimensions(mockElement, true);
      expect(result.maxHeight).toBe(200 + CONSTANTS.PADDING_HEIGHT + CONSTANTS.FOOTER_HEIGHT);
    });
  });

  describe('isSafariBrowser', () => {
    it('detects Safari browser', () => {
      expect(isSafariBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15')).toBe(true);
      expect(isSafariBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')).toBe(true);
    });

    it('does not detect Safari in user agents with chrome/android', () => {
      expect(isSafariBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')).toBe(false);
      expect(isSafariBrowser('Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36')).toBe(false);
    });

    it('excludes iOS Chrome and Firefox', () => {
      expect(isSafariBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1')).toBe(false);
      expect(isSafariBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0.0.0 Mobile/15E148 Safari/604.1')).toBe(false);
    });
  });

  describe('isInteractiveElement', () => {
    it('returns true for interactive tags', () => {
      expect(isInteractiveElement('BUTTON')).toBe(true);
      expect(isInteractiveElement('A')).toBe(true);
      expect(isInteractiveElement('COPY-BUTTON')).toBe(true);
      expect(isInteractiveElement('PID-ACTIONS')).toBe(true);
    });

    it('returns false for non-interactive tags', () => {
      expect(isInteractiveElement('DIV')).toBe(false);
      expect(isInteractiveElement('SPAN')).toBe(false);
      expect(isInteractiveElement('SUMMARY')).toBe(false);
      expect(isInteractiveElement('DETAILS')).toBe(false);
    });
  });

  describe('shouldSkipClick', () => {
    it('returns true for copy-button elements', () => {
      const mockTarget = { closest: () => true } as unknown as HTMLElement;
      expect(shouldSkipClick(mockTarget)).toBe(true);
    });

    it('returns true for elements with slot=summary-actions', () => {
      const mockTarget = {
        closest: (selector: string) => selector === '[slot="summary-actions"]' ? true : null,
        getAttribute: () => null,
        tagName: 'DIV',
      } as unknown as HTMLElement;
      expect(shouldSkipClick(mockTarget)).toBe(true);
    });

    it('returns true for BUTTON elements', () => {
      const mockTarget = { closest: () => null, tagName: 'BUTTON' } as unknown as HTMLElement;
      expect(shouldSkipClick(mockTarget)).toBe(true);
    });

    it('returns true for A elements', () => {
      const mockTarget = { closest: () => null, tagName: 'A' } as unknown as HTMLElement;
      expect(shouldSkipClick(mockTarget)).toBe(true);
    });

    it('returns true for elements with role=button', () => {
      const mockTarget = {
        closest: () => null,
        tagName: 'DIV',
        getAttribute: () => 'button',
      } as unknown as HTMLElement;
      expect(shouldSkipClick(mockTarget)).toBe(true);
    });

    it('returns false for non-interactive elements', () => {
      const mockTarget = { closest: () => null, tagName: 'SPAN', getAttribute: () => null } as unknown as HTMLElement;
      expect(shouldSkipClick(mockTarget)).toBe(false);
    });
  });

  describe('getHostClasses', () => {
    it('returns base classes for simple case', () => {
      const result = getHostClasses(false, false, false);
      expect(result).toContain('relative');
      expect(result).toContain('font-sans');
      expect(result).toContain('leading-normal');
      expect(result).toContain('inline-block');
      expect(result).toContain('text-sm');
    });

    it('includes emphasized classes when emphasized', () => {
      const result = getHostClasses(false, true, false);
      expect(result).toContain('box-border');
      expect(result).toContain('border');
      expect(result).toContain('rounded-md');
      expect(result).toContain('border-gray-300');
    });

    it('includes dark mode classes when dark mode', () => {
      const result = getHostClasses(false, false, true);
      expect(result).toContain('text-white');
    });

    it('returns open state classes when open', () => {
      const result = getHostClasses(true, false, false);
      expect(result).toContain('mb-2');
      expect(result).toContain('max-w-full');
      expect(result).toContain('text-xs');
      expect(result).toContain('block');
    });

    it('returns max-w-full for 100% initialWidth in collapsed state', () => {
      const result = getHostClasses(false, false, false, '100%');
      expect(result).toContain('max-w-full');
    });

    it('returns max-w-md for non-100% initialWidth in collapsed state', () => {
      const result = getHostClasses(false, false, false, '50%');
      expect(result).toContain('max-w-md');
    });
  });

  describe('getDetailsClasses', () => {
    it('returns base classes', () => {
      const result = getDetailsClasses(false, false);
      expect(result).toContain('group');
      expect(result).toContain('w-full');
      expect(result).toContain('font-sans');
      expect(result).toContain('transition-all');
    });

    it('adds collapsed classes when not open', () => {
      const result = getDetailsClasses(false, false);
      expect(result).toContain('text-clip');
      expect(result).toContain('overflow-hidden');
    });

    it('adds dark mode classes when dark mode', () => {
      const result = getDetailsClasses(false, true);
      expect(result).toContain('bg-gray-800');
      expect(result).toContain('text-white');
    });
  });

  describe('getSummaryClasses', () => {
    it('returns base classes', () => {
      const result = getSummaryClasses(false, false, false, 24);
      expect(result).toContain('font-bold');
      expect(result).toContain('font-mono');
      expect(result).toContain('cursor-pointer');
      expect(result).toContain('list-none');
    });

    it('adds collapsed classes when not open', () => {
      const result = getSummaryClasses(false, false, false, 24);
      expect(result).toContain('whitespace-nowrap');
      expect(result).toContain('overflow-hidden');
    });

    it('adds open state classes when open', () => {
      const result = getSummaryClasses(true, false, false, 24);
      expect(result).toContain('sticky');
      expect(result).toContain('top-0');
      expect(result).toContain('overflow-x-auto');
      expect(result).toContain('backdrop-blur-xs');
    });

    it('adds dark mode open state classes', () => {
      const result = getSummaryClasses(true, true, false, 24);
      expect(result).toContain('bg-gray-800');
    });

    it('includes line height in class', () => {
      const result = getSummaryClasses(false, false, false, 24);
      expect(result).toContain('h-[24px]');
    });
  });

  describe('getContentClasses', () => {
    it('returns base classes', () => {
      const result = getContentClasses(false, false);
      expect(result).toContain('grow');
      expect(result).toContain('flex');
      expect(result).toContain('flex-col');
      expect(result).toContain('min-h-0');
    });

    it('adds collapsed classes when not open', () => {
      const result = getContentClasses(false, false);
      expect(result).toContain('overflow-hidden');
      expect(result).toContain('p-0');
    });

    it('adds dark mode classes when dark mode', () => {
      const result = getContentClasses(false, true);
      expect(result).toContain('bg-gray-800');
      expect(result).toContain('text-white');
    });
  });

  describe('getFooterClasses', () => {
    it('returns base classes', () => {
      const result = getFooterClasses(false);
      expect(result).toContain('flex');
      expect(result).toContain('flex-col');
      expect(result).toContain('w-full');
      expect(result).toContain('mt-auto');
    });

    it('adds dark mode classes when dark mode', () => {
      const result = getFooterClasses(true);
      expect(result).toContain('bg-gray-800');
      expect(result).toContain('border-gray-700');
    });

    it('adds light mode classes when not dark mode', () => {
      const result = getFooterClasses(false);
      expect(result).toContain('bg-white');
      expect(result).toContain('border-gray-200');
    });
  });

  describe('getFooterActionsClasses', () => {
    it('returns base classes', () => {
      const result = getFooterActionsClasses(false);
      expect(result).toContain('flex');
      expect(result).toContain('items-center');
      expect(result).toContain('justify-between');
      expect(result).toContain('gap-2');
    });

    it('adds dark mode classes when dark mode', () => {
      const result = getFooterActionsClasses(true);
      expect(result).toContain('bg-gray-800');
    });

    it('adds light mode classes when not dark mode', () => {
      const result = getFooterActionsClasses(false);
      expect(result).toContain('bg-white');
    });
  });

  describe('getChevronRotationClasses', () => {
    it('returns transition class for collapsed', () => {
      const result = getChevronRotationClasses(false);
      expect(result).toContain('transition-transform');
      expect(result).toContain('duration-200');
    });

    it('includes rotate-180 when open', () => {
      const result = getChevronRotationClasses(true);
      expect(result).toContain('group-open:rotate-180');
    });
  });

  describe('getChevronColorClass', () => {
    it('returns dark mode color', () => {
      const result = getChevronColorClass(true);
      expect(result).toBe('text-gray-300');
    });

    it('returns light mode color', () => {
      const result = getChevronColorClass(false);
      expect(result).toBe('text-gray-600');
    });
  });
});
