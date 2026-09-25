import { describe, expect, it } from 'vitest';
import { GoogleBooksProvider } from '../../bookSources/GoogleBooksProvider';
import { GOOGLE_BOOKS_PAYLOAD, installFetchMock, installGoogleBooksSuccess, useFailingFetchInTests } from './bookSourcesTestUtils';

describe('GoogleBooksProvider', () => {
  useFailingFetchInTests();

  it('has name and action metadata', () => {
    const provider = new GoogleBooksProvider();
    expect(provider.name).toBe('Google Books');
    expect(provider.actionLabel).toBe('View on Google Books');
    expect(provider.isbnUrl('9781449373320')).toBe('https://www.google.com/search?tbm=bks&q=isbn:9781449373320');
  });

  it('maps volumeInfo fields and upgrades the cover to https', async () => {
    installGoogleBooksSuccess();
    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toEqual({
      title: 'Designing Data-Intensive Applications',
      subtitle: 'The Big Ideas Behind Reliable, Scalable, and Maintainable Systems',
      authors: ['Martin Kleppmann'],
      publishers: ["O'Reilly Media"],
      publishDate: '2017-04-02',
      description: 'A practical guide to modern data systems.',
      pages: 616,
      language: 'en',
      subjects: ['Computer Science'],
      sourceUrl: 'https://books.google.com/books?id=example',
      coverUrl: 'https://books.google.com/books/content?id=example&zoom=1',
    });
  });

  it('returns null when no volume matches the ISBN', async () => {
    installFetchMock(() => ({ ok: true, body: { totalItems: 0 } }));

    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('returns null when the request fails', async () => {
    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('returns null when the request rejects', async () => {
    installFetchMock(() => ({ reject: true }));

    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('falls back to smallThumbnail when thumbnail is missing', async () => {
    installFetchMock(() => ({
      ok: true,
      body: {
        items: [
          {
            volumeInfo: {
              title: 'Thumbless',
              imageLinks: { smallThumbnail: 'http://books.google.com/small?id=example' },
            },
          },
        ],
      },
    }));

    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.coverUrl).toBe('https://books.google.com/small?id=example');
  });

  it('keeps only meaningful list fields', async () => {
    installFetchMock(() => ({
      ok: true,
      body: {
        items: [
          {
            volumeInfo: {
              title: 'Minimal Book',
              authors: [],
              publisher: undefined,
              imageLinks: {},
            },
          },
        ],
      },
    }));

    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toEqual({
      title: 'Minimal Book',
      sourceUrl: undefined,
    });
  });

  it('returns null when the volume has no useful fields', async () => {
    installFetchMock(() => ({ ok: true, body: { items: [{ volumeInfo: {} }] } }));

    const metadata = await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('queries the API with the normalized ISBN', async () => {
    const { installFetchMock: install } = await import('./bookSourcesTestUtils');
    const mock = install(url => {
      if (url.startsWith('https://www.googleapis.com/books/')) return { ok: true, body: GOOGLE_BOOKS_PAYLOAD };
      return undefined;
    });

    await new GoogleBooksProvider().fetch({ isbn: '9781449373320' });

    expect(mock.mock.calls[0][0]).toBe('https://www.googleapis.com/books/v1/volumes?q=isbn:9781449373320');
  });
});
