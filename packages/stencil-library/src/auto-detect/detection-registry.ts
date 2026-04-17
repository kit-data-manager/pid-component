/**
 * Self-contained PID detection registry.
 *
 * Contains the format-checking logic for all renderer types, extracted
 * as pure functions with NO dependencies on @stencil/core or any
 * renderer class. This allows auto-detection to work in any JavaScript
 * environment (main thread, Web Worker, Storybook, etc.).
 *
 * IMPORTANT: These patterns MUST be kept in sync with the corresponding
 * hasCorrectFormatQuick() methods in each renderer class. They are
 * intentionally duplicated here to break the transitive dependency on
 * @stencil/core that importing the renderer classes would create.
 */

export interface DetectionEntry {
  key: string;
  check: (value: string) => boolean;
}

/**
 * Ordered list of all detection entries, from highest to lowest priority.
 * FallbackType is excluded — auto-detection should not match everything.
 */
export const detectionRegistry: DetectionEntry[] = [
  {
    key: 'DateType',
    check: (value: string) => {
      return new RegExp(
        '^([0-9]{4})-([0]?[1-9]|1[0-2])-([0-2][0-9]|3[0-1])(T([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9](.[0-9]*)?(Z|([+|-]([0-1][0-9]|2[0-3]):[0-5][0-9])){1}))$',
      ).test(value);
    },
  },
  {
    key: 'ORCIDType',
    check: (value: string) => {
      return new RegExp('^(https://orcid.org/)?[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$').test(value);
    },
  },
  {
    key: 'DOIType',
    check: (value: string) => {
      const cleaned = value
        .replace(/^https?:\/\/doi\.org\//i, '')
        .replace(/^https?:\/\/dx\.doi\.org\//i, '')
        .replace(/^doi:/i, '');
      return /^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/.test(cleaned);
    },
  },
  {
    key: 'HandleType',
    check: (value: string) => {
      return new RegExp('^([0-9A-Za-z])+.([0-9A-Za-z])+/([!-~])+$').test(value);
    },
  },
  {
    key: 'RORType',
    check: (value: string) => {
      return new RegExp('^https?://ror.org/[0-9a-z]{9}$', 'i').test(value);
    },
  },
  {
    key: 'SPDXType',
    check: (value: string) => {
      // For auto-detection, only match the full SPDX URL form.
      // The bare license ID regex (e.g. /^[\w.\-+]+$/) is far too broad
      // and would match virtually every word on a page.
      return new RegExp('^https?://spdx.org/licenses/[\\w.\\-+]+/?$', 'i').test(value);
    },
  },
  {
    key: 'EmailType',
    check: (value: string) => {
      if (value.length === 0) return false;
      const regex = /^(([\w\-.]+@([\w-]+\.)+[\w-]{2,})(\s*,\s*)?)+$/gm;
      regex.lastIndex = 0;
      return regex.test(value);
    },
  },
  {
    key: 'URLType',
    check: (value: string) => {
      return new RegExp('^http(s)?:(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$').test(value);
    },
  },
  {
    key: 'LocaleType',
    check: (value: string) => {
      // For auto-detection, only match locale codes with a region subtag
      // (e.g. "en-US", "de-DE"). Bare two-letter codes like "en", "is", "to"
      // are far too ambiguous and would match common English words.
      return /^[a-zA-Z]{2}-[A-Z]{2}$/.test(value);
    },
  },
  {
    key: 'JSONType',
    check: (value: string) => {
      try {
        if (typeof value !== 'string') return false;
        const trimmed = value.trim();
        if (trimmed === '') return false;
        const parsed = JSON.parse(trimmed);
        return typeof parsed === 'object' && parsed !== null;
      } catch {
        return false;
      }
    },
  },
];

/**
 * Find the best-fit renderer key for a value using the detection registry.
 *
 * @param value The string to check
 * @param orderedRendererKeys Optional ordered list of renderer keys to try.
 *        If set, only these renderers are checked, in this order. First match wins.
 * @returns The renderer key of the best-fit, or null if nothing matches.
 */
export function detectBestFit(value: string, orderedRendererKeys?: string[]): string | null {
  if (orderedRendererKeys && orderedRendererKeys.length > 0) {
    // Ordered mode: try in specified order, first match wins
    for (const key of orderedRendererKeys) {
      const entry = detectionRegistry.find(e => e.key === key);
      if (entry && entry.check(value)) {
        return entry.key;
      }
    }
    return null;
  }

  // Default mode: iterate in priority order (first match = highest priority)
  for (const entry of detectionRegistry) {
    if (entry.check(value)) {
      return entry.key;
    }
  }
  return null;
}
