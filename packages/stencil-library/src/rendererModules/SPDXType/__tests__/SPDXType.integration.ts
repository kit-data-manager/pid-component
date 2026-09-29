import { describe, expect, it } from 'vitest';
import { SPDXType } from '../SPDXType';

/**
 * Integration tests that hit the live SPDX license detail API
 * (raw.githubusercontent.com/spdx/license-list-data). These run as part of the
 * normal `unit` project so the API is verified to be working as intended on
 * every CI run. Unlike the unit tests, fetch is NOT mocked here.
 */

const BASE_URL = 'https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/json/details';

const PER_TEST_TIMEOUT = 30000;

interface LicenseDetail {
  licenseId?: string;
  name?: string;
  seeAlso?: string[];
  isOsiApproved?: boolean;
  isFsfLibre?: boolean;
  isDeprecatedLicenseId?: boolean;
  licenseText?: string;
}

async function fetchLicenseDetail(licenseId: string): Promise<LicenseDetail> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PER_TEST_TIMEOUT);
  try {
    const res = await fetch(`${BASE_URL}/${licenseId}.json`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`SPDX API returned ${res.status} for ${licenseId}.json (${BASE_URL})`);
    }
    return (await res.json()) as LicenseDetail;
  } finally {
    clearTimeout(timeoutId);
  }
}

describe('SPDX license API (integration)', () => {
  it('serves Apache-2.0 details with the schema SPDXType relies on', async () => {
    const detail = await fetchLicenseDetail('Apache-2.0');

    expect(detail.licenseId).toBe('Apache-2.0');
    expect(detail.name).toBe('Apache License 2.0');
    expect(Array.isArray(detail.seeAlso)).toBe(true);
    expect(typeof detail.isOsiApproved).toBe('boolean');
    expect(typeof detail.isFsfLibre).toBe('boolean');
    expect(detail.isDeprecatedLicenseId).toBe(false);
    expect(typeof detail.licenseText).toBe('string');
  }, PER_TEST_TIMEOUT);

  it('serves MIT details', async () => {
    const detail = await fetchLicenseDetail('MIT');
    expect(detail.licenseId).toBe('MIT');
    expect(detail.name).toBe('MIT License');
  }, PER_TEST_TIMEOUT);

  it('serves a deprecated license (GPL-3.0) so the deprecation branch has data', async () => {
    const detail = await fetchLicenseDetail('GPL-3.0');
    expect(detail.licenseId).toBe('GPL-3.0');
    expect(detail.isDeprecatedLicenseId).toBe(true);
  }, PER_TEST_TIMEOUT);

  it('resolves and populates licenseData via SPDXType.hasMeaningfulInformation()', async () => {
    const st = new SPDXType('Apache-2.0');
    const meaningful = await st.hasMeaningfulInformation();

    expect(meaningful).toBe(true);
    expect(st.licenseId).toBe('Apache-2.0');
    expect(st.data?.name).toBe('Apache License 2.0');
    expect(st.data?.licenseId).toBe('Apache-2.0');
  }, PER_TEST_TIMEOUT);

  it('returns false for a nonexistent license id', async () => {
    const st = new SPDXType('Not-A-Real-SPDX-License-12345');
    const meaningful = await st.hasMeaningfulInformation();
    expect(meaningful).toBe(false);
  }, PER_TEST_TIMEOUT);
});
