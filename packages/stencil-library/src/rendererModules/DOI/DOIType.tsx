import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { DOI } from './DOI';
import { CrossRefInfo } from './CrossRef/CrossRefInfo';
import { DataCiteInfo, Creator } from './DataCite/DataCiteInfo';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';
import { CrossRefLogo, DataCiteLogo } from './ResourceTypeIcons';
import { formatCitationPreview, getCitationStyleFromSettings } from './CitationStyles';

/**
 * Settings entry shape used across the renderer registry.
 */
export type RendererSettings = { name: string; value: unknown }[];

/**
 * Common surface shared by all DOI metadata providers (DataCite, CrossRef).
 * Both {@link DataCiteInfo} and {@link CrossRefInfo} implement this surface.
 */
export interface DOIProviderInfo {
  title: string;
  creators: Creator[];
  publicationDate?: string;
  url: string;
  /** CrossRef distinguishes funders from works; other providers can omit this. */
  type?: 'work' | 'funder';
  generateItems(): FoldableItem[];
  toObject(): { doi: string; rawMetadata: object; type?: 'work' | 'funder' };
}

/**
 * Slim description of a DOI metadata provider.
 */
export interface DOIProvider {
  /** The unique identifier, also used as the settings key. */
  id: string;
  /** Human-readable provider name used to derive labels and action titles. */
  name: string;
  /** Link shown in the "Metadata Source" item. */
  metadataSourceLink: string;
  /** Branded provider logo rendered in the preview. */
  logo: typeof DataCiteLogo;
  /** Builds the provider's metadata API URL for a DOI, honoring funder/work differentiation. */
  metadataApiUrl(doi: DOI, info: DOIProviderInfo | null): string;
  /** Fetches metadata for a DOI, returning null when nothing meaningful is found. */
  fetch(doi: DOI): Promise<DOIProviderInfo | null>;
  /** Restores a provider info from cached serialized data. */
  fromObject(doi: DOI, obj: ReturnType<DOIProviderInfo['toObject']>): DOIProviderInfo;
  /** Optional hook for providers (e.g. CrossRef) that treat funders specially. */
  isFunder?(info: DOIProviderInfo | null | undefined): boolean;
}

export const dataCiteProvider: DOIProvider = {
  id: 'DataCiteDOIType',
  name: 'DataCite',
  metadataSourceLink: 'https://datacite.org',
  logo: DataCiteLogo,
  metadataApiUrl: (doi) => `https://api.datacite.org/dois/${encodeURIComponent(doi.toString())}`,
  fetch: (doi) => DataCiteInfo.fetch(doi),
  fromObject: (doi, obj) =>
    DataCiteInfo.fromObject(doi, { doi: obj.doi, rawMetadata: obj.rawMetadata }),
};

export const crossRefProvider: DOIProvider = {
  id: 'CrossRefDOIType',
  name: 'CrossRef',
  metadataSourceLink: 'https://www.crossref.org',
  logo: CrossRefLogo,
  metadataApiUrl: (doi, info) =>
    info?.type === 'funder'
      ? `https://api.crossref.org/funders/${doi.toString()}`
      : `https://api.crossref.org/works/${doi.toString()}`,
  fetch: (doi) => CrossRefInfo.fetch(doi),
  fromObject: (doi, obj) =>
    CrossRefInfo.fromObject(doi, {
      doi: obj.doi,
      rawMetadata: obj.rawMetadata,
      type: obj.type ?? 'work',
    }),
  isFunder: (info) => info?.type === 'funder',
};

/**
 * Shared implementation of a DOI renderer. It is not meant to be instantiated
 * directly; use the concrete provider subclasses {@link DataCiteDOIType} and
 * {@link CrossRefDOIType}.
 */
export abstract class DOIType extends GenericIdentifierType {
  private _doi: DOI | null;
  protected _info: DOIProviderInfo | null;
  private readonly _provider: DOIProvider;

  constructor(
    value: string,
    settings: RendererSettings | undefined,
    provider: DOIProvider,
  ) {
    super(value);
    this._provider = provider;
    this._doi = null;
    this._info = null;
    if (settings) this.settings = settings;
  }

  get data(): string {
    return JSON.stringify(this._info?.toObject() ?? {});
  }

  get providerName(): string {
    return this._provider.name;
  }

  /** Lazy, memoized DOI parsed from the value. Only created once the value is validated. */
  protected get doi(): DOI {
    if (!this._doi) {
      this._doi = DOI.getDOIFromString(this.value);
    }
    return this._doi;
  }

  quickCheck(): boolean {
    return DOI.isDOI(this.value);
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    this._info = await this._provider.fetch(this.doi);
    return this._info !== null && this._info.title !== '';
  }

  async init(data?: string): Promise<void> {
    if (data !== undefined) {
      this._info = this._provider.fromObject(this.doi, JSON.parse(data));
    } else {
      this._info = await this._provider.fetch(this.doi);
    }

    if (!this._info) return;

    this.items.push(
      new FoldableItem(
        0,
        'DOI',
        this.doi.toString(),
        'The DOI used for this resource. Digital Object Identifier is a persistent identifier for academic and research resources.',
        'https://www.doi.org/',
        undefined,
        false,
      ),
    );

    this.items.push(
      new FoldableItem(
        1,
        'Metadata Source',
        this._provider.name,
        `The metadata in this record was provided by ${this._provider.name}`,
        this._provider.metadataSourceLink,
      ),
    );

    const metadataItems = this._info.generateItems();
    this.items.push(...metadataItems);

    if (this._info.url) {
      this.actions.push(new FoldableAction(0, 'Open Resource', this._info.url, 'primary'));
    }

    this.actions.push(new FoldableAction(1, 'Resolve DOI', this.doi.toURL(), 'secondary'));
    this.actions.push(new FoldableAction(2, `View ${this._provider.name} Metadata`, this._provider.metadataApiUrl(this.doi, this._info), 'secondary'));
  }

  isResolvable(): boolean {
    return this._info !== null && this._info.title !== '';
  }

  renderPreview(): FunctionalComponent<unknown> {
    const citationStyle = getCitationStyleFromSettings(this.settings);
    const creators = this._info?.creators || [];
    const year = this._info?.publicationDate;

    const isFunder = this._provider.isFunder?.(this._info) ?? false;

    let citation: string;
    let tooltip: string;

    if (isFunder) {
      citation = this._info?.title || '';
      tooltip = `Funder: ${citation}`;
    } else {
      const result = formatCitationPreview(this._info?.title || '', creators, year, citationStyle);
      citation = result.citation;
      tooltip = result.tooltip;
    }

    const logo = this._provider.logo;
    return (
      <span
        class={`inline-flex flex-nowrap items-baseline font-mono min-w-0 max-w-full ${this.isDarkMode ? 'text-gray-200' : ''}`}>
        <span class={'flex-none px-0.5 h-4 self-center'}>{logo()}</span>
        <span class={'min-w-0 pl-2 overflow-hidden text-ellipsis whitespace-nowrap'} title={tooltip}>
          {citation}
        </span>
      </span>
    );
  }

  getSettingsKey(): string {
    return this._provider.id;
  }
}
