// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { DOI } from './DOI';
import { DOIInfo, DOISource } from './DOIInfo';
import { Creator } from './DataCiteInfo';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';
import { getResourceTypeInfo, DataCiteLogo, CrossRefLogo } from './ResourceTypeIcons';
import { formatCitationPreview, getCitationStyleFromSettings } from './CitationStyles';

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

    // Add resource type with icon if available
    if (this._doiInfo.resourceType) {
      const typeInfo = getResourceTypeInfo(this._doiInfo.resourceType);
      this.items.push(
        new FoldableItem(
          5,
          'Resource Type',
          typeInfo.displayName,
          'The type of the resource.',
          undefined,
          undefined,
          false,
        ),
      );
    }

    // Generate items from the source-specific metadata
    const metadataItems = this._doiInfo.generateItems();
    this.items.push(...metadataItems);

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
    return this._doiInfo !== undefined && this._doiInfo !== null && this._doiInfo.title !== '';
  }

  renderPreview(): FunctionalComponent {
    // Get citation style from settings
    const citationStyle = getCitationStyleFromSettings(this.settings);

    // Get creators from the appropriate source
    let creators: Creator[] = [];
    let year: string | undefined;

    if (this._doiInfo.dataCiteInfo) {
      creators = this._doiInfo.dataCiteInfo.creators;
      year = this._doiInfo.dataCiteInfo.publicationDate;
    } else if (this._doiInfo.crossRefInfo) {
      creators = this._doiInfo.crossRefInfo.creators;
      year = this._doiInfo.crossRefInfo.publicationDate;
    }

    // Format citation preview
    const citation = formatCitationPreview(
      this._doiInfo.title,
      creators,
      year,
      citationStyle,
    );

    // Render logo based on source
    const LogoComponent = this._doiInfo.source === DOISource.DATACITE ? DataCiteLogo : CrossRefLogo;

    return (
      <span class={`inline-flex flex-nowrap items-center align-top font-mono ${this.isDarkMode ? 'text-gray-200' : ''}`}>
        <span class="mr-2 flex-none">
          <LogoComponent />
        </span>
        <span class={'flex-none items-center px-1 truncate'} title={citation}>
          {citation}
        </span>
      </span>
    );
  }

  getSettingsKey(): string {
    return 'DOIType';
  }
}
