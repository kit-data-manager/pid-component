import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Shared fixtures and fetch-mocking helpers for the ISBN book source tests.
 */

export type FetchResult = { ok: boolean; body?: unknown; text?: string; reject?: never } | { reject: true };
export type FetchHandler = (url: string) => FetchResult | undefined;

/**
 * Installs a global fetch mock that routes requests by URL prefix.
 * Unmatched URLs receive a 404 response; handlers may force a rejection.
 */
export function installFetchMock(handler: FetchHandler): ReturnType<typeof vi.fn> {
  const mock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const result = handler(url);
    if (result && result.reject) throw new Error(`Rejected by test mock: ${url}`);
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

/** Installs a fetch mock where every request fails (404). */
export function installFailingFetch(): ReturnType<typeof vi.fn> {
  return installFetchMock(() => undefined);
}

export function cleanupFetchMock(): void {
  delete (global as { fetch?: typeof fetch }).fetch;
}

export function useFailingFetchInTests(): void {
  beforeEach(() => {
    vi.clearAllMocks();
    installFailingFetch();
  });

  afterEach(() => {
    cleanupFetchMock();
  });
}

/** Installs a mock that succeeds for the Open Library ISBN endpoint + follow-ups. */
export function installOpenLibrarySuccess(): ReturnType<typeof vi.fn> {
  return installFetchMock(url => {
    if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
    if (url.includes('/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
    if (url.includes('/works/')) return { ok: true, body: { description: { value: 'A practical guide to modern data systems.' } } };
    return undefined;
  });
}

/** Installs a mock that succeeds for the Google Books API. */
export function installGoogleBooksSuccess(): ReturnType<typeof vi.fn> {
  return installFetchMock(url => {
    if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
    return undefined;
  });
}

/** Installs a mock that succeeds for the Wikidata search + label APIs. */
export function installWikidataSuccess(): ReturnType<typeof vi.fn> {
  return installFetchMock(url => {
    if (url.includes('action=query')) return { ok: true, body: WIKIDATA_SEARCH_PAYLOAD };
    if (url.includes('action=wbgetentities')) return { ok: true, body: WIKIDATA_ENTITY_PAYLOAD };
    return undefined;
  });
}

/** Installs a mock that succeeds for the DNB SRU endpoint. */
export function installDnbSuccess(): ReturnType<typeof vi.fn> {
  return installFetchMock(url => {
    if (url.startsWith('https://services.dnb.de/')) return { ok: true, text: DNB_XML };
    return undefined;
  });
}

export const OPENLIBRARY_EDITION = {
  title: 'Designing Data-Intensive Applications',
  subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
  publish_date: 'Apr 02, 2017',
  publishers: ["O'Reilly Media"],
  number_of_pages: 624,
  covers: [8434671],
  authors: [{ key: '/authors/OL7477772A' }],
  works: [{ key: '/works/OL19293745W' }],
};

export const GOOGLE_BOOKS_PAYLOAD = {
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

export const WIKIDATA_SEARCH_PAYLOAD = {
  query: {
    search: [{ title: 'Q110418801' }],
  },
};

export const WIKIDATA_ENTITY_PAYLOAD = {
  entities: {
    Q110418801: { labels: { en: { value: 'Introduction to Algorithms' } } },
  },
};

export const DNB_XML = `<?xml version="1.0" encoding="UTF-8"?>
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

export const DNB_EMPTY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
  <numberOfRecords>0</numberOfRecords>
  <records/>
</searchRetrieveResponse>`;
