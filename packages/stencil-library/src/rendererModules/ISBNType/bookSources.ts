/**
 * Multi-source book metadata providers for the ISBN renderer.
 *
 * The legacy Open Library Books API (openlibrary.org/api/books) has been
 * discontinued (returns 404). Metadata is now aggregated in parallel from
 * several open APIs and merged field-wise, with a defined provider priority.
 */

export interface BookMetadata {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publishers?: string[];
  publishDate?: string;
  pages?: number;
  description?: string;
  coverUrl?: string;
  sourceUrl?: string;
  language?: string;
  subjects?: string[];
}

/**
 * Input for a book metadata lookup.
 * - `isbn`: normalized ISBN (digits only, uppercase X allowed).
 * - `hyphenated`: the original hyphenated form of the identifier, when
 *   available. Some sources (notably Wikidata) store ISBNs in their
 *   hyphenated form and cannot be queried with plain digits.
 */
export interface IsbnLookup {
  isbn: string;
  hyphenated?: string;
}

export interface BookSourceProvider {
  readonly name: string;
  fetch(lookup: IsbnLookup): Promise<Partial<BookMetadata> | null>;
}

export interface BookSourceResult {
  name: string;
  url?: string;
  metadata: Partial<BookMetadata>;
}

export interface AggregatedBookMetadata {
  merged: BookMetadata;
  sources: BookSourceResult[];
}

const FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toHttps(url: string): string {
  return url.replace(/^http:\/\//i, 'https://');
}

function hasAnyField(metadata: Partial<BookMetadata>): boolean {
  return Boolean(
    metadata.title ||
    metadata.subtitle ||
    (metadata.authors && metadata.authors.length > 0) ||
    (metadata.publishers && metadata.publishers.length > 0) ||
    metadata.publishDate ||
    metadata.description ||
    metadata.coverUrl,
  );
}

function hyphenateForSearch(isbn: string): string {
  if (isbn.length === 13) {
    return `${isbn.slice(0, 3)}-${isbn.slice(3)}`;
  }
  return isbn;
}

class OpenLibraryProvider implements BookSourceProvider {
  readonly name = 'OpenLibrary';

  async fetch(lookup: IsbnLookup): Promise<Partial<BookMetadata> | null> {
    const { isbn } = lookup;
    try {
      const response = await fetchWithTimeout(`https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`);
      if (!response.ok) return null;
      const edition = (await response.json()) as Record<string, unknown>;

      const metadata: Partial<BookMetadata> = {
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

  private async fetchAuthorNames(authorKeys: { key?: string }[]): Promise<string[]> {
    const names = await Promise.all(
      authorKeys
        .map(author => author.key)
        .filter((key): key is string => Boolean(key))
        .map(async key => {
          try {
            const response = await fetchWithTimeout(`https://openlibrary.org${key}.json`);
            if (!response.ok) return null;
            const author = (await response.json()) as { name?: string };
            return typeof author.name === 'string' ? author.name : null;
          } catch {
            return null;
          }
        }),
    );
    return names.filter((name): name is string => Boolean(name));
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

class GoogleBooksProvider implements BookSourceProvider {
  readonly name = 'Google Books';

  async fetch(lookup: IsbnLookup): Promise<Partial<BookMetadata> | null> {
    try {
      const response = await fetchWithTimeout(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(lookup.isbn)}`);
      if (!response.ok) return null;
      const payload = (await response.json()) as { totalItems?: number; items?: GoogleBooksVolume[] };
      const info = payload.items?.[0]?.volumeInfo;
      if (!info) return null;

      const metadata: Partial<BookMetadata> = {
        title: info.title,
        subtitle: info.subtitle,
        authors: info.authors && info.authors.length > 0 ? info.authors : undefined,
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

interface WikidataSearchResponse {
  query?: {
    search?: {
      title?: string;
    }[];
  };
}

interface WikidataEntityResponse {
  entities?: Record<string, { labels?: Record<string, { value?: string }> }>;
}

/**
 * Wikidata stores ISBNs (P212/P957) as hyphenated strings and its search
 * only matches the exact stored form. A reliable reverse lookup therefore
 * requires the hyphenated form of the identifier (usually available from
 * the original identifier text). The SPARQL endpoint could match without
 * hyphens, but its cold queries regularly take tens of seconds, which is
 * not acceptable for an interactive component.
 */
class WikidataProvider implements BookSourceProvider {
  readonly name = 'Wikidata';

  async fetch(lookup: IsbnLookup): Promise<Partial<BookMetadata> | null> {
    // ISBN-13 is stored as P212, ISBN-10 as P957.
    const property = lookup.isbn.length === 13 ? 'P212' : 'P957';
    const candidates = [lookup.hyphenated, lookup.isbn].filter((value): value is string => Boolean(value));

    for (const candidate of candidates) {
      const metadata = await this.fetchByIsbn(property, candidate);
      if (metadata) return metadata;
    }
    return null;
  }

  private async fetchByIsbn(property: string, isbn: string): Promise<Partial<BookMetadata> | null> {
    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(`haswbstatement:${property}=${isbn}`)}&srlimit=1`;
      const response = await fetchWithTimeout(searchUrl, {
        headers: { 'User-Agent': 'pid-component (https://github.com/kit-data-manager/pid-component)' },
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as WikidataSearchResponse;
      const qid = payload.query?.search?.[0]?.title;
      if (!qid) return null;

      const metadata: Partial<BookMetadata> = {
        title: (await this.fetchEntityLabel(qid)) || undefined,
        sourceUrl: `https://www.wikidata.org/entity/${qid}`,
      };
      return hasAnyField(metadata) ? metadata : null;
    } catch {
      return null;
    }
  }

  private async fetchEntityLabel(qid: string): Promise<string | null> {
    try {
      const response = await fetchWithTimeout(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${encodeURIComponent(qid)}&props=labels&languages=en`, {
        headers: { 'User-Agent': 'pid-component (https://github.com/kit-data-manager/pid-component)' },
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as WikidataEntityResponse;
      return payload.entities?.[qid]?.labels?.en?.value || null;
    } catch {
      return null;
    }
  }
}

class DnbProvider implements BookSourceProvider {
  readonly name = 'DNB';

  async fetch(lookup: IsbnLookup): Promise<Partial<BookMetadata> | null> {
    // DNB normalizes hyphens itself, any ISBN spelling works.
    const url = `https://services.dnb.de/sru/dnb?version=1.1&operation=searchRetrieve&query=${encodeURIComponent(`isbn=${lookup.isbn}`)}&recordSchema=oai_dc&maximumRecords=1`;
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) return null;
      const xml = await response.text();
      const metadata = parseDnbOaiDc(xml);
      return hasAnyField(metadata) ? metadata : null;
    } catch {
      return null;
    }
  }
}

export function parseDnbOaiDc(xml: string): Partial<BookMetadata> {
  const extract = (tag: string): string[] => {
    const matches = xml.matchAll(new RegExp(`<dc:${tag}[^>]*>([\\s\\S]*?)</dc:${tag}>`, 'g'));
    return Array.from(matches, match => decodeXmlEntities(match[1].trim())).filter(Boolean);
  };

  const idn = xml.match(/xsi:type="dnb:IDN"[^>]*>([^<]+)</)?.[1];
  const metadata: Partial<BookMetadata> = {
    sourceUrl: idn ? `https://d-nb.info/${idn.trim()}` : undefined,
  };

  const [title] = extract('title');
  if (title) metadata.title = title;

  const creators = extract('creator');
  if (creators.length > 0) metadata.authors = creators;

  const publishers = extract('publisher');
  if (publishers.length > 0) metadata.publishers = publishers;

  const [date] = extract('date');
  if (date) metadata.publishDate = date;

  const subjects = extract('subject');
  if (subjects.length > 0) metadata.subjects = subjects;

  const [format] = extract('format');
  const pages = format?.match(/(\d+)\s*[SpP]\b/)?.[1];
  if (pages) metadata.pages = Number(pages);

  return metadata;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export const DEFAULT_ISBN_SOURCE_PRIORITY = ['OpenLibrary', 'Google Books', 'DNB', 'Wikidata'] as const;

export function createDefaultIsbnProviders(): BookSourceProvider[] {
  return [new OpenLibraryProvider(), new GoogleBooksProvider(), new DnbProvider(), new WikidataProvider()];
}

/**
 * Queries all providers in parallel and merges their results field-wise.
 * For each field, the value of the highest-priority provider that supplied
 * a non-empty value wins; remaining gaps are filled by lower-priority sources.
 */
export async function aggregateBookMetadata(lookup: IsbnLookup, providers: BookSourceProvider[]): Promise<AggregatedBookMetadata | null> {
  const ordered = [...providers].sort(byPriority);
  const results = await Promise.all(
    ordered.map(async (provider): Promise<BookSourceResult | null> => {
      try {
        const metadata = await provider.fetch(lookup);
        return metadata ? { name: provider.name, url: metadata.sourceUrl, metadata } : null;
      } catch {
        return null;
      }
    }),
  );

  const sources = results.filter((result): result is BookSourceResult => result !== null);
  if (sources.length === 0) return null;

  const merged: BookMetadata = {
    authors: [],
    publishers: [],
    subjects: [],
  };
  for (const source of sources) {
    mergeMetadata(merged, source.metadata);
  }
  if (merged.authors && merged.authors.length === 0) delete merged.authors;
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
  mergeList(merged, 'authors', addition.authors);
  mergeList(merged, 'publishers', addition.publishers);
  mergeList(merged, 'subjects', addition.subjects);
}

function mergeList(merged: BookMetadata, key: 'authors' | 'publishers' | 'subjects', addition: string[] | undefined): void {
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

export { hyphenateForSearch };
