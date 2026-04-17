import { PIDDataType } from '../../../rendererModules/Handle/PIDDataType';
import { PID } from '../../../rendererModules/Handle/PID';

// Mock dependencies
jest.mock('../../../utils/utils', () => ({
  handleMap: new Map(),
  unresolvables: new Set(),
  typeMap: new Map(),
}));
jest.mock('../../../utils/DataCache', () => ({
  cachedFetch: jest.fn(),
}));

describe('PIDDataType', () => {
  describe('constructor and getters', () => {
    it('stores all properties', () => {
      const pid = new PID('21.T11148', 'testtype');
      const dt = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com', /^test$/);

      expect(dt.pid).toBe(pid);
      expect(dt.name).toBe('TestName');
      expect(dt.description).toBe('A description');
      expect(dt.redirectURL).toBe('https://example.com');
      expect(dt.regex).toEqual(/^test$/);
    });

    it('handles undefined regex', () => {
      const pid = new PID('21.T11148', 'testtype');
      const dt = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com');

      expect(dt.regex).toBeUndefined();
    });
  });

  describe('fromJSON()', () => {
    it('reconstructs a PIDDataType from serialized JSON', () => {
      const pid = new PID('21.T11148', 'testtype');
      const original = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com');
      const serialized = JSON.stringify(original.toObject());
      const restored = PIDDataType.fromJSON(serialized);

      expect(restored.name).toBe('TestName');
      expect(restored.description).toBe('A description');
      expect(restored.redirectURL).toBe('https://example.com');
      expect(restored.pid.prefix).toBe('21.T11148');
      expect(restored.pid.suffix).toBe('testtype');
    });
  });

  describe('toObject()', () => {
    it('serializes all properties', () => {
      const pid = new PID('21.T11148', 'testtype');
      const dt = new PIDDataType(pid, 'TestName', 'A description', 'https://example.com');
      const obj = dt.toObject();

      expect(obj.pid).toBeDefined();
      expect(obj.name).toBe('TestName');
      expect(obj.description).toBe('A description');
      expect(obj.redirectURL).toBe('https://example.com');
    });
  });

  describe('resolveDataType()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns undefined for non-resolvable PID', async () => {
      // PID with prefix "0" is not resolvable
      const pid = new PID('0', 'test');

      const result = await PIDDataType.resolveDataType(pid);

      expect(result).toBeUndefined();
    });
  });
});
