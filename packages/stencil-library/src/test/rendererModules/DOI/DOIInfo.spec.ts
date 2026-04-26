import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DOIInfo, DOISource } from '../../../rendererModules/DOI/DOIInfo';
import { DOI } from '../../../rendererModules/DOI/DOI';
import * as DataCiteInfoModule from '../../../rendererModules/DOI/DataCiteInfo';
import * as CrossRefInfoModule from '../../../rendererModules/DOI/CrossRefInfo';

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
});
