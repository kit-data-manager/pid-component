// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { DOI } from './DOI';
import { DOIInfo, DOISource } from './DOIInfo';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';

/**
 * This class specifies a custom renderer for DOIs (Digital Object Identifiers).
 * @extends GenericIdentifierType
 */
export class DOIType extends GenericIdentifierType {
  /**
   * The DOI object.
   * @type {DOI}
   * @private
   */
  private _doi: DOI;

  /**
   * The DOIInfo object containing metadata.
   * @type {DOIInfo}
   * @private
   */
  private _doiInfo: DOIInfo;

  get data(): string {
    return JSON.stringify(this._doiInfo.toObject());
  }

  async hasCorrectFormat(): Promise<boolean> {
    return DOI.isDOI(this.value);
  }

  async init(data?: string): Promise<void> {
    if (data !== undefined) {
      // Load from cached data
      this._doiInfo = DOIInfo.fromJSON(data);
      this._doi = this._doiInfo.doi;
      console.debug('reload DOIInfo from data', this._doiInfo);
    } else {
      // Fetch fresh data
      this._doi = DOI.getDOIFromString(this.value);
      this._doiInfo = await DOIInfo.getDOIInfo(this._doi);
      console.debug('load DOIInfo from API', this._doiInfo);
    }

    // Build items for the data table
    this.items.push(
      new FoldableItem(
        0,
        'DOI',
        this._doi.toString(),
        'Digital Object Identifier - A persistent identifier for academic and research resources.',
        'https://www.doi.org/',
        undefined,
        false,
      ),
    );

    this.items.push(
      new FoldableItem(
        1,
        'Metadata Source',
        this._doiInfo.source,
        `Metadata provided by ${this._doiInfo.source}`,
        this._doiInfo.source === DOISource.DATACITE ? 'https://datacite.org' : 'https://www.crossref.org',
        undefined,
        false,
      ),
    );

    if (this._doiInfo.title) {
      this.items.push(
        new FoldableItem(
          10,
          'Title',
          this._doiInfo.title,
          'The title of the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    if (this._doiInfo.creators && this._doiInfo.creators.length > 0) {
      this.items.push(
        new FoldableItem(
          20,
          'Creators',
          this._doiInfo.creators.join(', '),
          'The creators or authors of the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    if (this._doiInfo.publisher) {
      this.items.push(
        new FoldableItem(
          30,
          'Publisher',
          this._doiInfo.publisher,
          'The publisher of the resource.',
        ),
      );
    }

    if (this._doiInfo.publicationYear) {
      this.items.push(
        new FoldableItem(
          40,
          'Publication Year',
          this._doiInfo.publicationYear.toString(),
          'The year the resource was published.',
        ),
      );
    }

    if (this._doiInfo.resourceType) {
      this.items.push(
        new FoldableItem(
          50,
          'Resource Type',
          this._doiInfo.resourceType,
          'The type of the resource.',
        ),
      );
    }

    if (this._doiInfo.description) {
      this.items.push(
        new FoldableItem(
          60,
          'Description',
          this._doiInfo.description,
          'The description or abstract of the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    if (this._doiInfo.subjects && this._doiInfo.subjects.length > 0) {
      this.items.push(
        new FoldableItem(
          70,
          'Subjects',
          this._doiInfo.subjects.join(', '),
          'Subject areas or keywords associated with the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    // Add actions
    if (this._doiInfo.url) {
      this.actions.push(
        new FoldableAction(
          0,
          'Open Resource',
          this._doiInfo.url,
          'primary',
        ),
      );
    }

    this.actions.push(
      new FoldableAction(
        1,
        'Resolve DOI',
        this._doi.toURL(),
        'secondary',
      ),
    );

    // Add action to view metadata based on source
    if (this._doiInfo.source === DOISource.DATACITE) {
      this.actions.push(
        new FoldableAction(
          2,
          'View DataCite Metadata',
          `https://api.datacite.org/dois/${encodeURIComponent(this._doi.toString())}`,
          'secondary',
        ),
      );
    } else if (this._doiInfo.source === DOISource.CROSSREF) {
      this.actions.push(
        new FoldableAction(
          2,
          'View CrossRef Metadata',
          `https://api.crossref.org/works/${encodeURIComponent(this._doi.toString())}`,
          'secondary',
        ),
      );
    }
  }

  isResolvable(): boolean {
    return this._doiInfo !== undefined && this._doiInfo !== null && (this._doiInfo.title !== undefined || this._doiInfo.creators.length > 0);
  }

  renderPreview(): FunctionalComponent {
    const sourceIcon = this._doiInfo.source === DOISource.DATACITE ? 'DC' : 'CR';
    const sourceColor = this._doiInfo.source === DOISource.DATACITE ? 'bg-blue-500' : 'bg-green-500';

    return (
      <span class={`inline-flex flex-nowrap items-center align-top font-mono ${this.isDarkMode ? 'text-gray-200' : ''}`}>
        <span class={`mr-2 rounded px-1.5 py-0.5 text-xs font-bold text-white ${sourceColor}`}>{sourceIcon}</span>
        <span class={'flex-none items-center px-1'}>
          {this._doiInfo.title ? (
            <span>
              <span class={'font-bold'}>{this._doiInfo.title}</span>
              {this._doiInfo.creators.length > 0 && <span class={'ml-2 text-sm opacity-75'}>({this._doiInfo.creators[0]}{this._doiInfo.creators.length > 1 ? ' et al.' : ''})</span>}
            </span>
          ) : (
            <span class={'font-bold'}>{this._doi.toString()}</span>
          )}
        </span>
      </span>
    );
  }

  getSettingsKey(): string {
    return 'DOIType';
  }
}
