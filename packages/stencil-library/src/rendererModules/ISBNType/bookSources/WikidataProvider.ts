import { BookMetadata, BookSourceProvider, IsbnLookup, fetchWithTimeout, hasAnyField } from './BookMetadata';

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
export class WikidataProvider implements BookSourceProvider {
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
