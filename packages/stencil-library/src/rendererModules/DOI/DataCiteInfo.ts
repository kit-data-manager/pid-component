import { cachedFetch } from '../../utils/DataCache';
import { DOI } from './DOI';
import { FoldableItem } from '../../utils/FoldableItem';

/** DataCite API response shape */
interface DataCiteResponse {
  data: {
    attributes: {
      titles?: Array<{ title?: string; titleType?: string } | string>;
      creators?: Array<{
        name?: string;
        givenName?: string;
        familyName?: string;
        nameIdentifiers?: Array<{
          nameIdentifier?: string;
          nameIdentifierScheme?: string;
          schemeUri?: string;
        }>;
        affiliation?: Array<{
          name?: string;
          affiliationIdentifier?: string;
          affiliationIdentifierScheme?: string;
        }>;
      } | string>;
      contributors?: Array<{
        name?: string;
        givenName?: string;
        familyName?: string;
        contributorType?: string;
        nameIdentifiers?: Array<{
          nameIdentifier?: string;
          nameIdentifierScheme?: string;
        }>;
        affiliation?: Array<{
          name?: string;
          affiliationIdentifier?: string;
          affiliationIdentifierScheme?: string;
        }>;
      }>;
      publisher?: string;
      publicationYear?: number;
      dates?: Array<{
        date?: string;
        dateType?: string;
      }>;
      types?: {
        resourceTypeGeneral?: string;
        resourceType?: string;
      };
      resourceTypeGeneral?: string;
      descriptions?: Array<{ description?: string; descriptionType?: string } | string>;
      url?: string;
      subjects?: Array<{ subject?: string; subjectScheme?: string } | string>;
    };
  };
}

/**
 * Interface representing a creator with additional metadata
 */
export interface Creator {
  name: string;
  givenName?: string;
  familyName?: string;
  orcid?: string;
  affiliation?: string;
  ror?: string;
  isCorresponding?: boolean;
}

/**
 * This class handles DataCite-specific metadata parsing and item generation.
 */
export class DataCiteInfo {
  private readonly _rawMetadata: object;
  private readonly _doi: DOI;
  private readonly _attributes: DataCiteResponse['data']['attributes'];

  constructor(doi: DOI, response: DataCiteResponse) {
    this._doi = doi;
    this._rawMetadata = response;
    this._attributes = response.data?.attributes || {};
  }

  /**
   * Gets the main title
   */
  get title(): string {
    const titles = this._attributes.titles || [];
    const mainTitle = titles.find((t) => {
      if (typeof t === 'string') return true;
      return !t.titleType || t.titleType === 'Title';
    });
    
    if (typeof mainTitle === 'string') return mainTitle;
    return mainTitle?.title || '';
  }

  /**
   * Gets all creators with enhanced metadata
   */
  get creators(): Creator[] {
    const creators = this._attributes.creators || [];
    return creators.map((creator) => {
      if (typeof creator === 'string') {
        return { name: creator };
      }

      const result: Creator = {
        name: creator.name || '',
        givenName: creator.givenName,
        familyName: creator.familyName,
      };

      // Extract name if not provided
      if (!result.name && creator.givenName && creator.familyName) {
        result.name = `${creator.givenName} ${creator.familyName}`;
      } else if (!result.name) {
        result.name = creator.givenName || creator.familyName || '';
      }

      // Extract ORCID
      const orcidIdentifier = creator.nameIdentifiers?.find(
        (id) => id.nameIdentifierScheme?.toLowerCase() === 'orcid'
      );
      if (orcidIdentifier?.nameIdentifier) {
        // Clean up ORCID to just the ID
        result.orcid = orcidIdentifier.nameIdentifier
          .replace(/^https?:\/\/orcid\.org\//i, '')
          .replace(/^orcid:/i, '');
      }

      // Extract affiliation and ROR
      if (creator.affiliation && creator.affiliation.length > 0) {
        const primaryAffiliation = creator.affiliation[0];
        result.affiliation = primaryAffiliation.name;
        
        const rorIdentifier = primaryAffiliation.affiliationIdentifier;
        if (rorIdentifier && primaryAffiliation.affiliationIdentifierScheme?.toLowerCase() === 'ror') {
          result.ror = rorIdentifier.replace(/^https?:\/\/ror\.org\//i, '');
        }
      }

      return result;
    }).filter((c) => c.name);
  }

  /**
   * Gets the corresponding author if available
   */
  get correspondingAuthor(): Creator | undefined {
    const contributors = this._attributes.contributors || [];
    const corresponding = contributors.find(
      (c) => c.contributorType?.toLowerCase() === 'contactperson'
    );
    
    if (!corresponding) return undefined;

    const result: Creator = {
      name: corresponding.name || '',
      givenName: corresponding.givenName,
      familyName: corresponding.familyName,
      isCorresponding: true,
    };

    if (!result.name && corresponding.givenName && corresponding.familyName) {
      result.name = `${corresponding.givenName} ${corresponding.familyName}`;
    }

    // Extract ORCID
    const orcidIdentifier = corresponding.nameIdentifiers?.find(
      (id) => id.nameIdentifierScheme?.toLowerCase() === 'orcid'
    );
    if (orcidIdentifier?.nameIdentifier) {
      result.orcid = orcidIdentifier.nameIdentifier
        .replace(/^https?:\/\/orcid\.org\//i, '')
        .replace(/^orcid:/i, '');
    }

    // Extract affiliation and ROR
    if (corresponding.affiliation && corresponding.affiliation.length > 0) {
      const primaryAffiliation = corresponding.affiliation[0];
      result.affiliation = primaryAffiliation.name;
      
      const rorIdentifier = primaryAffiliation.affiliationIdentifier;
      if (rorIdentifier && primaryAffiliation.affiliationIdentifierScheme?.toLowerCase() === 'ror') {
        result.ror = rorIdentifier.replace(/^https?:\/\/ror\.org\//i, '');
      }
    }

    return result;
  }

  /**
   * Gets the publisher
   */
  get publisher(): string | undefined {
    return this._attributes.publisher;
  }

  /**
   * Gets publication date in ISO8601 format
   */
  get publicationDate(): string | undefined {
    // Try to get from dates array first
    const dates = this._attributes.dates || [];
    const issued = dates.find((d) => d.dateType?.toLowerCase() === 'issued');
    if (issued?.date) return issued.date;

    // Fall back to publication year
    if (this._attributes.publicationYear) {
      return `${this._attributes.publicationYear}`;
    }

    return undefined;
  }

  /**
   * Gets the resource type
   */
  get resourceType(): string | undefined {
    return this._attributes.types?.resourceTypeGeneral || this._attributes.resourceTypeGeneral;
  }

  /**
   * Gets the specific resource type
   */
  get resourceTypeSpecific(): string | undefined {
    return this._attributes.types?.resourceType;
  }

  /**
   * Gets the description/abstract
   */
  get description(): string | undefined {
    const descriptions = this._attributes.descriptions || [];
    const abstract = descriptions.find((d) => {
      if (typeof d === 'string') return true;
      return d.descriptionType?.toLowerCase() === 'abstract' || !d.descriptionType;
    });
    
    if (typeof abstract === 'string') return abstract;
    return abstract?.description;
  }

  /**
   * Gets the URL to the resource
   */
  get url(): string {
    return this._attributes.url || this._doi.toURL();
  }

  /**
   * Gets all subjects
   */
  get subjects(): string[] {
    const subjects = this._attributes.subjects || [];
    return subjects.map((s) => {
      if (typeof s === 'string') return s;
      return s.subject || '';
    }).filter(Boolean);
  }

  /**
   * Gets the raw metadata
   */
  get rawMetadata(): object {
    return this._rawMetadata;
  }

  /**
   * Fetches DataCite metadata and creates a DataCiteInfo instance
   */
  static async fetch(doi: DOI): Promise<DataCiteInfo | null> {
    const apiUrl = `https://api.datacite.org/dois/${encodeURIComponent(doi.toString())}`;
    
    try {
      const response = (await cachedFetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.api+json',
        },
      })) as DataCiteResponse;

      if (!response || !response.data) return null;

      return new DataCiteInfo(doi, response);
    } catch (error) {
      console.debug('DataCite API error:', error);
      return null;
    }
  }

  /**
   * Generates FoldableItems for DataCite metadata
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

    // Corresponding author first
    const correspondingAuthor = this.correspondingAuthor;
    if (correspondingAuthor) {
      items.push(
        new FoldableItem(
          index++,
          'Corresponding Author',
          correspondingAuthor.orcid || correspondingAuthor.name,
          `Corresponding author: ${correspondingAuthor.name}${correspondingAuthor.affiliation ? ` (${correspondingAuthor.affiliation})` : ''}`,
          correspondingAuthor.orcid ? `https://orcid.org/${correspondingAuthor.orcid}` : undefined,
          undefined,
          false,
        ),
      );
    }

    // Individual creators
    const creators = this.creators;
    creators.forEach((creator, idx) => {
      items.push(
        new FoldableItem(
          index++,
          `Creator ${idx + 1}`,
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
      const displayType = this.resourceTypeSpecific || this.resourceType;
      items.push(
        new FoldableItem(
          index++,
          'Resource Type',
          displayType,
          'The type of the resource.',
        ),
      );
    }

    // Description
    if (this.description) {
      items.push(
        new FoldableItem(
          index++,
          'Description',
          this.description,
          'The description or abstract of the resource.',
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
  static fromObject(doiObj: DOI, obj: ReturnType<DataCiteInfo['toObject']>): DataCiteInfo {
    return new DataCiteInfo(doiObj, obj.rawMetadata as DataCiteResponse);
  }
}
