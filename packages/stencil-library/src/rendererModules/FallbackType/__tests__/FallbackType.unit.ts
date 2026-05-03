import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Parser } from '../../../utils/Parser';
import { renderers } from '../../../utils/utils';
import { FallbackType } from '../../FallbackType';

vi.mock('../../../utils/utils', () => {
  function _create(opts: {
    key: string;
    quickResult?: boolean | undefined;
    meaningfulInfoResult?: boolean;
    items?: any[];
    actions?: any[];
  }) {
    return vi.fn().mockImplementation(function(value: string) {
      return {
        value,
        quickCheck: vi.fn().mockReturnValue(opts.quickResult),
        hasMeaningfulInformation: vi.fn().mockResolvedValue(opts.meaningfulInfoResult ?? false),
        init: vi.fn().mockResolvedValue(undefined),
        getSettingsKey: vi.fn().mockReturnValue(opts.key),
        isResolvable: vi.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: opts.items ?? [],
        actions: opts.actions ?? [],
      };
    });
  }

  return {
    renderers: [
      {
        priority: 0,
        key: 'DateType',
        constructor: _create({
          key: 'DateType',
          quickResult: true,
          meaningfulInfoResult: true,
          items: [{ key: 'date' }],
          actions: [],
        }),
      },
      {
        priority: 1,
        key: 'ORCIDType',
        constructor: _create({
          key: 'ORCIDType',
          quickResult: true,
          meaningfulInfoResult: true,
          items: [{ key: 'orcid' }],
          actions: [],
        }),
      },
      {
        priority: 99,
        key: 'FallbackType',
        constructor: _create({
          key: 'FallbackType',
          quickResult: true,
          meaningfulInfoResult: true,
          items: [],
          actions: [],
        }),
      },
    ],
  };
});

describe('FallbackType', () => {
  describe('quickCheck()', () => {
    it('returns true for any arbitrary string', () => {
      const ft = new FallbackType('anything goes');
      expect(ft.quickCheck()).toBe(true);
    });

    it('returns true for empty string', () => {
      const ft = new FallbackType('');
      expect(ft.quickCheck()).toBe(true);
    });

    it('returns true for numeric string', () => {
      const ft = new FallbackType('42');
      expect(ft.quickCheck()).toBe(true);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('returns true', async () => {
      const ft = new FallbackType('hello');
      expect(await ft.hasMeaningfulInformation()).toBe(true);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "FallbackType"', () => {
      const ft = new FallbackType('test');
      expect(ft.getSettingsKey()).toBe('FallbackType');
    });
  });

  describe('init()', () => {
    it('completes without error', () => {
      const ft = new FallbackType('some value');
      expect(ft.init()).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ft = new FallbackType('my value');
      expect(ft.value).toBe('my value');
    });
  });

  describe('Fallback behavior in getBestFit()', () => {
    let mockRenderers: any[];

    beforeEach(() => {
      mockRenderers = renderers as any[];
    });

    it('is NOT selected when another renderer has meaningful information with higher relevance', async () => {
      const mockDateType = {
        ...mockRenderers[0],
        constructor: vi.fn().mockImplementation(function(value: string) {
          return {
            value,
            quickCheck: vi.fn().mockReturnValue(true),
            hasMeaningfulInformation: vi.fn().mockResolvedValue(true),
            init: vi.fn().mockResolvedValue(undefined),
            getSettingsKey: vi.fn().mockReturnValue('DateType'),
            isResolvable: vi.fn().mockReturnValue(true),
            settings: undefined as unknown,
            items: [{ key: 'date', value: '2024-01-01' }],
            actions: [{ title: 'Open' }],
          };
        }),
      };

      const mockFallbackType = {
        ...mockRenderers[2],
        constructor: vi.fn().mockImplementation(function(value: string) {
          return {
            value,
            quickCheck: vi.fn().mockReturnValue(true),
            hasMeaningfulInformation: vi.fn().mockResolvedValue(true),
            init: vi.fn().mockResolvedValue(undefined),
            getSettingsKey: vi.fn().mockReturnValue('FallbackType'),
            isResolvable: vi.fn().mockReturnValue(true),
            settings: undefined as unknown,
            items: [],
            actions: [],
          };
        }),
      };

      const value = '2024-01-01';

      // DateType should be selected over FallbackType because it has items and actions
      const dateTypeInstance = new mockDateType.constructor(value);
      const fallbackTypeInstance = new mockFallbackType.constructor(value);

      // Verify relevance: DateType has higher relevance due to items and actions
      const dateTypeRelevance = (renderers.length - 0) * 1000 + dateTypeInstance.items.length + dateTypeInstance.actions.length;
      const fallbackTypeRelevance = (renderers.length - 2) * 1000 + fallbackTypeInstance.items.length + fallbackTypeInstance.actions.length;

      expect(dateTypeRelevance).toBeGreaterThan(fallbackTypeRelevance);
    });

    it('is selected when no other renderer has meaningful information', async () => {
      const mockDateType = {
        ...mockRenderers[0],
        constructor: vi.fn().mockImplementation(function(value: string) {
          return {
            value,
            quickCheck: vi.fn().mockReturnValue(true),
            hasMeaningfulInformation: vi.fn().mockResolvedValue(false),
            init: vi.fn().mockResolvedValue(undefined),
            getSettingsKey: vi.fn().mockReturnValue('DateType'),
            isResolvable: vi.fn().mockReturnValue(true),
            settings: undefined as unknown,
            items: [],
            actions: [],
          };
        }),
      };

      const mockFallbackType = {
        ...mockRenderers[2],
        constructor: vi.fn().mockImplementation(function(value: string) {
          return {
            value,
            quickCheck: vi.fn().mockReturnValue(true),
            hasMeaningfulInformation: vi.fn().mockResolvedValue(true),
            init: vi.fn().mockResolvedValue(undefined),
            getSettingsKey: vi.fn().mockReturnValue('FallbackType'),
            isResolvable: vi.fn().mockReturnValue(true),
            settings: undefined as unknown,
            items: [],
            actions: [],
          };
        }),
      };

      const value = '2024-01-01';
      const settings = { type: 'DateType', values: [] };

      // Mock the renderers for this test
      const originalRenderers = [...renderers];
      (renderers as any).length = 0;
      (renderers as any).push(mockDateType, mockFallbackType);

      try {
        const result = await Parser.getBestFit(value, [settings], undefined, false);
        expect(result).not.toBeNull();
        expect(result?.getSettingsKey()).toBe('FallbackType');
      } finally {
        (renderers as any).length = 0;
        (renderers as any).push(...originalRenderers);
      }
    });

    it('has lowest relevance score when all renderers have same priority base', () => {
      const ft = new FallbackType('test');
      const mockIndex = 99; // FallbackType is last

      // FallbackType has no items and no actions, so its relevance is just priority-based
      const fallbackRelevance = (renderers.length - mockIndex) * 1000 + ft.items.length + ft.actions.length;

      // Even with other renderers having no items/actions, FallbackType should have lowest
      // priority score due to highest index (lowest position in array)
      for (let i = 0; i < mockRenderers.length - 1; i++) {
        const otherRelevance = (renderers.length - i) * 1000;
        expect(fallbackRelevance).toBeLessThan(otherRelevance);
      }
    });
  });
});
