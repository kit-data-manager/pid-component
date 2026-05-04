import { describe, expect, it } from 'vitest';
import { DateType } from '../DateType';

const DATE_examples = {
  ISO_8601: '2022-11-11T08:01:20.557+00:00',
  ISO_8601_ALT: '2024-06-15T09:30:00.000+02:00',
  DATE_ONLY: '2024-06-15',
  DATETIME_SHORT: '2023-11-20T00:00:00.000+01:00',
  INVALID_DATE_ONLY: '06-15',
  INVALID_NO_TIMEZONE: '2024-06-15T09:30:00',
  INVALID_NOT_A_DATE: 'not-a-date',
  INVALID_EMPTY: '',
} as const;

describe('DateType', () => {
  describe('quickCheck()', () => {
    it('returns true for valid ISO 8601 with positive timezone offset', () => {
      const dt = new DateType(DATE_examples.ISO_8601_ALT);
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns true for valid ISO 8601 with Z (UTC) timezone', () => {
      const dt = new DateType(DATE_examples.ISO_8601);
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns true for valid ISO 8601 with negative timezone offset', () => {
      const dt = new DateType('2024-01-01T00:00:00-05:00');
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns false for plain date without time', () => {
      const dt = new DateType(DATE_examples.DATE_ONLY);
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for random text', () => {
      const dt = new DateType(DATE_examples.INVALID_NOT_A_DATE);
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for date with time but no timezone', () => {
      const dt = new DateType(DATE_examples.INVALID_NO_TIMEZONE);
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const dt = new DateType(DATE_examples.INVALID_EMPTY);
      expect(dt.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() result for a valid date', async () => {
      const dt = new DateType(DATE_examples.ISO_8601_ALT);
      const quick = dt.quickCheck();
      const full = await dt.hasMeaningfulInformation();
      expect(full).toBe(quick);
    });

    it('matches quickCheck() result for an invalid date', async () => {
      const dt = new DateType(DATE_examples.INVALID_NOT_A_DATE);
      const quick = dt.quickCheck();
      const full = await dt.hasMeaningfulInformation();
      expect(full).toBe(quick);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "DateType"', () => {
      const dt = new DateType(DATE_examples.ISO_8601);
      expect(dt.getSettingsKey()).toBe('DateType');
    });
  });

  describe('init()', () => {
    it('completes without error for a valid date', async () => {
      const dt = new DateType(DATE_examples.ISO_8601_ALT);
      await expect(dt.init()).resolves.toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const dt = new DateType(DATE_examples.ISO_8601);
      expect(dt.value).toBe(DATE_examples.ISO_8601);
    });
  });
});
