import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_ISBN_SOURCE_PRIORITY, aggregateISBNMetadata, selectIsbnProviders } from '../../isbnMetadataSources/aggregateISBNMetadata';
import type { ISBNSourceProvider, ISBNLookup } from '../../isbnMetadataSources/isbnMetadata';

const LOOKUP: ISBNLookup = { isbn: '9781449373320' };

function provider(name: string, fetchImpl: ISBNSourceProvider['fetch']): ISBNSourceProvider {
  return { name, actionLabel: `View on ${name}`, isbnUrl: () => `https://example.com/${name}`, fetch: fetchImpl };
}

describe('aggregateISBNMetadata', () => {
  it('merges with field priority and fills gaps from lower-priority sources', async () => {
    const providers = [
      provider('OpenLibrary', async () => ({ title: 'OL Title', pages: 624, authors: [{ givenName: 'Martin', familyName: 'Kleppmann' }] })),
      provider('Google Books', async () => ({
        title: 'GB Title',
        subtitle: 'GB Subtitle',
        publishers: ["O'Reilly Media"],
        description: 'GB description',
        language: 'en',
        subjects: ['CS'],
      })),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result?.merged).toEqual({
      title: 'OL Title',
      pages: 624,
      authors: [{ givenName: 'Martin', familyName: 'Kleppmann' }],
      subtitle: 'GB Subtitle',
      publishers: ["O'Reilly Media"],
      description: 'GB description',
      language: 'en',
      subjects: ['CS'],
      sourceUrl: undefined,
      coverUrl: undefined,
    });
  });

  it('keeps the highest-priority sourceUrl and coverUrl', async () => {
    const providers = [
      provider('OpenLibrary', async () => ({ title: 'OL Title', sourceUrl: 'https://openlibrary.org/isbn/9781449373320' })),
      provider('Google Books', async () => ({ title: 'GB Title', sourceUrl: 'https://books.google.com/deep-link', coverUrl: 'https://books.google.com/cover.jpg' })),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result?.merged.sourceUrl).toBe('https://openlibrary.org/isbn/9781449373320');
    expect(result?.merged.coverUrl).toBe('https://books.google.com/cover.jpg');
  });

  it('returns null when no provider has data', async () => {
    const providers = [
      provider('OpenLibrary', async () => null),
      provider('Google Books', async () => {
        throw new Error('network down');
      }),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result).toBeNull();
  });

  it('survives a provider that throws and keeps the other results', async () => {
    const providers = [
      provider('OpenLibrary', async () => {
        throw new Error('network down');
      }),
      provider('Google Books', async () => ({ title: 'GB Title' })),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result?.merged.title).toBe('GB Title');
    expect(result?.sources.map(source => source.name)).toEqual(['Google Books']);
  });

  it('merges list fields without duplicates, case-insensitively', async () => {
    const providers = [
      provider('OpenLibrary', async () => ({ authors: [{ givenName: 'Martin', familyName: 'Kleppmann' }], publishers: ['O Reilly'] })),
      provider('Google Books', async () => ({
        authors: [
          { givenName: 'martin', familyName: 'kleppmann' },
          { givenName: 'Someone', familyName: 'Else' },
        ],
        publishers: ['o reilly', 'Springer'],
      })),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result?.merged.authors).toEqual([
      { givenName: 'Martin', familyName: 'Kleppmann' },
      { givenName: 'Someone', familyName: 'Else' },
    ]);
    expect(result?.merged.publishers).toEqual(['O Reilly', 'Springer']);
  });

  it('sorts sources by default priority, unknown providers last', async () => {
    const providers = [
      provider('Custom', async () => ({ title: 'Custom Title' })),
      provider('Wikidata', async () => ({ title: 'WD Title' })),
      provider('OpenLibrary', async () => ({ title: 'OL Title' })),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result?.sources.map(source => source.name)).toEqual(['OpenLibrary', 'Wikidata', 'Custom']);
    expect(result?.merged.title).toBe('OL Title');
  });

  it('builds actionUrl from the deep link when available and from isbnUrl otherwise', async () => {
    const providers = [
      provider('OpenLibrary', async () => ({ title: 'OL Title', sourceUrl: 'https://openlibrary.org/isbn/9781449373320' })),
      provider('Google Books', async () => ({ title: 'GB Title' })),
    ];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    const openLibrary = result?.sources.find(source => source.name === 'OpenLibrary');
    expect(openLibrary?.actionUrl).toBe('https://openlibrary.org/isbn/9781449373320');
    expect(openLibrary?.actionLabel).toBe('View on OpenLibrary');
    const googleBooks = result?.sources.find(source => source.name === 'Google Books');
    expect(googleBooks?.actionUrl).toBe('https://example.com/Google Books');
    expect(googleBooks?.actionLabel).toBe('View on Google Books');
  });

  it('removes empty list fields from the merged result', async () => {
    const providers = [provider('OpenLibrary', async () => ({ title: 'OL Title' }))];

    const result = await aggregateISBNMetadata(LOOKUP, providers);

    expect(result?.merged.authors).toBeUndefined();
    expect(result?.merged.publishers).toBeUndefined();
    expect(result?.merged.subjects).toBeUndefined();
  });
});

describe('selectIsbnProviders', () => {
  const providers = [
    provider('OpenLibrary', async () => null),
    provider('Google Books', async () => null),
    provider('DNB', async () => null),
    provider('Wikidata', async () => null),
  ];

  it('returns all providers when enabled is undefined or empty', () => {
    expect(selectIsbnProviders(providers, undefined)).toHaveLength(4);
    expect(selectIsbnProviders(providers, [])).toHaveLength(4);
  });

  it('returns only the enabled providers', () => {
    const selected = selectIsbnProviders(providers, ['DNB', 'Wikidata']);
    expect(selected.map(p => p.name)).toEqual(['DNB', 'Wikidata']);
  });

  it('returns an empty list when no enabled name matches', () => {
    expect(selectIsbnProviders(providers, ['Unknown'])).toHaveLength(0);
  });
});

describe('DEFAULT_ISBN_SOURCE_PRIORITY', () => {
  it('lists all default providers', () => {
    expect(DEFAULT_ISBN_SOURCE_PRIORITY).toEqual(['OpenLibrary', 'Google Books', 'DNB', 'Wikidata']);
  });
});

describe('fetchWithTimeout aborts hanging requests', () => {
  it('aborts after the timeout', async () => {
    vi.useFakeTimers();
    try {
      const { fetchWithTimeout } = await import('../../isbnMetadataSources/isbnMetadata');
      const pending = fetchWithTimeout('https://example.com/hanging');
      const expectation = expect(pending).rejects.toThrow();
      await vi.advanceTimersByTimeAsync(5000);
      await expectation;
    } finally {
      vi.useRealTimers();
    }
  });
});
