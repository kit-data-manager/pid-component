// Polyfill `self` before any module imports (DataCache uses `self.caches`)
(globalThis as any).self = (globalThis as any).self || globalThis;

import { describe, it, expect, vi } from 'vitest';
import { PID } from '../../../rendererModules/Handle/PID';

// Mock the modules that PID.ts imports at the top level
vi.mock('../../../utils/utils', () => ({
  handleMap: new Map(),
  unresolvables: new Set(),
}));
vi.mock('../../../utils/DataCache', () => ({
  cachedFetch: vi.fn(),
}));

describe('PID', () => {
  describe('isPID()', () => {
    it('returns true for a valid Handle PID', () => {
      expect(PID.isPID('21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6')).toBe(true);
    });

    it('returns true for a numeric prefix/suffix', () => {
      expect(PID.isPID('20.500/12345')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(PID.isPID('')).toBe(false);
    });

    it('returns false for string without slash', () => {
      expect(PID.isPID('noslash')).toBe(false);
    });

    it('returns false for string with only a slash', () => {
      expect(PID.isPID('/')).toBe(false);
    });

    it('returns true for alphanumeric prefix and suffix with special chars', () => {
      // The regex allows ! through ~ (ASCII printable excl space) in suffix
      expect(PID.isPID('21.T11981/some-suffix_v2')).toBe(true);
    });
  });

  describe('getPIDFromString()', () => {
    it('extracts prefix and suffix from a valid PID', () => {
      const pid = PID.getPIDFromString('21.T11981/be908bd1');
      expect(pid.prefix).toBe('21.T11981');
      expect(pid.suffix).toBe('be908bd1');
    });

    it('throws for invalid PID string', () => {
      expect(() => PID.getPIDFromString('invalid')).toThrow('Invalid input');
    });

    it('preserves slashes in the suffix', () => {
      const pid = PID.getPIDFromString('21.T11981/abc/def');
      expect(pid.prefix).toBe('21.T11981');
      expect(pid.suffix).toBe('abc/def');
      expect(pid.toString()).toBe('21.T11981/abc/def');
    });

    it('preserves multiple slashes in the suffix', () => {
      const pid = PID.getPIDFromString('10.5445/IR/1000178054');
      expect(pid.prefix).toBe('10.5445');
      expect(pid.suffix).toBe('IR/1000178054');
      expect(pid.toString()).toBe('10.5445/IR/1000178054');
    });
  });

  describe('toString()', () => {
    it('returns "prefix/suffix"', () => {
      const pid = new PID('21.T11981', 'abc123');
      expect(pid.toString()).toBe('21.T11981/abc123');
    });
  });

  describe('prefix / suffix getters', () => {
    it('returns the correct prefix', () => {
      const pid = new PID('21.T11981', 'suffix');
      expect(pid.prefix).toBe('21.T11981');
    });

    it('returns the correct suffix', () => {
      const pid = new PID('21.T11981', 'suffix');
      expect(pid.suffix).toBe('suffix');
    });
  });

  describe('isResolvable()', () => {
    it('returns true for a normal prefix', () => {
      const pid = new PID('21.T11981', 'abc');
      expect(pid.isResolvable()).toBe(true);
    });

    it('returns false for prefix "0"', () => {
      const pid = new PID('0', 'abc');
      expect(pid.isResolvable()).toBe(false);
    });

    it('returns false for HS_ prefix', () => {
      const pid = new PID('HS_ADMIN', 'abc');
      expect(pid.isResolvable()).toBe(false);
    });

    it('returns false for prefix "10320"', () => {
      const pid = new PID('10320', 'loc');
      expect(pid.isResolvable()).toBe(false);
    });
  });

  describe('fromJSON()', () => {
    it('round-trips through toObject / fromJSON', () => {
      const original = new PID('21.T11981', 'xyz');
      const serialized = JSON.stringify(original.toObject());
      const restored = PID.fromJSON(serialized);
      expect(restored.prefix).toBe(original.prefix);
      expect(restored.suffix).toBe(original.suffix);
    });

    it('reconstructs from serialized data with complex suffix', () => {
      const original = new PID('20.500', 'be908bd1-e049-4d35');
      const serialized = JSON.stringify(original.toObject());
      const restored = PID.fromJSON(serialized);
      expect(restored.prefix).toBe('20.500');
      expect(restored.suffix).toBe('be908bd1-e049-4d35');
      expect(restored.toString()).toBe('20.500/be908bd1-e049-4d35');
    });
  });

  describe('resolve() prerequisites', () => {
    it('isResolvable returns true for a normal prefix', () => {
      const pid = new PID('21.T11981', 'be908bd1');
      expect(pid.isResolvable()).toBe(true);
    });

    it('returns false for unresolvable PID (prefix "0")', () => {
      const pid = new PID('0', 'abc');
      expect(pid.isResolvable()).toBe(false);
    });

    it('returns false for HS_ADMIN prefix', () => {
      const pid = new PID('HS_ADMIN', 'test');
      expect(pid.isResolvable()).toBe(false);
    });

    it('returns false for 10320 prefix', () => {
      const pid = new PID('10320', 'loc');
      expect(pid.isResolvable()).toBe(false);
    });
  });

  describe('toURL()', () => {
    it('toString returns handle string for URL construction', () => {
      const pid = new PID('21.T11981', 'abc123');
      const url = `https://hdl.handle.net/${pid.toString()}`;
      expect(url).toBe('https://hdl.handle.net/21.T11981/abc123');
    });
  });

  describe('toObject()', () => {
    it('returns object with prefix and suffix', () => {
      const pid = new PID('21.T11981', 'test-suffix');
      const obj = pid.toObject();
      expect(obj).toEqual({ prefix: '21.T11981', suffix: 'test-suffix' });
    });
  });
});
