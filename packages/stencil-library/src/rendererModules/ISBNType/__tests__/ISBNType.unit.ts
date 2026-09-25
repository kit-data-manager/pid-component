import { describe, expect, it, vi } from 'vitest';
import { ISBNType } from '../ISBNType';
import { ISBN_examples } from '../../../../../../examples';
import {
  DNB_XML,
  GOOGLE_BOOKS_PAYLOAD,
  OPENLIBRARY_EDITION,
  WIKIDATA_ENTITY_PAYLOAD,
  WIKIDATA_SEARCH_PAYLOAD,
  installFetchMock,
  useFailingFetchInTests,
  type FetchHandler,
} from './bookSources/bookSourcesTestUtils';

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
        if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
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
        if (url.startsWith('https://www.googleapis.com/books/')) {
          return { ok: true, body: { items: [{ volumeInfo: { imageLinks: { thumbnail: 'https://books.google.com/cover.jpg' } } }] } };
        }
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      const result = await renderer.hasMeaningfulInformation();

      expect(result).toBe(false);
    });

    it('queries all sources in parallel', async () => {
      const mock = installFetchMock(
        openLibraryOnly(url => {
          if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
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
      expect(urls.some(url => url.startsWith('https://www.googleapis.com/books/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://www.wikidata.org/w/api.php'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://services.dnb.de/'))).toBe(true);
    });

    it('passes the hyphenated ISBN from the raw value to the sources', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.hasMeaningfulInformation();

      const wikidataUrls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('haswbstatement'));
      expect(wikidataUrls[0]).toContain(encodeURIComponent('P212=978-1-4493-7332-0'));
    });

    it('does not pass a hyphenated hint when the raw value has no hyphens', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_COMPACT);
      await renderer.hasMeaningfulInformation();

      const wikidataUrls = mock.mock.calls.map(call => String(call[0])).filter(url => url.includes('haswbstatement'));
      expect(wikidataUrls[0]).toContain(encodeURIComponent('P212=9781449373320'));
    });

    it('honors the isbnSources setting to restrict providers', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value: ['OpenLibrary'] }]);
      await renderer.hasMeaningfulInformation();

      const urls = mock.mock.calls.map(call => String(call[0]));
      expect(urls.some(url => url.startsWith('https://openlibrary.org/isbn/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://www.googleapis.com/books/'))).toBe(false);
      expect(urls.some(url => url.startsWith('https://www.wikidata.org/w/api.php'))).toBe(false);
    });

    it('accepts the isbnSources setting as a comma-separated string', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value: ' OpenLibrary , DNB ' }]);
      await renderer.hasMeaningfulInformation();

      const urls = mock.mock.calls.map(call => String(call[0]));
      expect(urls.some(url => url.startsWith('https://openlibrary.org/isbn/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://services.dnb.de/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://www.googleapis.com/books/'))).toBe(false);
    });

    it('falls back to all providers for empty or malformed isbnSources settings', async () => {
      for (const value of [[], [''], [42], '  ', 42, '']) {
        const mock = installFetchMock(
          openLibraryOnly(url => {
            if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
            return undefined;
          }),
        );
        const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value }]);
        await renderer.hasMeaningfulInformation();

        const urls = mock.mock.calls.map(call => String(call[0]));
        expect(urls.some(url => url.startsWith('https://www.googleapis.com/books/'))).toBe(true);
      }
    });
  });

  describe('init()', () => {
    it('creates foldable items for merged metadata and one metadata source item per contributing provider', async () => {
      installFetchMock(
        openLibraryOnly(url => {
          if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
          return undefined;
        }),
      );

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      const sourceItems = renderer.items.filter(i => i.keyTitle === 'Metadata Source');
      expect(sourceItems.map(item => item.value)).toEqual(expect.arrayContaining(['OpenLibrary', 'Google Books']));

      expect(renderer.items.find(i => i.keyTitle === 'Title')?.value).toBe('Designing Data-Intensive Applications');
      expect(renderer.items.find(i => i.keyTitle === 'Subtitle')?.value).toBe(GOOGLE_BOOKS_PAYLOAD.items[0].volumeInfo.subtitle);
      expect(renderer.items.find(i => i.keyTitle === 'Author')?.value).toContain('Martin Kleppmann');
      expect(renderer.items.find(i => i.keyTitle === 'Pages')?.value).toBe('624');
      expect(renderer.items.find(i => i.keyTitle === 'Abstract')?.value).toBe('A practical guide to modern data systems.');
    });

    it('shows the raw publication date when it cannot be parsed', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://services.dnb.de/')) {
          return { ok: true, text: DNB_XML.replace('<dc:date>1995</dc:date>', '<dc:date>Undated</dc:date>') };
        }
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.items.find(i => i.keyTitle === 'Date')?.value).toBe('Undated');
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

    it('opens the ISBN in sources that do not provide a deep link', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://www.googleapis.com/books/')) {
          const payload = { items: [{ volumeInfo: { title: 'No Deep Link Book', publisher: "O'Reilly Media" } }] };
          return { ok: true, body: payload };
        }
        if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      const googleAction = renderer.actions.find(a => a.title === 'View on Google Books');
      expect(googleAction?.link).toBe('https://www.google.com/search?tbm=bks&q=isbn:9781449373320');
      const dnbAction = renderer.actions.find(a => a.title === 'View in DNB catalog');
      expect(dnbAction?.link).toBe('https://d-nb.info/944033466');
    });

    it('prefers the deep link returned by a source over the ISBN-based URL', async () => {
      installFetchMock(url => {
        if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
        return undefined;
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      const googleAction = renderer.actions.find(a => a.title === 'View on Google Books');
      expect(googleAction?.link).toBe(GOOGLE_BOOKS_PAYLOAD.items[0].volumeInfo.infoLink);
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
        if (url.startsWith('https://www.googleapis.com/books/')) {
          const payload = { items: [{ volumeInfo: { title: 'No Cover Book' } }] };
          return { ok: true, body: payload };
        }
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

      expect(renderer.items.find(i => i.keyTitle === 'ISBN')?.value).toBe('9781449373320');
      expect(renderer.actions.find(a => a.title === 'View on OpenLibrary')?.link).toBe('https://openlibrary.org/isbn/9781449373320');
    });

    it('still loads legacy cache entries with bookData', async () => {
      installFetchMock(() => undefined);

      const legacy = JSON.stringify({
        isbn: '9781449373320',
        bookData: { title: 'Legacy Title', authors: ['Legacy Author'] },
      });

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(legacy);

      expect(renderer.isResolvable()).toBe(true);
      expect(renderer.items.find(i => i.keyTitle === 'Title')?.value).toBe('Legacy Title');
    });

    it('falls back to the raw value when the cache is invalid JSON', async () => {
      installFetchMock(() => undefined);

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init('not valid json');

      expect(renderer.isResolvable()).toBe(false);
      expect(renderer.items.length).toBe(0);
    });

    it('ignores cache entries without aggregated data or bookData', async () => {
      installFetchMock(() => undefined);

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init(JSON.stringify({ isbn: '9781449373320' }));

      expect(renderer.isResolvable()).toBe(false);
    });
  });
});
