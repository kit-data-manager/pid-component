import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DOI } from '../../../rendererModules/DOI/DOI';

describe('DOI', () => {
  describe('isDOI()', () => {
    it('returns true for a bare DOI string', () => {
      expect(DOI.isDOI('10.5281/zenodo.1234567')).toBe(true);
    });

    it('returns true for DOI with https://doi.org/ prefix', () => {
      expect(DOI.isDOI('https://doi.org/10.5281/zenodo.1234567')).toBe(true);
    });

    it('returns true for DOI with doi: prefix', () => {
      expect(DOI.isDOI('doi:10.5281/zenodo.1234567')).toBe(true);
    });

    it('returns true for DOI with dx.doi.org prefix', () => {
      expect(DOI.isDOI('https://dx.doi.org/10.1000/xyz123')).toBe(true);
    });

    it('returns false for non-DOI string', () => {
      expect(DOI.isDOI('not-a-doi')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(DOI.isDOI('')).toBe(false);
    });

    it('returns false for a URL without DOI prefix', () => {
      expect(DOI.isDOI('https://example.com/something')).toBe(false);
    });
  });

  describe('getDOIFromString()', () => {
    it('strips https://doi.org/ prefix', () => {
      const doi = DOI.getDOIFromString('https://doi.org/10.5281/zenodo.1234567');
      expect(doi.doi).toBe('10.5281/zenodo.1234567');
    });

    it('strips doi: prefix', () => {
      const doi = DOI.getDOIFromString('doi:10.5281/zenodo.1234567');
      expect(doi.doi).toBe('10.5281/zenodo.1234567');
    });

    it('keeps bare DOI unchanged', () => {
      const doi = DOI.getDOIFromString('10.5281/zenodo.1234567');
      expect(doi.doi).toBe('10.5281/zenodo.1234567');
    });

    it('throws for invalid DOI', () => {
      expect(() => DOI.getDOIFromString('not-a-doi')).toThrow('Invalid DOI format');
    });
  });

  describe('toURL()', () => {
    it('returns a valid doi.org URL', () => {
      const doi = new DOI('10.5281/zenodo.1234567');
      expect(doi.toURL()).toBe('https://doi.org/10.5281/zenodo.1234567');
    });

    it('strips prefix before building URL', () => {
      const doi = new DOI('https://doi.org/10.5281/zenodo.1234567');
      expect(doi.toURL()).toBe('https://doi.org/10.5281/zenodo.1234567');
    });
  });

  describe('toString()', () => {
    it('returns the cleaned DOI string', () => {
      const doi = new DOI('10.5281/zenodo.1234567');
      expect(doi.toString()).toBe('10.5281/zenodo.1234567');
    });

    it('strips prefix in toString', () => {
      const doi = new DOI('doi:10.5281/zenodo.1234567');
      expect(doi.toString()).toBe('10.5281/zenodo.1234567');
    });
  });

  describe('constructor', () => {
    it('strips trailing dots', () => {
      const doi = new DOI('10.5281/zenodo.1234567.');
      expect(doi.doi).toBe('10.5281/zenodo.1234567');
    });

    it('trims whitespace', () => {
      const doi = new DOI('  10.5281/zenodo.1234567  ');
      expect(doi.doi).toBe('10.5281/zenodo.1234567');
    });
  });

  describe('fromJSON()', () => {
    it('round-trips through toObject / fromJSON', () => {
      const original = new DOI('10.5281/zenodo.1234567');
      const serialized = JSON.stringify(original.toObject());
      const restored = DOI.fromJSON(serialized);
      expect(restored.doi).toBe(original.doi);
    });
  });
});
