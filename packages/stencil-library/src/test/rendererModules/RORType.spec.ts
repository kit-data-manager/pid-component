import { RORType } from '../../rendererModules/RORType';

describe('RORType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for a valid ROR ID with https', () => {
      const rt = new RORType('https://ror.org/04t3en479');
      expect(rt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for a valid ROR ID with http', () => {
      const rt = new RORType('http://ror.org/04t3en479');
      expect(rt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for a non-ROR URL', () => {
      const rt = new RORType('https://example.com');
      expect(rt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for ROR without scheme', () => {
      const rt = new RORType('ror.org/04t3en479');
      expect(rt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const rt = new RORType('');
      expect(rt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for ROR ID with wrong suffix length', () => {
      const rt = new RORType('https://ror.org/04t3en47');
      expect(rt.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result', async () => {
      const rt = new RORType('https://ror.org/04t3en479');
      expect(await rt.hasCorrectFormat()).toBe(rt.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "RORType"', () => {
      const rt = new RORType('https://ror.org/04t3en479');
      expect(rt.getSettingsKey()).toBe('RORType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const rt = new RORType('https://ror.org/04t3en479');
      expect(rt.value).toBe('https://ror.org/04t3en479');
    });
  });

  describe('init()', () => {
    const rorApiResponse = {
      id: 'https://ror.org/04t3en479',
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
      jest.clearAllMocks();
      // Mock global fetch for the ROR API call
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(rorApiResponse),
      }) as jest.Mock;
    });

    afterEach(() => {
      delete (global as any).fetch;
    });

    it('fetches ROR data and populates items', async () => {
      const rt = new RORType('https://ror.org/04t3en479');
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
      const rt = new RORType('https://ror.org/04t3en479');
      await rt.init();

      const rorAction = rt.actions.find(a => a.title === 'View on ROR');
      expect(rorAction).toBeDefined();
    });

    it('adds country and coordinates items from locations', async () => {
      const rt = new RORType('https://ror.org/04t3en479');
      await rt.init();

      const countryItem = rt.items.find(i => i.keyTitle === 'Country');
      expect(countryItem).toBeDefined();
      expect(countryItem.value).toBe('DE');

      const coordsItem = rt.items.find(i => i.keyTitle === 'Coordinates');
      expect(coordsItem).toBeDefined();
    });

    it('handles API failure gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const rt = new RORType('https://ror.org/04t3en479');
      await rt.init();

      const errorItem = rt.items.find(i => i.keyTitle === 'Error');
      expect(errorItem).toBeDefined();
    });

    it('handles organization with no names', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ ...rorApiResponse, names: [] }),
      });

      const rt = new RORType('https://ror.org/04t3en479');
      await rt.init();

      const nameItem = rt.items.find(i => i.keyTitle === 'Name');
      expect(nameItem).toBeDefined();
      expect(nameItem.value).toBe('Unknown');
    });
  });
});
