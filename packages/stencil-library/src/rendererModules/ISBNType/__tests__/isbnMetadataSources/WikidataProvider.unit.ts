import { describe, expect, it } from 'vitest';
import { WikidataProvider } from '../../isbnMetadataSources/WikidataProvider';
import {
  WIKIDATA_AUTHOR_NAMES,
  WIKIDATA_ENTITY_PAYLOAD,
  WIKIDATA_ENTITY_WITH_AUTHORS,
  WIKIDATA_SEARCH_PAYLOAD,
  installFetchMock,
  installWikidataSuccess,
  useFailingFetchInTests,
} from './isbnMetadataSourcesTestUtils';

describe('WikidataProvider', () => {
  useFailingFetchInTests();

  const LOOKUP = { isbn: '9780262033848', hyphenated: '978-0-262-03384-8' };

  it('has name and action metadata', () => {
    const provider = new WikidataProvider();
    expect(provider.name).toBe('Wikidata');
    expect(provider.actionLabel).toBe('View on Wikidata');
    expect(provider.isbnUrl('9780262033848')).toBe('https://www.wikidata.org/w/index.php?search=haswbstatement%3AP212%3D978-0262033848');
  });

  it('resolves the entity and its label for a hyphenated ISBN-13', async () => {
    installWikidataSuccess();
    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toEqual({
      title: 'Introduction to Algorithms',
      sourceUrl: 'https://www.wikidata.org/entity/Q110418801',
    });
  });

  it('extracts and resolves P50 authors from the book entity', async () => {
    const mock = installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      if (url.includes('action=wbgetentities')) {
        if (url.includes('props=labels|claims')) return { ok: true, body: WIKIDATA_ENTITY_WITH_AUTHORS };
        if (url.includes('props=labels')) return { ok: true, body: WIKIDATA_AUTHOR_NAMES };
      }
      return undefined;
    });

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata?.title).toBe('The Art of Computer Programming');
    expect(metadata?.authors).toEqual([{ givenName: 'Donald', familyName: 'Knuth', fullName: 'Donald Knuth' }]);

    // Author resolution is a single batched request, and every api.php call
    // carries origin=* so the browser receives CORS headers.
    const authorUrls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('props=labels&'));
    expect(authorUrls).toHaveLength(1);
    expect(authorUrls[0]).toContain('origin=*');
    const bookEntityUrl = mock.mock.calls.map(call => String(call[0])).find(url => url.includes('props=labels|claims'));
    expect(bookEntityUrl).toContain('origin=*');
  });

  it('omits authors when the book entity has no P50 claims', async () => {
    installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      if (url.includes('action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
      return undefined;
    });

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata?.title).toBe('Introduction to Algorithms');
    expect(metadata?.authors).toBeUndefined();
  });

  it('queries P957 for ISBN-10 lookups', async () => {
    const mock = installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      if (url.includes('action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
      return undefined;
    });

    await new WikidataProvider().fetch({ isbn: '0262033844', hyphenated: '0-262-03384-4' });

    const searchUrl = String(mock.mock.calls[0][0]);
    expect(searchUrl).toContain(encodeURIComponent('haswbstatement:P957=0-262-03384-4'));
    expect(searchUrl).toContain('origin=*');
  });

  it('tries the plain ISBN after the hyphenated form misses', async () => {
    const mock = installFetchMock(url => {
      // Fail the hyphenated candidate, succeed the plain candidate.
      if (url.includes('action=query')) {
        if (url.includes(encodeURIComponent('978-0-262-03384-8'))) return { ok: true, body: { query: { search: [] } } };
        return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      }
      if (url.includes('action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
      return undefined;
    });

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata?.sourceUrl).toBe('https://www.wikidata.org/entity/Q110418801');
    const searchCalls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('action=query'));
    expect(searchCalls).toHaveLength(2);
  });

  it('returns null when no entity matches', async () => {
    installFetchMock(() => ({ ok: true, body: { query: { search: [] } } }));

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toBeNull();
  });

  it('returns null when the request fails', async () => {
    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toBeNull();
  });

  it('returns null when the search request rejects', async () => {
    installFetchMock(() => ({ reject: true }));

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toBeNull();
  });

  it('returns null when the label fetch fails (sourceUrl alone is not meaningful)', async () => {
    installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      return undefined;
    });

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toBeNull();
  });

  it('returns null when the label fetch throws', async () => {
    installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      if (url.includes('action=wbgetentities')) return { reject: true };
      return undefined;
    });

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toBeNull();
  });

  it('omits the title when the entity has no English label', async () => {
    installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      if (url.includes('action=wbgetentities')) return { ok: true, body: { entities: { Q110418801: { labels: {} } } } };
      return undefined;
    });

    const metadata = await new WikidataProvider().fetch(LOOKUP);

    expect(metadata).toBeNull();
  });
});
