import { BookAuthor, parseFullName } from './authors';
import { ISBNMetadata, ISBNSourceProvider, ISBNLookup, fetchWithTimeout, hasAnyField } from './isbnMetadata';

export class OpenLibraryProvider implements ISBNSourceProvider {
  readonly name = 'OpenLibrary';
  readonly actionLabel = 'View on OpenLibrary';

  isbnUrl(isbn: string): string {
    return `https://openlibrary.org/isbn/${isbn}`;
  }

  async fetch(lookup: ISBNLookup): Promise<Partial<ISBNMetadata> | null> {
    const { isbn } = lookup;
    try {
      const response = await fetchWithTimeout(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`);
      if (!response.ok) return null;
      const edition = (await response.json()) as Record<string, unknown>;

      const metadata: Partial<ISBNMetadata> = {
        title: typeof edition.title === 'string' ? edition.title : undefined,
        subtitle: typeof edition.subtitle === 'string' ? edition.subtitle : undefined,
        publishers: Array.isArray(edition.publishers) ? ((edition.publishers as unknown[]).filter(p => typeof p === 'string') as string[]) : undefined,
        publishDate: typeof edition.publish_date === 'string' ? edition.publish_date : undefined,
        pages: typeof edition.number_of_pages === 'number' ? edition.number_of_pages : undefined,
        sourceUrl: `https://openlibrary.org/isbn/${isbn}`,
      };

      const coverIds = Array.isArray(edition.covers) ? (edition.covers as number[]) : [];
      if (coverIds.length > 0) {
        metadata.coverUrl = `https://covers.openlibrary.org/b/id/${coverIds[0]}-M.jpg`;
      }

      const authorKeys = (Array.isArray(edition.authors) ? edition.authors : []) as { key?: string }[];
      const authorNames = await this.fetchAuthorNames(authorKeys);
      if (authorNames.length > 0) metadata.authors = authorNames;

      const description = await this.fetchWorkDescription(edition);
      if (description) metadata.description = description;

      return hasAnyField(metadata) ? metadata : null;
    } catch {
      return null;
    }
  }

  private async fetchAuthorNames(authorKeys: { key?: string }[]): Promise<BookAuthor[]> {
    const authors = await Promise.all(
      authorKeys
        .map(author => author.key)
        .filter((key): key is string => Boolean(key))
        .map(async key => {
          try {
            const response = await fetchWithTimeout(`https://openlibrary.org${key}.json`);
            if (!response.ok) return null;
            const author = (await response.json()) as { name?: string };
            return typeof author.name === 'string' ? parseFullName(author.name) : null;
          } catch {
            return null;
          }
        }),
    );
    return authors.filter((author): author is BookAuthor => Boolean(author));
  }

  private async fetchWorkDescription(edition: Record<string, unknown>): Promise<string | null> {
    const works = (Array.isArray(edition.works) ? edition.works : []) as { key?: string }[];
    const workKey = works.find(work => work.key)?.key;
    if (!workKey) return null;
    try {
      const response = await fetchWithTimeout(`https://openlibrary.org${workKey}.json`);
      if (!response.ok) return null;
      const work = (await response.json()) as { description?: string | { value?: string } };
      if (!work.description) return null;
      if (typeof work.description === 'string') return work.description;
      return work.description.value || null;
    } catch {
      return null;
    }
  }
}
