import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CrossRefInfo } from '../../../rendererModules/DOI/CrossRefInfo';
import { DOI } from '../../../rendererModules/DOI/DOI';
import * as DataCache from '../../../utils/DataCache';
import crossRefFixture from '../../fixtures/doi-crossref.json';

let cachedFetchSpy: any;

describe('CrossRefInfo', () => {
  const testDOI = new DOI('10.1109/escience65000.2025.00022');

  describe('fetch()', () => {

    beforeEach(() => {
      cachedFetchSpy = vi.spyOn(DataCache, 'cachedFetch');
    });

    afterEach(() => {
      cachedFetchSpy.mockRestore();
    });

    it('parses a CrossRef API response from fixture data', async () => {
      cachedFetchSpy.mockResolvedValue(crossRefFixture);

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info).not.toBeNull();
      expect(info.title).toBe('FAIR Digital Objects in Practice');
      expect(info.publisher).toBe('IEEE');
      expect(info.resourceType).toBe('journal-article');
      expect(info.url).toBe('https://doi.org/10.1109/escience65000.2025.00022');
    });

    it('extracts creators correctly', async () => {
      cachedFetchSpy.mockResolvedValue(crossRefFixture);

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info.creators).toHaveLength(2);
      expect(info.creators[0].name).toBe('Maximilian Inckmann');
      expect(info.creators[0].givenName).toBe('Maximilian');
      expect(info.creators[0].familyName).toBe('Inckmann');
      expect(info.creators[0].orcid).toBe('0009-0005-2800-4833');
      expect(info.creators[1].name).toBe('Andreas Pfeil');
    });

    it('extracts publication date correctly', async () => {
      cachedFetchSpy.mockResolvedValue(crossRefFixture);

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info.publicationDate).toBe('2025-01-15');
    });

    it('extracts subjects correctly', async () => {
      cachedFetchSpy.mockResolvedValue(crossRefFixture);

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info.subjects).toContain('Computer Science');
    });

    it('parses JATS abstract', async () => {
      cachedFetchSpy.mockResolvedValue(crossRefFixture);

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info.description).toBeDefined();
      // JATS tags should be cleaned up
      expect(info.description).not.toContain('<jats:p>');
      expect(info.description).toContain('This paper presents FDO capabilities.');
    });

    it('returns null when API returns no data', async () => {
      cachedFetchSpy.mockResolvedValue(null);

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info).toBeNull();
    });

    it('returns null when API returns empty message', async () => {
      cachedFetchSpy.mockResolvedValue({ status: 'ok' });

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info).toBeNull();
    });

    it('returns null on network error', async () => {
      cachedFetchSpy.mockRejectedValue(new Error('Network error'));

      const info = await CrossRefInfo.fetch(testDOI);

      expect(info).toBeNull();
    });
  });

  describe('generateItems()', () => {
    it('creates FoldableItems from fixture data', () => {
      const info = new CrossRefInfo(testDOI, crossRefFixture as any);
      const items = info.generateItems();

      // Should have Title, Corresponding Author, Author, Publisher, Publication Date, Resource Type, Abstract, Subject
      expect(items.length).toBeGreaterThanOrEqual(5);

      const titleItem = items.find(i => i.keyTitle === 'Title');
      expect(titleItem).toBeDefined();
      expect(titleItem.value).toBe('FAIR Digital Objects in Practice');

      const publisherItem = items.find(i => i.keyTitle === 'Publisher');
      expect(publisherItem).toBeDefined();
      expect(publisherItem.value).toBe('IEEE');

      const dateItem = items.find(i => i.keyTitle === 'Publication Date');
      expect(dateItem).toBeDefined();
      expect(dateItem.value).toBe('2025-01-15');
    });

    it('includes corresponding author item', () => {
      const info = new CrossRefInfo(testDOI, crossRefFixture as any);
      const items = info.generateItems();

      const correspondingItem = items.find(i => i.keyTitle === 'Corresponding Author');
      expect(correspondingItem).toBeDefined();
    });
  });

  describe('fromObject()', () => {
    it('reconstructs a CrossRefInfo from a serialized object', () => {
      const original = new CrossRefInfo(testDOI, crossRefFixture as any);
      const serialized = original.toObject();
      const restored = CrossRefInfo.fromObject(testDOI, serialized);

      expect(restored.title).toBe(original.title);
      expect(restored.publisher).toBe(original.publisher);
      expect(restored.resourceType).toBe(original.resourceType);
      expect(restored.creators).toEqual(original.creators);
    });
  });

  describe('toObject()', () => {
    it('serializes the CrossRefInfo to an object', () => {
      const info = new CrossRefInfo(testDOI, crossRefFixture as any);
      const obj = info.toObject();

      expect(obj.doi).toBeDefined();
      expect(obj.rawMetadata).toEqual(crossRefFixture);
    });
  });

  describe('correspondingAuthor', () => {
    it('returns the first author as corresponding', () => {
      const info = new CrossRefInfo(testDOI, crossRefFixture as any);
      const corresponding = info.correspondingAuthor;

      expect(corresponding).toBeDefined();
      expect(corresponding.name).toBe('Maximilian Inckmann');
      expect(corresponding.isCorresponding).toBe(true);
    });

    it('returns undefined when no authors exist', () => {
      const emptyResponse = { message: { title: ['Test'] } };
      const info = new CrossRefInfo(testDOI, emptyResponse as any);

      expect(info.correspondingAuthor).toBeUndefined();
    });
  });

  describe('property getters with missing data', () => {
    const emptyResponse = { message: {} };
    const info = new CrossRefInfo(testDOI, emptyResponse as any);

    it('returns empty string for missing title', () => {
      expect(info.title).toBe('');
    });

    it('returns empty array for missing creators', () => {
      expect(info.creators).toEqual([]);
    });

    it('returns undefined for missing publisher', () => {
      expect(info.publisher).toBeUndefined();
    });

    it('returns undefined for missing publicationDate', () => {
      expect(info.publicationDate).toBeUndefined();
    });

    it('returns undefined for missing resourceType', () => {
      expect(info.resourceType).toBeUndefined();
    });

    it('returns empty array for missing subjects', () => {
      expect(info.subjects).toEqual([]);
    });

    it('falls back to DOI URL for missing url', () => {
      expect(info.url).toBe(testDOI.toURL());
    });
  });
});
