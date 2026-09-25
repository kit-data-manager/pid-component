import { describe, expect, it } from 'vitest';
import { createDefaultIsbnProviders, getProviderAction } from '../../bookSources';
import { DEFAULT_ISBN_SOURCE_PRIORITY } from '../../bookSources/aggregateBookMetadata';

describe('createDefaultIsbnProviders', () => {
  it('creates all default providers in priority order', () => {
    const providers = createDefaultIsbnProviders();
    expect(providers.map(provider => provider.name)).toEqual([...DEFAULT_ISBN_SOURCE_PRIORITY]);
  });

  it('creates independent provider instances', () => {
    const first = createDefaultIsbnProviders();
    const second = createDefaultIsbnProviders();
    expect(first[0]).not.toBe(second[0]);
  });
});

describe('getProviderAction', () => {
  it('returns label and ISBN-based URL for a known source', () => {
    expect(getProviderAction('OpenLibrary', '9781449373320')).toEqual({
      actionLabel: 'View on OpenLibrary',
      actionUrl: 'https://openlibrary.org/isbn/9781449373320',
    });
    expect(getProviderAction('DNB', '9783453416017')).toEqual({
      actionLabel: 'View in DNB catalog',
      actionUrl: 'https://portal.dnb.de/opac.htm?query=isbn:9783453416017',
    });
  });

  it('returns null for an unknown source name', () => {
    expect(getProviderAction('Unknown', '9781449373320')).toBeNull();
  });
});
