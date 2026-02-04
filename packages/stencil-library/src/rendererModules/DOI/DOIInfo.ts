import { DOI } from './DOI';
import { DataCiteInfo } from './DataCiteInfo';
import { CrossRefInfo } from './CrossRefInfo';
import { FoldableItem } from '../../utils/FoldableItem';

/**
 * Enum for DOI metadata sources.
 */
export enum DOISource {
  DATACITE = 'DataCite',
  CROSSREF = 'CrossRef',
  UNKNOWN = 'Unknown',
}

/**
 * This class combines DataCite and CrossRef metadata sources.
 * It tries DataCite first, then falls back to CrossRef.
 */
export class DOIInfo {
  private readonly _doi: DOI;
  private readonly _source: DOISource;
  private readonly _dataCiteInfo?: DataCiteInfo;
  private readonly _crossRefInfo?: CrossRefInfo;

  private constructor(doi: DOI, source: DOISource, dataCiteInfo?: DataCiteInfo, crossRefInfo?: CrossRefInfo) {
    this._doi = doi;
    this._source = source;
    this._dataCiteInfo = dataCiteInfo;
    this._crossRefInfo = crossRefInfo;
  }

  /**
   * Gets the DOI object
   */
  get doi(): DOI {
    return this._doi;
  }

  /**
   * Gets the metadata source
   */
  get source(): DOISource {
    return this._source;
  }

  /**
   * Gets the active metadata provider (DataCite or CrossRef)
   */
  private get activeInfo(): DataCiteInfo | CrossRefInfo | undefined {
    return this._dataCiteInfo || this._crossRefInfo;
  }

  /**
   * Gets the DataCite info if available
   */
  get dataCiteInfo(): DataCiteInfo | undefined {
    return this._dataCiteInfo;
  }

  /**
   * Gets the CrossRef info if available
   */
  get crossRefInfo(): CrossRefInfo | undefined {
    return this._crossRefInfo;
  }

  /**
   * Gets the main title
   */
  get title(): string {
    return this.activeInfo?.title || '';
  }

  /**
   * Gets the URL to the resource
   */
  get url(): string {
    return this.activeInfo?.url || this._doi.toURL();
  }

  /**
   * Gets the resource type
   */
  get resourceType(): string | undefined {
    return this.activeInfo?.resourceType;
  }

  /**
   * Gets the raw metadata
   */
  get rawMetadata(): object {
    return this.activeInfo?.rawMetadata || {};
  }

  /**
   * Generates FoldableItems based on the source
   */
  generateItems(): FoldableItem[] {
    if (this._dataCiteInfo) {
      return this._dataCiteInfo.generateItems();
    } else if (this._crossRefInfo) {
      return this._crossRefInfo.generateItems();
    }
    return [];
  }

  /**
   * Fetches DOI metadata and returns a DOIInfo object.
   * Tries DataCite first, then falls back to CrossRef.
   */
  static async getDOIInfo(doi: string | DOI): Promise<DOIInfo> {
    const doiObj = typeof doi === 'string' ? DOI.getDOIFromString(doi) : doi;

    // Try DataCite first
    try {
      const dataCiteInfo = await DataCiteInfo.fetch(doiObj);
      if (dataCiteInfo) {
        return new DOIInfo(doiObj, DOISource.DATACITE, dataCiteInfo, undefined);
      }
    } catch (error) {
      console.debug('Failed to fetch from DataCite:', error);
    }

    // Fall back to CrossRef
    try {
      const crossRefInfo = await CrossRefInfo.fetch(doiObj);
      if (crossRefInfo) {
        return new DOIInfo(doiObj, DOISource.CROSSREF, undefined, crossRefInfo);
      }
    } catch (error) {
      console.debug('Failed to fetch from CrossRef:', error);
    }

    // If both fail, throw an error
    throw new Error(`Failed to resolve DOI: ${doiObj.toString()}`);
  }

  /**
   * Serializes to object for caching
   */
  toObject() {
    return {
      doi: JSON.stringify(this._doi.toObject()),
      source: this._source,
      dataCiteInfo: this._dataCiteInfo?.toObject(),
      crossRefInfo: this._crossRefInfo?.toObject(),
    };
  }

  /**
   * Deserializes from cached object
   */
  static fromJSON(serialized: string): DOIInfo {
    const data: ReturnType<DOIInfo['toObject']> = JSON.parse(serialized);
    const doiObj = DOI.fromJSON(data.doi);

    let dataCiteInfo: DataCiteInfo | undefined;
    let crossRefInfo: CrossRefInfo | undefined;

    if (data.dataCiteInfo) {
      dataCiteInfo = DataCiteInfo.fromObject(doiObj, data.dataCiteInfo);
    }

    if (data.crossRefInfo) {
      crossRefInfo = CrossRefInfo.fromObject(doiObj, data.crossRefInfo);
    }

    return new DOIInfo(doiObj, data.source as DOISource, dataCiteInfo, crossRefInfo);
  }
}
