/**
 * Typed representation of a book author and helpers for parsing, formatting,
 * deduplication, spelling preference, and deterministic ordering.
 */

export interface BookAuthor {
  /** e.g. "Donald" */
  givenName?: string;
  /** e.g. "Knuth" */
  familyName?: string;
  /**
   * Original name string as reported by a source. Kept for ambiguous/corporate
   * names and to allow comparing spelling detail across sources.
   */
  fullName?: string;
}

const NAME_SEPARATOR = ', ';

/**
 * Parses a full name string into a structured BookAuthor.
 *
 * Handles:
 * - "Given Family"            -> { givenName: 'Given', familyName: 'Family' }
 * - "Family, Given"           -> { givenName: 'Given', familyName: 'Family' }
 * - "Family, Given Middle"    -> { givenName: 'Given Middle', familyName: 'Family' }
 * - single-token / corporate  -> { familyName: <token>, fullName: <input> }
 *
 * Splitting is best-effort; ambiguous input keeps the whole string in
 * `fullName`.
 */
export function parseFullName(name: string): BookAuthor {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { fullName: name };

  if (trimmed.includes(NAME_SEPARATOR)) {
    const [familyRaw, givenRaw] = trimmed.split(NAME_SEPARATOR);
    const familyName = familyRaw.trim();
    const givenName = givenRaw.trim();
    return { givenName: givenName || undefined, familyName: familyName || undefined, fullName: name };
  }

  const parts = trimmed.split(' ');
  if (parts.length === 1) {
    return { familyName: parts[0], fullName: name };
  }
  if (parts.length === 2) {
    return { givenName: parts[0], familyName: parts[1], fullName: name };
  }

  // 3+ tokens without a comma: assume "Given Middle Family" with the last
  // token as the family name. Keep the full string for humans too.
  return { givenName: parts.slice(0, -1).join(' '), familyName: parts[parts.length - 1], fullName: name };
}

/**
 * Identifies two author variants as the same person. Matching is family-name
 * primary; the given names must be compatible when both are present (equal, or
 * one is a prefix/lesser-detail variant of the other, e.g. "Brian W." vs
 * "Brian"). This lets us deduplicate spelling variants of the same person.
 */
export function sameAuthor(a: BookAuthor, b: BookAuthor): boolean {
  if (!a.familyName || !b.familyName) return false;
  if (a.familyName.toLowerCase() !== b.familyName.toLowerCase()) return false;

  const givenA = (a.givenName || '').toLowerCase();
  const givenB = (b.givenName || '').toLowerCase();
  if (!givenA || !givenB) return true; // one side lacks given name -> match by family
  if (givenA === givenB) return true;
  // compatible if one is a (dot-normalized) prefix of the other
  const norm = (s: string) => s.replace(/\./g, '').replace(/\s+/g, ' ');
  const na = norm(givenA);
  const nb = norm(givenB);
  return na.startsWith(nb) || nb.startsWith(na);
}

/**
 * Ranks the amount of name detail so we can prefer the most complete spelling.
 * Higher is "better": full middle name > abbreviated middle initial > no
 * middle name. Given name length is used as a coarse proxy.
 */
function detailScore(author: BookAuthor): number {
  const given = author.givenName || '';
  const tokens = given.split(' ').filter(Boolean);
  if (tokens.length >= 2) return 3; // full (or multiple) middle name(s)
  if (given.length > 0) {
    // A single initial like "W." vs a full given name like "Brian"
    const last = given.split(' ').pop() || '';
    const isInitial = last.length === 1 || (last.length === 2 && last.endsWith('.'));
    return isInitial ? 1 : 2;
  }
  return 0;
}

/**
 * Returns the variant with the most name detail; ties fall back to `head`.
 */
export function preferDetailedAuthor(head: BookAuthor, candidate: BookAuthor): BookAuthor {
  if (detailScore(candidate) > detailScore(head)) return candidate;
  return head;
}

/** Formats an author as "Given Family", falling back to the raw string. */
export function formatAuthor(author: BookAuthor): string {
  if (author.givenName && author.familyName) return `${author.givenName} ${author.familyName}`;
  if (author.familyName) return author.familyName;
  return author.fullName || '';
}

/**
 * Case-insensitive comparison key for deterministic (last-resort) sorting.
 */
function comparisonKey(author: BookAuthor): string {
  return `${author.familyName || ''}\u0000${author.givenName || ''}`.toLowerCase();
}

/**
 * Deterministically sorts authors by family name, then given name.
 * Used as the last-resort ordering rule.
 */
export function sortAuthorsAlphabetically(authors: BookAuthor[]): BookAuthor[] {
  return [...authors].sort((a, b) => (comparisonKey(a) < comparisonKey(b) ? -1 : comparisonKey(a) > comparisonKey(b) ? 1 : 0));
}

/**
 * Ordering authority used to break ties when two sources list the same number
 * of authors (higher = stronger).
 */
const ORDER_AUTHORITY = ['DNB', 'Wikidata', 'Google Books', 'OpenLibrary'];

/**
 * Reduces a pool of author candidates (from various sources) to distinct
 * people, preferring the most detailed spelling, and orders them
 * deterministically using the layered strategy (see plan):
 *   a) Wikidata P50 order, when Wikidata contributed authors;
 *   b) order of the source listing the most authors (ties broken by
 *      high-priority authority ORDER_AUTHORITY);
 *   c) alphabetical as a last resort.
 *
 * @param sourceAuthorLists ordered author list per contributing source.
 */
export function orderAuthors(sourceAuthorLists: Record<string, BookAuthor[]>): BookAuthor[] {
  const all = Object.values(sourceAuthorLists).flat().filter(Boolean);
  if (all.length === 0) return [];

  // Deduplicate to distinct people, keeping the most detailed spelling.
  const distinct: BookAuthor[] = [];
  for (const candidate of all) {
    const existingIdx = distinct.findIndex(existing => sameAuthor(existing, candidate));
    if (existingIdx === -1) {
      distinct.push({ ...candidate });
    } else {
      distinct[existingIdx] = { ...preferDetailedAuthor(distinct[existingIdx], candidate) };
    }
  }

  const sourcesWithAuthors = Object.entries(sourceAuthorLists).filter(([, list]) => list.length > 0);

  // (a) Wikidata order wins when available.
  const wikidataSource = sourcesWithAuthors.find(([name]) => name === 'Wikidata');
  if (wikidataSource) {
    return orderBySource(distinct, wikidataSource[1]);
  }

  if (sourcesWithAuthors.length > 0) {
    // (b) Order by the source listing the most authors; ties -> authority.
    const maxCount = Math.max(...sourcesWithAuthors.map(([, list]) => list.length));
    const maxSources = sourcesWithAuthors.filter(([, list]) => list.length === maxCount);
    const chosen = selectByAuthority(maxSources);
    if (chosen) return orderBySource(distinct, chosen[1]);
  }

  // (c) Alphabetical fallback.
  return sortAuthorsAlphabetically(distinct);
}

function orderBySource(distinct: BookAuthor[], sourceList: BookAuthor[]): BookAuthor[] {
  const ordered: BookAuthor[] = [];
  for (const sourceAuthor of sourceList) {
    const idx = distinct.findIndex(d => sameAuthor(d, sourceAuthor));
    if (idx !== -1) {
      ordered.push(distinct[idx]);
      distinct.splice(idx, 1);
    }
  }
  return [...ordered, ...sortAuthorsAlphabetically(distinct)];
}

function selectByAuthority(candidates: [string, BookAuthor[]][]): [string, BookAuthor[]] | null {
  let best: [string, BookAuthor[]] | null = null;
  for (const candidate of candidates) {
    if (!best) {
      best = candidate;
      continue;
    }
    if (ORDER_AUTHORITY.indexOf(candidate[0]) < ORDER_AUTHORITY.indexOf(best[0])) {
      best = candidate;
    }
  }
  return best;
}
