import { FunctionalComponent, h } from '@stencil/core';
import { GenericIdentifierType } from '../../utils/GenericIdentifierType';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';

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

  getSettingsKey(): string {
    return 'SPDXType';
  }

  private static readonly ID_REGEX = /^[\w.\-+]+$/;
  private static readonly URL_REGEX = /^https?:\/\/spdx\.org\/licenses\/[\w.\-+]+\/?$/i;

  quickCheck(): boolean | undefined {
    if (SPDXType.URL_REGEX.test(this.value)) return true;
    if (SPDXType.ID_REGEX.test(this.value)) return undefined;
    return false;
  }

  async hasMeaningfulInformation(): Promise<boolean> {
    const licenseId = this.extractLicenseId();
    if (!licenseId) return false;

    const url = this.buildLicenseApiUrl(licenseId);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return false;

      const data = await response.json();
      if (data && data.licenseId) {
        this.licenseData = data;
        this.licenseId = licenseId;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private extractLicenseId(): string {
    if (!this.value.includes('/') && !this.value.includes('://')) {
      return this.value.trim();
    }
    return this.value
      .replace(/^https?:\/\/spdx\.org\/licenses\//i, '')
      .replace(/\/$/, '')
      .replace(/\.(json|html)$/i, '');
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
   * Debugging method to log the current license data
   */
  logLicenseData(): void {
    console.log('Current license data:', {
      licenseId: this.licenseId,
      licenseData: this.licenseData,
      hasData: Boolean(this.licenseData && this.licenseData.licenseId && this.licenseData.name),
    });
  }
  /**
   * Main initialization method that fetches data if needed and populates the view
   */
  async init(): Promise<void> {
    // Fetch data if not already available (for backwards compatibility)
    if (!this.licenseData) {
      const success = await this.hasMeaningfulInformation();
      if (!success) {
        this.handleInitError(new Error('Failed to fetch SPDX license data'));
        return;
      }
    }
    this.populateLicenseData();
    this.addActionButtons();
  }

  /**
   * Populates the UI with license data
   */
  private populateLicenseData(): void {
    if (!this.licenseData) return;

    // Add license name and ID
    this.items.push(new FoldableItem(0, 'Full Name', this.licenseData.name, 'The full legal name of the license', undefined, null, false));
    this.items.push(new FoldableItem(10, 'SPDX ID', this.licenseData.licenseId, 'The unique SPDX identifier for this license', undefined, null, false));

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
        undefined,
        false,
      ),
    );

    // Add FSF Free/Libre status if available
    this.addFsfInfo();

    // Add related URLs
    this.addRelatedUrls();
  }

  /**
   * Adds deprecation information if the license is deprecated
   */
  private addDeprecationInfo(): void {
    if (!this.licenseData || !this.licenseData.isDeprecatedLicenseId) return;

    this.items.push(new FoldableItem(15, 'Deprecated', 'Yes', 'This license ID has been deprecated by SPDX', undefined, null, false));

    // Add deprecation notes if available
    if (this.licenseData.deprecatedVersion) {
      this.items.push(new FoldableItem(16, 'Deprecated Since', this.licenseData.deprecatedVersion, 'The SPDX version when this license was deprecated', undefined, null, false));
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
        undefined,
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
    const allowedHosts = ['opensource.org', 'fsf.org', 'gnu.org', 'apache.org', 'creativecommons.org'];
    return urls.find((url: string) => {
      try {
        const parsedUrl = new URL(url);
        return allowedHosts.includes(parsedUrl.host);
      } catch {
        // Ignore invalid URLs
        return false;
      }
    });
  }

  /**
   * Handles initialization errors
   */
  private handleInitError(error: { message: string }): void {
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
   * Renders a preview of the SPDX license
   */
  renderPreview(): FunctionalComponent {
    // If data is not yet loaded, show the SPDX ID
    if (!this.licenseData) {
      return <span class={`font-mono text-sm`}>SPDX: {this.licenseId || this.value}</span>;
    }

    // If data is loaded, show license name and ID with badges
    return (
      <span class={`inline-flex flex-nowrap items-baseline font-mono min-w-0 max-w-full`}>
          <span
            class={`font-medium min-w-0 overflow-hidden text-ellipsis whitespace-nowrap`}>{this.licenseData.name || this.licenseId}</span>
        {this.licenseData.licenseId &&
          <span class={`flex-none pl-1 text-gray-500`}>({this.licenseData.licenseId})</span>}
      </span>
    );
  }
}
