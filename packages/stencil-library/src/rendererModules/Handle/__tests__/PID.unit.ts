import { describe, it, expect, vi } from 'vitest';

// Mock PID module dependencies before importing PID
vi.mock('../../../utils/utils', () => ({
  handleMap: new Map(),
  unresolvables: new Set(),
  typeMap: new Map(),
  renderers: [],
}));

vi.mock('../../../utils/DataCache', () => ({
  cachedFetch: vi.fn(),
}));

import { PID } from '../PID';

describe('PID', () => {
  describe('constructor', () => {
    it('creates a PID with prefix and suffix', () => {
      const pid = new PID('21.T11981', 'abc123');
      expect(pid.prefix).toBe('21.T11981');
      expect(pid.suffix).toBe('abc123');
    });

    it('creates a PID with empty suffix', () => {
      const pid = new PID('21.T11981', '');
      expect(pid.prefix).toBe('21.T11981');
      expect(pid.suffix).toBe('');
    });
  });

  describe('isPID()', () => {
    it('returns true for valid PID format', () => {
      expect(PID.isPID('21.T11981/abc123')).toBe(true);
    });

    it('returns false for invalid PID format', () => {
      expect(PID.isPID('not a pid')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(PID.isPID('')).toBe(false);
    });

    it('returns false for string without slash', () => {
      expect(PID.isPID('21T11981abc123')).toBe(false);
    });
  });

  describe('getPIDFromString()', () => {
    it('creates PID from valid string', () => {
      const pid = PID.getPIDFromString('21.T11981/abc123');
      expect(pid.prefix).toBe('21.T11981');
      expect(pid.suffix).toBe('abc123');
    });

    it('throws error for invalid string', () => {
      expect(() => PID.getPIDFromString('invalid')).toThrow('Invalid input');
    });

    it('throws error for empty string', () => {
      expect(() => PID.getPIDFromString('')).toThrow('Invalid input');
    });
  });

  describe('fromJSON()', () => {
    it('deserializes from JSON string', () => {
      const json = JSON.stringify({ prefix: '21.T11981', suffix: 'abc123' });
      const pid = PID.fromJSON(json);
      expect(pid.prefix).toBe('21.T11981');
      expect(pid.suffix).toBe('abc123');
    });

    it('throws error for invalid JSON', () => {
      expect(() => PID.fromJSON('not json')).toThrow();
    });
  });

  describe('toString()', () => {
    it('outputs PID as string', () => {
      const pid = new PID('21.T11981', 'abc123');
      expect(pid.toString()).toBe('21.T11981/abc123');
    });

    it('outputs PID with empty suffix', () => {
      const pid = new PID('21.T11981', '');
      expect(pid.toString()).toBe('21.T11981/');
    });
  });

  describe('toObject()', () => {
    it('returns object with prefix and suffix', () => {
      const pid = new PID('21.T11981', 'abc123');
      expect(pid.toObject()).toEqual({ prefix: '21.T11981', suffix: 'abc123' });
    });
  });
});