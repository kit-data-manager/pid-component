import { describe, it, expect, vi } from 'vitest';
import { sanitizeToken, detectBestFit, detectionRegistry } from '../../auto-detect/detection-registry';
import { DOI_examples } from '../../../../../examples/doi/values';
import { ORCID_examples } from '../../../../../examples/orcid/values';
import { HANDLE_examples } from '../../../../../examples/handle/values';
import { ROR_examples } from '../../../../../examples/ror/values';
import { SPDX_examples } from '../../../../../examples/spdx/values';
import { EMAIL_examples } from '../../../../../examples/email/values';
import { URL_examples } from '../../../../../examples/url/values';
import { DATE_examples } from '../../../../../examples/date/values';
import { LOCALE_examples } from '../../../../../examples/locale/values';
import { JSON_examples } from '../../../../../examples/json/values';

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

    it('does NOT match DOI value when only ORCIDType is in the list', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['ORCIDType'])).toBeNull();
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

    it('returns null when all keys in the list are unknown', () => {
      expect(detectBestFit(DOI_examples.VALID_BARE, ['FooType', 'BarType'])).toBeNull();
    });

    it('returns null when the ordered list is empty', () => {
      // Empty array falls through to default mode because of the length check
      expect(detectBestFit(DOI_examples.VALID_BARE, [])).toBe('DOIType');
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
