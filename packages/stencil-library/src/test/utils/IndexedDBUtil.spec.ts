// ---------------------------------------------------------------------------
// Mocks — must be declared before imports that trigger module evaluation
// ---------------------------------------------------------------------------

const mockDb = {
  get: jest.fn(),
  put: jest.fn(),
  add: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  getAll: jest.fn(),
  transaction: jest.fn().mockReturnValue({
    store: {
      index: jest.fn().mockReturnValue({
        openCursor: jest.fn().mockResolvedValue(null),
      }),
      add: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    },
    done: Promise.resolve(),
  }),
};

jest.mock('@tempfix/idb', () => ({
  openDB: jest.fn().mockResolvedValue(mockDb),
}));

jest.mock('../../utils/Parser', () => ({
  Parser: {
    getBestFit: jest.fn(),
  },
}));

// Mock the renderers array from utils
const mockRendererConstructor = jest.fn().mockImplementation((value: string, settings?: unknown) => ({
  value,
  settings,
  init: jest.fn().mockResolvedValue(undefined),
  getSettingsKey: jest.fn().mockReturnValue('DOIType'),
  isResolvable: jest.fn().mockReturnValue(true),
  items: [],
  data: { some: 'data' },
}));

jest.mock('../../utils/utils', () => ({
  renderers: [
    { priority: 0, key: 'DOIType', constructor: mockRendererConstructor },
    { priority: 1, key: 'ORCIDType', constructor: jest.fn() },
    { priority: 99, key: 'FallbackType', constructor: jest.fn() },
  ],
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { Database } from '../../utils/IndexedDBUtil';
import { Parser } from '../../utils/Parser';

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
    jest.clearAllMocks();
    // Reset the transaction mock for each test
    mockDb.transaction.mockReturnValue({
      store: {
        index: jest.fn().mockReturnValue({
          openCursor: jest.fn().mockResolvedValue(null),
        }),
        add: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
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
        getSettingsKey: jest.fn().mockReturnValue('DOIType'),
        init: jest.fn().mockResolvedValue(undefined),
        isResolvable: jest.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: { fresh: true },
      };
      (Parser.getBestFit as jest.Mock).mockResolvedValue(freshRenderer);

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
        getSettingsKey: jest.fn().mockReturnValue('DOIType'),
        init: jest.fn().mockResolvedValue(undefined),
        isResolvable: jest.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as jest.Mock).mockResolvedValue(newRenderer);

      const result = await db.getEntity('new-doi', settings);

      expect(Parser.getBestFit).toHaveBeenCalledWith('new-doi', settings, undefined, true);
      expect(result).toBe(newRenderer);
    });

    it('only stores entity when isResolvable() returns true', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const resolvableRenderer = {
        value: 'doi-resolvable',
        getSettingsKey: jest.fn().mockReturnValue('DOIType'),
        init: jest.fn().mockResolvedValue(undefined),
        isResolvable: jest.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as jest.Mock).mockResolvedValue(resolvableRenderer);

      await db.getEntity('doi-resolvable', settingsNoTtl);

      // addEntity calls db.add internally
      expect(mockDb.add).toHaveBeenCalled();
    });

    it('does NOT store when isResolvable() returns false', async () => {
      mockDb.get.mockResolvedValue(undefined);

      const unresolvableRenderer = {
        value: 'doi-unresolvable',
        getSettingsKey: jest.fn().mockReturnValue('DOIType'),
        init: jest.fn().mockResolvedValue(undefined),
        isResolvable: jest.fn().mockReturnValue(false),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as jest.Mock).mockResolvedValue(unresolvableRenderer);

      const result = await db.getEntity('doi-unresolvable', settingsNoTtl);

      // Should NOT have called db.add
      expect(mockDb.add).not.toHaveBeenCalled();
      expect(result).toBe(unresolvableRenderer);
    });

    it('returns null when Parser returns null', async () => {
      mockDb.get.mockResolvedValue(undefined);
      (Parser.getBestFit as jest.Mock).mockResolvedValue(null);

      const result = await db.getEntity('unknown', settings);

      expect(result).toBeNull();
    });

    it('with orderedRendererKeys invalidates cache for wrong renderer', async () => {
      // Cached entity has rendererKey 'DOIType', but we only want 'ORCIDType'
      mockDb.get.mockResolvedValue({ ...cachedEntity, lastAccess: new Date() });

      const freshRenderer = {
        value: 'test-doi',
        getSettingsKey: jest.fn().mockReturnValue('ORCIDType'),
        init: jest.fn().mockResolvedValue(undefined),
        isResolvable: jest.fn().mockReturnValue(true),
        settings: undefined as unknown,
        items: [],
        data: {},
      };
      (Parser.getBestFit as jest.Mock).mockResolvedValue(freshRenderer);

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
      (Parser.getBestFit as jest.Mock).mockResolvedValue(null);

      await db.getEntity('my-string-key', settings);

      // db.get should have been called with the string directly
      expect(mockDb.get).toHaveBeenCalledWith('entities', 'my-string-key');
    });

    it('handles non-string inputs by converting to string', async () => {
      mockDb.get.mockResolvedValue(undefined);
      (Parser.getBestFit as jest.Mock).mockResolvedValue(null);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Force a non-string value through the public API by casting
      await db.getEntity({ weird: 'object' } as unknown as string, settings);

      // normalizeKey should have converted it — the db.get call should receive a string
      const calledWith = mockDb.get.mock.calls[0][1];
      expect(typeof calledWith).toBe('string');
      warnSpy.mockRestore();
    });
  });
});
