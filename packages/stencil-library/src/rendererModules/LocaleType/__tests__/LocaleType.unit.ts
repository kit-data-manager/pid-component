import { describe, it, expect } from 'vitest';
import { LocaleType } from '../LocaleType';

const LOCALE_examples = {
  EN_US: 'en-US',
  DE_DE: 'de-DE',
  EN_GB: 'en-GB',
  FR_FR: 'fr-FR',
  INVALID_FREE_TEXT: 'english',
  INVALID_NUMERIC: '123',
  INVALID_EMPTY: '',
} as const;

describe('LocaleType', () => {
  describe('quickCheck()', () => {
    it('returns true for "en-US"', () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      expect(lt.quickCheck()).toBe(true);
    });

    it('returns true for bare two-letter code "de"', () => {
      const lt = new LocaleType(LOCALE_examples.DE_DE);
      expect(lt.quickCheck()).toBe(true);
    });

    it('returns true for "fr-FR"', () => {
      const lt = new LocaleType(LOCALE_examples.FR_FR);
      expect(lt.quickCheck()).toBe(true);
    });

    it('returns false for full word "english"', () => {
      const lt = new LocaleType(LOCALE_examples.INVALID_FREE_TEXT);
      expect(lt.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const lt = new LocaleType(LOCALE_examples.INVALID_EMPTY);
      expect(lt.quickCheck()).toBe(false);
    });

    it('returns false for numeric string', () => {
      const lt = new LocaleType(LOCALE_examples.INVALID_NUMERIC);
      expect(lt.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() result', async () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      expect(await lt.hasMeaningfulInformation()).toBe(lt.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "LocaleType"', () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      expect(lt.getSettingsKey()).toBe('LocaleType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      expect(lt.value).toBe(LOCALE_examples.EN_US);
    });
  });

  describe('init()', () => {
    it('completes without error and returns undefined', async () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      await expect(lt.init()).resolves.toBeUndefined();
    });

    it('does not populate items (LocaleType has no init logic)', async () => {
      const lt = new LocaleType(LOCALE_examples.DE_DE);
      await lt.init();
      expect(lt.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value', () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      const preview = lt.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    it('returns true (default behavior)', () => {
      const lt = new LocaleType(LOCALE_examples.EN_US);
      expect(lt.isResolvable()).toBe(true);
    });
  });
});