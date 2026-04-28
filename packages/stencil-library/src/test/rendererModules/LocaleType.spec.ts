import { describe, it, expect } from 'vitest';
import { LocaleType } from '../../rendererModules/LocaleType';
import { LOCALE_examples } from '../../../../../examples/locale/values.ts';

describe('LocaleType', () => {
  describe('quickCheck()', () => {
    it('returns true for "en-US"', () => {
      const lt = new LocaleType('en-US');
      expect(lt.quickCheck()).toBe(true);
    });

    it('returns true for bare two-letter code "de"', () => {
      const lt = new LocaleType('de');
      expect(lt.quickCheck()).toBe(true);
    });

    it('returns true for "fr-FR"', () => {
      const lt = new LocaleType('fr-FR');
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
      const lt = new LocaleType('en-US');
      expect(await lt.hasMeaningfulInformation()).toBe(lt.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "LocaleType"', () => {
      const lt = new LocaleType('en-US');
      expect(lt.getSettingsKey()).toBe('LocaleType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const lt = new LocaleType('en-US');
      expect(lt.value).toBe('en-US');
    });
  });

  describe('init()', () => {
    it('completes without error and returns undefined', () => {
      const lt = new LocaleType('en-US');
      expect(lt.init()).toBeUndefined();
    });

    it('does not populate items (LocaleType has no init logic)', () => {
      const lt = new LocaleType('de');
      lt.init();
      expect(lt.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value', () => {
      const lt = new LocaleType('en-US');
      const preview = lt.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    it('returns true (default behavior)', () => {
      const lt = new LocaleType('en-US');
      expect(lt.isResolvable()).toBe(true);
    });
  });
});
