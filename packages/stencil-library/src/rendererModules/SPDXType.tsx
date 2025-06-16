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
  seeAlso?: string[];
}

/**
 * This class specifies a custom renderer for SPDX license identifiers.
 * It fetches license details from the SPDX API and displays them.
 * @extends GenericIdentifierType
 */
export class SPDXType extends GenericIdentifierType {
  private licenseData: Record<string, any>;
  private licenseId: string;
  private readonly spdxBaseUrl: string = 'https://spdx.org/licenses';
  private readonly fileFormat: string = 'json';
  private availableLicenses: SPDXLicense[] = [];

  // Static cache for known license URLs to avoid repeated API calls
  private static knownLicenses: Record<string, string> = {};

  getSettingsKey(): string {
    return 'SPDXType';
  }

  /**
   * Checks if the provided value is a valid SPDX URL format
   * SPDX URLs typically have the format: https://spdx.org/licenses/[licenseID]
   * @returns {boolean} Whether the value has the correct SPDX URL format
   */
  hasCorrectFormat(): boolean {
    const regex = new RegExp('^https?://spdx.org/licenses/[\\w\\.\\-+]+(?:/)?$', 'i');
    return regex.test(this.value);
  }

  /**
   * Fetches license data from the SPDX API
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    try {
      // Find the appropriate license URL based on the input
      const licenseUrl = await this.findLicenseUrl();

      // Extract the license ID from the URL
      this.licenseId = licenseUrl.split('/').pop()?.replace(`.${this.fileFormat}`, '') || '';

      if (this.licenseId === this.value) {
        // We couldn't find a proper license URL, so try a direct search using the input value
        this.licenseId = this.value.replace(/\.(json|html)$/i, '');
      }

      // Create a timeout promise to handle API timeouts
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 seconds timeout
      });

      // Attempt to fetch license data with timeout
      try {
        // Fetch data from SPDX API
        const fetchPromise = fetch(`${this.spdxBaseUrl}/${this.licenseId}.${this.fileFormat}`);
        const response = (await Promise.race([fetchPromise, timeout])) as Response;

        if (!response.ok) {
          throw new Error(`Failed to fetch SPDX data: ${response.status}`);
        }

        this.licenseData = await response.json();

        if (!this.licenseData) {
          throw new Error('No license data available');
        }
      } catch (fetchError) {
        console.warn('Error fetching SPDX license data:', fetchError);
        // Use fallback data for common licenses if available
        this.licenseData = this.getFallbackLicenseData(this.licenseId);

        if (!this.licenseData) {
          throw fetchError; // Re-throw if no fallback available
        }
      }

      // Add license name
      this.items.push(new FoldableItem(0, 'Full Name', this.licenseData.name, 'The full legal name of the license', null, null, false));

      // Add license ID
      this.items.push(new FoldableItem(10, 'SPDX ID', this.licenseData.licenseId, 'The unique SPDX identifier for this license', null, null, false));

      // Add deprecated status if applicable
      if (this.licenseData.isDeprecatedLicenseId) {
        this.items.push(new FoldableItem(15, 'Deprecated', 'Yes', 'This license ID has been deprecated by SPDX', null, null, false));

        // Add deprecation notes if available
        if (this.licenseData.deprecatedVersion) {
          this.items.push(new FoldableItem(16, 'Deprecated Since', this.licenseData.deprecatedVersion, 'The SPDX version when this license was deprecated', null, null, false));
        }
      }

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
      if (this.licenseData.isFsfLibre !== undefined) {
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

      // Add related URLs
      if (this.licenseData.seeAlso && this.licenseData.seeAlso.length > 0) {
        for (let i = 0; i < this.licenseData.seeAlso.length; i++) {
          const url = this.licenseData.seeAlso[i];
          this.items.push(new FoldableItem(30 + i, `Related URL ${i + 1}`, url, 'A related URL with more information about this license', null, null, true));
        }
      }

      // Add license text if available
      if (this.licenseData.licenseText) {
        this.items.push(
          new FoldableItem(
            40,
            'License Text',
            this.licenseData.licenseText.substring(0, 500) + (this.licenseData.licenseText.length > 500 ? '...' : ''),
            'The full text of the license (truncated for display)',
            null,
            null,
            false,
          ),
        );
      }

      // Add standard license header if available
      if (this.licenseData.standardLicenseHeader) {
        this.items.push(new FoldableItem(50, 'Standard License Header', this.licenseData.standardLicenseHeader, 'The standard header text for this license', null, null, false));
      }

      // Add actions
      this.actions.push(new FoldableAction(10, 'View on SPDX', `https://spdx.org/licenses/${this.licenseData.licenseId}`, 'primary'));

      if (this.licenseData.isOsiApproved) {
        this.actions.push(new FoldableAction(20, 'View on OSI', 'https://opensource.org/licenses/', 'secondary'));
      }

      if (this.licenseData.seeAlso && this.licenseData.seeAlso.length > 0) {
        // Find the most official looking URL to use as a direct link
        const officialUrl =
          this.licenseData.seeAlso.find((url: string) => {
            const lower = url.toLowerCase();
            return (
              lower.includes('opensource.org') || lower.includes('fsf.org') || lower.includes('gnu.org') || lower.includes('apache.org') || lower.includes('creativecommons.org')
            );
          }) || this.licenseData.seeAlso[0];

        this.actions.push(new FoldableAction(30, 'View Official License', officialUrl, 'secondary'));
      }
    } catch (error) {
      console.error('Error fetching SPDX data:', error);

      // Add meaningful error information
      this.items.push(new FoldableItem(0, 'Error', `Failed to fetch data from SPDX API: ${error.message}`));

      // Add basic information based on the input value
      if (this.licenseId) {
        this.items.push(new FoldableItem(10, 'License ID', this.licenseId, 'The license identifier that was detected'));

        // Try to add a meaningful action even in error case
        this.actions.push(new FoldableAction(10, 'View on SPDX', `https://spdx.org/licenses/${this.licenseId}`, 'primary'));
      } else {
        this.licenseId = this.value.replace(/^https?:\/\/spdx\.org\/licenses\//i, '').replace(/\/$/, '');
        this.items.push(new FoldableItem(10, 'Possible License ID', this.licenseId, 'Extracted from the input value'));
        this.actions.push(new FoldableAction(10, 'Search on SPDX', 'https://spdx.org/licenses/', 'primary'));
      }

      // Provide offline help information
      this.items.push(
        new FoldableItem(
          20,
          'Network Issue',
          'The SPDX API could not be reached. This may be due to network connectivity issues or the SPDX service being unavailable.',
          'Try again when you have internet connectivity',
        ),
      );

      // Create minimal fallback data structure for render functions
      this.licenseData = {
        licenseId: this.licenseId,
        name: this.licenseId,
      };
    }
  }

  /**
   * Renders a preview of the SPDX license
   * @returns {FunctionalComponent} The preview component
   */
  renderPreview(): FunctionalComponent {
    // If data is not yet loaded, show the SPDX ID
    if (!this.licenseData) {
      return <span class="font-mono text-sm">SPDX: {this.licenseId || this.value}</span>;
    }

    // If data is loaded, show license name and ID with badges
    return (
      <span class={'inline-flex flex-nowrap items-center align-top font-mono'}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" class={'mr-1 h-5 flex-none items-center p-0.5'} style={{ minWidth: '20px' }}>
          <g transform="translate(0,300) scale(0.1,-0.1)" fill="#43b02a">
            <path d="M630 2800 c-337 -57 -582 -277 -618 -555 -15 -114 -2 -191 57 -342 76 -193 81 -213 81 -368 0 -110 -4 -153 -18 -195 -26 -80 -81 -164 -133 -205 -47 -37 -50 -48 -15 -57 75 -17 323 25 446 77 193 81 353 229 430 396 30 65 60 172 60 218 0 16 7 21 30 23 17 2 35 0 40 -3 5 -3 19 -84 31 -179 31 -246 59 -347 121 -448 91 -146 205 -234 362 -279 61 -17 109 -22 214 -23 l135 0 -5 28 c-10 50 -59 135 -106 185 -25 27 -46 57 -46 68 0 17 -33 59 -97 126 -22 23 -23 28 -23 242 0 232 -4 258 -61 358 -16 28 -29 64 -29 80 0 25 -14 44 -81 113 -43 44 -87 96 -98 114 -35 62 -27 167 19 222 28 35 51 43 98 32 21 -4 20 -2 -7 15 -99 62 -276 93 -441 76 -139 -14 -246 -44 -339 -96 -16 -9 -31 -14 -34 -11 -12 12 65 70 152 116 95 50 188 77 323 94 91 12 95 13 95 37 0 19 -9 27 -45 41 -63 23 -173 41 -265 43 -85 2 -175 -8 -234 -26 -49 -14 -69 -14 -18 0 124 35 262 42 392 19 47 -9 112 -24 144 -34 l59 -19 -7 27 c-9 35 -60 98 -103 128 -76 54 -178 83 -343 98 -120 10 -160 10 -250 -1z" />
          </g>
        </svg>
        <span class={'flex-none items-center px-1'}>
          <span class="font-medium">{this.licenseData.name || this.licenseId}</span>
          {this.licenseData.licenseId && <span class="ml-1 text-gray-500">({this.licenseData.licenseId})</span>}
          <span class="ml-2 flex flex-wrap gap-1">
            {this.licenseData.isDeprecatedLicenseId && (
              <span class="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/20 ring-inset">Deprecated</span>
            )}
            {this.licenseData.isOsiApproved && (
              <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">OSI Approved</span>
            )}
            {this.licenseData.isFsfLibre && (
              <span class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">FSF Free</span>
            )}
          </span>
        </span>
      </span>
    );
  }

  /**
   * Normalizes text for comparison by removing case sensitivity, whitespace, and URL prefixes
   * @param text - The text to normalize
   * @returns The normalized text
   */
  private normalizeText(text: string): string {
    let normalized = text.toLowerCase();

    // Remove whitespaces
    normalized = normalized.replace(/\s+/g, '');

    // Remove URL prefixes
    normalized = normalized.replace(/https?:\/\//g, '');
    normalized = normalized.replace(/www\./g, '');

    // Remove 'legalcode'
    normalized = normalized.replace(/legalcode/g, '');

    // Remove file extensions
    normalized = normalized.replace(/\.(json|html|txt|md|xml|rdf)$/g, '');

    // Replace 'licenses' with 'license'
    normalized = normalized.replace(/licenses/g, 'license');

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');

    return normalized;
  }

  /**
   * Checks if two texts are similar after normalization
   * @param original - The original text
   * @param target - The target text or array of texts
   * @returns Whether the texts are similar
   */
  private checkTextIsSimilar(original: string, target: string | string[]): boolean {
    const targets = Array.isArray(target) ? target : [target];
    const normalizedOriginal = this.normalizeText(original);

    for (const t of targets) {
      const normalizedTarget = this.normalizeText(t);
      if (normalizedOriginal === normalizedTarget) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if a string is likely to be a valid SPDX license ID
   * @param input - The input string to check
   * @returns Whether the string is likely a valid SPDX license ID
   */
  private isLikelyLicenseId(input: string): boolean {
    // Common SPDX license ID pattern
    const licenseIdPattern = /^[A-Za-z0-9\-.+]+$/;

    // List of common license IDs for fallback
    const commonLicenseIds = [
      'MIT',
      'Apache-2.0',
      'GPL-3.0',
      'GPL-2.0',
      'LGPL-3.0',
      'LGPL-2.1',
      'BSD-3-Clause',
      'BSD-2-Clause',
      'MPL-2.0',
      'CC-BY-4.0',
      'CC-BY-SA-4.0',
      'Unlicense',
      'AGPL-3.0',
      'EPL-2.0',
      'CC0-1.0',
      'ISC',
    ];

    // Check if input matches common license IDs
    if (commonLicenseIds.includes(input.trim())) {
      return true;
    }

    // Check against pattern and reasonable length
    return licenseIdPattern.test(input.trim()) && input.length < 30;
  }

  /**
   * Extracts the license ID from the input value by checking against the SPDX license list
   * @returns Promise with the license URL
   */
  private async findLicenseUrl(): Promise<string> {
    const input = this.value;

    // Check if we already know this license
    if (SPDXType.knownLicenses[input]) {
      console.debug(`Using cached license URL for ${input}: ${SPDXType.knownLicenses[input]}`);
      return SPDXType.knownLicenses[input];
    }

    // If input looks like a direct SPDX license URL or ID
    if (this.value.includes('spdx.org/licenses/')) {
      // Extract license ID from URL
      const licenseId = this.value
        .replace(/\/$/, '')
        .replace(/\.html$|\.json$/, '')
        .split('/')
        .pop();

      if (licenseId) {
        const url = `${this.spdxBaseUrl}/${licenseId}.${this.fileFormat}`;
        SPDXType.knownLicenses[input] = url;
        return url;
      }
    }

    // Fetch the list of licenses
    try {
      // Add timeout for fetch requests
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 seconds timeout
      });

      try {
        const fetchPromise = fetch(`${this.spdxBaseUrl}/licenses.${this.fileFormat}`);
        const response = (await Promise.race([fetchPromise, timeout])) as Response;
        if (!response.ok) {
          throw new Error(`Failed to fetch SPDX license list: ${response.status}`);
        }

        const data = await response.json();
        this.availableLicenses = data.licenses;
      } catch (fetchError) {
        console.warn('Error fetching SPDX license list:', fetchError);
        // If we can't fetch the list, try to use a direct URL based on input
        if (this.isLikelyLicenseId(input)) {
          const directUrl = `${this.spdxBaseUrl}/${input.trim()}.${this.fileFormat}`;
          SPDXType.knownLicenses[input] = directUrl;
          return directUrl;
        }
        throw fetchError;
      }

      // Check against each license
      for (const license of this.availableLicenses) {
        const url = `${this.spdxBaseUrl}/${license.licenseId}.${this.fileFormat}`;

        // Check against reference URL
        if (license.reference && this.checkTextIsSimilar(input, license.reference)) {
          SPDXType.knownLicenses[input] = url;
          return url;
        }

        // Check against detailsUrl
        if (license.detailsUrl && this.checkTextIsSimilar(input, license.detailsUrl)) {
          SPDXType.knownLicenses[input] = url;
          return url;
        }

        // Check against licenseId
        if (license.licenseId && this.checkTextIsSimilar(input, license.licenseId)) {
          SPDXType.knownLicenses[input] = url;
          return url;
        }

        // Check against seeAlso URLs
        if (license.seeAlso && this.checkTextIsSimilar(input, license.seeAlso)) {
          SPDXType.knownLicenses[input] = url;
          return url;
        }

        // Check against license name
        if (license.name && this.checkTextIsSimilar(input, license.name)) {
          SPDXType.knownLicenses[input] = url;
          return url;
        }

        // Check against reference number
        if (license.referenceNumber && input === license.referenceNumber.toString()) {
          SPDXType.knownLicenses[input] = url;
          return url;
        }
      }

      // If no match found, just use the input value as is
      return input;
    } catch (error) {
      console.error('Error fetching SPDX license list:', error);
      return input;
    }
  }

  /**
   * Returns the data fetched from SPDX
   * @returns {unknown} The data fetched from SPDX API
   */
  /**
   * Returns fallback license data for common licenses when API is unreachable
   * @param licenseId - The license ID to get fallback data for
   * @returns License data or null if no fallback available
   */
  private getFallbackLicenseData(licenseId: string): Record<string, any> | null {
    // Map of common license fallbacks
    const fallbackLicenses: Record<string, Record<string, any>> = {
      'MIT': {
        licenseId: 'MIT',
        name: 'MIT License',
        isOsiApproved: true,
        seeAlso: ['https://opensource.org/licenses/MIT'],
        isDeprecatedLicenseId: false,
      },
      'Apache-2.0': {
        licenseId: 'Apache-2.0',
        name: 'Apache License 2.0',
        isOsiApproved: true,
        seeAlso: ['https://www.apache.org/licenses/LICENSE-2.0'],
        isDeprecatedLicenseId: false,
      },
      'GPL-3.0': {
        licenseId: 'GPL-3.0',
        name: 'GNU General Public License v3.0',
        isOsiApproved: true,
        seeAlso: ['https://www.gnu.org/licenses/gpl-3.0.html'],
        isDeprecatedLicenseId: false,
      },
      'CC-BY-4.0': {
        licenseId: 'CC-BY-4.0',
        name: 'Creative Commons Attribution 4.0 International',
        isOsiApproved: false,
        seeAlso: ['https://creativecommons.org/licenses/by/4.0/'],
        isDeprecatedLicenseId: false,
      },
      'BSD-3-Clause': {
        licenseId: 'BSD-3-Clause',
        name: 'BSD 3-Clause "New" or "Revised" License',
        isOsiApproved: true,
        seeAlso: ['https://opensource.org/licenses/BSD-3-Clause'],
        isDeprecatedLicenseId: false,
      },
      'LGPL-3.0': {
        licenseId: 'LGPL-3.0',
        name: 'GNU Lesser General Public License v3.0',
        isOsiApproved: true,
        seeAlso: ['https://www.gnu.org/licenses/lgpl-3.0.html'],
        isDeprecatedLicenseId: false,
      },
    };

    // Clean up the license ID for matching
    const normalizedId = licenseId
      .trim()
      .replace(/^https?:\/\/spdx\.org\/licenses\//, '')
      .replace(/\/$/, '');

    return fallbackLicenses[normalizedId] || null;
  }

  get data(): unknown {
    return this.licenseData;
  }
}
