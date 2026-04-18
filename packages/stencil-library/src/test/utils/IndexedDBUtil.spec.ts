import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Database } from '../../utils/IndexedDBUtil';
import { Parser } from '../../utils/Parser';

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted() ensures these are available when vi.mock factories
// run (which are hoisted above all other code including const declarations).
// ---------------------------------------------------------------------------

const { mockDb, mockRendererConstructor } = vi.hoisted(() => {
  const mockDb = {
    get: vi.fn(),
    put: vi.fn(),
    add: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn(),
    transaction: vi.fn().mockReturnValue({
      store: {
        index: vi.fn().mockReturnValue({
          openCursor: vi.fn().mockResolvedValue(null),
        }),
        add: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      done: Promise.resolve(),
    }),
  };

  const mockRendererConstructor = vi.fn().mockImplementation(function(value: string, settings?: unknown) {
    return {
      value,
      settings,
      init: vi.fn().mockResolvedValue(undefined),
      getSettingsKey: vi.fn().mockReturnValue('DOIType'),
      isResolvable: vi.fn().mockReturnValue(true),
      items: [],
      data: { some: 'data' },
    };
  });

  return { mockDb, mockRendererConstructor };
});

vi.mock('@tempfix/idb', () => ({
  openDB: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock('../../utils/Parser', () => ({
  Parser: {
    getBestFit: vi.fn(),
  },
}));

vi.mock('../../utils/utils', () => ({
  renderers: [
    { priority: 0, key: 'DOIType', constructor: mockRendererConstructor },
    { priority: 1, key: 'ORCIDType', constructor: vi.fn() },
    { priority: 99, key: 'FallbackType', constructor: vi.fn() },
  ],
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Database', () => {
  let db: Database;

  const settings: { type: string; values: { name: string; value: unknown }[] }[] = [
    {
      type: 'DOIType',
      values: [
        { name: 'ttl', value: 60000 },
        { name: 'apiKey', value: 'test-key' },
      ],
    },
  ];

  const settingsNoTtl: typeof settings = [
    {
      type: 'DOIType',
      values: [{ name: 'apiKey', value: 'test-key' }],
    },
  ];

  const cachedEntity = {
    value: 'test-doi',
    rendererKey: 'DOIType',
    context: 'https://example.com',
    lastAccess: new Date(),
    lastData: { some: 'data' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the transaction mock for each test
    mockDb.transaction.mockReturnValue({
      store: {
        index: vi.fn().mockReturnValue({
          openCursor: vi.fn().mockResolvedValue(null),
        }),
        add: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
      done: Promise.resolve(),
    });
    db = new Database();
  });

  // -------------------------------------------------------------------------
  // getEntity
  // -------------------------------------------------------------------------

  describe('getEntity()', () => {
    it('returns cached entity when found in DB and TTL not expired', async () => {
      // lastAccess is now → TTL of 60000ms is NOT expired
      mockDb.get.mockResolvedValue({ ...cachedEntity, lastAccess: new Date() });

      const result = await db.getEntity('test-doi', settings);

      expect(result).not.toBeNull();
      expect(mockDb.get).toHaveBeenCalledWith('entities', 'test-doi');
      // Should NOT call Parser.getBestFit because entity was cached
      expect(Parser.getBestFit).not.toHaveBeenCalled();
    });

    it('deletes and re-fetches when TTL expired', async () => {
      // lastAccess is far in the past → TTL expired
      const oldDate = new Date(Date.now() - 120000);
      mockDb.get.mockResolvedValue({ ...cachedEntity, lastAccess: oldDate });

      // After deletion, Parser.getBestFit returns a new renderer
      const freshRenderer = {
        value: 'test-doi',
        getSettingsKey: vi.fn().mockReturnValue('DOIType'),
        init: vi.fn().mockResolvedValue(undefined),
        isResolvable: vi.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: { fresh: true },
      };
      (Parser.getBestFit as any).mockResolvedValue(freshRenderer);

      const result = await db.getEntity('test-doi', settings);

      // Should have deleted the stale entity
      expect(mockDb.delete).toHaveBeenCalledWith('entities', 'test-doi');
      // Should have called Parser.getBestFit to re-detect
      expect(Parser.getBestFit).toHaveBeenCalled();
      expect(result).toBe(freshRenderer);
    });

    it('calls Parser.getBestFit() on cache miss', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const newRenderer = {
        value: 'new-doi',
        getSettingsKey: vi.fn().mockReturnValue('DOIType'),
        init: vi.fn().mockResolvedValue(undefined),
        isResolvable: vi.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as any).mockResolvedValue(newRenderer);

      const result = await db.getEntity('new-doi', settings);

      expect(Parser.getBestFit).toHaveBeenCalledWith('new-doi', settings, undefined, true);
      expect(result).toBe(newRenderer);
    });

    it('only stores entity when isResolvable() returns true', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const resolvableRenderer = {
        value: 'doi-resolvable',
        getSettingsKey: vi.fn().mockReturnValue('DOIType'),
        init: vi.fn().mockResolvedValue(undefined),
        isResolvable: vi.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as any).mockResolvedValue(resolvableRenderer);

      await db.getEntity('doi-resolvable', settingsNoTtl);

      // addEntity calls db.add internally
      expect(mockDb.add).toHaveBeenCalled();
    });

    it('does NOT store when isResolvable() returns false', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const unresolvableRenderer = {
        value: 'doi-unresolvable',
        getSettingsKey: vi.fn().mockReturnValue('DOIType'),
        init: vi.fn().mockResolvedValue(undefined),
        isResolvable: vi.fn().mockReturnValue(false),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as any).mockResolvedValue(unresolvableRenderer);

      const result = await db.getEntity('doi-unresolvable', settingsNoTtl);

      // Should NOT have called db.add
      expect(mockDb.add).not.toHaveBeenCalled();
      expect(result).toBe(unresolvableRenderer);
    });

    it('returns null when Parser returns null', async () => {
      mockDb.get.mockResolvedValue(undefined);
      (Parser.getBestFit as any).mockResolvedValue(null);

      const result = await db.getEntity('unknown', settings);

      expect(result).toBeNull();
    });

    it('with orderedRendererKeys invalidates cache for wrong renderer', async () => {
      // Cached entity has rendererKey 'DOIType', but we only want 'ORCIDType'
      mockDb.get.mockResolvedValue({ ...cachedEntity, lastAccess: new Date() });

      const freshRenderer = {
        value: 'test-doi',
        getSettingsKey: vi.fn().mockReturnValue('ORCIDType'),
        init: vi.fn().mockResolvedValue(undefined),
        isResolvable: vi.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as any).mockResolvedValue(freshRenderer);

      const result = await db.getEntity('test-doi', settings, ['ORCIDType'], false);

      // Should have deleted the mismatched cache entry
      expect(mockDb.delete).toHaveBeenCalledWith('entities', 'test-doi');
      // Should have re-detected with the ordered list
      expect(Parser.getBestFit).toHaveBeenCalledWith('test-doi', settings, ['ORCIDType'], false);
      expect(result).toBe(freshRenderer);
    });

    it('returns cached entity when TTL is undefined (no TTL setting)', async () => {
      mockDb.get.mockResolvedValue({ ...cachedEntity, lastAccess: new Date() });

      const result = await db.getEntity('test-doi', settingsNoTtl);

      expect(result).not.toBeNull();
      expect(Parser.getBestFit).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // deleteEntity
  // -------------------------------------------------------------------------

  describe('deleteEntity()', () => {
    it('calls db.delete with normalized key', async () => {
      await db.deleteEntity('some-value');

      expect(mockDb.delete).toHaveBeenCalledWith('entities', 'some-value');
    });

    it('also cleans up relations via transaction', async () => {
      await db.deleteEntity('some-value');

      expect(mockDb.transaction).toHaveBeenCalledWith('relations', 'readwrite');
    });
  });

  // -------------------------------------------------------------------------
  // clearEntities
  // -------------------------------------------------------------------------

  describe('clearEntities()', () => {
    it('clears both entities and relations stores', async () => {
      await db.clearEntities();

      expect(mockDb.clear).toHaveBeenCalledWith('entities');
      expect(mockDb.clear).toHaveBeenCalledWith('relations');
    });
  });

  // -------------------------------------------------------------------------
  // normalizeKey (private, tested via public methods)
  // -------------------------------------------------------------------------

  describe('normalizeKey() (via public API)', () => {
    it('returns string for string input', async () => {
      mockDb.get.mockResolvedValue(undefined);
      (Parser.getBestFit as any).mockResolvedValue(null);

      await db.getEntity('my-string-key', settings);

      // db.get should have been called with the string directly
      expect(mockDb.get).toHaveBeenCalledWith('entities', 'my-string-key');
    });

    it('handles non-string inputs by converting to string', async () => {
      mockDb.get.mockResolvedValue(undefined);
      (Parser.getBestFit as any).mockResolvedValue(null);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Force a non-string value through the public API by casting
      await db.getEntity({ weird: 'object' } as unknown as string, settings);

      // normalizeKey should have converted it — the db.get call should receive a string
      const calledWith = mockDb.get.mock.calls[0][1];
      expect(typeof calledWith).toBe('string');
      warnSpy.mockRestore();
    });
  });
});
