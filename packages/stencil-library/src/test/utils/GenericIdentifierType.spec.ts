import { describe, it, expect } from 'vitest';
import { FunctionalComponent } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';

/**
 * Concrete test stub that extends the abstract GenericIdentifierType.
 * Implements all abstract methods with minimal no-op behavior.
 */
class TestRenderer extends GenericIdentifierType {
  quickCheck(): boolean {
    return true;
  }

  async hasMeaningfulInformation() {
    return true;
  }

  getSettingsKey() {
    return 'TestRenderer';
  }

  renderPreview(): FunctionalComponent<unknown> {
    return (() => null) as unknown as FunctionalComponent<unknown>;
  }

  async init() {
  }
}

describe('GenericIdentifierType', () => {
  // ─── Constructor ───────────────────────────────────────────────────

  describe('constructor', () => {
    it('stores the value passed to the constructor', () => {
      const renderer = new TestRenderer('my-value');
      expect(renderer.value).toBe('my-value');
    });

    it('stores settings when provided via setter', () => {
      const settings = [{ name: 'color', value: 'red' }];
      const renderer = new TestRenderer('val');
      renderer.settings = settings;
      expect(renderer.settings).toEqual(settings);
    });

    it('defaults settings to an empty array when not provided', () => {
      const renderer = new TestRenderer('val');
      // settings may be undefined or empty array depending on the constructor path
      expect(renderer.settings).toEqual(expect.any(Array));
      expect(renderer.settings).toHaveLength(0);
    });
  });

  // ─── value getter ──────────────────────────────────────────────────

  describe('value getter', () => {
    it('returns the stored value', () => {
      const renderer = new TestRenderer('10.5281/zenodo.123');
      expect(renderer.value).toBe('10.5281/zenodo.123');
    });
  });

  // ─── settings getter/setter ────────────────────────────────────────

  describe('settings getter/setter', () => {
    it('getter returns the current settings', () => {
      const settings = [{ name: 'theme', value: 'blue' }];
      const renderer = new TestRenderer('val');
      renderer.settings = settings;
      expect(renderer.settings).toEqual(settings);
    });

    it('setter updates the settings', () => {
      const renderer = new TestRenderer('val');
      const newSettings = [{ name: 'size', value: 'large' }];
      renderer.settings = newSettings;
      expect(renderer.settings).toEqual(newSettings);
    });

    it('setter triggers updateDarkMode', () => {
      const renderer = new TestRenderer('val');
      renderer.settings = [{ name: 'darkMode', value: 'dark' }];
      expect(renderer.isDarkMode).toBe(true);
    });
  });

  // ─── isDarkMode ────────────────────────────────────────────────────

  describe('isDarkMode', () => {
    it('returns false when darkMode setting is "light"', () => {
      const renderer = new TestRenderer('val');
      renderer.settings = [{ name: 'darkMode', value: 'light' }];
      expect(renderer.isDarkMode).toBe(false);
    });

    it('returns true when darkMode setting is "dark"', () => {
      const renderer = new TestRenderer('val');
      renderer.settings = [{ name: 'darkMode', value: 'dark' }];
      expect(renderer.isDarkMode).toBe(true);
    });

    it('returns false by default when no darkMode setting exists', () => {
      const renderer = new TestRenderer('val');
      renderer.settings = [{ name: 'otherSetting', value: 42 }];
      expect(renderer.isDarkMode).toBe(false);
    });

    it('returns false by default when settings are empty', () => {
      const renderer = new TestRenderer('val');
      renderer.settings = [];
      expect(renderer.isDarkMode).toBe(false);
    });

    it('updates when settings are changed via the setter', () => {
      const renderer = new TestRenderer('val');
      renderer.settings = [{ name: 'darkMode', value: 'light' }];
      expect(renderer.isDarkMode).toBe(false);

      renderer.settings = [{ name: 'darkMode', value: 'dark' }];
      expect(renderer.isDarkMode).toBe(true);
    });
  });

  // ─── items getter ─────────────────────────────────────────────────

  describe('items getter', () => {
    it('returns an empty array by default', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.items).toEqual([]);
    });
  });

  // ─── actions getter ───────────────────────────────────────────────

  describe('actions getter', () => {
    it('returns an empty array by default', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.actions).toEqual([]);
    });
  });

  // ─── data getter ──────────────────────────────────────────────────

  describe('data getter', () => {
    it('returns undefined by default', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.data).toBeUndefined();
    });
  });

  // ─── quickCheck() ───────────────────────────────────────

  describe('quickCheck()', () => {
    it('returns true by default for test renderer', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.quickCheck()).toBe(true);
    });
  });

  // ─── isResolvable() ───────────────────────────────────────────────

  describe('isResolvable()', () => {
    it('returns true by default', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.isResolvable()).toBe(true);
    });
  });

  // ─── renderBody() ─────────────────────────────────────────────────

  describe('renderBody()', () => {
    it('returns undefined by default', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.renderBody()).toBeUndefined();
    });
  });

  // ─── abstract method implementations (via TestRenderer) ───────────

  describe('abstract methods (TestRenderer stubs)', () => {
    it('hasMeaningfulInformation() resolves to true', async () => {
      const renderer = new TestRenderer('val');
      const result = await renderer.hasMeaningfulInformation();
      expect(result).toBe(true);
    });

    it('getSettingsKey() returns the stub key', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.getSettingsKey()).toBe('TestRenderer');
    });

    it('renderPreview() returns a FunctionalComponent from the stub', () => {
      const renderer = new TestRenderer('val');
      expect(renderer.renderPreview()).toBeDefined();
    });

    it('init() completes without error', async () => {
      const renderer = new TestRenderer('val');
      await expect(renderer.init()).resolves.toBeUndefined();
    });
  });
});
