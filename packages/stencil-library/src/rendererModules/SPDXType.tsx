// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../utils/GenericIdentifierType';
import { FoldableItem } from '../utils/FoldableItem';
import { FoldableAction } from '../utils/FoldableAction';

interface SPDXLicense {
  licenseId: string;
  name: string;
  reference?: string;
  detailsUrl?: string;
  referenceNumber?: string;
  isDeprecatedLicenseId?: boolean;
  isOsiApproved?: boolean;
  isFsfLibre?: boolean;
  deprecatedVersion?: string;
  licenseText?: string;
  standardLicenseHeader?: string;
  seeAlso?: string[];
}

/**
 * This class specifies a custom renderer for SPDX license identifiers.
 * It fetches license details from the SPDX API and displays them.
 * @extends GenericIdentifierType
 */
export class SPDXType extends GenericIdentifierType {
  private licenseData: SPDXLicense | null = null;
  private licenseId: string = '';
  private readonly corsFallback: boolean = true;
  private readonly corsProxy: string = 'https://corsproxy.io/?';
  private readonly spdxBaseUrl: string = 'https://spdx.org/licenses';
  private readonly fileFormat: string = 'json';
  private readonly requestTimeout: number = 10000; // 10 seconds

  // Static list of common SPDX licenses for quick validation
  private static readonly commonLicenses: string[] = [
    'MIT',
    'Apache-2.0',
    'GPL-3.0-only',
    'GPL-2.0-only',
    'BSD-3-Clause',
    'BSD-2-Clause',
    'LGPL-3.0-only',
    'LGPL-2.1-only',
    'MPL-2.0',
    'AGPL-3.0-only',
    'CC-BY-4.0',
    'CC-BY-SA-4.0',
    'CC0-1.0',
    'Unlicense',
    'ISC',
  ];

  getSettingsKey(): string {
    return 'SPDXType';
  }

  /**
   * Checks if the provided value is a valid SPDX license identifier or URL
   * Also prefetches license data to improve user experience
   * @returns true if the value is a valid SPDX license identifier
   */
  hasCorrectFormat(): boolean {
    // Check if the value is directly a SPDX URL
    const urlRegex = new RegExp('^https?://spdx.org/licenses/[\\w\\.\\-+]+(?:/)?$', 'i');
    const isValidUrl = urlRegex.test(this.value);

    // Check if the value looks like a license ID (e.g., "MIT", "Apache-2.0")
    const idRegex = /^[\w\.\-+]+$/;
    const isValidId = idRegex.test(this.value);

    // If neither format is valid, return false immediately
    if (!isValidUrl && !isValidId) {
      return false;
    }

    // Extract potential license ID from the value
    let licenseId: string;

    if (isValidUrl) {
      // Extract license ID from URL
      licenseId = this.value.replace(/^https?:\/\/spdx\.org\/licenses\//i, '').replace(/\/$/, '');
    } else {
      // Use the value directly as license ID
      licenseId = this.value;
    }

    // Pre-fetch license data in the background to validate it exists
    // and improve loading time when the component is displayed
    this.validateLicense(licenseId);

    return true;
  }

  /**
   * Validates that a license ID exists in SPDX and pre-fetches data
   * @param licenseId The license ID to validate
   * @returns A promise that resolves to true if the license exists
   */
  private async validateLicense(licenseId: string): Promise<boolean> {
    try {
      // Store the license ID for later use
      this.licenseId = licenseId;

      // Quick check against common licenses list for faster validation
      if (SPDXType.commonLicenses.includes(licenseId)) {
        console.debug(`License ${licenseId} is in common licenses list, skipping fetch validation`);
        return true;
      }

      // Construct API URL
      const url = this.buildLicenseApiUrl(licenseId);

      // Attempt to fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // shorter timeout for validation

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.debug(`License ${licenseId} validation failed with status ${response.status}`);
        return false;
      }

      // Store license data for later use
      const data = await response.json();
      if (data && data.licenseId) {
        // Cache the data to avoid refetching later
        this.licenseData = data;
        return true;
      }

      return false;
    } catch (error) {
      // If validation fails (e.g., timeout or network error), still return true
      // as we want to attempt to render with this renderer
      console.debug(`License validation error for ${licenseId}:`, error);
      return true;
    }
  }

  /**
   * Builds the appropriate API URL for a license ID
   * @param licenseId The license ID
   * @returns The API URL
   */
  private buildLicenseApiUrl(licenseId: string): string {
    const baseUrl = this.corsFallback
      ? `${this.corsProxy}${encodeURIComponent(`${this.spdxBaseUrl}/${licenseId}.${this.fileFormat}`)}`
      : `${this.spdxBaseUrl}/${licenseId}.${this.fileFormat}`;

    return baseUrl;
  }
  /**
   * Returns the license data that is being rendered in the component
   * @returns The license data
   */
  get data(): SPDXLicense | null {
    return this.licenseData;
  }
  /**
   * Main initialization method that fetches license data and populates the view
   */
  async init(): Promise<void> {
    try {
      // Extract license ID if not already set during validation
      if (!this.licenseId) {
        this.extractLicenseIdFromInput();
      }

      // If we already have license data from validation, skip fetching
      if (!this.licenseData) {
        await this.fetchLicenseData();
      } else {
        console.debug(`Using pre-fetched data for license ${this.licenseId}`);
      }

      this.populateLicenseData();
      this.addActionButtons();
    } catch (error) {
      console.error('Error fetching SPDX data:', error);
      this.handleInitError(error);
    }
  }

  /**
   * Extracts license ID from the input value
   */
  private extractLicenseIdFromInput(): void {
    // If input is likely a direct license ID, set it immediately
    if (!this.value.includes('/') && !this.value.includes('://')) {
      this.licenseId = this.value.trim();
    } else {
      // Extract the license ID from the URL
      this.licenseId = this.value
        .replace(/^https?:\/\/spdx\.org\/licenses\//i, '')
        .replace(/\/$/, '')
        .replace(/\.(json|html)$/i, '');
    }
  }

  /**
   * Fetches license data from the SPDX API with fallback options
   */
  private async fetchLicenseData(): Promise<void> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout);
    });

    try {
      const apiUrl = this.buildApiUrl();
      console.debug(`Fetching license data from: ${apiUrl}`);

      const fetchPromise = fetch(apiUrl);
      const response = (await Promise.race([fetchPromise, timeout])) as Response;

      if (!response.ok) {
        if (this.corsFallback && apiUrl.includes(this.corsProxy)) {
          await this.tryFallbackOptions();
        } else {
          throw new Error(`Failed to fetch SPDX data: ${response.status}`);
        }
      } else {
        this.licenseData = await response.json();
      }

      if (!this.licenseData) {
        throw new Error('No license data available');
      }
    } catch (fetchError) {
      console.warn('Error fetching SPDX license data:', fetchError);
      this.licenseData = this.getFallbackLicenseData(this.licenseId);
      if (!this.licenseData) {
        throw fetchError; // Re-throw if no fallback available
      }
    }
  }

  /**
   * Tries fallback options when the primary fetch fails
   */
  private async tryFallbackOptions(): Promise<void> {
    console.debug('CORS proxy fetch failed, trying direct request as fallback');

    // Try local fallback data first before making another network request
    const fallbackData = this.getFallbackLicenseData(this.licenseId);
    if (fallbackData) {
      console.debug('Using local fallback data for', this.licenseId);
      this.licenseData = fallbackData;
      return;
    }

    // If no fallback data, try direct request as last resort
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), this.requestTimeout);
    });

    const directUrl = `${this.spdxBaseUrl}/${this.licenseId}.${this.fileFormat}`;
    const directFetchPromise = fetch(directUrl);
    const directResponse = (await Promise.race([directFetchPromise, timeout])) as Response;

    if (!directResponse.ok) {
      throw new Error(`Failed to fetch SPDX data: ${directResponse.status}`);
    }

    this.licenseData = await directResponse.json();
  }

  /**
   * Builds the API URL with CORS proxy if needed
   */
  private buildApiUrl(): string {
    return this.buildLicenseApiUrl(this.licenseId);
  }

  /**
   * Populates the UI with license data
   */
  private populateLicenseData(): void {
    if (!this.licenseData) return;

    // Add license name and ID
    this.items.push(new FoldableItem(0, 'Full Name', this.licenseData.name, 'The full legal name of the license', null, null, false));
    this.items.push(new FoldableItem(10, 'SPDX ID', this.licenseData.licenseId, 'The unique SPDX identifier for this license', null, null, false));

    // Add deprecated status if applicable
    this.addDeprecationInfo();

    // Add OSI Approved status
    this.items.push(
      new FoldableItem(
        20,
        'OSI Approved',
        this.licenseData.isOsiApproved ? 'Yes' : 'No',
        'Whether the license is approved by the Open Source Initiative',
        'https://opensource.org/licenses/',
        null,
        false,
      ),
    );

    // Add FSF Free/Libre status if available
    this.addFsfInfo();

    // Add related URLs
    this.addRelatedUrls();

    // // Add license text if available
    // this.addLicenseText();

    // // Add standard license header if available
    // if (this.licenseData.standardLicenseHeader) {
    //   this.items.push(new FoldableItem(50, 'Standard License Header', this.licenseData.standardLicenseHeader, 'The standard header text for this license', null, null, false));
    // }
  }

  /**
   * Adds deprecation information if the license is deprecated
   */
  private addDeprecationInfo(): void {
    if (!this.licenseData || !this.licenseData.isDeprecatedLicenseId) return;

    this.items.push(new FoldableItem(15, 'Deprecated', 'Yes', 'This license ID has been deprecated by SPDX', null, null, false));

    // Add deprecation notes if available
    if (this.licenseData.deprecatedVersion) {
      this.items.push(new FoldableItem(16, 'Deprecated Since', this.licenseData.deprecatedVersion, 'The SPDX version when this license was deprecated', null, null, false));
    }
  }

  /**
   * Adds FSF Free/Libre information if available
   */
  private addFsfInfo(): void {
    if (!this.licenseData || this.licenseData.isFsfLibre === undefined) return;

    this.items.push(
      new FoldableItem(
        25,
        'FSF Free/Libre',
        this.licenseData.isFsfLibre ? 'Yes' : 'No',
        'Whether the license is considered "Free" by the Free Software Foundation',
        'https://www.fsf.org/licensing/',
        null,
        false,
      ),
    );
  }

  /**
   * Adds related URLs if available
   */
  private addRelatedUrls(): void {
    if (!this.licenseData || !this.licenseData.seeAlso || this.licenseData.seeAlso.length === 0) return;

    for (let i = 0; i < this.licenseData.seeAlso.length; i++) {
      const url = this.licenseData.seeAlso[i];
      this.items.push(new FoldableItem(30 + i, `Related URL`, url, 'A related URL with more information about this license'));
    }
  }

  // /**
  //  * Adds license text if available
  //  */
  // private addLicenseText(): void {
  //   if (!this.licenseData || !this.licenseData.licenseText) return;
  //
  //   const truncatedText = this.licenseData.licenseText.substring(0, 500) + (this.licenseData.licenseText.length > 500 ? '...' : '');
  //
  //   this.items.push(new FoldableItem(40, 'License Text', truncatedText, 'The full text of the license (truncated for display)', null, null, false));
  // }

  /**
   * Adds action buttons for the license
   */
  private addActionButtons(): void {
    if (!this.licenseData) return;

    // Add main SPDX link
    this.actions.push(new FoldableAction(10, 'View on SPDX', `https://spdx.org/licenses/${this.licenseData.licenseId}`, 'primary'));

    // Add OSI link if applicable
    if (this.licenseData.isOsiApproved) {
      this.actions.push(new FoldableAction(20, 'View on OSI', 'https://opensource.org/licenses/', 'secondary'));
    }

    // Add official license link if available
    this.addOfficialLicenseLink();
  }

  /**
   * Adds a link to the official license page
   */
  private addOfficialLicenseLink(): void {
    if (!this.licenseData || !this.licenseData.seeAlso || this.licenseData.seeAlso.length === 0) return;

    // Find the most official looking URL to use as a direct link
    const officialUrl = this.findOfficialUrl(this.licenseData.seeAlso) || this.licenseData.seeAlso[0];
    this.actions.push(new FoldableAction(30, 'View Official License', officialUrl, 'secondary'));
  }

  /**
   * Finds the most official-looking URL from a list of URLs
   */
  private findOfficialUrl(urls: string[]): string | undefined {
    return urls.find((url: string) => {
      const lower = url.toLowerCase();
      return lower.includes('opensource.org') || lower.includes('fsf.org') || lower.includes('gnu.org') || lower.includes('apache.org') || lower.includes('creativecommons.org');
    });
  }

  /**
   * Handles initialization errors
   */
  private handleInitError(error: any): void {
    // Add meaningful error information
    if (error.message && error.message.includes('CORS')) {
      this.items.push(
        new FoldableItem(
          0,
          'Error',
          `CORS error: Cannot access SPDX API due to cross-origin restrictions. The proxy service may be unavailable.`,
          'This is a browser security restriction. Try again later or use a different browser.',
        ),
      );
    } else {
      this.items.push(new FoldableItem(0, 'Error', `Failed to fetch data from SPDX API: ${error.message}`));
    }

    this.addBasicErrorInfo();
    this.addNetworkIssueInfo();

    // Create minimal fallback data structure for render functions
    this.licenseData = {
      licenseId: this.licenseId,
      name: this.licenseId,
    };
  }

  /**
   * Adds basic error information
   */
  private addBasicErrorInfo(): void {
    if (this.licenseId) {
      this.items.push(new FoldableItem(10, 'License ID', this.licenseId, 'The license identifier that was detected'));
      // Try to add a meaningful action even in error case
      this.actions.push(new FoldableAction(10, 'View on SPDX', `https://spdx.org/licenses/${this.licenseId}`, 'primary'));
    } else {
      this.licenseId = this.value.replace(/^https?:\/\/spdx\.org\/licenses\//i, '').replace(/\/$/, '');
      this.items.push(new FoldableItem(10, 'Possible License ID', this.licenseId, 'Extracted from the input value'));
      this.actions.push(new FoldableAction(10, 'Search on SPDX', 'https://spdx.org/licenses/', 'primary'));
    }
  }

  /**
   * Adds network issue information
   */
  private addNetworkIssueInfo(): void {
    this.items.push(
      new FoldableItem(
        20,
        'Network Issue',
        'The SPDX API could not be reached. This may be due to network connectivity issues or the SPDX service being unavailable.',
        'Try again when you have internet connectivity',
      ),
    );
  }

  /**
   * Gets fallback license data for common licenses
   */
  private getFallbackLicenseData(licenseId: string): SPDXLicense | null {
    // Basic fallback for common licenses
    const commonLicenses: Record<string, SPDXLicense> = {
      'MIT': {
        licenseId: 'MIT',
        name: 'MIT License',
        isOsiApproved: true,
      },
      'Apache-2.0': {
        licenseId: 'Apache-2.0',
        name: 'Apache License 2.0',
        isOsiApproved: true,
      },
      'GPL-3.0-only': {
        licenseId: 'GPL-3.0-only',
        name: 'GNU General Public License v3.0 only',
        isOsiApproved: true,
      },
      'GPL-2.0-only': {
        licenseId: 'GPL-2.0-only',
        name: 'GNU General Public License v2.0 only',
        isOsiApproved: true,
      },
      'BSD-3-Clause': {
        licenseId: 'BSD-3-Clause',
        name: 'BSD 3-Clause License',
        isOsiApproved: true,
      },
      'BSD-2-Clause': {
        licenseId: 'BSD-2-Clause',
        name: 'BSD 2-Clause License',
        isOsiApproved: true,
      },
      'LGPL-3.0-only': {
        licenseId: 'LGPL-3.0-only',
        name: 'GNU Lesser General Public License v3.0 only',
        isOsiApproved: true,
      },
      'CC-BY-4.0': {
        licenseId: 'CC-BY-4.0',
        name: 'Creative Commons Attribution 4.0 International',
        isOsiApproved: false,
      },
      'CC-BY-SA-4.0': {
        licenseId: 'CC-BY-SA-4.0',
        name: 'Creative Commons Attribution-ShareAlike 4.0 International',
        isOsiApproved: false,
      },
      'CC0-1.0': {
        licenseId: 'CC0-1.0',
        name: 'Creative Commons Zero v1.0 Universal',
        isOsiApproved: false,
      },
      'Unlicense': {
        licenseId: 'Unlicense',
        name: 'The Unlicense',
        isOsiApproved: false,
      },
      'ISC': {
        licenseId: 'ISC',
        name: 'ISC License (ISCL)',
        isOsiApproved: true,
      },
      'MPL-2.0': {
        licenseId: 'MPL-2.0',
        name: 'Mozilla Public License 2.0',
        isOsiApproved: true,
      },
      'AGPL-3.0-only': {
        licenseId: 'AGPL-3.0-only',
        name: 'GNU Affero General Public License v3.0 only',
        isOsiApproved: true,
      },
    };

    return commonLicenses[licenseId] || null;
  }

  /**
   * Renders a preview of the SPDX license
   */
  renderPreview(): FunctionalComponent {
    // If data is not yet loaded, show the SPDX ID
    if (!this.licenseData) {
      return <span class="font-mono text-sm">SPDX: {this.licenseId || this.value}</span>;
    }

    // If data is loaded, show license name and ID with badges
    return (
      <span class={'flex flex-nowrap items-center align-top font-mono'}>
        <span class={'items-center px-1'}>
          <span class="font-medium">{this.licenseData.name || this.licenseId}</span>
          {this.licenseData.licenseId && <span class="ml-1 text-gray-500">({this.licenseData.licenseId})</span>}
        </span>
      </span>
    );
  }
}
