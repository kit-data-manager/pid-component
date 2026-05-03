import { describe, it, expect } from 'vitest';
import {
  CitationStyle,
  formatCitationPreview,
  getDefaultCitationStyle,
  getCitationStyleFromSettings,
} from '../CitationStyles';
import { Creator } from '../DataCiteInfo';

describe('CitationStyles', () => {
  const singleCreator: Creator[] = [
    { name: 'Jane Doe', givenName: 'Jane', familyName: 'Doe' },
  ];

  const multipleCreators: Creator[] = [
    { name: 'Jane Doe', givenName: 'Jane', familyName: 'Doe' },
    { name: 'John Smith', givenName: 'John', familyName: 'Smith' },
  ];

  describe('formatCitationPreview()', () => {
    it('formats APA style for single author with year', () => {
      const { citation } = formatCitationPreview(
        'A Great Paper',
        singleCreator,
        '2024',
        CitationStyle.APA,
      );
      expect(citation).toContain('Doe');
      expect(citation).toContain('(2024)');
      expect(citation).toContain('A Great Paper');
      expect(citation).not.toContain('et al.');
    });

    it('formats APA style with et al. for multiple authors', () => {
      const { citation } = formatCitationPreview(
        'A Great Paper',
        multipleCreators,
        '2024',
        CitationStyle.APA,
      );
      expect(citation).toContain('Doe');
      expect(citation).toContain('et al.');
    });

    it('formats IEEE style with initial and quotes', () => {
      const { citation } = formatCitationPreview(
        'A Great Paper',
        singleCreator,
        '2024',
        CitationStyle.IEEE,
      );
      expect(citation).toContain('J.');
      expect(citation).toContain('Doe');
      expect(citation).toContain('"A Great Paper"');
      expect(citation).toContain('2024');
    });

    it('formats Chicago style with quotes around title', () => {
      const { citation } = formatCitationPreview(
        'A Great Paper',
        singleCreator,
        '2024',
        CitationStyle.CHICAGO,
      );
      expect(citation).toContain('Doe');
      expect(citation).toContain('"A Great Paper"');
    });

    it('formats Harvard style with initials', () => {
      const { citation } = formatCitationPreview(
        'A Great Paper',
        singleCreator,
        '2024',
        CitationStyle.HARVARD,
      );
      expect(citation).toContain('Doe');
      expect(citation).toContain('J.');
      expect(citation).toContain('2024');
    });

    it('formats Anglia Ruskin style with uppercase author', () => {
      const { citation } = formatCitationPreview(
        'A Great Paper',
        singleCreator,
        '2024',
        CitationStyle.ANGLIA_RUSKIN,
      );
      expect(citation).toContain('DOE');
    });

    it('returns title when no creators provided', () => {
      const { citation } = formatCitationPreview('My Title', [], '2024', CitationStyle.APA);
      expect(citation).toBe('My Title');
    });

    it('returns "Untitled" when no title and no creators', () => {
      const { citation } = formatCitationPreview('', [], undefined, CitationStyle.APA);
      expect(citation).toBe('Untitled');
    });

    it('provides tooltip that contains the full title', () => {
      const longTitle = 'A'.repeat(100);
      const { tooltip } = formatCitationPreview(longTitle, singleCreator, '2024', CitationStyle.APA);
      expect(tooltip).toContain(longTitle);
    });

    it('truncates long titles in citation but not in tooltip', () => {
      const longTitle = 'A very long title that exceeds sixty characters and should be truncated in the citation preview';
      const { citation, tooltip } = formatCitationPreview(longTitle, singleCreator, '2024', CitationStyle.APA);
      // citation may be truncated (with ...) while tooltip contains the full title
      expect(tooltip).toContain(longTitle);
      expect(citation).not.toBeNull();
    });
  });

  describe('getDefaultCitationStyle()', () => {
    it('returns APA as the default', () => {
      expect(getDefaultCitationStyle()).toBe(CitationStyle.APA);
    });
  });

  describe('getCitationStyleFromSettings()', () => {
    it('returns APA when settings is undefined', () => {
      expect(getCitationStyleFromSettings(undefined)).toBe(CitationStyle.APA);
    });

    it('returns APA when citationStyle setting is missing', () => {
      const settings = [{ name: 'otherSetting', value: 'foo' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.APA);
    });

    it('extracts APA from settings', () => {
      const settings = [{ name: 'citationStyle', value: 'APA' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.APA);
    });

    it('extracts IEEE from settings (case insensitive)', () => {
      const settings = [{ name: 'citationStyle', value: 'ieee' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.IEEE);
    });

    it('extracts CHICAGO from settings', () => {
      const settings = [{ name: 'citationStyle', value: 'Chicago' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.CHICAGO);
    });

    it('extracts HARVARD from settings', () => {
      const settings = [{ name: 'citationStyle', value: 'HARVARD' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.HARVARD);
    });

    it('extracts ANGLIA_RUSKIN from settings', () => {
      const settings = [{ name: 'citationStyle', value: 'ANGLIA_RUSKIN' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.ANGLIA_RUSKIN);
    });

    it('falls back to APA for unknown style', () => {
      const settings = [{ name: 'citationStyle', value: 'MLA' }];
      expect(getCitationStyleFromSettings(settings)).toBe(CitationStyle.APA);
    });
  });
});
