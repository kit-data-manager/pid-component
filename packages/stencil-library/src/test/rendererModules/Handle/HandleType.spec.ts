import { HandleType } from '../../../rendererModules/Handle/HandleType';

// Mock PID module dependencies
jest.mock('../../../utils/utils', () => ({
  handleMap: new Map(),
  unresolvables: new Set(),
}));
jest.mock('../../../utils/DataCache', () => ({
  cachedFetch: jest.fn(),
}));

describe('HandleType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for a valid Handle PID', () => {
      const ht = new HandleType('21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6');
      expect(ht.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for a numeric PID', () => {
      const ht = new HandleType('20.500/12345');
      expect(ht.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for a non-PID string', () => {
      const ht = new HandleType('not-a-pid');
      expect(ht.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ht = new HandleType('');
      expect(ht.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result', async () => {
      const ht = new HandleType('21.T11981/abc123');
      expect(await ht.hasCorrectFormat()).toBe(ht.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "HandleType"', () => {
      const ht = new HandleType('21.T11981/abc123');
      expect(ht.getSettingsKey()).toBe('HandleType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ht = new HandleType('21.T11981/abc123');
      expect(ht.value).toBe('21.T11981/abc123');
    });
  });

  describe('init()', () => {
    it('loads PIDRecord from cached JSON when data is provided', async () => {
      // Build a valid serialized PIDRecord
      const serializedRecord = JSON.stringify({
        pid: JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' }),
        values: [
          JSON.stringify({
            index: 1,
            type: JSON.stringify({ string: 'URL' }),
            data: JSON.stringify({ format: 'string', value: 'https://example.com' }),
            ttl: 86400,
            timestamp: 1704067200000,
          }),
        ],
      });

      const ht = new HandleType('21.T11981/abc123');
      await ht.init(serializedRecord);

      expect(ht.actions.length).toBeGreaterThanOrEqual(2);
      expect(ht.actions[0].title).toBe('Open in FAIR-DOscope');
      expect(ht.actions[1].title).toBe('View in Handle.net registry');
    });

    it('populates items from PIDRecord values with string types', async () => {
      const serializedRecord = JSON.stringify({
        pid: JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' }),
        values: [
          JSON.stringify({
            index: 1,
            type: JSON.stringify({ string: 'URL' }),
            data: JSON.stringify({ format: 'string', value: 'https://example.com' }),
            ttl: 86400,
            timestamp: 1704067200000,
          }),
        ],
      });

      const ht = new HandleType('21.T11981/abc123');
      await ht.init(serializedRecord);

      // String types don't get added as items (only PIDDataType instances do)
      // But actions should still be populated
      expect(ht.actions.length).toBe(2);
    });
  });

  describe('isResolvable()', () => {
    it('returns true when PID record has values', async () => {
      const serializedRecord = JSON.stringify({
        pid: JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' }),
        values: [
          JSON.stringify({
            index: 1,
            type: JSON.stringify({ string: 'URL' }),
            data: JSON.stringify({ format: 'string', value: 'https://example.com' }),
            ttl: 86400,
            timestamp: 1704067200000,
          }),
        ],
      });

      const ht = new HandleType('21.T11981/abc123');
      await ht.init(serializedRecord);

      expect(ht.isResolvable()).toBe(true);
    });

    it('returns false when PID record has no values', async () => {
      const serializedRecord = JSON.stringify({
        pid: JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' }),
        values: [],
      });

      const ht = new HandleType('21.T11981/abc123');
      await ht.init(serializedRecord);

      expect(ht.isResolvable()).toBe(false);
    });
  });

  describe('renderPreview()', () => {
    it('returns a truthy value (functional component)', async () => {
      const serializedRecord = JSON.stringify({
        pid: JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' }),
        values: [
          JSON.stringify({
            index: 1,
            type: JSON.stringify({ string: 'URL' }),
            data: JSON.stringify({ format: 'string', value: 'https://example.com' }),
            ttl: 86400,
            timestamp: 1704067200000,
          }),
        ],
      });

      const ht = new HandleType('21.T11981/abc123');
      await ht.init(serializedRecord);

      const preview = ht.renderPreview();
      expect(preview).toBeTruthy();
    });
  });

  describe('data getter', () => {
    it('returns serialized PIDRecord as JSON string', async () => {
      const serializedRecord = JSON.stringify({
        pid: JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' }),
        values: [
          JSON.stringify({
            index: 1,
            type: JSON.stringify({ string: 'URL' }),
            data: JSON.stringify({ format: 'string', value: 'https://example.com' }),
            ttl: 86400,
            timestamp: 1704067200000,
          }),
        ],
      });

      const ht = new HandleType('21.T11981/abc123');
      await ht.init(serializedRecord);

      const data = ht.data;
      expect(typeof data).toBe('string');
      const parsed = JSON.parse(data);
      expect(parsed.pid).toBeDefined();
      expect(parsed.values).toBeDefined();
    });
  });
});
