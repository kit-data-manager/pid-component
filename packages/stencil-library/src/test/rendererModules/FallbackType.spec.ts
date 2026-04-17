import { FallbackType } from '../../rendererModules/FallbackType';

describe('FallbackType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for any arbitrary string', () => {
      const ft = new FallbackType('anything goes');
      expect(ft.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for empty string', () => {
      const ft = new FallbackType('');
      expect(ft.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for numeric string', () => {
      const ft = new FallbackType('42');
      expect(ft.hasCorrectFormatQuick()).toBe(true);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('returns true', async () => {
      const ft = new FallbackType('hello');
      expect(await ft.hasCorrectFormat()).toBe(true);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "FallbackType"', () => {
      const ft = new FallbackType('test');
      expect(ft.getSettingsKey()).toBe('FallbackType');
    });
  });

  describe('init()', () => {
    it('completes without error', () => {
      const ft = new FallbackType('some value');
      expect(ft.init()).toBeUndefined();
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const ft = new FallbackType('my value');
      expect(ft.value).toBe('my value');
    });
  });
});
