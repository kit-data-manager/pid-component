import { BookAuthor, orderAuthors } from './authors';
import { AggregatedBookMetadata, BookMetadata, BookSourceProvider, BookSourceResult, IsbnLookup } from './BookMetadata';

export const DEFAULT_ISBN_SOURCE_PRIORITY = ['OpenLibrary', 'Google Books', 'DNB', 'Wikidata'] as const;

/**
 * Queries all providers in parallel and merges their results field-wise.
 * For each field, the value of the highest-priority provider that supplied
 * a non-empty value wins; remaining gaps are filled by lower-priority sources.
 * Authors are deduplicated across sources and ordered deterministically (see
 * orderAuthors).
 */
export async function aggregateBookMetadata(lookup: IsbnLookup, providers: BookSourceProvider[]): Promise<AggregatedBookMetadata | null> {
  const ordered = [...providers].sort(byPriority);
  const results = await Promise.all(
    ordered.map(async (provider): Promise<BookSourceResult | null> => {
      try {
        const metadata = await provider.fetch(lookup);
        if (!metadata) return null;
        return {
          name: provider.name,
          actionLabel: provider.actionLabel,
          // Prefer the deep link returned by the source; fall back to an
          // ISBN-based URL so the action always opens this book.
          actionUrl: metadata.sourceUrl || provider.isbnUrl(lookup.isbn),
          url: metadata.sourceUrl,
          metadata,
        };
      } catch {
        return null;
      }
    }),
  );

  const sources = results.filter((result): result is BookSourceResult => result !== null);
  if (sources.length === 0) return null;

  const merged: BookMetadata = {
    publishers: [],
    subjects: [],
  };

  const sourceAuthorLists: Record<string, BookAuthor[]> = {};
  for (const source of sources) {
    mergeMetadata(merged, source.metadata);
    if (source.metadata.authors && source.metadata.authors.length > 0) {
      sourceAuthorLists[source.name] = source.metadata.authors;
    }
  }

  const authors = orderAuthors(sourceAuthorLists);
  if (authors.length > 0) merged.authors = authors;

  if (merged.publishers && merged.publishers.length === 0) delete merged.publishers;
  if (merged.subjects && merged.subjects.length === 0) delete merged.subjects;

  return { merged, sources };
}

function byPriority(a: BookSourceProvider, b: BookSourceProvider): number {
  const priorities = DEFAULT_ISBN_SOURCE_PRIORITY as readonly string[];
  const indexA = priorities.indexOf(a.name);
  const indexB = priorities.indexOf(b.name);
  const valueA = indexA === -1 ? priorities.length : indexA;
  const valueB = indexB === -1 ? priorities.length : indexB;
  return valueA - valueB;
}

function mergeMetadata(merged: BookMetadata, addition: Partial<BookMetadata>): void {
  if (!merged.title && addition.title) merged.title = addition.title;
  if (!merged.subtitle && addition.subtitle) merged.subtitle = addition.subtitle;
  if (!merged.publishDate && addition.publishDate) merged.publishDate = addition.publishDate;
  if (!merged.pages && addition.pages) merged.pages = addition.pages;
  if (!merged.description && addition.description) merged.description = addition.description;
  if (!merged.coverUrl && addition.coverUrl) merged.coverUrl = addition.coverUrl;
  if (!merged.sourceUrl && addition.sourceUrl) merged.sourceUrl = addition.sourceUrl;
  if (!merged.language && addition.language) merged.language = addition.language;
  mergeList(merged, 'publishers', addition.publishers);
  mergeList(merged, 'subjects', addition.subjects);
}

function mergeList(merged: BookMetadata, key: 'publishers' | 'subjects', addition: string[] | undefined): void {
  if (!addition || addition.length === 0) return;
  const existing = merged[key] || [];
  for (const value of addition) {
    if (!existing.some(current => current.toLowerCase() === value.toLowerCase())) {
      existing.push(value);
    }
  }
  merged[key] = existing;
}

export function selectIsbnProviders(providers: BookSourceProvider[], enabled: string[] | undefined): BookSourceProvider[] {
  if (!enabled || enabled.length === 0) return providers;
  return providers.filter(provider => enabled.includes(provider.name));
}
