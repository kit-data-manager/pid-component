import { describe, it, expect } from 'vitest';
import { DateType } from '../../rendererModules/DateType';

describe('DateType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for valid ISO 8601 with positive timezone offset', () => {
      const dt = new DateType('2024-06-15T09:30:00.000+02:00');
      expect(dt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for valid ISO 8601 with Z (UTC) timezone', () => {
      const dt = new DateType('2024-06-15T09:30:00Z');
      expect(dt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for valid ISO 8601 with negative timezone offset', () => {
      const dt = new DateType('2024-01-01T00:00:00-05:00');
      expect(dt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for plain date without time', () => {
      const dt = new DateType('2024-06-15');
      expect(dt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for random text', () => {
      const dt = new DateType('hello');
      expect(dt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for date with time but no timezone', () => {
      const dt = new DateType('2024-06-15T09:30:00');
      expect(dt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const dt = new DateType('');
      expect(dt.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result for a valid date', async () => {
      const dt = new DateType('2024-06-15T09:30:00.000+02:00');
      const quick = dt.hasCorrectFormatQuick();
      const full = await dt.hasCorrectFormat();
      expect(full).toBe(quick);
    });

    it('matches hasCorrectFormatQuick() result for an invalid date', async () => {
      const dt = new DateType('not-a-date');
      const quick = dt.hasCorrectFormatQuick();
      const full = await dt.hasCorrectFormat();
      expect(full).toBe(quick);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "DateType"', () => {
      const dt = new DateType('2024-06-15T09:30:00Z');
      expect(dt.getSettingsKey()).toBe('DateType');
    });
  });

  describe('init()', () => {
    it('completes without error for a valid date', () => {
      const dt = new DateType('2024-06-15T09:30:00.000+02:00');
      expect(dt.init()).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const dt = new DateType('2024-06-15T09:30:00Z');
      expect(dt.value).toBe('2024-06-15T09:30:00Z');
    });
  });
});
