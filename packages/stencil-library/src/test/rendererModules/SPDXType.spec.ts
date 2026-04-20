import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SPDXType } from '../../rendererModules/SPDXType';
import { SPDX_examples } from '../../../../../examples/spdx/values.ts';

describe('SPDXType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for SPDX license URL', () => {
      const st = new SPDXType('https://spdx.org/licenses/Apache-2.0');
      expect(st.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for SPDX license URL with trailing slash', () => {
      const st = new SPDXType('https://spdx.org/licenses/MIT/');
      expect(st.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns undefined for bare license ID "MIT"', () => {
      const st = new SPDXType('MIT');
      expect(st.hasCorrectFormatQuick()).toBeUndefined();
    });

    it('returns undefined for bare license ID "Apache-2.0"', () => {
      const st = new SPDXType('Apache-2.0');
      expect(st.hasCorrectFormatQuick()).toBeUndefined();
    });

    it('returns undefined for bare license ID "GPL-3.0-only"', () => {
      const st = new SPDXType('GPL-3.0-only');
      expect(st.hasCorrectFormatQuick()).toBeUndefined();
    });

    it('returns false for empty string', () => {
      const st = new SPDXType(SPDX_examples.INVALID_EMPTY);
      expect(st.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for string with spaces', () => {
      const st = new SPDXType(SPDX_examples.INVALID_LICENSE_NAME);
      expect(st.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for unrelated URL', () => {
      const st = new SPDXType(SPDX_examples.INVALID_NOT_SPdx);
      expect(st.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "SPDXType"', () => {
      const st = new SPDXType('MIT');
      expect(st.getSettingsKey()).toBe('SPDXType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const st = new SPDXType('MIT');
      expect(st.value).toBe('MIT');
    });
  });

  describe('hasCorrectFormat() (async with API validation)', () => {
    const spdxLicenseResponse = {
      licenseId: 'Apache-2.0',
      name: 'Apache License 2.0',
      seeAlso: ['https://www.apache.org/licenses/LICENSE-2.0'],
      isOsiApproved: true,
      isFsfLibre: true,
      isDeprecatedLicenseId: false,
    };

    beforeEach(() => {
      vi.clearAllMocks();
      global.fetch = vi.fn() as any;
    });

    afterEach(() => {
      delete (global as any).fetch;
    });

    it('returns true for valid license ID validated by API', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(spdxLicenseResponse),
      });

      const st = new SPDXType('Apache-2.0');
      const result = await st.hasCorrectFormat();

      expect(result).toBe(true);
    });

    it('returns false when API returns 404', async () => {
      const st = new SPDXType(SPDX_examples.INVALID_LICENSE);
      const result = await st.hasCorrectFormat();

      expect(result).toBe(false);
    });

    it('returns false when API response has no licenseId', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      const st = new SPDXType('Apache-2.0');
      const result = await st.hasCorrectFormat();

      expect(result).toBe(false);
    });

    it('returns true for SPDX URL validated by API', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(spdxLicenseResponse),
      });

      const st = new SPDXType('https://spdx.org/licenses/Apache-2.0');
      const result = await st.hasCorrectFormat();

      expect(result).toBe(true);
    });
  });

  describe('init()', () => {
    const spdxLicenseResponse = {
      licenseId: 'MIT',
      name: 'MIT License',
      seeAlso: ['https://opensource.org/licenses/MIT'],
      isOsiApproved: true,
      isFsfLibre: true,
      isDeprecatedLicenseId: false,
    };

    beforeEach(() => {
      vi.clearAllMocks();
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(spdxLicenseResponse),
      }) as any;
    });

    afterEach(() => {
      delete (global as any).fetch;
    });

    it('fetches license data and populates items for a bare license ID', async () => {
      const st = new SPDXType('MIT');
      await st.init();

      const nameItem = st.items.find(i => i.keyTitle === 'Full Name');
      expect(nameItem).toBeDefined();
      expect(nameItem.value).toBe('MIT License');

      const idItem = st.items.find(i => i.keyTitle === 'SPDX ID');
      expect(idItem).toBeDefined();
      expect(idItem.value).toBe('MIT');
    });

    it('adds OSI Approved item', async () => {
      const st = new SPDXType('MIT');
      await st.init();

      const osiItem = st.items.find(i => i.keyTitle === 'OSI Approved');
      expect(osiItem).toBeDefined();
      expect(osiItem.value).toBe('Yes');
    });

    it('adds FSF Free/Libre item when available', async () => {
      const st = new SPDXType('MIT');
      await st.init();

      const fsfItem = st.items.find(i => i.keyTitle === 'FSF Free/Libre');
      expect(fsfItem).toBeDefined();
      expect(fsfItem.value).toBe('Yes');
    });

    it('adds action buttons', async () => {
      const st = new SPDXType('MIT');
      await st.init();

      const viewAction = st.actions.find(a => a.title === 'View on SPDX');
      expect(viewAction).toBeDefined();
    });

    it('handles fetch error gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const st = new SPDXType('MIT');
      await st.init();

      const errorItem = st.items.find(i => i.keyTitle === 'Error');
      expect(errorItem).toBeDefined();
    });
  });
});
