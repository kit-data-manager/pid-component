// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';
import { FoldableItem } from '../utils/FoldableItem';
import { FoldableAction } from '../utils/FoldableAction';

/**
 * This class specifies a custom renderer for Research Organization Registry (ROR) identifiers.
 * It fetches organization details from the ROR API v2 and displays them.
 * @extends GenericIdentifierType
 */
export class RORType extends GenericIdentifierType {
  private rorData: Record<string, any>;
  private label: string;
  private acronym: string;

  private relationshipTypes = {
    parent: {
      title: 'Parent Organization',
      tooltip: 'Organization that this organization is part of',
    },
    child: {
      title: 'Child Organization',
      tooltip: 'Organization that is part of this organization',
    },
    related: {
      title: 'Related Organization',
      tooltip: 'Organization that is related to this organization',
    },
    predecessor: {
      title: 'Predecessor Organization',
      tooltip: 'Organization that preceded this organization',
    },
    successor: {
      title: 'Successor Organization',
      tooltip: 'Organization that succeeded this organization',
    },
  };

  private contentMappings = {
    active: '🟢 Active',
    inactive: '⚪️ Inactive',
    withdrawn: '⚠️ Withdrawn',
    education: '🏫 Education',
    funder: '💰 Funder',
    healthcare: '🏥 Healthcare',
    company: '🏢 Company',
    archive: '📚 Archive',
    nonprofit: '🎗️ Nonprofit',
    government: '🏛️ Government',
    facility: '🔬 Facility',
    other: 'Other',
    unknown: '❓ Unknown',
  };

  getSettingsKey(): string {
    return 'RORType';
  }

  /**
   * Checks if the provided value is a valid ROR ID format
   * ROR IDs typically have the format: https://ror.org/XXXXXXXXX where X is an alphanumeric character
   * @returns {boolean} Whether the value has the correct ROR ID format
   */
  hasCorrectFormat(): boolean {
    const regex = new RegExp('^https?://ror.org/[0-9a-z]{9}$', 'i');
    return regex.test(this.value);
  }

  /**
   * Extracts the ROR ID from the full URL
   * @returns {string} The ROR ID
   */
  private getRorId(): string {
    return this.value.split('/').pop();
  }

  private getOptimizedContent(content: string): string {
    // Check if the content is in the contentMappings
    if (this.contentMappings[content.toLowerCase()]) {
      return this.contentMappings[content.toLowerCase()];
    }
    // If not, return the content as is
    return content;
  }

  /**
   * Fetches organization data from the ROR API v2
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    try {
      // Extract the ROR ID from the URL
      const rorId = this.getRorId();

      // Fetch data from ROR API v2
      const response = await fetch(`https://api.ror.org/v2/organizations/${rorId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ROR data: ${response.status}`);
      }

      this.rorData = await response.json();

      if (!this.rorData) return;

      // Initialize name, acronym, and labels
      if (!this.rorData.names || this.rorData.names.length === 0) {
        this.label = 'Unknown';
        this.items.push(new FoldableItem(0, 'Name', 'Unknown', 'No names available for this organization'));
        return;
      } else {
        for (const name of this.rorData.names) {
          const types = name.types || [];
          if (types.includes('acronym')) {
            this.acronym = name.value;
            this.items.push(new FoldableItem(20, 'Acronym', name.value, 'Short form of the organization name'));
          } else if (types.includes('ror_display')) {
            this.label = name.value;
            this.items.push(new FoldableItem(1, 'Display Name', name.value, 'Name used for display purposes'));
          } else if (types.includes('alias')) {
            this.items.push(new FoldableItem(5, 'Alias', name.value, 'Alternative name for the organization'));
          } else if (types.includes('label')) {
            this.items.push(new FoldableItem(15, 'Label', name.value, 'Name in another language or script'));
          }
        }
      }

      // Add ROR ID
      this.items.push(new FoldableItem(20, 'ROR ID', this.rorData.id, 'Unique identifier for the organization in the ROR registry', null, null, false));
      this.actions.push(new FoldableAction(10, 'View on ROR', this.rorData.id, 'primary'));

      // Add status of the organization

      this.items.push(new FoldableItem(30, 'Status', this.getOptimizedContent(this.rorData.status || 'unknown'), 'Current status of the organization in the ROR registry'));

      // Add types of the organization
      if (!this.rorData.types || this.rorData.types.length === 0) {
        this.items.push(new FoldableItem(25, 'Type', this.getOptimizedContent('unknown'), 'Type of organization'));
      } else {
        for (const type of this.rorData.types) {
          this.items.push(new FoldableItem(25, 'Type', this.getOptimizedContent(type), 'Type of organization'));
        }
      }

      // Add external references
      if (this.rorData.links && this.rorData.links.length > 0) {
        for (const link of this.rorData.links) {
          if (link.type && link.type.isEmpty()) {
            this.items.push(new FoldableItem(35, `Link to ${link.type}`, link.value, 'External link related to the organization'));
          } else {
            this.items.push(new FoldableItem(35, `Link`, link.value, 'External link related to the organization'));
          }
        }
      }

      // Add external identifiers
      if (this.rorData.external_ids && this.rorData.external_ids.length > 0) {
        for (const external of this.rorData.external_ids) {
          const type = external.type;
          const value = external.preferred || external.all[0];
          this.items.push(new FoldableItem(40, `External ID: ${type}`, value, `Identifier from another system: ${type}`));
        }
      }

      // Add related organizations with tooltips for relationship types
      if (this.rorData.relationships && this.rorData.relationships.length > 0) {
        for (const rel of this.rorData.relationships) {
          const relationType = this.relationshipTypes[rel.type] || { title: rel.type, tooltip: `${rel.type} organization` };

          this.items.push(new FoldableItem(90, relationType.title, rel.id, relationType.tooltip));
        }
      }

      // Add locations with country code and coordinates
      if (this.rorData.locations && this.rorData.locations.length > 0) {
        for (const location of this.rorData.locations) {
          const details = location.geonames_details;
          if (details.country_code) {
            this.items.push(new FoldableItem(50, 'Country', details.country_code, 'Country where the organization is located'));
          }
          if (details.lat && details.lng) {
            this.items.push(new FoldableItem(55, 'Coordinates', `${details.lat}, ${details.lng}`, 'Geographic coordinates of the organization'));
            const osmUrl = `https://www.openstreetmap.org/?mlat=${details.lat}&mlon=${details.lng}&zoom=15`;
            this.actions.push(new FoldableAction(20, 'View on OpenStreetMap', osmUrl, 'secondary'));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching ROR data:', error);
      // Add an error item
      this.items.push(new FoldableItem(0, 'Error', `Failed to fetch data from ROR API: ${error.message}`));
    }
  }

  /**
   * Renders a preview of the ROR organization
   * @returns {FunctionalComponent} The preview component
   */
  renderPreview(): FunctionalComponent {
    // If data is not yet loaded, show the ROR ID
    if (!this.rorData) {
      return <span class="font-mono text-sm">Loading ROR: {this.value}...</span>;
    }

    // If data is loaded, show organization name and ID
    return (
      <span class={'inline-flex flex-nowrap items-center align-top font-mono'}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          // xmlns:xlink="http://www.w3.org/1999/xlink"
          // xmlns:serif="http://www.serif.com/"
          // width="100%"
          // height="100%"
          viewBox="0 0 164 118"
          version="1.1"
          // xml:space="preserve"
          class={'mr-1 h-5 flex-none items-center p-0.5'}
          style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: '2' }}
        >
          <g transform="matrix(0.994301,0,0,0.989352,0,0)">
            <rect x="0" y="0" width="164.94" height="119.27" style={{ fill: 'white' }} />
          </g>
          <g transform="matrix(1,0,0,1,-0.945,-0.815)">
            <path d="M68.65,4.16L56.52,22.74L44.38,4.16L68.65,4.16Z" style={{ fill: 'rgb(83,186,161)', fillRule: 'nonzero' }} />
            <path d="M119.41,4.16L107.28,22.74L95.14,4.16L119.41,4.16Z" style={{ fill: 'rgb(83,186,161)', fillRule: 'nonzero' }} />
            <path d="M44.38,115.47L56.52,96.88L68.65,115.47L44.38,115.47Z" style={{ fill: 'rgb(83,186,161)', fillRule: 'nonzero' }} />
            <path d="M95.14,115.47L107.28,96.88L119.41,115.47L95.14,115.47Z" style={{ fill: 'rgb(83,186,161)', fillRule: 'nonzero' }} />
            <path
              d="M145.53,63.71C149.83,62.91 153.1,61 155.33,57.99C157.57,54.98 158.68,51.32 158.68,47.03C158.68,43.47 158.06,40.51 156.83,38.13C155.6,35.75 153.93,33.86 151.84,32.45C149.75,31.05 147.31,30.04 144.53,29.44C141.75,28.84 138.81,28.54 135.72,28.54L112.16,28.54L112.16,47.37C111.97,46.82 111.77,46.28 111.55,45.74C109.92,41.79 107.64,38.42 104.71,35.64C101.78,32.86 98.32,30.72 94.3,29.23C90.29,27.74 85.9,26.99 81.14,26.99C76.38,26.99 72,27.74 67.98,29.23C63.97,30.72 60.5,32.86 57.57,35.64C54.95,38.13 52.85,41.1 51.27,44.54C51.04,42.07 50.46,39.93 49.53,38.13C48.3,35.75 46.63,33.86 44.54,32.45C42.45,31.05 40.01,30.04 37.23,29.44C34.45,28.84 31.51,28.54 28.42,28.54L4.87,28.54L4.87,89.42L18.28,89.42L18.28,65.08L24.9,65.08L37.63,89.42L53.71,89.42L38.24,63.71C42.54,62.91 45.81,61 48.04,57.99C48.14,57.85 48.23,57.7 48.33,57.56C48.31,58.03 48.3,58.5 48.3,58.98C48.3,63.85 49.12,68.27 50.75,72.22C52.38,76.17 54.66,79.54 57.59,82.32C60.51,85.1 63.98,87.24 68,88.73C72.01,90.22 76.4,90.97 81.16,90.97C85.92,90.97 90.3,90.22 94.32,88.73C98.33,87.24 101.8,85.1 104.73,82.32C107.65,79.54 109.93,76.17 111.57,72.22C111.79,71.69 111.99,71.14 112.18,70.59L112.18,89.42L125.59,89.42L125.59,65.08L132.21,65.08L144.94,89.42L161.02,89.42L145.53,63.71ZM36.39,50.81C35.67,51.73 34.77,52.4 33.68,52.83C32.59,53.26 31.37,53.52 30.03,53.6C28.68,53.69 27.41,53.73 26.2,53.73L18.29,53.73L18.29,39.89L27.06,39.89C28.26,39.89 29.5,39.98 30.76,40.15C32.02,40.32 33.14,40.65 34.11,41.14C35.08,41.63 35.89,42.33 36.52,43.25C37.15,44.17 37.47,45.4 37.47,46.95C37.47,48.6 37.11,49.89 36.39,50.81ZM98.74,66.85C97.85,69.23 96.58,71.29 94.91,73.04C93.25,74.79 91.26,76.15 88.93,77.13C86.61,78.11 84.01,78.59 81.15,78.59C78.28,78.59 75.69,78.1 73.37,77.13C71.05,76.16 69.06,74.79 67.39,73.04C65.73,71.29 64.45,69.23 63.56,66.85C62.67,64.47 62.23,61.85 62.23,58.98C62.23,56.17 62.67,53.56 63.56,51.15C64.45,48.74 65.72,46.67 67.39,44.92C69.05,43.17 71.04,41.81 73.37,40.83C75.69,39.86 78.28,39.37 81.15,39.37C84.02,39.37 86.61,39.86 88.93,40.83C91.25,41.8 93.24,43.17 94.91,44.92C96.57,46.67 97.85,48.75 98.74,51.15C99.63,53.56 100.07,56.17 100.07,58.98C100.07,61.85 99.63,64.47 98.74,66.85ZM143.68,50.81C142.96,51.73 142.06,52.4 140.97,52.83C139.88,53.26 138.66,53.52 137.32,53.6C135.97,53.69 134.7,53.73 133.49,53.73L125.58,53.73L125.58,39.89L134.35,39.89C135.55,39.89 136.79,39.98 138.05,40.15C139.31,40.32 140.43,40.65 141.4,41.14C142.37,41.63 143.18,42.33 143.81,43.25C144.44,44.17 144.76,45.4 144.76,46.95C144.76,48.6 144.4,49.89 143.68,50.81Z"
              style={{ fill: 'rgb(32,40,38)', fillRule: 'nonzero' }}
            />
          </g>
        </svg>
        <span class={'flex-none items-center px-1'}>
          {this.label}
          {this.acronym ? ' (' + this.acronym + ')' : ''}
        </span>
      </span>
    );
  }

  /**
   * Returns the data fetched from ROR
   * @returns {unknown} The data fetched from ROR API
   */
  get data(): unknown {
    return this.rorData;
  }
}
