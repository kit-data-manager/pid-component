import { GenericIdentifierType } from './GenericIdentifierType';
import { renderers } from './utils';

/**
 * Resolves the effective renderer list based on an optional ordered list of renderer keys.
 * If orderedRendererKeys is provided, returns only the matching renderers in the specified order.
 * Otherwise, returns the full default registry.
 */
function getEffectiveRenderers(orderedRendererKeys?: string[]) {
  if (!orderedRendererKeys || orderedRendererKeys.length === 0) {
    return renderers;
  }

  const result: typeof renderers = [];
  for (const key of orderedRendererKeys) {
    const found = renderers.find(r => r.key === key);
    if (found) {
      result.push(found);
    } else {
      console.warn(`Parser: Unknown renderer key "${key}" in ordered renderer list, skipping.`);
    }
  }
  return result;
}

/**
 * Class that handles the parsing of a given value and returns the best fitting component object
 */
export class Parser {
  /**
   * Returns the priority of the best fitting component object for a given value (lower is better).
   * Uses the quick synchronous check when available, falling back to async.
   * @param value String value to parse and evaluate
   * @returns {number} The priority of the best fitting component object for a given value (lower is better)
   */
  static async getEstimatedPriority(value: string): Promise<number> {
    let priority = 0;
    for (let i = 0; i < renderers.length; i++) {
      const obj = new renderers[i].constructor(value);
      const quick = obj.hasCorrectFormatQuick();
      const matches = quick !== undefined ? quick : await obj.hasCorrectFormat();
      if (matches) {
        priority = i;
        break;
      }
    }
    return priority;
  }

  /**
   * Synchronous best-fit detection using only hasCorrectFormatQuick().
   * No network I/O, no init() call. Used by the auto-detection Web Worker.
   * Returns the renderer key of the best-fit renderer, or null if only
   * FallbackType matches (or nothing matches when orderedRendererKeys is set).
   * @param value String value to evaluate
   * @param orderedRendererKeys Optional ordered list of renderer keys to restrict detection
   * @returns {string | null} The key of the best-fit renderer, or null
   */
  static getBestFitQuick(value: string, orderedRendererKeys?: string[]): string | null {
    const effective = getEffectiveRenderers(orderedRendererKeys);

    // When an ordered list is specified, try renderers in that order; first match wins
    if (orderedRendererKeys && orderedRendererKeys.length > 0) {
      for (const entry of effective) {
        const obj = new entry.constructor(value);
        const quick = obj.hasCorrectFormatQuick();
        if (quick === true) {
          return entry.key;
        }
        // If quick is undefined (no cheap check available), we can't determine — skip
      }
      return null;
    }

    // Default mode: iterate all renderers, highest priority (lowest index) that matches wins
    // Iterate backwards so the last overwrite is the highest-priority match
    let bestKey: string | null = null;
    for (let i = effective.length - 1; i >= 0; i--) {
      const entry = effective[i];
      const obj = new entry.constructor(value);
      const quick = obj.hasCorrectFormatQuick();
      if (quick === true && entry.key !== 'FallbackType') {
        bestKey = entry.key;
      }
    }
    return bestKey;
  }

  /**
   * Returns the best fitting component object for a given value.
   * Uses a tiered approach: first runs cheap synchronous checks to narrow candidates,
   * then runs expensive async checks only on uncertain candidates.
   *
   * @param value String value to parse and evaluate
   * @param settings Settings of the environment from which the settings for the component are extracted
   * @param orderedRendererKeys Optional ordered list of renderer keys to try first (non-binding
   *        preselection). These renderers are tried in order; if one matches, it is used. If none
   *        match, falls back to the full default registry (unless fallbackToAll is false).
   * @param fallbackToAll If true (default) and orderedRendererKeys is set but no listed renderer
   *        matches, falls back to the full default registry. If false, returns null when no listed
   *        renderer matches.
   * @returns {Promise<GenericIdentifierType | null>} The best fitting component object, or null if no match
   */
  static async getBestFit(
    value: string,
    settings: {
      type: string;
      values: {
        name: string;
        value: unknown;
      }[];
    }[],
    orderedRendererKeys?: string[],
    fallbackToAll: boolean = true,
  ): Promise<GenericIdentifierType | null> {
    const effective = getEffectiveRenderers(orderedRendererKeys);
    const hasOrderedList = orderedRendererKeys && orderedRendererKeys.length > 0;

    // Collect all format-matching candidates in priority order
    const matchedCandidates: GenericIdentifierType[] = [];

    if (hasOrderedList) {
      // Ordered list mode: try renderers in the specified order; first match wins
      for (const entry of effective) {
        const obj = new entry.constructor(value);

        // Try cheap check first
        const quick = obj.hasCorrectFormatQuick();
        if (quick === false) {
          continue;
        }

        // If quick is true or undefined (needs async verification), run full check
        if (quick === true || (await obj.hasCorrectFormat())) {
          matchedCandidates.push(obj);
          break;
        }
      }

      // If no match and fallbackToAll, retry with full registry
      if (matchedCandidates.length === 0 && fallbackToAll) {
        return Parser.getBestFit(value, settings);
      }
    } else {
      // Default mode: tiered detection across all renderers

      // Phase 1: Quick pass — categorize each renderer as confirmed, rejected, or uncertain
      const confirmed: { index: number; obj: GenericIdentifierType }[] = [];
      const uncertain: { index: number; obj: GenericIdentifierType }[] = [];

      for (let i = 0; i < effective.length; i++) {
        const obj = new effective[i].constructor(value);
        const quick = obj.hasCorrectFormatQuick();
        if (quick === true) {
          confirmed.push({ index: i, obj });
        } else if (quick === undefined) {
          uncertain.push({ index: i, obj });
        }
        // quick === false → rejected, skip
      }

      // Phase 2: Async pass — only for uncertain candidates
      for (const candidate of uncertain) {
        if (await candidate.obj.hasCorrectFormat()) {
          confirmed.push(candidate);
        }
      }

      // Phase 3: Sort by priority (lowest index = highest priority)
      if (confirmed.length > 0) {
        confirmed.sort((a, b) => a.index - b.index);
        for (const c of confirmed) {
          matchedCandidates.push(c.obj);
        }
      }
    }

    if (matchedCandidates.length === 0) {
      return null;
    }

    // Try each candidate in priority order. Initialize it; if init() throws,
    // fall back to the next candidate.
    for (const candidate of matchedCandidates) {
      // Apply settings for this renderer type
      try {
        const settingsKey = candidate.getSettingsKey();
        const settingsValues = settings.find(v => v.type === settingsKey)?.values;
        if (settingsValues) candidate.settings = settingsValues;
      } catch (e) {
        console.warn('Error while adding settings to object:', e);
      }

      // Initialize the renderer
      try {
        await candidate.init();
        return candidate;
      } catch (e) {
        console.warn(`Renderer ${candidate.getSettingsKey()} init() threw for "${value}", trying next candidate:`, e);
        continue;
      }
    }

    // No candidate initialized successfully — return the first match
    // (it will render with whatever fallback/error content it has)
    return matchedCandidates[0];
  }
}
