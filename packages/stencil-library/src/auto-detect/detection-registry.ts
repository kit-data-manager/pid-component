import { renderers } from '../utils/utils';

export interface DetectionEntry {
  key: string;
  check: (value: string) => boolean;
  /** Whether this renderer participates in auto-detection when no explicit renderer list is given. */
  autoDiscoverableByDefault: boolean;
}

function buildDetectionRegistry(): DetectionEntry[] {
  return renderers
    .filter(r => r.key !== 'FallbackType')
    .map(renderer => ({
      key: renderer.key,
      autoDiscoverableByDefault: renderer.autoDiscoverableByDefault,
      check: (value: string) => {
        const instance = new renderer.constructor(value);
        return instance.quickCheck();
      },
    }))
    .sort((a, b) => {
      const aPriority = renderers.find(r => r.key === a.key)?.priority ?? 99;
      const bPriority = renderers.find(r => r.key === b.key)?.priority ?? 99;
      return aPriority - bPriority;
    });
}

let _detectionRegistry: DetectionEntry[] | undefined;

function getDetectionRegistry(): DetectionEntry[] {
  if (!_detectionRegistry) {
    _detectionRegistry = buildDetectionRegistry();
  }
  return _detectionRegistry;
}

export const detectionRegistry: DetectionEntry[] = [];

getDetectionRegistry().forEach(entry => detectionRegistry.push(entry));

/**
 * Characters to strip from the leading edge of a token during auto-detection.
 * These are common surrounding punctuation that may be adjacent to a PID in
 * running text (e.g., `"10.5281/foo"`, `(0009-0005-2800-4833)`, `DOI:10.5281/foo`).
 */
const LEADING_STRIP = /^[\s.,;:!?\-–—"'`´''""«»()[\]{}<>*/\\#@^~|]+/;

/**
 * Characters to strip from the trailing edge of a token during auto-detection.
 */
const TRAILING_STRIP = /[\s.,;:!?\-–—"'`´''""«»()[\]{}<>*/\\#@^~|]+$/;

/**
 * Sanitize a token by stripping common leading/trailing punctuation.
 * Returns the sanitized value and the character offsets stripped from each side,
 * so the caller can adjust match positions to point at only the cleaned portion.
 *
 * @param token The raw token from the text
 * @returns { sanitized, leadingStripped } where leadingStripped is the number
 *          of characters removed from the front.
 */
export function sanitizeToken(token: string): { sanitized: string; leadingStripped: number } {
  const leadingMatch = LEADING_STRIP.exec(token);
  const leadingStripped = leadingMatch ? leadingMatch[0].length : 0;
  let sanitized = token.substring(leadingStripped);

  const trailingMatch = TRAILING_STRIP.exec(sanitized);
  if (trailingMatch) {
    sanitized = sanitized.substring(0, sanitized.length - trailingMatch[0].length);
  }

  return { sanitized, leadingStripped };
}

/**
 * Find the best-fit renderer key for a value using the detection registry.
 *
 * @param value The string to check
 * @param orderedRendererKeys Optional ordered list of renderer keys to try.
 *        If set, only these renderers are checked, in this order. First match wins.
 *        If not set, only renderers with `autoDiscoverableByDefault: true` are tried.
 * @param fallbackToAll When orderedRendererKeys is set but no listed renderer matches,
 *        falls back to the full default registry if true (default: true).
 * @returns The renderer key of the best-fit, or null if nothing matches.
 */
export function detectBestFit(
  value: string,
  orderedRendererKeys?: string[],
  fallbackToAll: boolean = true,
): string | null {
  const registry = getDetectionRegistry();
  if (orderedRendererKeys && orderedRendererKeys.length > 0) {
    for (const key of orderedRendererKeys) {
      const entry = registry.find(e => e.key === key);
      if (entry && entry.check(value)) {
        return entry.key; // First match wins
      }
    }
    if (!fallbackToAll) { // If fallbackToAll is false, return null if no match is found
      return null;
    }
  }

  // No explicit list (or fallback mode): only try renderers that are auto-discoverable by default
  for (const entry of registry) {
    if (entry.autoDiscoverableByDefault && entry.check(value)) {
      return entry.key;
    }
  }
  return null; // No match found
}
