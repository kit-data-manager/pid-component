import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { URLType } from '../../rendererModules/URLType';

describe('URLType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for https URL', () => {
      const ut = new URLType('https://example.com');
      expect(ut.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for http URL with path, query and hash', () => {
      const ut = new URLType('http://example.com/path?q=1#hash');
      expect(ut.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for https URL with complex path', () => {
      const ut = new URLType('https://sub.domain.org/a/b/c?x=1&y=2');
      expect(ut.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for string without scheme', () => {
      const ut = new URLType('not-a-url');
      expect(ut.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for ftp URL', () => {
      const ut = new URLType('ftp://example.com');
      expect(ut.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const ut = new URLType('');
      expect(ut.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result', async () => {
      const ut = new URLType('https://example.com');
      expect(await ut.hasCorrectFormat()).toBe(ut.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "URLType"', () => {
      const ut = new URLType('https://example.com');
      expect(ut.getSettingsKey()).toBe('URLType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ut = new URLType('https://example.com');
      expect(ut.value).toBe('https://example.com');
    });
  });

  describe('init()', () => {
    it('completes without error and returns undefined', () => {
      const ut = new URLType('https://example.com');
      expect(ut.init()).toBeUndefined();
    });

    it('does not populate items (URLType has no init logic)', () => {
      const ut = new URLType('https://example.com/path');
      ut.init();
      expect(ut.items).toEqual([]);
    });
  });

  describe('renderPreview()', () => {
    it('returns a defined value', () => {
      const ut = new URLType('https://example.com');
      const preview = ut.renderPreview();
      expect(preview).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    it('returns true (default behavior)', () => {
      const ut = new URLType('https://example.com');
      expect(ut.isResolvable()).toBe(true);
    });
  });
});
