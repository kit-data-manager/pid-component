import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Parser } from '../../utils/Parser';
import { renderers } from '../../utils/utils';

// ---------------------------------------------------------------------------
// Mock renderers — we replace the real `renderers` array from ./utils with
// lightweight stubs so we never pull in Stencil component dependencies.
//
// vi.mock() calls are hoisted above imports, so we cannot reference
// variables declared in the outer scope. Instead we build the mock array
// inside the factory and later obtain a reference to it via require().
// ---------------------------------------------------------------------------

function createMockConstructor(opts: {
  key: string;
  quickResult?: boolean | undefined;
  meaningfulInfoResult?: boolean;
  settingsKey?: string;
}) {
  return vi.fn().mockImplementation(function(value: string) {
    return {
      value,
      quickCheck: vi.fn().mockReturnValue(opts.quickResult),
      hasMeaningfulInformation: vi.fn().mockResolvedValue(opts.meaningfulInfoResult ?? false),
      init: vi.fn().mockResolvedValue(undefined),
      getSettingsKey: vi.fn().mockReturnValue(opts.settingsKey ?? opts.key),
      isResolvable: vi.fn().mockReturnValue(true),
      settings: undefined as unknown,
      items: [],
      actions: [],
    };
  });
}

vi.mock('../../utils/utils', () => {
  // This helper is duplicated inside the factory because the outer
  // createMockConstructor is not yet available when vi.mock runs.
  function _create(opts: {
    key: string;
    quickResult?: boolean | undefined;
    meaningfulInfoResult?: boolean;
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
        items: [],
        actions: [],
      };
    });
  }

  return {
    renderers: [
      { priority: 0, key: 'DateType', constructor: _create({ key: 'DateType', quickResult: false }) },
      { priority: 1, key: 'ORCIDType', constructor: _create({ key: 'ORCIDType', quickResult: true }) },
      {
        priority: 2,
        key: 'DOIType',
        constructor: _create({ key: 'DOIType', quickResult: undefined, meaningfulInfoResult: true }),
      },
      { priority: 3, key: 'HandleType', constructor: _create({ key: 'HandleType', quickResult: false }) },
      { priority: 99, key: 'FallbackType', constructor: _create({ key: 'FallbackType', quickResult: true }) },
    ],
  };
});

// Typed reference to the mocked renderers array for easy mutation in tests
const mockRenderers = renderers as {
  priority: number;
  key: string;
  constructor: any;
}[];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Parser', () => {
  const emptySettings: { type: string; values: { name: string; value: unknown }[] }[] = [];

  function resetRenderers() {
    mockRenderers[0].constructor = createMockConstructor({ key: 'DateType', quickResult: false });
    mockRenderers[1].constructor = createMockConstructor({
      key: 'ORCIDType',
      quickResult: true,
      meaningfulInfoResult: true,
    });
    mockRenderers[2].constructor = createMockConstructor({
      key: 'DOIType',
      quickResult: undefined,
      meaningfulInfoResult: true,
    });
    mockRenderers[3].constructor = createMockConstructor({ key: 'HandleType', quickResult: false });
    mockRenderers[4].constructor = createMockConstructor({
      key: 'FallbackType',
      quickResult: true,
      meaningfulInfoResult: true,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    resetRenderers();
  });

  // -------------------------------------------------------------------------
  // getBestFitQuick
  // -------------------------------------------------------------------------

  describe('getBestFitQuick()', () => {
    it('returns correct key for a matching value', () => {
      // ORCIDType has quickResult=true and is not FallbackType
      const result = Parser.getBestFitQuick('some-value');
      expect(result).toBe('ORCIDType');
    });

    it('returns null when nothing matches (excluding FallbackType)', () => {
      // Override all non-fallback constructors to return false
      mockRenderers.forEach(r => {
        if (r.key !== 'FallbackType') {
          r.constructor = createMockConstructor({ key: r.key, quickResult: false });
        }
      });

      const result = Parser.getBestFitQuick('unrecognized');
      expect(result).toBeNull();
    });

    it('with orderedRendererKeys tries only listed keys', () => {
      const result = Parser.getBestFitQuick('value', ['ORCIDType']);
      expect(result).toBe('ORCIDType');
    });

    it('with orderedRendererKeys returns null when none match', () => {
      const result = Parser.getBestFitQuick('value', ['DateType']);
      // DateType has quickResult=false → not true, so returns null
      expect(result).toBeNull();
    });

    it('with orderedRendererKeys returns first match in specified order', () => {
      // Both ORCIDType and FallbackType return true quickly
      const result = Parser.getBestFitQuick('value', ['FallbackType', 'ORCIDType']);
      // FallbackType is first and matches → returns FallbackType (ordered list mode does not skip FallbackType)
      expect(result).toBe('FallbackType');
    });

    it('skips FallbackType in default mode', () => {
      // Only FallbackType returns true in default mode
      mockRenderers.forEach(r => {
        if (r.key !== 'FallbackType') {
          r.constructor = createMockConstructor({ key: r.key, quickResult: false });
        }
      });

      const result = Parser.getBestFitQuick('value');
      expect(result).toBeNull();
    });

    it('returns highest-priority (lowest index) match in default mode', () => {
      // Both DateType and ORCIDType match
      mockRenderers[0].constructor = createMockConstructor({ key: 'DateType', quickResult: true });
      mockRenderers[1].constructor = createMockConstructor({ key: 'ORCIDType', quickResult: true });

      const result = Parser.getBestFitQuick('value');
      // Iterates backwards; last overwrite is highest-priority → DateType (index 0)
      expect(result).toBe('DateType');
    });

    it('skips renderers whose quick check returns undefined in ordered mode', () => {
      // DOIType has quickResult=undefined
      const result = Parser.getBestFitQuick('value', ['DOIType']);
      expect(result).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getBestFit
  // -------------------------------------------------------------------------

  describe('getBestFit()', () => {
    it('runs tiered detection (quick then async) and returns best match', async () => {
      const result = await Parser.getBestFit('value', emptySettings);
      expect(result).not.toBeNull();
      // ORCIDType (index 1) is confirmed quick, DOIType (index 2) is confirmed async
      // Highest priority = lowest index → ORCIDType wins
      expect(result!.getSettingsKey()).toBe('ORCIDType');
    });

    it('applies settings to matched renderer', async () => {
      const settings = [
        {
          type: 'ORCIDType',
          values: [{ name: 'apiKey', value: '12345' }],
        },
      ];
      const result = await Parser.getBestFit('value', settings);
      expect(result).not.toBeNull();
      expect(result!.settings).toEqual([{ name: 'apiKey', value: '12345' }]);
    });

    it('calls init() on matched renderer', async () => {
      const result = await Parser.getBestFit('value', emptySettings);
      expect(result).not.toBeNull();
      expect(result!.init).toHaveBeenCalled();
    });

    it('with orderedRendererKeys and fallbackToAll=true falls back to full registry', async () => {
      // Supply an ordered list where no renderer matches
      const result = await Parser.getBestFit('value', emptySettings, ['HandleType'], true);
      // HandleType has quickResult=false → skipped; fallback to full registry → ORCIDType matches
      expect(result).not.toBeNull();
      expect(result!.getSettingsKey()).toBe('ORCIDType');
    });

    it('with orderedRendererKeys and fallbackToAll=false returns null when none match', async () => {
      const result = await Parser.getBestFit('value', emptySettings, ['HandleType'], false);
      // HandleType has quickResult=false → skipped; no fallback → null
      expect(result).toBeNull();
    });

    it('skips renderers that fail quick check', async () => {
      // Only DateType has quickResult=true, rest are false
      mockRenderers.forEach(r => {
        r.constructor = createMockConstructor({ key: r.key, quickResult: false, meaningfulInfoResult: true });
      });
      mockRenderers[0].constructor = createMockConstructor({
        key: 'DateType',
        quickResult: true,
        meaningfulInfoResult: true,
      });

      const result = await Parser.getBestFit('value', emptySettings);
      expect(result).not.toBeNull();
      expect(result!.getSettingsKey()).toBe('DateType');
    });

    it('runs async check for uncertain (undefined quick) candidates', async () => {
      // Only DOIType is uncertain (undefined quick, meaningfulInfoResult true), rest are false
      mockRenderers.forEach(r => {
        r.constructor = createMockConstructor({ key: r.key, quickResult: false, meaningfulInfoResult: false });
      });
      mockRenderers[2].constructor = createMockConstructor({
        key: 'DOIType',
        quickResult: undefined,
        meaningfulInfoResult: true,
      });

      const result = await Parser.getBestFit('value', emptySettings);
      expect(result).not.toBeNull();
      expect(result!.getSettingsKey()).toBe('DOIType');
    });

    it('returns null when no renderer matches at all', async () => {
      mockRenderers.forEach(r => {
        r.constructor = createMockConstructor({ key: r.key, quickResult: false });
      });

      const result = await Parser.getBestFit('value', emptySettings);
      expect(result).toBeNull();
    });

    it('in ordered mode, uses hasMeaningfulInformation when quickCheck is undefined', async () => {
      // DOIType: quickResult=undefined, asyncResult=true
      const result = await Parser.getBestFit('value', emptySettings, ['DOIType'], false);
      expect(result).not.toBeNull();
      expect(result!.getSettingsKey()).toBe('DOIType');
    });

    it('warns on settings error but still returns the renderer', async () => {
      const badConstructor = vi.fn().mockImplementation(function(value: string) {
        return {
          value,
          quickCheck: vi.fn().mockReturnValue(true),
          hasMeaningfulInformation: vi.fn().mockResolvedValue(true),
          init: vi.fn().mockResolvedValue(undefined),
          getSettingsKey: vi.fn().mockImplementation(() => {
            throw new Error('boom');
          }),
          settings: undefined as unknown,
          items: [],
          actions: [],
        };
      });
      mockRenderers[1].constructor = badConstructor;

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      });
      const result = await Parser.getBestFit('value', emptySettings);
      expect(result).not.toBeNull();
      expect(warnSpy).toHaveBeenCalledWith('Error while adding settings to object:', expect.any(Error));
      warnSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // getEstimatedPriority
  // -------------------------------------------------------------------------

  describe('getEstimatedPriority()', () => {
    it('returns the index of the first matching renderer', async () => {
      // DateType (0) = false, ORCIDType (1) = true quick → priority 1
      const priority = await Parser.getEstimatedPriority('value');
      expect(priority).toBe(1);
    });

    it('returns 0 when the first renderer matches', async () => {
      mockRenderers[0].constructor = createMockConstructor({ key: 'DateType', quickResult: true });
      const priority = await Parser.getEstimatedPriority('value');
      expect(priority).toBe(0);
    });

    it('falls back to async check when quick returns undefined', async () => {
      // Make everything fail except DOIType (index 2) which is async-only
      mockRenderers.forEach(r => {
        r.constructor = createMockConstructor({ key: r.key, quickResult: false });
      });
      mockRenderers[2].constructor = createMockConstructor({
        key: 'DOIType',
        quickResult: undefined,
        meaningfulInfoResult: true,
      });

      const priority = await Parser.getEstimatedPriority('value');
      expect(priority).toBe(2);
    });

    it('returns 0 (initial value) when no renderer matches', async () => {
      mockRenderers.forEach(r => {
        r.constructor = createMockConstructor({ key: r.key, quickResult: false });
      });

      const priority = await Parser.getEstimatedPriority('value');
      expect(priority).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // getEffectiveRenderers (tested indirectly through Parser methods)
  // -------------------------------------------------------------------------

  describe('getEffectiveRenderers() (via public API)', () => {
    it('warns on unknown renderer keys', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      });
      // getBestFitQuick calls getEffectiveRenderers internally
      Parser.getBestFitQuick('value', ['NonExistentKey']);
      expect(warnSpy).toHaveBeenCalledWith('Parser: Unknown renderer key "NonExistentKey" in ordered renderer list, skipping.');
      warnSpy.mockRestore();
    });

    it('returns full list when no keys provided', () => {
      // In default mode all renderers are tried — ORCIDType should match
      const result = Parser.getBestFitQuick('value');
      expect(result).toBe('ORCIDType');
    });

    it('filters to only requested keys in specified order', () => {
      // Ask for FallbackType first, then ORCIDType — FallbackType is not skipped in ordered mode
      const result = Parser.getBestFitQuick('value', ['FallbackType', 'ORCIDType']);
      expect(result).toBe('FallbackType');
    });

    it('returns empty effective list for all unknown keys', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      });
      const result = Parser.getBestFitQuick('value', ['Alpha', 'Beta']);
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledTimes(2);
      warnSpy.mockRestore();
    });
  });
});
