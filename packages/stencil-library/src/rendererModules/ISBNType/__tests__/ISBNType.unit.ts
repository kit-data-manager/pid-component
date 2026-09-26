import { describe, expect, it, vi } from 'vitest';
import { ISBNType } from '../ISBNType';
import { ISBN_examples } from '../../../../../../examples';
import {
  DNB_XML,
  OPENLIBRARY_EDITION,
  WIKIDATA_ENTITY_PAYLOAD,
  WIKIDATA_SEARCH_PAYLOAD,
  installFetchMock,
  useFailingFetchInTests,
  type FetchHandler,
} from './isbnMetadataSources/isbnMetadataSourcesTestUtils';

function openLibraryOnly(handler?: FetchHandler): FetchHandler {
  return (url: string) => {
    if (url.startsWith('https://openlibrary.org/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
    if (url.startsWith('https://openlibrary.org/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
    if (url.startsWith('https://openlibrary.org/works/')) return { ok: true, body: { description: { value: 'A practical guide to modern data systems.' } } };
    return handler?.(url);
  };
}

describe('ISBNType', () => {
  useFailingFetchInTests();

  describe('quickCheck()', () => {
    it('returns true for valid ISBN-13 with hyphens', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      expect(renderer.quickCheck()).toBe(true);
    });

    it('returns true for valid ISBN-10', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_10);
      expect(renderer.quickCheck()).toBe(true);
    });

    it('returns true for valid ISBN-10 with X checksum', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_10_X_CHECKSUM);
      expect(renderer.quickCheck()).toBe(true);
    });

    it('returns false for ISBN with invalid checksum', () => {
      const renderer = new ISBNType(ISBN_examples.INVALID_13_CHECKSUM);
      expect(renderer.quickCheck()).toBe(false);
    });

    it('returns false for a 13-digit number with a non-book EAN prefix', () => {
      const renderer = new ISBNType('9771234567890');
      expect(renderer.quickCheck()).toBe(false);
    });

    it('returns false for non-isbn values', () => {
      const renderer = new ISBNType(ISBN_examples.INVALID_NOT_ISBN);
      expect(renderer.quickCheck()).toBe(false);
    });

    it('accepts compact, hyphenated, and arbitrarily hyphenated forms of a valid ISBN (isbn3)', () => {
      expect(new ISBNType(ISBN_examples.VALID_13_HYPHENATED).quickCheck()).toBe(true);
      expect(new ISBNType(ISBN_examples.VALID_13_COMPACT).quickCheck()).toBe(true);
      expect(new ISBNType('978-1449373320').quickCheck()).toBe(true);
      expect(new ISBNType(ISBN_examples.VALID_13_PREFIXED).quickCheck()).toBe(true);
    });

    it('accepts a valid ISBN-10 via isbn3', () => {
      expect(new ISBNType(ISBN_examples.VALID_10).quickCheck()).toBe(true);
    });
  });

  describe('getSettingsKey()', () => {
    it('returns ISBNType', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      expect(renderer.getSettingsKey()).toBe('ISBNType');
    });
  });

  describe('hasMeaningfulInformation()', () => {
    it('returns true when OpenLibrary provides meaningful metadata via the new ISBN endpoint', async () => {
      installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const result = await renderer.hasMeaningfulInformation();

      expect(result).toBe(true);
    });

    it('returns true when only a secondary source provides data', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const result = await renderer.hasMeaningfulInformation();

      expect(result).toBe(true);
    });

    it('returns false without network access for syntactically invalid values', async () => {
      const renderer = new ISBNType(ISBN_examples.INVALID_NOT_ISBN);
      const result = await renderer.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('returns false when all sources fail', async () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const result = await renderer.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('returns false when sources only provide non-useful fields like a cover URL', async () => {
      installFetchMock(url => {
        // OpenLibrary returns an edition with only a cover (no title/authors/date).
        if (url.startsWith('https://openlibrary.org/isbn/')) return { ok: true, body: { covers: [123] } };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const result = await renderer.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('queries all sources in parallel', async () => {
      const mock = installFetchMock(
        openLibraryOnly(url => {
          if (url.startsWith('https://www.wikidata.org/w/api.php?action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
          if (url.startsWith('https://www.wikidata.org/w/api.php?action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
          if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
          return undefined;
        }),
      );

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.hasMeaningfulInformation();

      const urls = mock.mock.calls.map(call => String(call[0]));
      expect(urls.some(url => url.startsWith('https://openlibrary.org/isbn/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://www.wikidata.org/w/api.php'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://services.dnb.de/'))).toBe(true);
    });

    it('passes the hyphenated ISBN derived from the raw value to the sources', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.hasMeaningfulInformation();

      const wikidataUrls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('haswbstatement'));
      expect(wikidataUrls[0]).toContain(encodeURIComponent('P212=978-1-4493-7332-0'));
    });

    it('computes a canonical hyphenated ISBN for compact input', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_COMPACT);
      await renderer.hasMeaningfulInformation();

      const wikidataUrls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('haswbstatement'));
      expect(wikidataUrls[0]).toContain(encodeURIComponent('P212=978-1-4493-7332-0'));
    });

    it('computes a canonical hyphenated ISBN for arbitrarily hyphenated input', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType('ISBN 978-1449373320');
      await renderer.hasMeaningfulInformation();

      const wikidataUrls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('haswbstatement'));
      expect(wikidataUrls[0]).toContain(encodeURIComponent('P212=978-1-4493-7332-0'));
    });

    it('honors the isbnSources setting to restrict providers', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value: ['OpenLibrary'] }]);
      await renderer.hasMeaningfulInformation();

      const urls = mock.mock.calls.map(call => String(call[0]));
      expect(urls.some(url => url.startsWith('https://openlibrary.org/isbn/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://services.dnb.de/'))).toBe(false);
      expect(urls.some(url => url.startsWith('https://www.wikidata.org/w/api.php'))).toBe(false);
    });

    it('accepts the isbnSources setting as a comma-separated string', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value: ' OpenLibrary , DNB ' }]);
      await renderer.hasMeaningfulInformation();

      const urls = mock.mock.calls.map(call => String(call[0]));
      expect(urls.some(url => url.startsWith('https://openlibrary.org/isbn/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://services.dnb.de/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://www.wikidata.org/w/api.php'))).toBe(false);
    });

    it('falls back to all providers for empty or malformed isbnSources settings', async () => {
      for (const value of [[], [''], [42], '  ', 42, '']) {
        const mock = installFetchMock(
          openLibraryOnly(url => {
            if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
            return undefined;
          }),
        );
        const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value }]);
        await renderer.hasMeaningfulInformation();

        const urls = mock.mock.calls.map(call => String(call[0]));
        expect(urls.some(url => url.startsWith('https://services.dnb.de/'))).toBe(true);
      }
    });
  });

  describe('init()', () => {
    it('creates foldable items for merged metadata and one metadata source item per contributing provider', async () => {
      installFetchMock(
        openLibraryOnly(url => {
          if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
          return undefined;
        }),
      );

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      const sourceItems = renderer.items.filter(i => i.keyTitle === 'Metadata Source');
      expect(sourceItems.map(item => item.value)).toEqual(expect.arrayContaining(['OpenLibrary', 'DNB']));

      expect(renderer.items.find(i => i.keyTitle === 'Title')?.value).toBe('Designing Data-Intensive Applications');
      const authorRows = renderer.items.filter(i => i.keyTitle === 'Author').map(item => item.value);
      expect(authorRows).toEqual(expect.arrayContaining(['Martin Kleppmann']));
      expect(renderer.items.find(i => i.keyTitle === 'Pages')?.value).toBe('624');
      expect(renderer.items.find(i => i.keyTitle === 'Abstract')?.value).toBe('A practical guide to modern data systems.');
    });

    it('shows the hyphenated ISBN in the ISBN foldable item', async () => {
      installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_COMPACT);
      await renderer.init();

      expect(renderer.items.find(i => i.keyTitle === 'ISBN')?.value).toBe('978-1-4493-7332-0');
    });

    it('renders the publication date in ISO 8601 form', async () => {
      installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_COMPACT);
      await renderer.init();

      // OPENLIBRARY_EDITION.publish_date is "Apr 02, 2017" -> ISO date only.
      expect(renderer.items.find(i => i.keyTitle === 'Date')?.value).toBe('2017-04-02');
    });

    it('keeps a year-only publication date as-is', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) {
          return { ok: true, text: DNB_XML.replace('<dc:date>1995</dc:date>', '<dc:date>1988</dc:date>') };
        }
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.items.find(i => i.keyTitle === 'Date')?.value).toBe('1988');
    });

    it('omits the Date item when the publication date cannot be parsed', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) {
          return { ok: true, text: DNB_XML.replace('<dc:date>1995</dc:date>', '<dc:date>Undated</dc:date>') };
        }
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.items.find(i => i.keyTitle === 'Date')).toBeUndefined();
    });

    it('reduces a year-month publication date to the first of that month', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) {
          return { ok: true, text: DNB_XML.replace('<dc:date>1995</dc:date>', '<dc:date>2008-01</dc:date>') };
        }
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.items.find(i => i.keyTitle === 'Date')?.value).toBe('2008-01-01');
    });

    it('reduces an unknown-day publication date to the first of that month', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) {
          return { ok: true, text: DNB_XML.replace('<dc:date>1995</dc:date>', '<dc:date>2008-01-?</dc:date>') };
        }
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.items.find(i => i.keyTitle === 'Date')?.value).toBe('2008-01-01');
    });

    it('creates one view action per contributing source with the primary action for the highest-priority source', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://openlibrary.org/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
        if (url.startsWith('https://openlibrary.org/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
        if (url.startsWith('https://www.wikidata.org/w/api.php?action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
        if (url.startsWith('https://www.wikidata.org/w/api.php?action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      const primary = renderer.actions.find(a => a.style === 'primary');
      expect(primary?.title).toBe('View on OpenLibrary');
      expect(primary?.link).toBe('https://openlibrary.org/isbn/9781449373320');
      expect(renderer.actions.find(a => a.title === 'View on Wikidata')).toBeDefined();
    });

    it('opens the ISBN via the deep link returned by a source', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      const dnbAction = renderer.actions.find(a => a.title === 'View in DNB catalog');
      expect(dnbAction?.link).toBe('https://d-nb.info/944033466');
    });

    it('skips actions for unknown sources without any URL', async () => {
      installFetchMock(() => undefined);

      const cached = JSON.stringify({
        isbn: '9781449373320',
        aggregated: {
          merged: { title: 'Unknown Source Book' },
          sources: [{ name: 'UnknownSource', actionLabel: '', actionUrl: '', url: undefined, metadata: {} }],
        },
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(cached);

      expect(renderer.items.find(i => i.keyTitle === 'Title')?.value).toBe('Unknown Source Book');
      expect(renderer.items.find(i => i.keyTitle === 'Metadata Source')?.value).toBe('UnknownSource');
      expect(renderer.actions).toHaveLength(0);
    });

    it('uses a generic action label for unknown sources with a URL', async () => {
      installFetchMock(() => undefined);

      const cached = JSON.stringify({
        isbn: '9781449373320',
        aggregated: {
          merged: { title: 'Unknown Source Book' },
          sources: [{ name: 'UnknownSource', actionLabel: '', actionUrl: '', url: 'https://example.com/book', metadata: {} }],
        },
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(cached);

      expect(renderer.actions[0]?.title).toBe('View on UnknownSource');
      expect(renderer.actions[0]?.link).toBe('https://example.com/book');
    });

    it('populates nothing when no source returns data', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
      try {
        const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
        await renderer.init();

        expect(renderer.items.length).toBe(0);
        expect(renderer.actions.length).toBe(0);
        expect(renderer.isResolvable()).toBe(false);
        expect(consoleSpy).toHaveBeenCalled();
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });

  describe('render methods', () => {
    it('returns a preview component with the raw value fallback before init', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const preview = renderer.renderPreview();
      expect(preview).toBeTruthy();
      expect(renderer.isResolvable()).toBe(false);
    });

    it('renders the book title in the preview after init', async () => {
      installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.renderPreview()).toBeTruthy();
    });

    it('returns a body component when cover image is present', async () => {
      installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();
      expect(renderer.renderBody()).toBeTruthy();
    });

    it('returns no body component without cover image', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();
      expect(renderer.renderBody()).toBeUndefined();
    });
  });

  describe('data getter and cache round-trip', () => {
    it('returns serialized isbn metadata after init', async () => {
      installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();
      const data = renderer.data;
      expect(typeof data).toBe('string');
      const parsed = JSON.parse(data);
      expect(parsed.isbn).toBe('9781449373320');
      expect(parsed.aggregated.sources.map((source: { name: string }) => source.name)).toContain('OpenLibrary');
    });

    it('serializes without aggregated data before init', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const parsed = JSON.parse(renderer.data);
      expect(parsed.isbn).toBe('');
      expect(parsed.aggregated).toBeUndefined();
    });

    it('restores metadata from cache without network access', async () => {
      const mock = installFetchMock(() => undefined);

      const cached = JSON.stringify({
        isbn: '9781449373320',
        aggregated: {
          merged: { title: 'Designing Data-Intensive Applications', authors: ['Martin Kleppmann'] },
          sources: [{ name: 'OpenLibrary', url: 'https://openlibrary.org/isbn/9781449373320', metadata: {} }],
        },
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(cached);

      expect(renderer.isResolvable()).toBe(true);
      expect(renderer.items.find(i => i.keyTitle === 'Title')?.value).toBe('Designing Data-Intensive Applications');
      expect(renderer.actions.find(a => a.title === 'View on OpenLibrary')?.link).toBe('https://openlibrary.org/isbn/9781449373320');
      expect(mock).not.toHaveBeenCalled();
    });

    it('normalizes the ISBN from the raw value when the cache has none', async () => {
      installFetchMock(() => undefined);

      const cached = JSON.stringify({
        aggregated: {
          merged: { title: 'Cached Book' },
          sources: [{ name: 'OpenLibrary', actionLabel: 'View on OpenLibrary', actionUrl: 'https://openlibrary.org/isbn/9781449373320', metadata: {} }],
        },
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(cached);

      expect(renderer.items.find(i => i.keyTitle === 'ISBN')?.value).toBe('978-1-4493-7332-0');
      expect(renderer.actions.find(a => a.title === 'View on OpenLibrary')?.link).toBe('https://openlibrary.org/isbn/9781449373320');
    });

    it('falls back to the raw value when the cache is invalid JSON', async () => {
      installFetchMock(() => undefined);

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init('not valid json');

      expect(renderer.isResolvable()).toBe(false);
      expect(renderer.items.length).toBe(0);
    });

    it('ignores cache entries without aggregated data', async () => {
      installFetchMock(() => undefined);

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(JSON.stringify({ isbn: '9781449373320' }));

      expect(renderer.isResolvable()).toBe(false);
    });
  });
});
