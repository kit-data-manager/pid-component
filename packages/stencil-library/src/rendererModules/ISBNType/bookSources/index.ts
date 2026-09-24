import { DnbProvider, parseDnbOaiDc } from './DnbProvider';
import { GoogleBooksProvider } from './GoogleBooksProvider';
import { OpenLibraryProvider } from './OpenLibraryProvider';
import { WikidataProvider } from './WikidataProvider';
import type { AggregatedBookMetadata, BookMetadata, BookSourceProvider, BookSourceResult, IsbnLookup } from './BookMetadata';

export type { AggregatedBookMetadata, BookMetadata, BookSourceProvider, BookSourceResult, IsbnLookup };
export { DEFAULT_ISBN_SOURCE_PRIORITY, aggregateBookMetadata, selectIsbnProviders } from './aggregateBookMetadata';
export { parseDnbOaiDc };

export function createDefaultIsbnProviders(): BookSourceProvider[] {
  return [new OpenLibraryProvider(), new GoogleBooksProvider(), new DnbProvider(), new WikidataProvider()];
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
