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
