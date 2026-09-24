import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ISBNType } from '../ISBNType';
import { ISBN_examples } from '../../../../../../examples';
import { aggregateBookMetadata, createDefaultIsbnProviders, parseDnbOaiDc, selectIsbnProviders, type BookSourceProvider } from '../bookSources';

const DNB_XML = `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <numberOfRecords>1</numberOfRecords>
  <records><record><recordData>
    <dc xmlns:dnb="http://d-nb.de/standards/dnbterms" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title>Homöopathische Hausapotheke : alternative Heilmethoden</dc:title>
      <dc:creator>Panos, Maesimund B.</dc:creator>
      <dc:creator>Heimlich, Jane</dc:creator>
      <dc:publisher>München : Heyne</dc:publisher>
      <dc:date>1995</dc:date>
      <dc:subject>33 Medizin</dc:subject>
      <dc:format>318 S.</dc:format>
      <dc:identifier xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="dnb:IDN">944033466</dc:identifier>
    </dc>
  </recordData></record></records>
</searchRetrieveResponse>`;

const OPENLIBRARY_EDITION = {
  title: 'Designing Data-Intensive Applications',
  publishers: ["O'Reilly Media"],
  publish_date: 'Apr 02, 2017',
  number_of_pages: 624,
  covers: [8434671],
  authors: [{ key: '/authors/OL7477772A' }],
  works: [{ key: '/works/OL19293745W' }],
};

const GOOGLE_BOOKS_PAYLOAD = {
  totalItems: 1,
  items: [
    {
      volumeInfo: {
        title: 'Designing Data-Intensive Applications',
        subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
        authors: ['Martin Kleppmann'],
        publisher: "O'Reilly Media",
        publishedDate: '2017-04-02',
        description: 'A practical guide to modern data systems.',
        pageCount: 616,
        language: 'en',
        categories: ['Computer Science'],
        infoLink: 'https://books.google.com/books?id=example',
        imageLinks: { thumbnail: 'http://books.google.com/books/content?id=example&zoom=1' },
      },
    },
  ],
};

const WIKIDATA_SEARCH_PAYLOAD = {
  query: {
    search: [{ title: 'Q110418801' }],
  },
};

const WIKIDATA_ENTITY_PAYLOAD = {
  entities: {
    Q110418801: { labels: { en: { value: 'Introduction to Algorithms' } } },
  },
};

type FetchHandler = (url: string) => { ok: boolean; body?: unknown; text?: string } | undefined;

function installFetchMock(handler: FetchHandler): ReturnType<typeof vi.fn> {
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const result = handler(url);
    if (!result) return { ok: false, status: 404, json: vi.fn().mockResolvedValue({}), text: vi.fn().mockResolvedValue('') };
    return {
      ok: result.ok,
      status: result.ok ? 200 : 404,
      json: vi.fn().mockResolvedValue(result.body ?? {}),
      text: vi.fn().mockResolvedValue(result.text ?? ''),
    };
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

function openLibraryOnly(handler?: FetchHandler): FetchHandler {
  return (url: string) => {
    if (url.startsWith('https://openlibrary.org/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
    if (url.startsWith('https://openlibrary.org/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
    if (url.startsWith('https://openlibrary.org/works/')) return { ok: true, body: { description: { value: 'A practical guide to modern data systems.' } } };
    return handler?.(url);
  };
}

describe('ISBNType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    installFetchMock(() => undefined);
  });

  afterEach(() => {
    delete (global as { fetch?: typeof fetch }).fetch;
  });

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

    it('returns false when all sources fail', async () => {
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

    it('honors the isbnSources setting to restrict providers', async () => {
      const mock = installFetchMock(openLibraryOnly());

      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED, [{ name: 'isbnSources', value: ['OpenLibrary'] }]);
      await renderer.hasMeaningfulInformation();

      const urls = mock.mock.calls.map(call => String(call[0]));
      expect(urls.some(url => url.startsWith('https://openlibrary.org/isbn/'))).toBe(true);
      expect(urls.some(url => url.startsWith('https://www.googleapis.com/books/'))).toBe(false);
      expect(urls.some(url => url.startsWith('https://www.wikidata.org/w/api.php'))).toBe(false);
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

    it('populates nothing when no source returns data', async () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
      await renderer.init();

      expect(renderer.items.length).toBe(0);
      expect(renderer.actions.length).toBe(0);
    });
  });

  describe('render methods', () => {
    it('returns a preview component', () => {
      const renderer = new ISBNType(ISBN_examples.VALID_13_HYPHENATED);
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
  });

  describe('bookSources', () => {
    it('merges metadata with field priority and gap-filling', async () => {
      const providers: BookSourceProvider[] = [
        {
          name: 'OpenLibrary',
          actionLabel: 'View on OpenLibrary',
          isbnUrl: () => 'https://openlibrary.org/isbn/x',
          fetch: async () => ({ title: 'OL Title', pages: 624, authors: ['Martin Kleppmann'] }),
        },
        {
          name: 'Google Books',
          actionLabel: 'View on Google Books',
          isbnUrl: () => 'https://www.google.com/search?tbm=bks&q=isbn:x',
          fetch: async () => ({
            title: 'GB Title',
            subtitle: 'GB Subtitle',
            publishers: ["O'Reilly Media"],
          }),
        },
      ];

      const result = await aggregateBookMetadata({ isbn: '9781449373320' }, providers);

      expect(result?.merged.title).toBe('OL Title');
      expect(result?.merged.pages).toBe(624);
      expect(result?.merged.subtitle).toBe('GB Subtitle');
      expect(result?.merged.publishers).toEqual(["O'Reilly Media"]);
      expect(result?.merged.authors).toEqual(['Martin Kleppmann']);
    });

    it('returns null when no provider has data', async () => {
      const providers: BookSourceProvider[] = [
        { name: 'OpenLibrary', actionLabel: 'View on OpenLibrary', isbnUrl: () => '', fetch: async () => null },
        {
          name: 'Google Books',
          actionLabel: 'View on Google Books',
          isbnUrl: () => '',
          fetch: async () => {
            throw new Error('network down');
          },
        },
      ];

      const result = await aggregateBookMetadata({ isbn: '9781449373320' }, providers);
      expect(result).toBeNull();
    });

    it('merges list fields without duplicates, case-insensitively', async () => {
      const providers: BookSourceProvider[] = [
        { name: 'OpenLibrary', actionLabel: 'View on OpenLibrary', isbnUrl: () => '', fetch: async () => ({ authors: ['Martin Kleppmann'] }) },
        { name: 'Google Books', actionLabel: 'View on Google Books', isbnUrl: () => '', fetch: async () => ({ authors: ['martin kleppmann', 'Someone Else'] }) },
      ];

      const result = await aggregateBookMetadata({ isbn: '9781449373320' }, providers);
      expect(result?.merged.authors).toEqual(['Martin Kleppmann', 'Someone Else']);
    });

    it('parses DNB oai_dc XML', () => {
      const metadata = parseDnbOaiDc(DNB_XML);

      expect(metadata.title).toBe('Homöopathische Hausapotheke : alternative Heilmethoden');
      expect(metadata.authors).toEqual(['Panos, Maesimund B.', 'Heimlich, Jane']);
      expect(metadata.publishers).toEqual(['München : Heyne']);
      expect(metadata.publishDate).toBe('1995');
      expect(metadata.pages).toBe(318);
      expect(metadata.subjects).toEqual(['33 Medizin']);
      expect(metadata.sourceUrl).toBe('https://d-nb.info/944033466');
    });

    it('creates the default providers in priority order', () => {
      const providers = createDefaultIsbnProviders();
      expect(providers.map(provider => provider.name)).toEqual(['OpenLibrary', 'Google Books', 'DNB', 'Wikidata']);
    });

    it('selects only enabled providers', () => {
      const providers = createDefaultIsbnProviders();
      const selected = selectIsbnProviders(providers, ['DNB', 'Wikidata']);
      expect(selected.map(provider => provider.name)).toEqual(['DNB', 'Wikidata']);
    });

    it('returns all providers when enabled list is empty', () => {
      const providers = createDefaultIsbnProviders();
      expect(selectIsbnProviders(providers, undefined)).toHaveLength(4);
      expect(selectIsbnProviders(providers, [])).toHaveLength(4);
    });
  });
});
