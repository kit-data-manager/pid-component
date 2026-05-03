import { describe, it, expect } from 'vitest';
import { URLType } from '../../URLType';

describe('URLType', () => {
  describe('quickCheck()', () => {
    it('returns true for https URL', () => {
      const ut = new URLType('https://scc.kit.edu');
      expect(ut.quickCheck()).toBe(true);
    });

    it('returns true for http URL with path, query and hash', () => {
      const ut = new URLType('http://example.com/path?q=1#hash');
      expect(ut.quickCheck()).toBe(true);
    });

    it('returns true for https URL with complex path', () => {
      const ut = new URLType('https://github.com/kit-data-manager/pid-component');
      expect(ut.quickCheck()).toBe(true);
    });

    it('returns false for string without scheme', () => {
      const ut = new URLType('not-a-url');
      expect(ut.quickCheck()).toBe(false);
    });

    it('returns false for ftp URL', () => {
      const ut = new URLType('://example.com');
      expect(ut.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ut = new URLType('');
      expect(ut.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() result', async () => {
      const ut = new URLType('https://scc.kit.edu');
      expect(await ut.hasMeaningfulInformation()).toBe(ut.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "URLType"', () => {
      const ut = new URLType('https://scc.kit.edu');
      expect(ut.getSettingsKey()).toBe('URLType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ut = new URLType('https://scc.kit.edu');
      expect(ut.value).toBe('https://scc.kit.edu');
    });
  });

  describe('init()', () => {
    it('completes without error and returns undefined', () => {
      const ut = new URLType('https://scc.kit.edu');
      expect(ut.init()).toBeUndefined();
    });

    it('does not populate items (URLType has no init logic)', () => {
      const ut = new URLType('https://github.com/kit-data-manager/pid-component');
      ut.init();
      expect(ut.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value', () => {
      const ut = new URLType('https://scc.kit.edu');
      const preview = ut.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    it('returns true (default behavior)', () => {
      const ut = new URLType('https://scc.kit.edu');
      expect(ut.isResolvable()).toBe(true);
    });
  });
});
