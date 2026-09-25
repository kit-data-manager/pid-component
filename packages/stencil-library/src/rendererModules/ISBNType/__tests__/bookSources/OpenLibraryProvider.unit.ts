import { describe, expect, it } from 'vitest';
import { OpenLibraryProvider } from '../../bookSources/OpenLibraryProvider';
import { OPENLIBRARY_EDITION, installOpenLibrarySuccess, installFetchMock, useFailingFetchInTests } from './bookSourcesTestUtils';

describe('OpenLibraryProvider', () => {
  useFailingFetchInTests();

  it('has name and action metadata', () => {
    const provider = new OpenLibraryProvider();
    expect(provider.name).toBe('OpenLibrary');
    expect(provider.actionLabel).toBe('View on OpenLibrary');
    expect(provider.isbnUrl('9781449373320')).toBe('https://openlibrary.org/isbn/9781449373320');
  });

  it('fetches the edition document and maps all fields', async () => {
    installOpenLibrarySuccess();
    const provider = new OpenLibraryProvider();

    const metadata = await provider.fetch({ isbn: '9781449373320' });

    expect(metadata).toEqual({
      title: OPENLIBRARY_EDITION.title,
      subtitle: OPENLIBRARY_EDITION.subtitle,
      publishDate: OPENLIBRARY_EDITION.publish_date,
      publishers: OPENLIBRARY_EDITION.publishers,
      pages: OPENLIBRARY_EDITION.number_of_pages,
      sourceUrl: 'https://openlibrary.org/isbn/9781449373320',
      coverUrl: 'https://covers.openlibrary.org/b/id/8434671-M.jpg',
      authors: [{ givenName: 'Martin', familyName: 'Kleppmann', fullName: 'Martin Kleppmann' }],
      description: 'A practical guide to modern data systems.',
    });
  });

  it('returns null when the ISBN is unknown', async () => {
    const provider = new OpenLibraryProvider();

    const metadata = await provider.fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('returns null when the request fails', async () => {
    const provider = new OpenLibraryProvider();
    installFetchMock(() => ({ ok: false }));

    const metadata = await provider.fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('returns null when the edition has no useful fields', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: { key: '/books/OL1M' } };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toBeNull();
  });

  it('omits authors when the author follow-up fails', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
      // /authors/ and /works/ requests fail
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.title).toBe(OPENLIBRARY_EDITION.title);
    expect(metadata?.authors).toBeUndefined();
    expect(metadata?.description).toBeUndefined();
  });

  it('omits authors when the author follow-up throws', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
      if (url.includes('/authors/')) return { reject: true };
      if (url.includes('/works/')) return { ok: true, body: { description: { value: 'description' } } };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.title).toBe(OPENLIBRARY_EDITION.title);
    expect(metadata?.authors).toBeUndefined();
    expect(metadata?.description).toBe('description');
  });

  it('omits the description when the work follow-up throws', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
      if (url.includes('/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
      if (url.includes('/works/')) return { reject: true };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.authors).toEqual([{ givenName: 'Martin', familyName: 'Kleppmann', fullName: 'Martin Kleppmann' }]);
    expect(metadata?.description).toBeUndefined();
  });

  it('omits the author entry when the author document has no name', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
      if (url.includes('/authors/')) return { ok: true, body: {} };
      if (url.includes('/works/')) return { ok: true, body: { description: { value: 'work description' } } };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.authors).toBeUndefined();
    expect(metadata?.description).toBe('work description');
  });

  it('reads a plain string work description', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
      if (url.includes('/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
      if (url.includes('/works/')) return { ok: true, body: { description: 'plain string description' } };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.description).toBe('plain string description');
  });

  it('falls back to an empty description when the work has none', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) return { ok: true, body: OPENLIBRARY_EDITION };
      if (url.includes('/authors/')) return { ok: true, body: { name: 'Martin Kleppmann' } };
      if (url.includes('/works/')) return { ok: true, body: { description: { value: '' } } };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata?.description).toBeUndefined();
  });

  it('handles editions without subtitle, publishers, covers, pages, or works', async () => {
    installFetchMock(url => {
      if (url.includes('/isbn/')) {
        return { ok: true, body: { title: 'Bare Edition', authors: [{ key: '/authors/OL1A' }] } };
      }
      if (url.includes('/authors/')) return { ok: true, body: { name: 'Some Author' } };
      return undefined;
    });

    const metadata = await new OpenLibraryProvider().fetch({ isbn: '9781449373320' });

    expect(metadata).toEqual({
      title: 'Bare Edition',
      sourceUrl: 'https://openlibrary.org/isbn/9781449373320',
      authors: [{ givenName: 'Some', familyName: 'Author', fullName: 'Some Author' }],
    });
  });
});
