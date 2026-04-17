// DataCache.ts uses `self.caches` (a browser/worker global). In Jest's Node
// environment `self` is not defined, so we need to polyfill it on `globalThis`
// before importing the module.
(globalThis as any).self = globalThis;

import { cachedFetch, clearCache } from '../../utils/DataCache';

describe('DataCache', () => {
  let originalFetch: typeof global.fetch;
  let originalCaches: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalCaches = (globalThis as any).caches;

    // Remove caches so the module-level open() finds no Cache API
    delete (globalThis as any).caches;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalCaches !== undefined) {
      (globalThis as any).caches = originalCaches;
    } else {
      delete (globalThis as any).caches;
    }
  });

  describe('cachedFetch() without cache API available', () => {
    it('falls back to fetch when no cache is available', async () => {
      const mockData = { name: 'test-resource' };
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response;

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await cachedFetch('https://example.com/api/data');

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/data', undefined);
      expect(result).toEqual(mockData);
    });

    it('passes init options through to fetch', async () => {
      const mockData = { result: 'ok' };
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response;
      const init = { headers: { Authorization: 'Bearer token' } };

      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await cachedFetch('https://example.com/api/data', init);

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/data', init);
      expect(result).toEqual(mockData);
    });
  });

  describe('cachedFetch() with cache API available', () => {
    let mockCache: {
      match: jest.Mock;
      put: jest.Mock;
      delete: jest.Mock;
    };

    beforeEach(() => {
      mockCache = {
        match: jest.fn(),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(true),
      };

      (globalThis as any).caches = {
        open: jest.fn().mockResolvedValue(mockCache),
      };
    });

    it('returns cached response when cache hit occurs', async () => {
      const cachedData = { cached: true };
      const cachedResponse = {
        json: jest.fn().mockResolvedValue(cachedData),
      };
      mockCache.match.mockResolvedValue(cachedResponse);
      global.fetch = jest.fn();

      const result = await cachedFetch('https://example.com/resource');

      expect(mockCache.match).toHaveBeenCalledWith('https://example.com/resource');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(result).toEqual(cachedData);
    });

    it('fetches from network, caches, and returns data on cache miss for https URL', async () => {
      mockCache.match.mockResolvedValue(undefined);

      const networkData = { fresh: true };
      const clonedResponse = {} as Response;
      const networkResponse = {
        json: jest.fn().mockResolvedValue(networkData),
        clone: jest.fn().mockReturnValue(clonedResponse),
      } as unknown as Response;

      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      const result = await cachedFetch('https://example.com/resource');

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/resource', undefined);
      expect(mockCache.put).toHaveBeenCalledWith('https://example.com/resource', clonedResponse);
      expect(result).toEqual(networkData);
    });

    it('upgrades http to https when fetching on cache miss', async () => {
      mockCache.match.mockResolvedValue(undefined);

      const networkData = { upgraded: true };
      const clonedResponse = {} as Response;
      const networkResponse = {
        json: jest.fn().mockResolvedValue(networkData),
        clone: jest.fn().mockReturnValue(clonedResponse),
      } as unknown as Response;

      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      const result = await cachedFetch('http://example.com/resource');

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/resource', undefined);
      expect(result).toEqual(networkData);
    });
  });

  describe('clearCache()', () => {
    it('works without error when no cache instance exists', async () => {
      // No caches API available, so cacheInstance is never set
      await expect(clearCache()).resolves.toBeUndefined();
    });

    it('calls delete on the cache instance when it exists', async () => {
      const mockCache = {
        match: jest.fn(),
        put: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(true),
      };

      (globalThis as any).caches = {
        open: jest.fn().mockResolvedValue(mockCache),
      };

      // Trigger open() by calling cachedFetch so cacheInstance is populated
      const mockResponse = {
        json: jest.fn().mockResolvedValue({}),
      };
      mockCache.match.mockResolvedValue(mockResponse);
      global.fetch = jest.fn();

      await cachedFetch('https://example.com/init');

      // Now clear the cache
      await clearCache();

      expect(mockCache.delete).toHaveBeenCalledWith('pid-component');
    });
  });
});
