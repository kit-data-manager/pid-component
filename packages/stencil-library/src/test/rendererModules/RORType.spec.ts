import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RORType } from '../../rendererModules/RORType';
import { ROR_examples } from '../../../../../examples/ror/values.ts';

describe('RORType', () => {
  describe('quickCheck()', () => {
    it('returns true for a valid ROR ID with https', () => {
      const rt = new RORType(ROR_examples.VALID);
      expect(rt.quickCheck()).toBe(true);
    });

    it('returns true for a valid ROR ID with http', () => {
      const rt = new RORType('http://ror.org/04t3en479');
      expect(rt.quickCheck()).toBe(true);
    });

    it('returns false for a non-ROR URL', () => {
      const rt = new RORType(ROR_examples.INVALID_WRONG_DOMAIN);
      expect(rt.quickCheck()).toBe(false);
    });

    it('returns false for ROR without scheme', () => {
      const rt = new RORType(ROR_examples.INVALID_NO_SCHEME);
      expect(rt.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const rt = new RORType(ROR_examples.INVALID_EMPTY);
      expect(rt.quickCheck()).toBe(false);
    });

    it('returns false for ROR ID with wrong suffix length', () => {
      const rt = new RORType(ROR_examples.INVALID_WRONG_LENGTH);
      expect(rt.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('matches quickCheck() result', async () => {
      const rt = new RORType(ROR_examples.VALID);
      expect(await rt.hasMeaningfulInformation()).toBe(rt.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "RORType"', () => {
      const rt = new RORType(ROR_examples.VALID);
      expect(rt.getSettingsKey()).toBe('RORType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const rt = new RORType(ROR_examples.VALID);
      expect(rt.value).toBe(ROR_examples.VALID);
    });
  });

  describe('init()', () => {
    const rorApiResponse = {
      id: ROR_examples.VALID,
      names: [
        { value: 'Karlsruhe Institute of Technology', types: ['ror_display'] },
        { value: 'KIT', types: ['acronym'] },
        { value: 'KIT alias', types: ['alias'] },
      ],
      status: 'active',
      types: ['Education'],
      links: [{ value: 'https://www.kit.edu', type: 'website' }],
      external_ids: [{ type: 'GRID', all: ['grid.7892.4'], preferred: 'grid.7892.4' }],
      relationships: [{ label: 'Predecessor', type: 'predecessor', id: 'https://ror.org/02vbkpn33' }],
      locations: [{ geonames_details: { country_code: 'DE', lat: 49.0069, lng: 8.4037 } }],
    };

    beforeEach(() => {
      vi.clearAllMocks();
      // Mock global fetch for the ROR API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(rorApiResponse),
      }) as any;
    });

    afterEach(() => {
      delete (global as any).fetch;
    });

    it('fetches ROR data and populates items', async () => {
      const rt = new RORType(ROR_examples.VALID);
      await rt.init();

      // Should have Display Name, Acronym, Alias, ROR ID, Status, Type, Link, External ID, Relationship, Country, Coordinates
      expect(rt.items.length).toBeGreaterThanOrEqual(5);
      const displayItem = rt.items.find(i => i.keyTitle === 'Display Name');
      expect(displayItem).toBeDefined();
      expect(displayItem.value).toBe('Karlsruhe Institute of Technology');

      const acronymItem = rt.items.find(i => i.keyTitle === 'Acronym');
      expect(acronymItem).toBeDefined();
      expect(acronymItem.value).toBe('KIT');
    });

    it('adds View on ROR action', async () => {
      const rt = new RORType(ROR_examples.VALID);
      await rt.init();

      const rorAction = rt.actions.find(a => a.title === 'View on ROR');
      expect(rorAction).toBeDefined();
    });

    it('adds country and coordinates items from locations', async () => {
      const rt = new RORType(ROR_examples.VALID);
      await rt.init();

      const countryItem = rt.items.find(i => i.keyTitle === 'Country');
      expect(countryItem).toBeDefined();
      expect(countryItem.value).toBe('DE');

      const coordsItem = rt.items.find(i => i.keyTitle === 'Coordinates');
      expect(coordsItem).toBeDefined();
    });

    it('handles API failure gracefully', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const rt = new RORType(ROR_examples.VALID);
      await rt.init();

      const errorItem = rt.items.find(i => i.keyTitle === 'Error');
      expect(errorItem).toBeDefined();
    });

    it('handles organization with no names', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ ...rorApiResponse, names: [] }),
      });

      const rt = new RORType(ROR_examples.VALID);
      await rt.init();

      const nameItem = rt.items.find(i => i.keyTitle === 'Name');
      expect(nameItem).toBeDefined();
      expect(nameItem.value).toBe('Unknown');
    });
  });
});
