import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOIInfo, DOISource } from '../DOIInfo';
import { DOI } from '../DOI';
import * as DataCiteInfoModule from '../DataCiteInfo';
import * as CrossRefInfoModule from '../CrossRefInfo';

let dataCiteFetchSpy: any;
let crossRefFetchSpy: any;
let dataCiteFromObjectSpy: any;
let crossRefFromObjectSpy: any;

describe('DOIInfo', () => {
  const testDOI = new DOI('10.5281/zenodo.1234567');

  beforeEach(() => {
    dataCiteFetchSpy = vi.spyOn(DataCiteInfoModule.DataCiteInfo, 'fetch');
    crossRefFetchSpy = vi.spyOn(CrossRefInfoModule.CrossRefInfo, 'fetch');
    dataCiteFromObjectSpy = vi.spyOn(DataCiteInfoModule.DataCiteInfo, 'fromObject');
    crossRefFromObjectSpy = vi.spyOn(CrossRefInfoModule.CrossRefInfo, 'fromObject');
  });

  afterEach(() => {
    dataCiteFetchSpy.mockRestore();
    crossRefFetchSpy.mockRestore();
    dataCiteFromObjectSpy.mockRestore();
    crossRefFromObjectSpy.mockRestore();
  });

  describe('getDOIInfo()', () => {
    it('returns DataCite source when DataCite fetch succeeds', async () => {
      const mockDataCiteInfo = {
        title: 'Test Title',
        url: 'https://example.com',
        resourceType: 'Software',
        rawMetadata: {},
        creators: [{ name: 'Doe', familyName: 'Doe' }],
        publicationDate: '2024',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      dataCiteFetchSpy.mockResolvedValue(mockDataCiteInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.source).toBe(DOISource.DATACITE);
      expect(info.doi).toBeDefined();
      expect(info.dataCiteInfo).toBeDefined();
      expect(info.crossRefInfo).toBeUndefined();
    });

    it('falls back to CrossRef when DataCite returns null', async () => {
      dataCiteFetchSpy.mockResolvedValue(null);

      const mockCrossRefInfo = {
        title: 'CrossRef Title',
        url: 'https://example.com/cr',
        resourceType: 'journal-article',
        rawMetadata: {},
        creators: [{ name: 'Smith' }],
        publicationDate: '2025',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      crossRefFetchSpy.mockResolvedValue(mockCrossRefInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.source).toBe(DOISource.CROSSREF);
      expect(info.crossRefInfo).toBeDefined();
      expect(info.dataCiteInfo).toBeUndefined();
    });

    it('falls back to CrossRef when DataCite throws', async () => {
      dataCiteFetchSpy.mockRejectedValue(new Error('network'));

      const mockCrossRefInfo = {
        title: 'CrossRef Title',
        url: 'https://example.com/cr',
        resourceType: 'journal-article',
        rawMetadata: {},
        creators: [],
        publicationDate: '2025',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      crossRefFetchSpy.mockResolvedValue(mockCrossRefInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.source).toBe(DOISource.CROSSREF);
    });

    it('throws when both DataCite and CrossRef fail', async () => {
      dataCiteFetchSpy.mockResolvedValue(null);
      crossRefFetchSpy.mockResolvedValue(null);

      await expect(DOIInfo.getDOIInfo(testDOI)).rejects.toThrow('Failed to resolve DOI');
    });

    it('accepts a string DOI', async () => {
      const mockDataCiteInfo = {
        title: 'Test',
        url: '',
        resourceType: 'Dataset',
        rawMetadata: {},
        creators: [],
        publicationDate: '2024',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      dataCiteFetchSpy.mockResolvedValue(mockDataCiteInfo);

      const info = await DOIInfo.getDOIInfo('10.5281/zenodo.1234567');

      expect(info.source).toBe(DOISource.DATACITE);
    });
  });

  describe('generateItems()', () => {
    it('delegates to dataCiteInfo when available', async () => {
      const mockItems = [{ keyTitle: 'Title', value: 'Test' }];
      const mockDataCiteInfo = {
        title: 'Test',
        url: '',
        resourceType: 'Dataset',
        rawMetadata: {},
        creators: [],
        publicationDate: '2024',
        generateItems: vi.fn().mockReturnValue(mockItems),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      dataCiteFetchSpy.mockResolvedValue(mockDataCiteInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);
      const items = info.generateItems();

      expect(mockDataCiteInfo.generateItems).toHaveBeenCalled();
      expect(items).toBe(mockItems);
    });

    it('delegates to crossRefInfo when dataCiteInfo is absent', async () => {
      dataCiteFetchSpy.mockResolvedValue(null);

      const mockItems = [{ keyTitle: 'Title', value: 'CrossRef Test' }];
      const mockCrossRefInfo = {
        title: 'CrossRef Test',
        url: '',
        resourceType: 'journal-article',
        rawMetadata: {},
        creators: [],
        publicationDate: '2025',
        generateItems: vi.fn().mockReturnValue(mockItems),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      crossRefFetchSpy.mockResolvedValue(mockCrossRefInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);
      const items = info.generateItems();

      expect(mockCrossRefInfo.generateItems).toHaveBeenCalled();
      expect(items).toBe(mockItems);
    });
  });

  describe('fromJSON()', () => {
    it('reconstructs a DOIInfo from serialized DataCite data', () => {
      const serialized = JSON.stringify({
        doi: JSON.stringify({ doi: '10.5281/zenodo.1234567' }),
        source: DOISource.DATACITE,
        dataCiteInfo: { doi: '{}', rawMetadata: { data: { attributes: { titles: [{ title: 'Test' }] } } } },
        crossRefInfo: undefined,
      });

      // DataCiteInfo.fromObject is mocked, so set up the mock
      const mockReconstructed = { title: 'Test', generateItems: vi.fn().mockReturnValue([]) };
      dataCiteFromObjectSpy.mockReturnValue(mockReconstructed);

      const info = DOIInfo.fromJSON(serialized);

      expect(info.source).toBe(DOISource.DATACITE);
      expect(info.doi.doi).toBe('10.5281/zenodo.1234567');
    });

    it('reconstructs a DOIInfo from serialized CrossRef data', () => {
      const serialized = JSON.stringify({
        doi: JSON.stringify({ doi: '10.1109/test.2025' }),
        source: DOISource.CROSSREF,
        dataCiteInfo: undefined,
        crossRefInfo: { doi: '{}', rawMetadata: { message: { title: ['Test'] } } },
      });

      const mockReconstructed = { title: 'Test', generateItems: vi.fn().mockReturnValue([]) };
      crossRefFromObjectSpy.mockReturnValue(mockReconstructed);

      const info = DOIInfo.fromJSON(serialized);

      expect(info.source).toBe(DOISource.CROSSREF);
    });
  });

  describe('getters (url, resourceType, rawMetadata)', () => {
    it('returns url from DataCite source', async () => {
      const mockDataCiteInfo = {
        title: 'Test',
        url: 'https://datacite.example.com',
        resourceType: 'Dataset',
        rawMetadata: { test: 'data' },
        creators: [],
        publicationDate: '2024',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      dataCiteFetchSpy.mockResolvedValue(mockDataCiteInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.url).toBe('https://datacite.example.com');
      expect(info.resourceType).toBe('Dataset');
      expect(info.rawMetadata).toEqual({ test: 'data' });
    });

    it('returns url from CrossRef source', async () => {
      dataCiteFetchSpy.mockResolvedValue(null);
      const mockCrossRefInfo = {
        title: 'Test',
        url: 'https://crossref.example.com',
        resourceType: 'JournalArticle',
        rawMetadata: { crossref: true },
        creators: [],
        publicationDate: '2025',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      crossRefFetchSpy.mockResolvedValue(mockCrossRefInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.url).toBe('https://crossref.example.com');
      expect(info.resourceType).toBe('JournalArticle');
      expect(info.rawMetadata).toEqual({ crossref: true });
    });

    it('returns undefined resourceType when not set', async () => {
      const mockDataCiteInfo = {
        title: 'Test',
        url: 'https://example.com',
        resourceType: undefined,
        rawMetadata: {},
        creators: [],
        publicationDate: '2024',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      dataCiteFetchSpy.mockResolvedValue(mockDataCiteInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.resourceType).toBeUndefined();
    });

    it('returns empty rawMetadata when not set', async () => {
      const mockDataCiteInfo = {
        title: 'Test',
        url: 'https://example.com',
        resourceType: 'Dataset',
        rawMetadata: undefined,
        creators: [],
        publicationDate: '2024',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      dataCiteFetchSpy.mockResolvedValue(mockDataCiteInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.rawMetadata).toEqual({});
    });
  });

  describe('generateItems() fallback', () => {
    it('returns empty array when no sources available', async () => {
      dataCiteFetchSpy.mockResolvedValue(null);
      crossRefFetchSpy.mockResolvedValue(null);

      await expect(DOIInfo.getDOIInfo(testDOI)).rejects.toThrow('Failed to resolve DOI');
    });

    it('falls back to CrossRef when DataCite throws', async () => {
      dataCiteFetchSpy.mockRejectedValue(new Error('DataCite error'));
      const mockCrossRefInfo = {
        title: 'CrossRef Title',
        url: 'https://example.com',
        resourceType: 'Article',
        rawMetadata: {},
        creators: [],
        publicationDate: '2025',
        generateItems: vi.fn().mockReturnValue([]),
        toObject: vi.fn().mockReturnValue({ doi: '{}', rawMetadata: {} }),
      };
      crossRefFetchSpy.mockResolvedValue(mockCrossRefInfo);

      const info = await DOIInfo.getDOIInfo(testDOI);

      expect(info.source).toBe(DOISource.CROSSREF);
      expect(info.generateItems()).toEqual([]);
    });

    it('throws when DataCite returns null and CrossRef throws', async () => {
      dataCiteFetchSpy.mockResolvedValue(null);
      crossRefFetchSpy.mockRejectedValue(new Error('CrossRef error'));

      await expect(DOIInfo.getDOIInfo(testDOI)).rejects.toThrow('Failed to resolve DOI');
    });

    it('generateItems returns empty array when both sources are undefined (fromJSON)', () => {
      const serialized = JSON.stringify({
        doi: JSON.stringify({ doi: '10.5281/zenodo.1234567' }),
        source: DOISource.UNKNOWN,
        dataCiteInfo: undefined,
        crossRefInfo: undefined,
      });

      const info = DOIInfo.fromJSON(serialized);

      expect(info.generateItems()).toEqual([]);
    });
  });
});
