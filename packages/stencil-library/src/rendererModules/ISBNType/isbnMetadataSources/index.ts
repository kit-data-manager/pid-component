import { DnbProvider, normalizeDnbCreator, parseDnbOaiDc } from './DnbProvider';
import { OpenLibraryProvider } from './OpenLibraryProvider';
import { WikidataProvider } from './WikidataProvider';
import { formatAuthor, parseFullName } from './authors';
import type { BookAuthor } from './authors';
import type { AggregatedISBNMetadata, ISBNMetadata, ISBNSourceProvider, ISBNSourceResult, ISBNLookup } from './isbnMetadata';

export type { AggregatedISBNMetadata, ISBNMetadata, ISBNSourceProvider, ISBNSourceResult, ISBNLookup, BookAuthor };
export { DEFAULT_ISBN_SOURCE_PRIORITY, aggregateISBNMetadata, selectIsbnProviders } from './aggregateISBNMetadata';
export { parseDnbOaiDc, normalizeDnbCreator };
export { formatAuthor, parseFullName };

export function createDefaultIsbnProviders(): ISBNSourceProvider[] {
  return [new OpenLibraryProvider(), new DnbProvider(), new WikidataProvider()];
}

/**
 * Returns action label and ISBN-based URL for a source by name. Used as a
 * fallback for cache entries that predate action labels/URLs.
 */
export function getProviderAction(name: string, isbn: string): { actionLabel: string; actionUrl: string } | null {
  const provider = createDefaultIsbnProviders().find(candidate => candidate.name === name);
  if (!provider) return null;
  return { actionLabel: provider.actionLabel, actionUrl: provider.isbnUrl(isbn) };
}
