import { BookAuthor, parseFullName } from './authors';
import { ISBNMetadata, ISBNSourceProvider, ISBNLookup, fetchWithTimeout, hasAnyField, hyphenateForSearch } from './isbnMetadata';

interface WikidataSearchResponse {
  query?: {
    search?: {
      title?: string;
    }[];
  };
}

interface WikidataClaimEntity {
  entities?: Record<string, { labels?: Record<string, { value?: string }>; claims?: Record<string, WikidataClaim[]> }>;
}

interface WikidataClaim {
  mainsnak?: {
    datavalue?: {
      value?: string | { id?: string };
    };
  };
}

/**
 * Wikidata stores ISBNs (P212/P957) as hyphenated strings and its search
 * only matches the exact stored form. A reliable reverse lookup therefore
 * requires the hyphenated form of the identifier (either from the original
 * identifier text or computed by isbn3). The SPARQL endpoint could match
 * without hyphens, but its cold queries regularly take tens of seconds,
 * which is not acceptable for an interactive component.
 *
 * Author extraction uses the book entity's P50 claims, resolved through a
 * single batched entity request.
 */
export class WikidataProvider implements ISBNSourceProvider {
  readonly name = 'Wikidata';
  readonly actionLabel = 'View on Wikidata';

  readonly headers = { 'User-Agent': 'pid-component (https://github.com/kit-data-manager/pid-component)' };

  isbnUrl(isbn: string): string {
    return `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(`haswbstatement:P212=${hyphenateForSearch(isbn)}`)}`;
  }

  async fetch(lookup: ISBNLookup): Promise<Partial<ISBNMetadata> | null> {
    // ISBN-13 is stored as P212, ISBN-10 as P957.
    const property = lookup.isbn.length === 13 ? 'P212' : 'P957';
    const candidates = [lookup.hyphenated, lookup.isbn].filter((value): value is string => Boolean(value));

    for (const candidate of candidates) {
      const metadata = await this.fetchByIsbn(property, candidate);
      if (metadata) return metadata;
    }
    return null;
  }

  private async fetchByIsbn(property: string, isbn: string): Promise<Partial<ISBNMetadata> | null> {
    try {
      const searchUrl = `https://www.wikidata.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(`haswbstatement:${property}=${isbn}`)}&srlimit=1`;
      const response = await fetchWithTimeout(searchUrl, { headers: this.headers });
      if (!response.ok) return null;
      const payload = (await response.json()) as WikidataSearchResponse;
      const qid = payload.query?.search?.[0]?.title;
      if (!qid) return null;

      const entity = await this.fetchEntity(qid);
      if (!entity) return null;

      const metadata: Partial<ISBNMetadata> = {
        title: entity.labels?.en?.value || undefined,
        sourceUrl: `https://www.wikidata.org/entity/${qid}`,
      };

      const authorIds = this.extractAuthorIds(entity);
      const authors = await this.fetchAuthorNames(authorIds);
      if (authors.length > 0) metadata.authors = authors;

      return hasAnyField(metadata) ? metadata : null;
    } catch {
      return null;
    }
  }

  private async fetchEntity(qid: string): Promise<{ labels?: Record<string, { value?: string }>; claims?: Record<string, WikidataClaim[]> } | null> {
    try {
      const response = await fetchWithTimeout(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${encodeURIComponent(qid)}&props=labels|claims&languages=en`,
        {
          headers: this.headers,
        },
      );
      if (!response.ok) return null;
      const payload = (await response.json()) as WikidataClaimEntity;
      return payload.entities?.[qid] || null;
    } catch {
      return null;
    }
  }

  private extractAuthorIds(entity: { claims?: Record<string, WikidataClaim[]> }): string[] {
    return (entity.claims?.P50 || [])
      .map(claim => claim.mainsnak?.datavalue?.value)
      .filter((value): value is { id: string } => Boolean(value && typeof value === 'object' && (value as { id?: string }).id))
      .map(value => value.id);
  }

  private async fetchAuthorNames(authorIds: string[]): Promise<BookAuthor[]> {
    if (authorIds.length === 0) return [];
    try {
      const response = await fetchWithTimeout(
        `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${encodeURIComponent(authorIds.join('|'))}&props=labels&languages=en`,
        { headers: this.headers },
      );
      if (!response.ok) return [];
      const payload = (await response.json()) as WikidataClaimEntity;
      const entities = payload.entities || {};
      return authorIds
        .map(id => entities[id]?.labels?.en?.value)
        .filter((label): label is string => Boolean(label))
        .map(label => parseFullName(label));
    } catch {
      return [];
    }
  }
}
