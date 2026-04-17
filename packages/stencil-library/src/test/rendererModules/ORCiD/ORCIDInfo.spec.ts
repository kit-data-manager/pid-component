import { ORCIDInfo } from '../../../rendererModules/ORCiD/ORCIDInfo';

// Mock the cachedFetch dependency to prevent real network calls
jest.mock('../../../utils/DataCache', () => ({
  cachedFetch: jest.fn(),
}));

describe('ORCIDInfo', () => {
  describe('isORCiD()', () => {
    it('returns true for a bare ORCiD', () => {
      expect(ORCIDInfo.isORCiD('0009-0005-2800-4833')).toBe(true);
    });

    it('returns true for ORCiD with https://orcid.org/ prefix', () => {
      expect(ORCIDInfo.isORCiD('https://orcid.org/0009-0005-2800-4833')).toBe(true);
    });

    it('returns true for ORCiD ending with X', () => {
      expect(ORCIDInfo.isORCiD('0000-0002-1825-009X')).toBe(true);
    });

    it('returns false for random text', () => {
      expect(ORCIDInfo.isORCiD('not-an-orcid')).toBe(false);
    });

    it('returns false for too-short numeric segments', () => {
      expect(ORCIDInfo.isORCiD('1234-5678')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(ORCIDInfo.isORCiD('')).toBe(false);
    });
  });

  describe('constructor and getters', () => {
    const info = new ORCIDInfo(
      '0009-0005-2800-4833',
      { raw: 'json' },
      'Doe',
      ['Jane'],
      [],
      'en',
      'A biography',
      [{ email: 'jane@example.com', primary: true, verified: true }],
      [{ content: 'science', index: 0 }],
      [{ url: 'https://example.com', name: 'Website', index: 0 }],
      'US',
    );

    it('returns the orcid', () => {
      expect(info.orcid).toBe('0009-0005-2800-4833');
    });

    it('returns the family name', () => {
      expect(info.familyName).toBe('Doe');
    });

    it('returns the given names', () => {
      expect(info.givenNames).toEqual(['Jane']);
    });

    it('returns the biography', () => {
      expect(info.biography).toBe('A biography');
    });

    it('returns the country', () => {
      expect(info.country).toBe('US');
    });

    it('returns the preferred locale', () => {
      expect(info.preferredLocale).toBe('en');
    });

    it('returns the raw JSON', () => {
      expect(info.ORCiDJSON).toEqual({ raw: 'json' });
    });

    it('returns emails', () => {
      expect(info.emails).toHaveLength(1);
      expect(info.emails[0].email).toBe('jane@example.com');
    });

    it('returns keywords', () => {
      expect(info.keywords).toHaveLength(1);
      expect(info.keywords[0].content).toBe('science');
    });

    it('returns researcher URLs', () => {
      expect(info.researcherUrls).toHaveLength(1);
      expect(info.researcherUrls[0].url).toBe('https://example.com');
    });
  });
});
