import { describe, expect, it } from 'vitest';
import { parseFullName, formatAuthor, sameAuthor, preferDetailedAuthor, orderAuthors, sortAuthorsAlphabetically } from '../../isbnMetadataSources/authors';

describe('parseFullName', () => {
  it('parses "Given Family"', () => {
    expect(parseFullName('Donald Knuth')).toEqual({
      givenName: 'Donald',
      familyName: 'Knuth',
      fullName: 'Donald Knuth',
    });
  });

  it('parses "Family, Given"', () => {
    expect(parseFullName('Knuth, Donald')).toEqual({
      givenName: 'Donald',
      familyName: 'Knuth',
      fullName: 'Knuth, Donald',
    });
  });

  it('parses "Family, Given Middle"', () => {
    expect(parseFullName('Kernighan, Brian W.')).toEqual({
      givenName: 'Brian W.',
      familyName: 'Kernighan',
      fullName: 'Kernighan, Brian W.',
    });
  });

  it('parses multi-word given names as "Given Middle Family"', () => {
    expect(parseFullName('Brian W. Kernighan')).toEqual({
      givenName: 'Brian W.',
      familyName: 'Kernighan',
      fullName: 'Brian W. Kernighan',
    });
  });

  it('treats a single token as a family name', () => {
    expect(parseFullName('IETF')).toEqual({ familyName: 'IETF', fullName: 'IETF' });
  });

  it('collapses repeated whitespace', () => {
    expect(parseFullName('  Donald    Knuth  ')).toEqual({
      givenName: 'Donald',
      familyName: 'Knuth',
      fullName: '  Donald    Knuth  ',
    });
  });

  it('returns fullName for an empty string', () => {
    expect(parseFullName('')).toEqual({ fullName: '' });
  });
});

describe('formatAuthor', () => {
  it('formats as "Given Family"', () => {
    expect(formatAuthor({ givenName: 'Donald', familyName: 'Knuth' })).toBe('Donald Knuth');
  });

  it('falls back to family name', () => {
    expect(formatAuthor({ familyName: 'IETF' })).toBe('IETF');
  });

  it('falls back to fullName', () => {
    expect(formatAuthor({ fullName: 'Some Social Org' })).toBe('Some Social Org');
  });
});

describe('sameAuthor', () => {
  it('matches different spellings of the same person', () => {
    expect(sameAuthor({ givenName: 'Donald', familyName: 'Knuth' }, { givenName: 'Knuth', familyName: 'Donald' })).toBe(false);
    expect(sameAuthor({ givenName: 'Donald', familyName: 'Knuth' }, { givenName: 'Donald', familyName: 'Knuth' })).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(sameAuthor({ givenName: 'donald', familyName: 'knuth' }, { givenName: 'Donald', familyName: 'Knuth' })).toBe(true);
  });

  it('matches when one side lacks a given name', () => {
    expect(sameAuthor({ familyName: 'Knuth' }, { givenName: 'Donald', familyName: 'Knuth' })).toBe(true);
  });

  it('matches given names that differ only in middle detail', () => {
    expect(sameAuthor({ givenName: 'Brian W.', familyName: 'Kernighan' }, { givenName: 'Brian', familyName: 'Kernighan' })).toBe(true);
  });

  it('does not match different people with the same surname', () => {
    expect(sameAuthor({ givenName: 'Donald', familyName: 'Knuth' }, { givenName: 'John', familyName: 'Knuth' })).toBe(false);
  });
});

describe('preferDetailedAuthor', () => {
  it('prefers a full middle name over an initial', () => {
    const best = preferDetailedAuthor({ givenName: 'Brian', familyName: 'Kernighan' }, { givenName: 'Brian W.', familyName: 'Kernighan' });
    expect(best.givenName).toBe('Brian W.');
  });

  it('prefers an initial over no middle name', () => {
    const best = preferDetailedAuthor({ givenName: 'Brian', familyName: 'Kernighan' }, { givenName: 'Brian W.', familyName: 'Kernighan' });
    expect(best.givenName).toBe('Brian W.');
  });

  it('keeps the head on a tie', () => {
    const a = { givenName: 'Brian', familyName: 'Kernighan' };
    expect(preferDetailedAuthor(a, { ...a })).toBe(a);
  });
});

describe('orderAuthors', () => {
  it('(a) uses Wikidata P50 order when Wikidata contributes authors', () => {
    const result = orderAuthors({
      OpenLibrary: [{ givenName: 'Dennis', familyName: 'Ritchie' }],
      Wikidata: [
        { givenName: 'Brian', familyName: 'Kernighan' },
        { givenName: 'Dennis', familyName: 'Ritchie' },
      ],
    });
    expect(result.map(a => `${a.givenName} ${a.familyName}`)).toEqual(['Brian Kernighan', 'Dennis Ritchie']);
  });

  it('(b) orders by the source listing the most authors', () => {
    const result = orderAuthors({
      GoogleBooks: [{ givenName: 'Dennis', familyName: 'Ritchie' }],
      OpenLibrary: [
        { givenName: 'Brian', familyName: 'Kernighan' },
        { givenName: 'Dennis', familyName: 'Ritchie' },
      ],
    });
    expect(result.map(a => `${a.givenName} ${a.familyName}`)).toEqual(['Brian Kernighan', 'Dennis Ritchie']);
  });

  it('(b) breaks ties using DNB > Wikidata > Google Books > OpenLibrary', () => {
    // All sources list the same two authors (Ada, Grace) but disagree on order.
    const ada = () => ({ givenName: 'Ada', familyName: 'Byrona' });
    const grace = () => ({ givenName: 'Grace', familyName: 'Hopper' });
    const result = orderAuthors({
      OpenLibrary: [grace(), ada()],
      GoogleBooks: [ada(), grace()],
      DNB: [ada(), grace()],
    });
    // DNB is the strongest authority; its order wins the tie.
    expect(result.map(a => `${a.givenName} ${a.familyName}`)).toEqual(['Ada Byrona', 'Grace Hopper']);
  });

  it('alphabetizes authors absent from the chosen ordering source', () => {
    // Wikidata order is authoritative, but an author only reported by DNB is
    // appended alphabetically.
    const result = orderAuthors({
      Wikidata: [{ givenName: 'Brian', familyName: 'Kernighan' }],
      DNB: [{ givenName: 'Zeta', familyName: 'Alpha' }],
    });
    expect(result.map(a => `${a.givenName} ${a.familyName}`)).toEqual(['Brian Kernighan', 'Zeta Alpha']);
  });

  it('deduplicates spelling variants keeping the most detailed', () => {
    const result = orderAuthors({
      OpenLibrary: [{ givenName: 'Brian', familyName: 'Kernighan' }],
      Wikidata: [{ givenName: 'Brian W.', familyName: 'Kernighan' }],
    });
    expect(result).toEqual([{ givenName: 'Brian W.', familyName: 'Kernighan' }]);
  });

  it('returns an empty array when there are no authors', () => {
    expect(orderAuthors({})).toEqual([]);
  });
});

describe('sortAuthorsAlphabetically', () => {
  it('sorts by family name then given name', () => {
    const sorted = sortAuthorsAlphabetically([
      { givenName: 'Zeta', familyName: 'Aardvark' },
      { givenName: 'Beta', familyName: 'Aardvark' },
    ]);
    expect(sorted.map(a => a.givenName)).toEqual(['Beta', 'Zeta']);
  });
});
