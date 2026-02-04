import { cachedFetch } from '../../utils/DataCache';
import { DOI } from './DOI';
import { FoldableItem } from '../../utils/FoldableItem';
import { Creator } from './DataCiteInfo';

/** CrossRef API response shape */
interface CrossRefResponse {
  message: {
    title?: string[];
    subtitle?: string[];
    author?: Array<{
      given?: string;
      family?: string;
      name?: string;
      ORCID?: string;
      affiliation?: Array<{
        name?: string;
      }>;
      sequence?: string; // 'first' or 'additional'
    }>;
    publisher?: string;
    published?: {
      'date-parts'?: number[][];
    };
    created?: {
      'date-parts'?: number[][];
    };
    issued?: {
      'date-parts'?: number[][];
    };
    type?: string;
    abstract?: string;
    URL?: string;
    resource?: {
      primary?: {
        URL?: string;
      };
    };
    subject?: string[];
  };
}

/**
 * This class handles CrossRef-specific metadata parsing and item generation.
 */
export class CrossRefInfo {
  private readonly _rawMetadata: object;
  private readonly _doi: DOI;
  private readonly _message: CrossRefResponse['message'];

  constructor(doi: DOI, response: CrossRefResponse) {
    this._doi = doi;
    this._rawMetadata = response;
    this._message = response.message || {};
  }

  /**
   * Gets the main title
   */
  get title(): string {
    const titles = this._message.title || [];
    return titles[0] || '';
  }

  /**
   * Parses JATS syntax in text
   * JATS (Journal Article Tag Suite) is an XML format used by CrossRef
   */
  private parseJATS(text: string): string {
    if (!text) return text;

    // Remove common JATS tags
    return text
      .replace(/<jats:p>/g, '')
      .replace(/<\/jats:p>/g, '\n')
      .replace(/<jats:italic>/g, '<i>')
      .replace(/<\/jats:italic>/g, '</i>')
      .replace(/<jats:bold>/g, '<b>')
      .replace(/<\/jats:bold>/g, '</b>')
      .replace(/<jats:sub>/g, '<sub>')
      .replace(/<\/jats:sub>/g, '</sub>')
      .replace(/<jats:sup>/g, '<sup>')
      .replace(/<\/jats:sup>/g, '</sup>')
      .replace(/<jats:title>/g, '<strong>')
      .replace(/<\/jats:title>/g, '</strong>')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  }

  /**
   * Gets all creators with enhanced metadata
   */
  get creators(): Creator[] {
    const authors = this._message.author || [];
    return authors.map((author) => {
      const result: Creator = {
        name: author.name || '',
        givenName: author.given,
        familyName: author.family,
      };

      // Build name if not provided
      if (!result.name) {
        if (author.given && author.family) {
          result.name = `${author.given} ${author.family}`;
        } else {
          result.name = author.given || author.family || '';
        }
      }

      // Extract ORCID
      if (author.ORCID) {
        result.orcid = author.ORCID.replace(/^https?:\/\/orcid\.org\//i, '');
      }

      // Extract affiliation
      if (author.affiliation && author.affiliation.length > 0) {
        result.affiliation = author.affiliation[0].name;
      }

      return result;
    }).filter((c) => c.name);
  }

  /**
   * Gets the corresponding author (first author in CrossRef)
   */
  get correspondingAuthor(): Creator | undefined {
    const authors = this._message.author || [];
    const firstAuthor = authors.find((a) => a.sequence === 'first') || authors[0];
    
    if (!firstAuthor) return undefined;

    const result: Creator = {
      name: firstAuthor.name || '',
      givenName: firstAuthor.given,
      familyName: firstAuthor.family,
      isCorresponding: true,
    };

    if (!result.name) {
      if (firstAuthor.given && firstAuthor.family) {
        result.name = `${firstAuthor.given} ${firstAuthor.family}`;
      } else {
        result.name = firstAuthor.given || firstAuthor.family || '';
      }
    }

    // Extract ORCID
    if (firstAuthor.ORCID) {
      result.orcid = firstAuthor.ORCID.replace(/^https?:\/\/orcid\.org\//i, '');
    }

    // Extract affiliation
    if (firstAuthor.affiliation && firstAuthor.affiliation.length > 0) {
      result.affiliation = firstAuthor.affiliation[0].name;
    }

    return result;
  }

  /**
   * Gets the publisher
   */
  get publisher(): string | undefined {
    return this._message.publisher;
  }

  /**
   * Extracts publication date from CrossRef message in ISO8601 format
   */
  get publicationDate(): string | undefined {
    // Try different date fields in order of preference
    const dateObj = this._message.issued || this._message.published || this._message.created;
    
    if (!dateObj?.['date-parts']?.[0]) return undefined;

    const parts = dateObj['date-parts'][0];
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];

    // Build ISO8601 date string
    if (year && month && day) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } else if (year && month) {
      return `${year}-${String(month).padStart(2, '0')}`;
    } else if (year) {
      return `${year}`;
    }

    return undefined;
  }

  /**
   * Gets the resource type
   */
  get resourceType(): string | undefined {
    return this._message.type;
  }

  /**
   * Gets the description/abstract with JATS parsing
   */
  get description(): string | undefined {
    const abstract = this._message.abstract;
    return abstract ? this.parseJATS(abstract) : undefined;
  }

  /**
   * Gets the URL to the resource
   */
  get url(): string {
    return this._message.URL || this._message.resource?.primary?.URL || this._doi.toURL();
  }

  /**
   * Gets all subjects
   */
  get subjects(): string[] {
    return this._message.subject || [];
  }

  /**
   * Gets the raw metadata
   */
  get rawMetadata(): object {
    return this._rawMetadata;
  }

  /**
   * Fetches CrossRef metadata and creates a CrossRefInfo instance
   */
  static async fetch(doi: DOI): Promise<CrossRefInfo | null> {
    const apiUrl = `https://api.crossref.org/works/${encodeURIComponent(doi.toString())}`;
    
    try {
      const response = (await cachedFetch(apiUrl, {
        headers: {
          Accept: 'application/json',
        },
      })) as CrossRefResponse;

      if (!response || !response.message) return null;

      return new CrossRefInfo(doi, response);
    } catch (error) {
      console.debug('CrossRef API error:', error);
      return null;
    }
  }

  /**
   * Generates FoldableItems for CrossRef metadata
   */
  generateItems(): FoldableItem[] {
    const items: FoldableItem[] = [];
    let index = 10;

    // Title
    if (this.title) {
      items.push(
        new FoldableItem(
          index++,
          'Title',
          this.title,
          'The title of the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    // Corresponding author (first author)
    const correspondingAuthor = this.correspondingAuthor;
    if (correspondingAuthor) {
      items.push(
        new FoldableItem(
          index++,
          'Corresponding Author',
          correspondingAuthor.orcid || correspondingAuthor.name,
          `First/corresponding author: ${correspondingAuthor.name}${correspondingAuthor.affiliation ? ` (${correspondingAuthor.affiliation})` : ''}`,
          correspondingAuthor.orcid ? `https://orcid.org/${correspondingAuthor.orcid}` : undefined,
          undefined,
          false,
        ),
      );
    }

    // Individual authors
    const creators = this.creators;
    creators.forEach((creator, idx) => {
      // Skip the first author if already shown as corresponding
      if (idx === 0 && correspondingAuthor) return;

      items.push(
        new FoldableItem(
          index++,
          `Author ${idx + 1}`,
          creator.orcid || creator.name,
          `${creator.name}${creator.affiliation ? ` (${creator.affiliation})` : ''}`,
          creator.orcid ? `https://orcid.org/${creator.orcid}` : undefined,
          undefined,
          false,
        ),
      );
    });

    // Publisher
    if (this.publisher) {
      items.push(
        new FoldableItem(
          index++,
          'Publisher',
          this.publisher,
          'The publisher of the resource.',
        ),
      );
    }

    // Publication Date (ISO8601)
    if (this.publicationDate) {
      items.push(
        new FoldableItem(
          index++,
          'Publication Date',
          this.publicationDate,
          'The publication date in ISO 8601 format.',
        ),
      );
    }

    // Resource Type
    if (this.resourceType) {
      items.push(
        new FoldableItem(
          index++,
          'Resource Type',
          this.resourceType,
          'The type of the resource.',
        ),
      );
    }

    // Description (with JATS parsing)
    if (this.description) {
      items.push(
        new FoldableItem(
          index++,
          'Abstract',
          this.description,
          'The abstract of the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    // Individual subjects
    this.subjects.forEach((subject) => {
      items.push(
        new FoldableItem(
          index++,
          'Subject',
          subject,
          'A subject area or keyword associated with the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    });

    return items;
  }

  /**
   * Serializes to object for caching
   */
  toObject() {
    return {
      doi: JSON.stringify(this._doi.toObject()),
      rawMetadata: this._rawMetadata,
    };
  }

  /**
   * Deserializes from cached object
   */
  static fromObject(doiObj: DOI, obj: ReturnType<CrossRefInfo['toObject']>): CrossRefInfo {
    return new CrossRefInfo(doiObj, obj.rawMetadata as CrossRefResponse);
  }
}
