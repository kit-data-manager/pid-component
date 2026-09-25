import { describe, expect, it } from 'vitest';
import { aggregateISBNMetadata, createDefaultIsbnProviders } from '../isbnMetadataSources';

/**
 * Integration tests against the real book metadata APIs.
 *
 * These tests perform actual network requests. They live in the dedicated
 * 'integration' vitest project, which is not part of the default
 * `npm test` run, so they only execute when run explicitly via:
 *   npm run test:integration
 *
 * Google Books anonymous quota may be exhausted at times; that provider's
 * test tolerates a quota failure.
 */
const CLRS_ISBN = '9780262033848';
const CLRS_ISBN_HYPHENATED = '978-0-262-03384-8';
const DNB_ISBN = '9783453416017';

describe('ISBN book source integration', () => {
  describe('aggregateISBNMetadata', () => {
    it('aggregates real metadata from all sources for a well-known ISBN', { timeout: 30000 }, async () => {
      const result = await aggregateISBNMetadata({ isbn: CLRS_ISBN, hyphenated: CLRS_ISBN_HYPHENATED }, createDefaultIsbnProviders());

      expect(result).not.toBeNull();
      expect(result?.merged.title).toBeTruthy();
      expect(result?.sources.length).toBeGreaterThan(0);
      expect(result?.merged.sourceUrl).toBeTruthy();
    });
  });

  describe('individual providers', () => {
    it('OpenLibrary returns metadata via the new /isbn endpoint', { timeout: 30000 }, async () => {
      const provider = createDefaultIsbnProviders().find(p => p.name === 'OpenLibrary');
      const metadata = await provider?.fetch({ isbn: CLRS_ISBN });

      expect(metadata?.title).toContain('Introduction to Algorithms');
      expect(metadata?.sourceUrl).toBe(`https://openlibrary.org/isbn/${CLRS_ISBN}`);
    });

    it('Google Books returns metadata or fails gracefully on quota exhaustion', { timeout: 30000 }, async () => {
      const provider = createDefaultIsbnProviders().find(p => p.name === 'Google Books');
      const metadata = await provider?.fetch({ isbn: CLRS_ISBN });

      if (metadata) {
        expect(metadata.title).toBeTruthy();
      } else {
        expect(metadata).toBeNull();
      }
    });

    it('Wikidata resolves a hyphenated ISBN to an entity', { timeout: 30000 }, async () => {
      const provider = createDefaultIsbnProviders().find(p => p.name === 'Wikidata');
      const metadata = await provider?.fetch({ isbn: CLRS_ISBN, hyphenated: CLRS_ISBN_HYPHENATED });

      expect(metadata?.sourceUrl).toMatch(/^https?:\/\/www\.wikidata\.org\/entity\/Q\d+$/);
    });

    it('DNB returns metadata for a German publication', { timeout: 30000 }, async () => {
      const provider = createDefaultIsbnProviders().find(p => p.name === 'DNB');
      const metadata = await provider?.fetch({ isbn: DNB_ISBN });

      expect(metadata?.title).toBeTruthy();
      expect(metadata?.sourceUrl).toMatch(/^https:\/\/d-nb\.info\/\d+$/);
    });
  });

  describe('action links resolve', () => {
    it('provider ISBN action URLs return a successful response', { timeout: 60000 }, async () => {
      for (const provider of createDefaultIsbnProviders()) {
        const url = provider.isbnUrl(CLRS_ISBN);
        const response = await fetch(url, { redirect: 'follow' });
        // Google Books search may answer 429 under heavy anonymous quota use;
        // every other source must resolve.
        if (provider.name === 'Google Books') {
          expect([200, 301, 302, 429]).toContain(response.status);
        } else {
          expect(response.ok).toBe(true);
        }
      }
    });

    it('aggregated deep links resolve', { timeout: 60000 }, async () => {
      const result = await aggregateISBNMetadata({ isbn: CLRS_ISBN, hyphenated: CLRS_ISBN_HYPHENATED }, createDefaultIsbnProviders());
      expect(result).not.toBeNull();

      for (const source of result?.sources ?? []) {
        expect(source.actionUrl).toBeTruthy();
        const response = await fetch(source.actionUrl, { redirect: 'follow' });
        if (source.name !== 'Google Books') {
          expect(response.ok).toBe(true);
        }
      }
    });
  });
});
