import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DOIType } from '../DOIType';
import { DOISource } from '../DOIInfo';
import * as DataCache from '../../../utils/DataCache';

const VALID_BARE = '10.52825/ocp.v5i.1411';
const VALID_WITH_PREFIX = 'https://dx.doi.org/10.52825/ocp.v5i.1411';
const INVALID_NOT_A_DOI = 'not-a-doi';

let cachedFetchSpy: any;
beforeEach(() => {
  cachedFetchSpy = vi.spyOn(DataCache, 'cachedFetch');
});
afterEach(() => {
  cachedFetchSpy.mockRestore();
});

describe('DOIType', () => {
  describe('quickCheck()', () => {
    it('returns true for a bare DOI', () => {
      const dt = new DOIType(VALID_BARE);
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns true for DOI with https prefix', () => {
      const dt = new DOIType(VALID_WITH_PREFIX);
      expect(dt.quickCheck()).toBe(true);
    });

    it('returns false for non-DOI string', () => {
      const dt = new DOIType(INVALID_NOT_A_DOI);
      expect(dt.quickCheck()).toBe(false);
    });

    it('returns false for empty string', () => {
      const dt = new DOIType('');
      expect(dt.quickCheck()).toBe(false);
    });
  });

  describe('hasMeaningfulInformation()', () => {
    const dataCiteResponse = {
      data: {
        attributes: {
          titles: [{ title: 'The PID Component' }],
          creators: [{
            name: 'Inckmann, Maximilian',
            givenName: 'Maximilian',
            familyName: 'Inckmann',
            nameIdentifiers: [{
              nameIdentifier: 'https://orcid.org/0009-0005-2800-4833',
              nameIdentifierScheme: 'ORCID',
            }],
          }],
          publisher: 'KIT',
          publicationYear: 2024,
          types: { resourceTypeGeneral: 'Software', resourceType: 'Software' },
          descriptions: [{ description: 'A web component.', descriptionType: 'Abstract' }],
          url: 'https://github.com/kit-data-manager/pid-component',
          subjects: [{ subject: 'CS' }],
          dates: [{ date: '2024-06-15', dateType: 'Issued' }],
        },
      },
    };

    it('matches quickCheck() result', async () => {
      cachedFetchSpy.mockResolvedValue(dataCiteResponse);
      const dt = new DOIType(VALID_BARE);
      expect(await dt.hasMeaningfulInformation()).toBe(dt.quickCheck());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "DOIType"', () => {
      const dt = new DOIType(VALID_BARE);
      expect(dt.getSettingsKey()).toBe('DOIType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const dt = new DOIType(VALID_BARE);
      expect(dt.value).toBe('10.52825/ocp.v5i.1411');
    });
  });

  describe('init()', () => {
    const dataCiteResponse = {
      data: {
        attributes: {
          titles: [{ title: 'The PID Component' }],
          creators: [{
            name: 'Inckmann, Maximilian',
            givenName: 'Maximilian',
            familyName: 'Inckmann',
            nameIdentifiers: [{
              nameIdentifier: 'https://orcid.org/0009-0005-2800-4833',
              nameIdentifierScheme: 'ORCID',
            }],
          }],
          publisher: 'KIT',
          publicationYear: 2024,
          types: { resourceTypeGeneral: 'Software', resourceType: 'Software' },
          descriptions: [{ description: 'A web component.', descriptionType: 'Abstract' }],
          url: 'https://github.com/kit-data-manager/pid-component',
          subjects: [{ subject: 'CS' }],
          dates: [{ date: '2024-06-15', dateType: 'Issued' }],
        },
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('fetches DOIInfo via DataCite API and populates items and actions', async () => {
      cachedFetchSpy.mockResolvedValue(dataCiteResponse);

      const dt = new DOIType('10.5445/ir/1000185135');
      await dt.init();

      expect(dt.items.length).toBeGreaterThanOrEqual(2);
      expect(dt.items[0].keyTitle).toBe('DOI');
      expect(dt.items[1].keyTitle).toBe('Metadata Source');
      expect(dt.items[1].value).toBe(DOISource.DATACITE);

      const openAction = dt.actions.find(a => a.title === 'Open Resource');
      expect(openAction).toBeDefined();

      const resolveAction = dt.actions.find(a => a.title === 'Resolve DOI');
      expect(resolveAction).toBeDefined();

      const metadataAction = dt.actions.find(a => a.title === 'View DataCite Metadata');
      expect(metadataAction).toBeDefined();
    });

    it('falls back to CrossRef when DataCite fails', async () => {
      const crossRefResponse = {
        message: {
          title: ['FAIR Digital Objects in Practice'],
          author: [{ given: 'Max', family: 'Doe' }],
          publisher: 'IEEE',
          type: 'journal-article',
          URL: 'https://doi.org/10.1109/test',
          published: { 'date-parts': [[2025, 1]] },
        },
      };
      cachedFetchSpy.mockResolvedValueOnce(null).mockResolvedValueOnce(crossRefResponse);

      const dt = new DOIType('10.1109/escience65000.2025.00022');
      await dt.init();

      expect(dt.items[1].value).toBe(DOISource.CROSSREF);
      const metadataAction = dt.actions.find(a => a.title === 'View CrossRef Metadata');
      expect(metadataAction).toBeDefined();
    });
  });

  describe('isResolvable()', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns true when DOIInfo has a title', async () => {
      cachedFetchSpy.mockResolvedValue({
        data: {
          attributes: {
            titles: [{ title: 'Some Title' }],
            creators: [{ name: 'Author' }],
            url: 'https://example.com',
          },
        },
      });

      const dt = new DOIType('10.5445/ir/1000185135');
      await dt.init();

      expect(dt.isResolvable()).toBe(true);
    });

    it('returns false when DOIInfo is null (not initialized)', () => {
      const dt = new DOIType('10.5281/zenodo.1234567');
      expect(dt.isResolvable()).toBe(false);
    });

    it('returns false when DOIInfo title is empty', async () => {
      cachedFetchSpy.mockResolvedValue({
        data: {
          attributes: {
            titles: [],
            creators: [],
          },
        },
      });

      const dt = new DOIType('10.5445/ir/1000185135');
      await dt.init();

      expect(dt.isResolvable()).toBe(false);
    });
  });

  describe('renderPreview()', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns a truthy functional component', async () => {
      cachedFetchSpy.mockResolvedValue({
        data: {
          attributes: {
            titles: [{ title: 'Test DOI Resource' }],
            creators: [{ name: 'Test Author', givenName: 'Test', familyName: 'Author', nameIdentifiers: [] }],
            publisher: 'Test Publisher',
            publicationYear: 2024,
            types: { resourceTypeGeneral: 'Dataset', resourceType: 'Dataset' },
            descriptions: [{ description: 'A test.', descriptionType: 'Abstract' }],
            url: 'https://example.com',
            subjects: [],
            dates: [{ date: '2024-01-01', dateType: 'Issued' }],
          },
        },
      });

      const dt = new DOIType('10.5281/zenodo.1234567');
      await dt.init();

      const preview = dt.renderPreview();
      expect(preview).toBeTruthy();
    });

    it('uses CrossRef data for citation when DataCite fails', async () => {
      cachedFetchSpy.mockResolvedValueOnce(null);

      const crossRefResponse = {
        message: {
          title: ['CrossRef Title'],
          author: [{ given: 'Cross', family: 'Ref' }],
          publisher: 'CrossRef Publisher',
          type: 'journal-article',
          URL: 'https://doi.org/10.1109/test',
          published: { 'date-parts': [[2025, 2, 20]] },
        },
      };
      cachedFetchSpy.mockResolvedValueOnce(crossRefResponse);

      const dt = new DOIType('10.1109/test2025.00042');
      await dt.init();

      const preview = dt.renderPreview();
      expect(preview).toBeTruthy();
    });
  });

  describe('data getter', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns serialized DOIInfo as JSON string', async () => {
      cachedFetchSpy.mockResolvedValue({
        data: {
          attributes: {
            titles: [{ title: 'Serialization Test' }],
            creators: [{ name: 'Author' }],
            url: 'https://example.com',
          },
        },
      });

      const dt = new DOIType('10.5281/zenodo.1234567');
      await dt.init();

      const data = dt.data;
      expect(typeof data).toBe('string');
      const parsed = JSON.parse(data);
      expect(parsed).toBeDefined();
    });
  });

  describe('init() with cached data', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('loads from cached data via second arg without fetching', async () => {
      cachedFetchSpy.mockResolvedValue({
        data: {
          attributes: {
            titles: [{ title: 'Cached Title' }],
            creators: [{ name: 'Cached Author' }],
            url: 'https://example.com/cached',
          },
        },
      });

      const dt1 = new DOIType('10.5281/zenodo.9999999');
      await dt1.init();
      const cachedData = dt1.data;

      vi.clearAllMocks();
      const dt2 = new DOIType('10.5281/zenodo.9999999');
      await dt2.init(cachedData);

      expect(cachedFetchSpy).not.toHaveBeenCalled();
      expect(dt2.isResolvable()).toBe(true);
      expect(dt2.items.length).toBeGreaterThanOrEqual(2);
    });
  });
});