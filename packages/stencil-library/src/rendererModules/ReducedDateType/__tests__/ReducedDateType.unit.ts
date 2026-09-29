import { describe, expect, it } from 'vitest';
import { ReducedDateType } from '../ReducedDateType';

describe('ReducedDateType', () => {
  describe('quickCheck()', () => {
    it('returns true for a year-only value', () => {
      const dt = new ReducedDateType('2023');
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns true for a year-month value', () => {
      const dt = new ReducedDateType('2023-01');
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns false for a full date (handled by DateType)', () => {
      const dt = new ReducedDateType('2023-01-18');
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for a datetime', () => {
      const dt = new ReducedDateType('2023-01-18T09:21:00');
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for random text', () => {
      const dt = new ReducedDateType('not-a-date');
      expect(dt.quickCheck()).toBe(false);
    });
  });

  describe('renderPreview()', () => {
    it('renders a preview for a year-only value', async () => {
      const dt = new ReducedDateType('2023');
      await dt.init();
      expect(dt.renderPreview()).toBeTruthy();
    });

    it('renders a preview for a year-month value', async () => {
      const dt = new ReducedDateType('2023-01');
      await dt.init();
      expect(dt.renderPreview()).toBeTruthy();
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "ReducedDateType"', () => {
      const dt = new ReducedDateType('2023');
      expect(dt.getSettingsKey()).toBe('ReducedDateType');
    });
  });
});
