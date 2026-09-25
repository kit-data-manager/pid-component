import { parseFullName } from './authors';
import { ISBNMetadata, ISBNSourceProvider, ISBNLookup, fetchWithTimeout, hasAnyField, toHttps } from './isbnMetadata';

interface GoogleBooksVolume {
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    language?: string;
    categories?: string[];
    infoLink?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

export class GoogleBooksProvider implements ISBNSourceProvider {
  readonly name = 'Google Books';
  readonly actionLabel = 'View on Google Books';

  isbnUrl(isbn: string): string {
    return `https://www.google.com/search?tbm=bks&q=isbn:${isbn}`;
  }

  async fetch(lookup: ISBNLookup): Promise<Partial<ISBNMetadata> | null> {
    try {
      const response = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(lookup.isbn)}`);
      if (!response.ok) return null;
      const payload = (await response.json()) as { totalItems?: number; items?: GoogleBooksVolume[] };
      const info = payload.items?.[0]?.volumeInfo;
      if (!info) return null;

      const metadata: Partial<ISBNMetadata> = {
        title: info.title,
        subtitle: info.subtitle,
        authors: info.authors && info.authors.length > 0 ? info.authors.map(parseFullName) : undefined,
        publishers: info.publisher ? [info.publisher] : undefined,
        publishDate: info.publishedDate,
        description: info.description,
        pages: info.pageCount,
        language: info.language,
        subjects: info.categories,
        sourceUrl: info.infoLink,
      };

      const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
      if (thumbnail) metadata.coverUrl = toHttps(thumbnail);

      return hasAnyField(metadata) ? metadata : null;
    } catch {
      return null;
    }
  }
}
