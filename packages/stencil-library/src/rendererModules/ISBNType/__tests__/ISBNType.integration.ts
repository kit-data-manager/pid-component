import { describe, expect, it } from 'vitest';
import { aggregateBookMetadata, createDefaultIsbnProviders } from '../bookSources';

/**
 * Integration tests against the real book metadata APIs.
 *
 * These tests perform actual network requests and are skipped by default.
 * Run them explicitly with:
 *   RUN_API_INTEGRATION_TESTS=1 npm run test:integration
 *
 * Google Books anonymous quota may be exhausted at times; that provider's
 * test tolerates a quota failure.
 */
const RUN_INTEGRATION_TESTS = Boolean(process.env.RUN_API_INTEGRATION_TESTS);

const CLRS_ISBN = '9780262033848';
const CLRS_ISBN_HYPHENATED = '978-0-262-03384-8';
const DNB_ISBN = '9783453416017';

describe('ISBN book source integration', () => {
  describe.skipIf(!RUN_INTEGRATION_TESTS)('aggregateBookMetadata', () => {
    it('aggregates real metadata from all sources for a well-known ISBN', { timeout: 30000 }, async () => {
      const result = await aggregateBookMetadata({ isbn: CLRS_ISBN, hyphenated: CLRS_ISBN_HYPHENATED }, createDefaultIsbnProviders());

      expect(result).not.toBeNull();
      expect(result?.merged.title).toBeTruthy();
      expect(result?.sources.length).toBeGreaterThan(0);
      expect(result?.merged.sourceUrl).toBeTruthy();
    });
  });

  describe.skipIf(!RUN_INTEGRATION_TESTS)('individual providers', () => {
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
});
