import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SPDXType } from '../SPDXType';

const SPDX_examples = {
  APACHE_2_0: 'https://spdx.org/licenses/Apache-2.0',
  APACHE_2_0_BARE: 'Apache-2.0',
  MIT: 'https://spdx.org/licenses/MIT',
  MIT_BARE: 'MIT',
  CC_BY_4_0: 'https://spdx.org/licenses/CC-BY-4.0',
  CC_BY_4_0_BARE: 'CC-BY-4.0',
  INVALID_LICENSE_NAME: 'Apache License 2.0',
  INVALID_NOT_SPdx: 'https://example.com/licenses/MIT',
  INVALID_LICENSE: 'INVALID-LICENSE',
  INVALID_EMPTY: '',
} as const;

describe('SPDXType', () => {
  describe('quickCheck()', () => {
    it('returns true for SPDX license URL', () => {
      const st = new SPDXType(SPDX_examples.APACHE_2_0);
      expect(st.quickCheck()).toBe(true);
    });

    it('returns true for SPDX license URL with trailing slash', () => {
      const st = new SPDXType(SPDX_examples.MIT);
      expect(st.quickCheck()).toBe(true);
    });

    it('returns undefined (uncertain, use hasMeaningfulInformation) for bare license ID "MIT"', () => {
      const st = new SPDXType(SPDX_examples.MIT_BARE);
      expect(st.quickCheck()).toBe(undefined);
    });

    it('returns undefined (uncertain, use hasMeaningfulInformation) for bare license ID "Apache-2.0"', () => {
      const st = new SPDXType(SPDX_examples.APACHE_2_0_BARE);
      expect(st.quickCheck()).toBe(undefined);
    });

    it('returns undefined (uncertain, use hasMeaningfulInformation) for bare license ID "GPL-3.0-only"', () => {
      const st = new SPDXType('GPL-3.0-only');
      expect(st.quickCheck()).toBe(undefined);
    });

    it('returns false for empty string', () => {
      const st = new SPDXType(SPDX_examples.INVALID_EMPTY);
      expect(st.quickCheck()).toBe(false);
    });

    it('returns false for string with spaces', () => {
      const st = new SPDXType(SPDX_examples.INVALID_LICENSE_NAME);
      expect(st.quickCheck()).toBe(false);
    });

    it('returns false for unrelated URL', () => {
      const st = new SPDXType(SPDX_examples.INVALID_NOT_SPdx);
      expect(st.quickCheck()).toBe(false);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "SPDXType"', () => {
      const st = new SPDXType(SPDX_examples.MIT_BARE);
      expect(st.getSettingsKey()).toBe('SPDXType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const st = new SPDXType(SPDX_examples.MIT_BARE);
      expect(st.value).toBe('MIT');
    });
  });

  describe('hasMeaningfulInformation() (async with API validation)', () => {
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

      const st = new SPDXType(SPDX_examples.APACHE_2_0_BARE);
      const result = await st.hasMeaningfulInformation();

      expect(result).toBe(true);
    });

    it('returns false when API returns 404', async () => {
      const st = new SPDXType(SPDX_examples.INVALID_LICENSE);
      const result = await st.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('returns false when API response has no licenseId', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });

      const st = new SPDXType(SPDX_examples.APACHE_2_0_BARE);
      const result = await st.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('returns true for SPDX URL validated by API', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(spdxLicenseResponse),
      });

      const st = new SPDXType(SPDX_examples.APACHE_2_0);
      const result = await st.hasMeaningfulInformation();

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
