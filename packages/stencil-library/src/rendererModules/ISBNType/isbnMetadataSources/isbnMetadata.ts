/**
 * Shared types and helpers for the ISBN book metadata providers.
 */

import type { BookAuthor } from './authors';

export interface ISBNMetadata {
  title?: string;
  subtitle?: string;
  authors?: BookAuthor[];
  publishers?: string[];
  publishDate?: string;
  pages?: number;
  description?: string;
  coverUrl?: string;
  sourceUrl?: string;
  language?: string;
  subjects?: string[];
}

/**
 * Input for a book metadata lookup.
 * - `isbn`: normalized ISBN (digits only, uppercase X allowed).
 * - `hyphenated`: the original hyphenated form of the identifier, when
 *   available. Some sources (notably Wikidata) store ISBNs in their
 *   hyphenated form and cannot be queried with plain digits.
 */
export interface ISBNLookup {
  isbn: string;
  hyphenated?: string;
}

export interface ISBNSourceProvider {
  readonly name: string;
  /** Label for the action that opens this ISBN in the source's UI. */
  readonly actionLabel: string;
  /** URL that opens the given ISBN in the source's catalog/UI. */
  isbnUrl(isbn: string): string;
  fetch(lookup: ISBNLookup): Promise<Partial<ISBNMetadata> | null>;
}

export interface ISBNSourceResult {
  name: string;
  /** Label for the action that opens this ISBN in the source's UI. */
  actionLabel: string;
  /** URL that opens this ISBN in the source (deep link if known, ISBN-based otherwise). */
  actionUrl: string;
  url?: string;
  metadata: Partial<ISBNMetadata>;
}

export interface AggregatedISBNMetadata {
  merged: ISBNMetadata;
  sources: ISBNSourceResult[];
}

const FETCH_TIMEOUT_MS = 5000;

export async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function toHttps(url: string): string {
  return url.replace(/^http:\/\//i, 'https://');
}

export function hasAnyField(metadata: Partial<ISBNMetadata>): boolean {
  return Boolean(
    metadata.title ||
    metadata.subtitle ||
    (metadata.authors && metadata.authors.length > 0) ||
    (metadata.publishers && metadata.publishers.length > 0) ||
    metadata.publishDate ||
    metadata.description ||
    metadata.coverUrl,
  );
}

export function hyphenateForSearch(isbn: string): string {
  if (isbn.length === 13) {
    return `${isbn.slice(0, 3)}-${isbn.slice(3)}`;
  }
  return isbn;
}

export function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
