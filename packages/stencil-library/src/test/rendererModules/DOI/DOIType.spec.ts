// Polyfill `self` before any module imports (DataCache uses `self.caches`)
(globalThis as any).self = globalThis;

import { DOIType } from '../../../rendererModules/DOI/DOIType';
import { DOISource } from '../../../rendererModules/DOI/DOIInfo';
import * as DataCache from '../../../utils/DataCache';

// Spy on cachedFetch to intercept all network calls
let cachedFetchSpy: jest.SpyInstance;
beforeEach(() => {
  cachedFetchSpy = jest.spyOn(DataCache, 'cachedFetch');
});
afterEach(() => {
  cachedFetchSpy.mockRestore();
});

describe('DOIType', () => {
  describe('hasCorrectFormatQuick()', () => {
    it('returns true for a bare DOI', () => {
      const dt = new DOIType('10.5281/zenodo.1234567');
      expect(dt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns true for DOI with https prefix', () => {
      const dt = new DOIType('https://doi.org/10.5281/zenodo.1234567');
      expect(dt.hasCorrectFormatQuick()).toBe(true);
    });

    it('returns false for non-DOI string', () => {
      const dt = new DOIType('not-a-doi');
      expect(dt.hasCorrectFormatQuick()).toBe(false);
    });

    it('returns false for empty string', () => {
      const dt = new DOIType('');
      expect(dt.hasCorrectFormatQuick()).toBe(false);
    });
  });

  describe('hasCorrectFormat()', () => {
    it('matches hasCorrectFormatQuick() result', async () => {
      const dt = new DOIType('10.5281/zenodo.1234567');
      expect(await dt.hasCorrectFormat()).toBe(dt.hasCorrectFormatQuick());
    });
  });

  describe('getSettingsKey()', () => {
    it('returns "DOIType"', () => {
      const dt = new DOIType('10.5281/zenodo.1234567');
      expect(dt.getSettingsKey()).toBe('DOIType');
    });
  });

  describe('constructor', () => {
    it('stores the value', () => {
      const dt = new DOIType('10.5281/zenodo.1234567');
      expect(dt.value).toBe('10.5281/zenodo.1234567');
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
      jest.clearAllMocks();
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
      // First call (DataCite) returns null, second call (CrossRef) returns data
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
      jest.clearAllMocks();
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
});
