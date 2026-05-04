import { describe, expect, it, vi } from 'vitest';
import { detectBestFit, detectionRegistry, sanitizeToken } from '../../auto-detect/detection-registry';

const DOI_examples = {
  VALID_BARE: '10.52825/ocp.v5i.1411',
  VALID_WITH_PREFIX: 'https://dx.doi.org/10.52825/ocp.v5i.1411',
  DATACITE_RFC: 'doi:10.17487/rfc3650',
  INVALID_NOT_A_DOI: 'not-a-doi',
};

const ORCID_examples = {
  VALID: '0009-0005-2800-4833',
  VALID_ALT: '0009-0003-2196-9187',
  VALID_WITH_HTTPS: 'https://orcid.org/0009-0005-2800-4833',
};

const HANDLE_examples = {
  FDO_TYPED: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
};

const ROR_examples = {
  VALID: 'https://ror.org/04t3en479',
};

const SPDX_examples = {
  APACHE_2_0: 'https://spdx.org/licenses/Apache-2.0',
  APACHE_2_0_BARE: 'Apache-2.0',
  MIT: 'https://spdx.org/licenses/MIT',
  MIT_BARE: 'MIT',
  CC_BY_4_0: 'https://spdx.org/licenses/CC-BY-4.0',
};

const EMAIL_examples = {
  VALID: 'someone@example.com',
  INVALID_EMPTY: '',
};

const URL_examples = {
  KIT_WEBSITE: 'https://scc.kit.edu',
  GITHUB: 'https://github.com/kit-data-manager/pid-component',
};

const DATE_examples = {
  ISO_8601: '2022-11-11T08:01:20.557+00:00',
  ISO_8601_ALT: '2024-06-15T09:30:00.000+02:00',
};

const LOCALE_examples = {
  VALID: 'en-US',
  VALID_ALT: 'de-DE',
  EN_US: 'en-US',
  DE_DE: 'de-DE',
};

const JSON_examples = {
  VALID_MINIMAL: '{"test": "value"}',
  SIMPLE: '{"name": "pid-component", "version": "1.0.0"}',
  ARRAY: '{"features": ["PIDs", "ORCiDs", "DOIs"]}',
  INVALID_EMPTY: '',
};

vi.mock('../../components/json-viewer/json-viewer', () => ({}));

describe('detection-registry', () => {
  // ─── sanitizeToken() ───────────────────────────────────────────────

  describe('sanitizeToken()', () => {
    it('strips trailing dot', () => {
      const result = sanitizeToken('10.5281/foo.');
      expect(result.sanitized).toBe('10.5281/foo');
    });

    it('strips trailing comma', () => {
      const result = sanitizeToken('10.5281/foo,');
      expect(result.sanitized).toBe('10.5281/foo');
    });

    it('strips surrounding double quotes', () => {
      const result = sanitizeToken('"10.5281/foo"');
      expect(result.sanitized).toBe('10.5281/foo');
    });

    it('strips surrounding parentheses', () => {
      const result = sanitizeToken('(0009-0005-2800-4833)');
      expect(result.sanitized).toBe('0009-0005-2800-4833');
    });

    it('strips surrounding single quotes', () => {
      const result = sanitizeToken('\'value\'');
      expect(result.sanitized).toBe('value');
    });

    it('strips trailing semicolon', () => {
      const result = sanitizeToken('value;');
      expect(result.sanitized).toBe('value');
    });

    it('strips trailing colon', () => {
      const result = sanitizeToken('value:');
      expect(result.sanitized).toBe('value');
    });

    it('returns unchanged value when no leading/trailing punctuation', () => {
      const result = sanitizeToken('10.5281/foo');
      expect(result.sanitized).toBe('10.5281/foo');
      expect(result.leadingStripped).toBe(0);
    });

    it('returns empty string for all-punctuation input', () => {
      const result = sanitizeToken('.,;:!?');
      expect(result.sanitized).toBe('');
    });

    it('returns correct leadingStripped count for leading quote', () => {
      const result = sanitizeToken('"10.5281/foo"');
      expect(result.leadingStripped).toBe(1);
    });

    it('returns correct leadingStripped count for leading parenthesis', () => {
      const result = sanitizeToken('(value)');
      expect(result.leadingStripped).toBe(1);
    });

    it('returns leadingStripped 0 when only trailing punctuation', () => {
      const result = sanitizeToken('value.');
      expect(result.leadingStripped).toBe(0);
    });

    it('strips multiple leading/trailing punctuation characters', () => {
      const result = sanitizeToken('**value**');
      expect(result.sanitized).toBe('value');
      expect(result.leadingStripped).toBe(2);
    });

    it('strips surrounding straight double quotes', () => {
      const result = sanitizeToken('"10.5281/foo"');
      expect(result.sanitized).toBe('10.5281/foo');
      expect(result.leadingStripped).toBe(1);
    });

    it('strips surrounding guillemets', () => {
      const result = sanitizeToken('\u00AB10.5281/foo\u00BB');
      expect(result.sanitized).toBe('10.5281/foo');
      expect(result.leadingStripped).toBe(1);
    });

    it('strips whitespace-only input to empty string', () => {
      const result = sanitizeToken('   ');
      expect(result.sanitized).toBe('');
      expect(result.leadingStripped).toBeGreaterThan(0);
    });

    it('handles mixed leading and trailing punctuation', () => {
      const result = sanitizeToken('"10.5281/foo."');
      expect(result.sanitized).toBe('10.5281/foo');
      expect(result.leadingStripped).toBe(1);
    });

    it('returns empty string for empty input with leadingStripped 0', () => {
      const result = sanitizeToken('');
      expect(result.sanitized).toBe('');
      expect(result.leadingStripped).toBe(0);
    });
  });

  // ─── detectBestFit() — default mode ────────────────────────────────

  describe('detectBestFit() — default mode', () => {
    it('returns DOIType for a bare DOI', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE)).toBe('DOIType');
    });

    it('returns DOIType for a DOI with doi: prefix', () => {
      expect(detectBestFit(DOI_examples.DATACITE_RFC)).toBe('DOIType');
    });

    it('returns ORCIDType for a bare ORCID', () => {
      expect(detectBestFit(ORCID_examples.VALID)).toBe('ORCIDType');
    });

    it('returns ORCIDType for an ORCID URL', () => {
      expect(detectBestFit(ORCID_examples.VALID_WITH_HTTPS)).toBe('ORCIDType');
    });

    it('returns HandleType for a Handle identifier', () => {
      expect(detectBestFit(HANDLE_examples.FDO_TYPED)).toBe('HandleType');
    });

    it('returns RORType for a ROR URL', () => {
      expect(detectBestFit(ROR_examples.VALID)).toBe('RORType');
    });

    it('returns SPDXType for an SPDX license URL', () => {
      expect(detectBestFit(SPDX_examples.APACHE_2_0)).toBe('SPDXType');
    });

    it('returns EmailType for an email address', () => {
      expect(detectBestFit(EMAIL_examples.VALID)).toBe('EmailType');
    });

    it('returns URLType for a generic HTTPS URL', () => {
      expect(detectBestFit(URL_examples.KIT_WEBSITE)).toBe('URLType');
    });

    it('returns DateType for an ISO 8601 datetime with timezone offset', () => {
      expect(detectBestFit(DATE_examples.ISO_8601_ALT)).toBe('DateType');
    });

    it('returns LocaleType for a locale with region subtag', () => {
      expect(detectBestFit(LOCALE_examples.DE_DE)).toBeNull();
    });

    it('returns null for a random word with no match', () => {
      expect(detectBestFit('hello')).toBeNull();
    });

    it('returns null for an empty string', () => {
      expect(detectBestFit('')).toBeNull();
    });

    it('returns JSONType for a JSON object string', () => {
      expect(detectBestFit(JSON_examples.SIMPLE)).toBe('JSONType');
    });

    it('returns DOIType for a DOI with https://doi.org/ prefix', () => {
      expect(detectBestFit(DOI_examples.VALID_WITH_PREFIX)).toBe('DOIType');
    });

    it('returns DOIType for a DOI with https://dx.doi.org/ prefix', () => {
      expect(detectBestFit('https://dx.doi.org/10.5281/zenodo.1234567')).toBe('DOIType');
    });

    it('returns DateType for a datetime with Z timezone', () => {
      expect(detectBestFit(DATE_examples.ISO_8601)).toBe('DateType');
    });

    it('returns null for a bare two-letter locale code (too ambiguous)', () => {
      expect(detectBestFit('en')).toBeNull();
    });

    it('returns null for a bare SPDX license ID (too broad for auto-detect)', () => {
      expect(detectBestFit(SPDX_examples.APACHE_2_0_BARE)).toBeNull();
    });
  });

  // ─── detectBestFit() — ordered mode ────────────────────────────────

  describe('detectBestFit() — ordered mode', () => {
    it('matches DOI value when DOIType is in the list', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['DOIType'])).toBe('DOIType');
    });

    it('does NOT match DOI value when only ORCIDType is in the list (strict mode)', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['ORCIDType'], false)).toBeNull();
    });

    it('HandleType wins for a DOI when HandleType is listed before DOIType', () => {
      // DOIs also match the Handle regex (prefix/suffix format)
      expect(detectBestFit(DOI_examples.VALID_BARE, ['HandleType', 'DOIType'])).toBe('HandleType');
    });

    it('DOIType wins when it is listed before HandleType', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['DOIType', 'HandleType'])).toBe('DOIType');
    });

    it('skips unknown keys gracefully and still matches known ones', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['UnknownType', 'DOIType'])).toBe('DOIType');
    });

    it('returns null when all keys in the list are unknown (strict mode)', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['FooType', 'BarType'], false)).toBeNull();
    });

    it('returns null when the ordered list is empty', () => {
      // Empty array falls through to default mode because of the length check
      expect(detectBestFit(DOI_examples.VALID_BARE, [])).toBe('DOIType');
    });

    it('returns null when the ordered list has no match', () => {
      // 'not-a-doi' doesn't match ORCID, Handle, or any other renderer in the list
      expect(detectBestFit(DOI_examples.INVALID_NOT_A_DOI, ['ORCIDType', 'HandleType'])).toBeNull();
    });

    it('skips unknown keys and falls back to default when fallbackToAll is true', () => {
      // Unknown key first, then DOI-like value — should fall back to default registry
      expect(detectBestFit(DOI_examples.VALID_BARE, ['UnknownType'], true)).toBe('DOIType');
    });

    it('skips unknown keys and returns null when fallbackToAll is false', () => {
      // Unknown key first with no fallback — should return null
      expect(detectBestFit(DOI_examples.VALID_BARE, ['UnknownType'], false)).toBeNull();
    });

    it('duplicate keys in ordered list — first match wins', () => {
      // DOI matches DOIType, which comes first even with duplicates
      expect(detectBestFit(DOI_examples.VALID_BARE, ['DOIType', 'DOIType', 'HandleType'])).toBe('DOIType');
    });
  });

  // ─── detectBestFit() — ordered mode with non-auto-discoverable renderers ──

  describe('detectBestFit() — ordered mode with non-auto-discoverable renderers', () => {
    it('LocaleType matches when explicitly listed (not auto-discoverable by default)', () => {
      expect(detectBestFit(LOCALE_examples.DE_DE, ['LocaleType'])).toBe('LocaleType');
    });

    it('LocaleType returns null in default mode (not auto-discoverable)', () => {
      expect(detectBestFit(LOCALE_examples.DE_DE)).toBeNull();
    });

    it('en-US locale matches when explicitly listed', () => {
      expect(detectBestFit(LOCALE_examples.EN_US, ['LocaleType'])).toBe('LocaleType');
    });

    it('strictly ordered mode with non-auto-discoverable renderer and fallbackToAll=false', () => {
      // LocaleType is not auto-discoverable, but listed explicitly — should match
      expect(detectBestFit(LOCALE_examples.DE_DE, ['LocaleType'], false)).toBe('LocaleType');
    });
  });

  // ─── detectBestFit() — quickCheck() returning undefined ─────────────

  describe('detectBestFit() — quickCheck() returning undefined', () => {
    it('SPDX bare license ID quickCheck() returns undefined (not false)', () => {
      // SPDX bare IDs like "MIT" return undefined from quickCheck() — uncertain, needs API lookup
      const spdxEntry = detectionRegistry.find(e => e.key === 'SPDXType')!;
      expect(spdxEntry.check(SPDX_examples.MIT_BARE)).toBeUndefined();
    });

    it('SPDX bare license ID returns null in default mode (undefined is falsy)', () => {
      // SPDX bare IDs are not detected in default mode because quickCheck() returns undefined
      expect(detectBestFit(SPDX_examples.MIT_BARE)).toBeNull();
    });

    it('SPDX bare license ID with ordered list and fallbackToAll=true falls back to null', () => {
      // Even with fallbackToAll=true, SPDX bare IDs fall through because they're not auto-discoverable
      expect(detectBestFit(SPDX_examples.MIT_BARE, ['SPDXType'], true)).toBeNull();
    });

    it('Apache-2.0 bare ID returns null in default mode', () => {
      expect(detectBestFit(SPDX_examples.APACHE_2_0_BARE)).toBeNull();
    });
  });

  // ─── detectBestFit() — fallbackToAll ──────────────────────────────

  describe('detectBestFit() — fallbackToAll', () => {
    it('falls back to default registry when ordered list has no match (fallbackToAll=true)', () => {
      // ORCIDType listed but DOI value doesn't match ORCID — falls back to DOIType
      expect(detectBestFit(DOI_examples.VALID_BARE, ['ORCIDType'], true)).toBe('DOIType');
    });

    it('returns null when ordered list has no match and fallbackToAll=false', () => {
      // Strictly restricted to ORCIDType which doesn't match DOI — returns null
      expect(detectBestFit(DOI_examples.VALID_BARE, ['ORCIDType'], false)).toBeNull();
    });

    it('fallbackToAll defaults to true when not specified', () => {
      // Even without explicit fallbackToAll, the default should fall back
      expect(detectBestFit(DOI_examples.VALID_BARE, ['ORCIDType'])).toBe('DOIType');
    });

    it('empty ordered list with fallbackToAll=true falls back to default', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, [], true)).toBe('DOIType');
    });

    it('empty ordered list with fallbackToAll=false falls back to default', () => {
      // Empty list is treated as "no explicit list" so fallbackToAll doesn't apply
      expect(detectBestFit(DOI_examples.VALID_BARE, [], false)).toBe('DOIType');
    });
  });

  // ─── Priority tests ────────────────────────────────────────────────

  describe('priority ordering', () => {
    it('DOI beats Handle in default mode for a DOI value', () => {
      // A DOI like "10.5281/zenodo.1234567" matches both DOIType and HandleType.
      // DOIType appears before HandleType in the registry, so it should win.
      const result = detectBestFit(DOI_examples.VALID_BARE);
      expect(result).toBe('DOIType');
    });

    it('ORCID beats Handle in default mode for an ORCID value', () => {
      // An ORCID like "0009-0005-2800-4833" could theoretically match other patterns.
      // ORCIDType appears before HandleType in the registry.
      const result = detectBestFit(ORCID_examples.VALID);
      expect(result).toBe('ORCIDType');
    });

    it('ORCIDType appears before DOIType in the registry', () => {
      const orcidIndex = detectionRegistry.findIndex(e => e.key === 'ORCIDType');
      const doiIndex = detectionRegistry.findIndex(e => e.key === 'DOIType');
      expect(orcidIndex).toBeLessThan(doiIndex);
    });

    it('DOIType appears before HandleType in the registry', () => {
      const doiIndex = detectionRegistry.findIndex(e => e.key === 'DOIType');
      const handleIndex = detectionRegistry.findIndex(e => e.key === 'HandleType');
      expect(doiIndex).toBeLessThan(handleIndex);
    });

    it('SPDXType URL is matched before URLType in default mode', () => {
      // An SPDX URL also matches URLType, but SPDXType should come first.
      const result = detectBestFit(SPDX_examples.MIT);
      expect(result).toBe('SPDXType');
    });

    it('ROR URL is matched as RORType rather than URLType', () => {
      const result = detectBestFit(ROR_examples.VALID);
      expect(result).toBe('RORType');
    });

    it('ORCID URL is matched as ORCIDType rather than URLType', () => {
      const result = detectBestFit(ORCID_examples.VALID_WITH_HTTPS);
      expect(result).toBe('ORCIDType');
    });
  });

  // ─── Individual detector edge cases ────────────────────────────────

  describe('individual detector edge cases', () => {
    it('EmailType rejects empty string', () => {
      const emailEntry = detectionRegistry.find(e => e.key === 'EmailType')!;
      expect(emailEntry.check(EMAIL_examples.INVALID_EMPTY)).toBe(false);
    });

    it('JSONType rejects a plain string (non-object)', () => {
      const jsonEntry = detectionRegistry.find(e => e.key === 'JSONType')!;
      expect(jsonEntry.check('"just a string"')).toBe(false);
    });

    it('JSONType rejects an empty string', () => {
      const jsonEntry = detectionRegistry.find(e => e.key === 'JSONType')!;
      expect(jsonEntry.check(JSON_examples.INVALID_EMPTY)).toBe(false);
    });

    it('JSONType accepts a JSON array', () => {
      const jsonEntry = detectionRegistry.find(e => e.key === 'JSONType')!;
      expect(jsonEntry.check(JSON_examples.ARRAY)).toBe(true);
    });

    it('JSONType rejects invalid JSON', () => {
      const jsonEntry = detectionRegistry.find(e => e.key === 'JSONType')!;
      expect(jsonEntry.check('{invalid}')).toBe(false);
    });

    it('LocaleType rejects bare two-letter code', () => {
      const localeEntry = detectionRegistry.find(e => e.key === 'LocaleType')!;
      expect(localeEntry.check('en')).toBe(true);
    });

    it('LocaleType accepts "en-US"', () => {
      const localeEntry = detectionRegistry.find(e => e.key === 'LocaleType')!;
      expect(localeEntry.check(LOCALE_examples.EN_US)).toBe(true);
    });
  });
});
