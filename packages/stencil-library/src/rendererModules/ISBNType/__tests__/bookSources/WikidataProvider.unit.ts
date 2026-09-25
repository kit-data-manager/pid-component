import { describe, expect, it } from 'vitest';
import { WikidataProvider } from '../../bookSources/WikidataProvider';
import { WIKIDATA_ENTITY_PAYLOAD, WIKIDATA_SEARCH_PAYLOAD, installFetchMock, installWikidataSuccess, useFailingFetchInTests } from './bookSourcesTestUtils';

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

  it('queries P957 for ISBN-10 lookups', async () => {
    const mock = installFetchMock(url => {
      if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
      if (url.includes('action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
      return undefined;
    });

    await new WikidataProvider().fetch({ isbn: '0262033844', hyphenated: '0-262-03384-4' });

    const searchUrl = String(mock.mock.calls[0][0]);
    expect(searchUrl).toContain(encodeURIComponent('haswbstatement:P957=0-262-03384-4'));
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
