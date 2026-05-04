import { describe, expect, it } from 'vitest';
import { URLType } from '../URLType';

const URL_examples = {
  KIT_WEBSITE: 'https://scc.kit.edu',
  GITHUB: 'https://github.com/kit-data-manager/pid-component',
  ZENODO: 'https://zenodo.org',
  INVALID_NOT_A_URL: 'not-a-url',
  INVALID_WRONG_PROTOCOL: '://example.com',
  INVALID_EMPTY: '',
} as const;

describe('URLType', () => {
  describe('quickCheck()', () => {
    it('returns true for https URL', () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      expect(ut.quickCheck()).toBe(true);
    });

    it('returns true for http URL with path, query and hash', () => {
      const ut = new URLType('http://example.com/path?q=1#hash');
      expect(ut.quickCheck()).toBe(true);
    });

    it('returns true for https URL with complex path', () => {
      const ut = new URLType(URL_examples.GITHUB);
      expect(ut.quickCheck()).toBe(true);
    });

    it('returns false for string without scheme', () => {
      const ut = new URLType(URL_examples.INVALID_NOT_A_URL);
      expect(ut.quickCheck()).toBe(false);
    });

    it('returns false for ftp URL', () => {
      const ut = new URLType(URL_examples.INVALID_WRONG_PROTOCOL);
      expect(ut.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ut = new URLType(URL_examples.INVALID_EMPTY);
      expect(ut.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() result', async () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      expect(await ut.hasMeaningfulInformation()).toBe(ut.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "URLType"', () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      expect(ut.getSettingsKey()).toBe('URLType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      expect(ut.value).toBe(URL_examples.KIT_WEBSITE);
    });
  });

  describe('init()', () => {
    it('completes without error and returns undefined', async () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      await expect(ut.init()).resolves.toBeUndefined();
    });

    it('does not populate items (URLType has no init logic)', async () => {
      const ut = new URLType(URL_examples.GITHUB);
      await ut.init();
      expect(ut.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value', () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      const preview = ut.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    it('returns true (default behavior)', () => {
      const ut = new URLType(URL_examples.KIT_WEBSITE);
      expect(ut.isResolvable()).toBe(true);
    });
  });
});
