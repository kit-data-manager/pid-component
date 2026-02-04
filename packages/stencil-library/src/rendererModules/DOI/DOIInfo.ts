import { cachedFetch } from '../../utils/DataCache';
import { DOI } from './DOI';

/**
 * Enum for DOI metadata sources.
 */
export enum DOISource {
  DATACITE = 'DataCite',
  CROSSREF = 'CrossRef',
  UNKNOWN = 'Unknown',
}

/** DataCite API response shape */
interface DataCiteResponse {
  data: {
    attributes: {
      titles?: Array<{ title?: string } | string>;
      creators?: Array<{
        name?: string;
        givenName?: string;
        familyName?: string;
      } | string>;
      publisher?: string;
      publicationYear?: number;
      types?: {
        resourceTypeGeneral?: string;
      };
      resourceTypeGeneral?: string;
      descriptions?: Array<{ description?: string } | string>;
      url?: string;
      subjects?: Array<{ subject?: string } | string>;
    };
  };
}

/** CrossRef API response shape */
interface CrossRefResponse {
  message: {
    title?: string[];
    author?: Array<{
      given?: string;
      family?: string;
      name?: string;
    }>;
    publisher?: string;
    published?: {
      'date-parts'?: number[][];
    };
    created?: {
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
 * This class stores information about a DOI and its metadata.
 */
export class DOIInfo {
  /**
   * The DOI object.
   * @type {DOI}
   * @private
   */
  private readonly _doi: DOI;

  /**
   * The source of the metadata (DataCite or CrossRef).
   * @type {DOISource}
   * @private
   */
  private readonly _source: DOISource;

  /**
   * The title(s) of the resource.
   * @type {string[]}
   * @private
   */
  private readonly _titles: string[];

  /**
   * The creator(s)/author(s) of the resource.
   * @type {string[]}
   * @private
   */
  private readonly _creators: string[];

  /**
   * The publisher of the resource.
   * @type {string | undefined}
   * @private
   */
  private readonly _publisher?: string;

  /**
   * The publication year.
   * @type {number | undefined}
   * @private
   */
  private readonly _publicationYear?: number;

  /**
   * The resource type.
   * @type {string | undefined}
   * @private
   */
  private readonly _resourceType?: string;

  /**
   * The description/abstract of the resource.
   * @type {string | undefined}
   * @private
   */
  private readonly _description?: string;

  /**
   * The URL to the resource or landing page.
   * @type {string | undefined}
   * @private
   */
  private readonly _url?: string;

  /**
   * The subjects/keywords associated with the resource.
   * @type {string[]}
   * @private
   */
  private readonly _subjects: string[];

  /**
   * The raw JSON metadata from the API.
   * @type {object}
   * @private
   */
  private readonly _rawMetadata: object;

  /**
   * Creates a new DOIInfo object.
   * @param doi The DOI object.
   * @param source The source of the metadata.
   * @param titles The title(s) of the resource.
   * @param creators The creator(s) of the resource.
   * @param rawMetadata The raw metadata from the API.
   * @param publisher The publisher.
   * @param publicationYear The publication year.
   * @param resourceType The resource type.
   * @param description The description.
   * @param url The URL to the resource.
   * @param subjects The subjects/keywords.
   * @constructor
   */
  constructor(
    doi: DOI,
    source: DOISource,
    titles: string[],
    creators: string[],
    rawMetadata: object,
    publisher?: string,
    publicationYear?: number,
    resourceType?: string,
    description?: string,
    url?: string,
    subjects?: string[],
  ) {
    this._doi = doi;
    this._source = source;
    this._titles = titles;
    this._creators = creators;
    this._publisher = publisher;
    this._publicationYear = publicationYear;
    this._resourceType = resourceType;
    this._description = description;
    this._url = url;
    this._subjects = subjects || [];
    this._rawMetadata = rawMetadata;
  }

  /**
   * Gets the DOI object.
   * @returns {DOI} The DOI object.
   */
  get doi(): DOI {
    return this._doi;
  }

  /**
   * Gets the metadata source.
   * @returns {DOISource} The metadata source.
   */
  get source(): DOISource {
    return this._source;
  }

  /**
   * Gets the titles.
   * @returns {string[]} The titles.
   */
  get titles(): string[] {
    return this._titles;
  }

  /**
   * Gets the main title.
   * @returns {string} The main title.
   */
  get title(): string {
    return this._titles[0] || '';
  }

  /**
   * Gets the creators.
   * @returns {string[]} The creators.
   */
  get creators(): string[] {
    return this._creators;
  }

  /**
   * Gets the publisher.
   * @returns {string | undefined} The publisher.
   */
  get publisher(): string | undefined {
    return this._publisher;
  }

  /**
   * Gets the publication year.
   * @returns {number | undefined} The publication year.
   */
  get publicationYear(): number | undefined {
    return this._publicationYear;
  }

  /**
   * Gets the resource type.
   * @returns {string | undefined} The resource type.
   */
  get resourceType(): string | undefined {
    return this._resourceType;
  }

  /**
   * Gets the description.
   * @returns {string | undefined} The description.
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * Gets the URL.
   * @returns {string | undefined} The URL.
   */
  get url(): string | undefined {
    return this._url;
  }

  /**
   * Gets the subjects.
   * @returns {string[]} The subjects.
   */
  get subjects(): string[] {
    return this._subjects;
  }

  /**
   * Gets the raw metadata.
   * @returns {object} The raw metadata.
   */
  get rawMetadata(): object {
    return this._rawMetadata;
  }

  /**
   * Fetches DOI metadata and returns a DOIInfo object.
   * Tries DataCite first, then falls back to CrossRef.
   * @param doi The DOI string or DOI object.
   * @returns {Promise<DOIInfo>} The DOIInfo object.
   */
  static async getDOIInfo(doi: string | DOI): Promise<DOIInfo> {
    const doiObj = typeof doi === 'string' ? DOI.getDOIFromString(doi) : doi;

    // Try DataCite first
    try {
      const dataCiteInfo = await DOIInfo.getDataCiteInfo(doiObj);
      if (dataCiteInfo) return dataCiteInfo;
    } catch (error) {
      console.debug('Failed to fetch from DataCite:', error);
    }

    // Fall back to CrossRef
    try {
      const crossRefInfo = await DOIInfo.getCrossRefInfo(doiObj);
      if (crossRefInfo) return crossRefInfo;
    } catch (error) {
      console.debug('Failed to fetch from CrossRef:', error);
    }

    // If both fail, throw an error
    throw new Error(`Failed to resolve DOI: ${doiObj.toString()}`);
  }

  /**
   * Fetches metadata from DataCite API.
   * @param doi The DOI object.
   * @returns {Promise<DOIInfo | null>} The DOIInfo object or null if not found.
   * @private
   */
  private static async getDataCiteInfo(doi: DOI): Promise<DOIInfo | null> {
    const apiUrl = `https://api.datacite.org/dois/${encodeURIComponent(doi.toString())}`;
    
    try {
      const response = (await cachedFetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.api+json',
        },
      })) as DataCiteResponse;

      if (!response || !response.data) return null;

      const data = response.data;
      const attributes = data.attributes || {};

      // Extract titles
      const titles = (attributes.titles || []).map((t) => {
        if (typeof t === 'string') return t;
        return t.title || '';
      }).filter(Boolean);

      // Extract creators
      const creators = (attributes.creators || []).map((creator) => {
        if (typeof creator === 'string') return creator;
        if (creator.name) return creator.name;
        if (creator.givenName && creator.familyName) {
          return `${creator.givenName} ${creator.familyName}`;
        }
        return creator.givenName || creator.familyName || '';
      }).filter(Boolean);

      // Extract other metadata
      const publisher = attributes.publisher;
      const publicationYear = attributes.publicationYear;
      const resourceType = attributes.types?.resourceTypeGeneral || attributes.resourceTypeGeneral;
      
      // Extract description
      const descriptions = attributes.descriptions || [];
      const description = descriptions.length > 0 
        ? (typeof descriptions[0] === 'string' ? descriptions[0] : descriptions[0].description) 
        : undefined;

      // Extract URL
      const url = attributes.url || doi.toURL();

      // Extract subjects
      const subjects = (attributes.subjects || []).map((s) => {
        if (typeof s === 'string') return s;
        return s.subject || '';
      }).filter(Boolean);

      return new DOIInfo(
        doi,
        DOISource.DATACITE,
        titles,
        creators,
        response as object,
        publisher,
        publicationYear,
        resourceType,
        description,
        url,
        subjects,
      );
    } catch (error) {
      console.debug('DataCite API error:', error);
      return null;
    }
  }

  /**
   * Fetches metadata from CrossRef API.
   * @param doi The DOI object.
   * @returns {Promise<DOIInfo | null>} The DOIInfo object or null if not found.
   * @private
   */
  private static async getCrossRefInfo(doi: DOI): Promise<DOIInfo | null> {
    const apiUrl = `https://api.crossref.org/works/${encodeURIComponent(doi.toString())}`;
    
    try {
      const response = (await cachedFetch(apiUrl, {
        headers: {
          Accept: 'application/json',
        },
      })) as CrossRefResponse;

      if (!response || !response.message) return null;

      const message = response.message;

      // Extract titles
      const titles = message.title || [];

      // Extract creators/authors
      const creators = (message.author || []).map((author) => {
        if (author.given && author.family) {
          return `${author.given} ${author.family}`;
        }
        return author.family || author.given || author.name || '';
      }).filter(Boolean);

      // Extract other metadata
      const publisher = message.publisher;
      const publicationYear = this.extractPublicationYear(message);
      const resourceType = message.type;

      // Extract description (abstract)
      const description = message.abstract;

      // Extract URL
      const url = message.URL || message.resource?.primary?.URL || doi.toURL();

      // Extract subjects
      const subjects = message.subject || [];

      return new DOIInfo(
        doi,
        DOISource.CROSSREF,
        titles,
        creators,
        response as object,
        publisher,
        publicationYear,
        resourceType,
        description,
        url,
        subjects,
      );
    } catch (error) {
      console.debug('CrossRef API error:', error);
      return null;
    }
  }

  /**
   * Extracts publication year from CrossRef message.
   * @param message The CrossRef message object.
   * @returns {number | undefined} The publication year or undefined if not found.
   * @private
   */
  private static extractPublicationYear(message: CrossRefResponse['message']): number | undefined {
    // Try to get year from published date
    const publishedYear = message.published?.['date-parts']?.[0]?.[0];
    if (publishedYear) return publishedYear;
    
    // Fall back to created date
    const createdYear = message.created?.['date-parts']?.[0]?.[0];
    return createdYear;
  }

  /**
   * Creates a DOIInfo object from JSON.
   * @param serialized The serialized DOIInfo.
   * @returns {DOIInfo} The DOIInfo object.
   */
  static fromJSON(serialized: string): DOIInfo {
    const data: ReturnType<DOIInfo['toObject']> = JSON.parse(serialized);
    return new DOIInfo(
      DOI.fromJSON(data.doi),
      data.source as DOISource,
      data.titles,
      data.creators,
      data.rawMetadata,
      data.publisher,
      data.publicationYear,
      data.resourceType,
      data.description,
      data.url,
      data.subjects,
    );
  }

  /**
   * Converts the DOIInfo to an object.
   * @returns {object} The DOIInfo as an object.
   */
  toObject() {
    return {
      doi: JSON.stringify(this._doi.toObject()),
      source: this._source,
      titles: this._titles,
      creators: this._creators,
      publisher: this._publisher,
      publicationYear: this._publicationYear,
      resourceType: this._resourceType,
      description: this._description,
      url: this._url,
      subjects: this._subjects,
      rawMetadata: this._rawMetadata,
    };
  }
}
