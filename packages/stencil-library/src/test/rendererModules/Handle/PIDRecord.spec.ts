import { PIDRecord } from '../../../rendererModules/Handle/PIDRecord';
import { PID } from '../../../rendererModules/Handle/PID';
import { PIDDataType } from '../../../rendererModules/Handle/PIDDataType';

// Mock dependencies
jest.mock('../../../utils/utils', () => ({
  handleMap: new Map(),
  unresolvables: new Set(),
  typeMap: new Map(),
}));
jest.mock('../../../utils/DataCache', () => ({
  cachedFetch: jest.fn(),
}));

describe('PIDRecord', () => {
  const testPID = new PID('21.T11981', 'abc123');

  describe('constructor', () => {
    it('creates a PIDRecord with PID only', () => {
      const record = new PIDRecord(testPID);
      expect(record.pid).toBe(testPID);
      expect(record.values).toBeUndefined();
    });

    it('creates a PIDRecord with PID and values', () => {
      const values = [
        {
          index: 1,
          type: 'URL' as string | PID | PIDDataType,
          data: { format: 'string', value: 'https://example.com' },
          ttl: 86400,
          timestamp: 1704067200000,
        },
      ];
      const record = new PIDRecord(testPID, values);
      expect(record.pid).toBe(testPID);
      expect(record.values).toHaveLength(1);
      expect(record.values[0].type).toBe('URL');
      expect(record.values[0].data.value).toBe('https://example.com');
    });
  });

  describe('pid getter', () => {
    it('returns the PID', () => {
      const record = new PIDRecord(testPID);
      expect(record.pid.prefix).toBe('21.T11981');
      expect(record.pid.suffix).toBe('abc123');
    });
  });

  describe('toObject() and fromJSON() round-trip', () => {
    it('round-trips a record with string type values', () => {
      const values = [
        {
          index: 1,
          type: 'URL' as string | PID | PIDDataType,
          data: { format: 'string', value: 'https://example.com' },
          ttl: 86400,
          timestamp: 1704067200000,
        },
        {
          index: 2,
          type: 'HS_ADMIN' as string | PID | PIDDataType,
          data: { format: 'admin', value: '0.NA/21.T11981' },
          ttl: 86400,
          timestamp: 1704067200000,
        },
      ];
      const record = new PIDRecord(testPID, values);
      const serialized = JSON.stringify(record.toObject());
      const restored = PIDRecord.fromJSON(serialized);

      expect(restored.pid.prefix).toBe('21.T11981');
      expect(restored.pid.suffix).toBe('abc123');
      expect(restored.values).toHaveLength(2);
      expect(restored.values[0].type).toBe('URL');
      expect(restored.values[0].data.value).toBe('https://example.com');
      expect(restored.values[1].type).toBe('HS_ADMIN');
    });

    it('round-trips a record with PID type values', () => {
      const typePID = new PID('21.T11148', '076759916209e5d62bd5');
      const values = [
        {
          index: 1,
          type: typePID as string | PID | PIDDataType,
          data: { format: 'string', value: 'some-value' },
          ttl: 86400,
          timestamp: 1704067200000,
        },
      ];
      const record = new PIDRecord(testPID, values);
      const serialized = JSON.stringify(record.toObject());
      const restored = PIDRecord.fromJSON(serialized);

      expect(restored.values).toHaveLength(1);
      // Restored type should be a PID instance
      expect(restored.values[0].type).toBeInstanceOf(PID);
      const restoredPID = restored.values[0].type as PID;
      expect(restoredPID.prefix).toBe('21.T11148');
      expect(restoredPID.suffix).toBe('076759916209e5d62bd5');
    });

    it('round-trips a record with PIDDataType type values', () => {
      const typePID = new PID('21.T11148', 'testtype');
      const dataType = new PIDDataType(typePID, 'TestName', 'A test data type', 'https://example.com');
      const values = [
        {
          index: 1,
          type: dataType as string | PID | PIDDataType,
          data: { format: 'string', value: 'typed-value' },
          ttl: 86400,
          timestamp: 1704067200000,
        },
      ];
      const record = new PIDRecord(testPID, values);
      const serialized = JSON.stringify(record.toObject());
      const restored = PIDRecord.fromJSON(serialized);

      expect(restored.values).toHaveLength(1);
      expect(restored.values[0].type).toBeInstanceOf(PIDDataType);
      const restoredType = restored.values[0].type as PIDDataType;
      expect(restoredType.name).toBe('TestName');
      expect(restoredType.description).toBe('A test data type');
    });
  });

  describe('toObject()', () => {
    it('serializes pid and values', () => {
      const values = [
        {
          index: 1,
          type: 'URL' as string | PID | PIDDataType,
          data: { format: 'string', value: 'https://example.com' },
          ttl: 86400,
          timestamp: 1704067200000,
        },
      ];
      const record = new PIDRecord(testPID, values);
      const obj = record.toObject();

      expect(obj.pid).toBeDefined();
      expect(JSON.parse(obj.pid)).toEqual({ prefix: '21.T11981', suffix: 'abc123' });
      expect(obj.values).toHaveLength(1);
      // Each value is a JSON string
      expect(typeof obj.values[0]).toBe('string');
    });
  });
});
