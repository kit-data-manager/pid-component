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
   * Uses the quick synchronous check.
   * @param value String value to parse and evaluate
   * @returns {number} The priority of the best fitting component object for a given value (lower is better)
   */
  static async getEstimatedPriority(value: string): Promise<number> {
    for (let i = 0; i < renderers.length; i++) {
      const obj = new renderers[i].constructor(value);
      const quickResult = obj.quickCheck();
      if (quickResult === true) {
        return i;
      }
      if (quickResult === undefined) {
        const hasMeaningful = await obj.hasMeaningfulInformation();
        if (hasMeaningful) {
          return i;
        }
      }
    }
    return 0;
  }

  /**
   * Synchronous best-fit detection using only quickCheck().
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
        if (obj.quickCheck()) {
          return entry.key;
        }
      }
      return null;
    }

    // Default mode: iterate all renderers, highest priority (lowest index) that matches wins
    // Iterate backwards so the last overwrite is the highest-priority match
    let bestKey: string | null = null;
    for (let i = effective.length - 1; i >= 0; i--) {
      const entry = effective[i];
      const obj = new entry.constructor(value);
      if (obj.quickCheck() && entry.key !== 'FallbackType') {
        bestKey = entry.key;
      }
    }
    return bestKey;
  }

  /**
   * Returns the best fitting component object for a given value.
   * Uses parallel resolution with relevance ranking to select the best candidate.
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

    if (hasOrderedList) {
      // Ordered list mode: try renderers in the specified order; first match wins
      for (const entry of effective) {
        const obj = new entry.constructor(value);
        const quickResult = obj.quickCheck();

        if (quickResult === true) {
          // Quick check passed - apply settings and init
          try {
            const settingsKey = obj.getSettingsKey();
            const settingsValues = settings.find(v => v.type === settingsKey)?.values;
            if (settingsValues) obj.settings = settingsValues;
          } catch (e) {
            console.warn('Error while adding settings to object:', e);
          }

          await obj.init();
          return obj;
        }

        if (quickResult === undefined || quickResult === false) {
          // Quick check returned undefined (uncertain) or false - try hasMeaningfulInformation for explicit selection
          if (await obj.hasMeaningfulInformation()) {
            try {
              const settingsKey = obj.getSettingsKey();
              const settingsValues = settings.find(v => v.type === settingsKey)?.values;
              if (settingsValues) obj.settings = settingsValues;
            } catch (e) {
              console.warn('Error while adding settings to object:', e);
            }

            await obj.init();
            return obj;
          }
        }
      }

      // If no match and fallbackToAll, retry with full registry
      if (fallbackToAll) {
        return Parser.getBestFit(value, settings, undefined, false);
      }
      return null;
    }

    // Default mode: gather all quick-check passing candidates and resolve in parallel
    const candidates: { index: number; obj: GenericIdentifierType; uncertain?: boolean }[] = [];

    for (let i = 0; i < effective.length; i++) {
      const obj = new effective[i].constructor(value);
      const quickResult = obj.quickCheck();
      if (quickResult === true || quickResult === undefined) {
        candidates.push({ index: i, obj, uncertain: quickResult === undefined });
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Resolve all candidates in parallel
    const results = await Promise.all(
      candidates.map(async ({ index, obj }) => {
        const meaningful = await obj.hasMeaningfulInformation();
        const relevance = this.calculateRelevance(obj, index);
        return { obj, meaningful, relevance, index };
      }),
    );

    // Filter to only those with meaningful information
    const validResults = results.filter(r => r.meaningful);

    if (validResults.length === 0) {
      return null;
    }

    // Sort by relevance (higher is better) - already prioritized by quickCheck order
    validResults.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return a.index - b.index; // Tiebreaker: lower index = higher priority
    });

    const best = validResults[0].obj;

    // Apply settings for the best renderer type
    try {
      const settingsKey = best.getSettingsKey();
      const settingsValues = settings.find(v => v.type === settingsKey)?.values;
      if (settingsValues) best.settings = settingsValues;
    } catch (e) {
      console.warn('Error while adding settings to object:', e);
    }

    await best.init();
    return best;
  }

  /**
   * Calculates the relevance score for a renderer based on priority and available information.
   * Higher score = more relevant.
   * @param obj The renderer instance
   * @param index The priority index (lower is better, inverted to higher score)
   * @returns {number} The relevance score
   */
  private static calculateRelevance(obj: GenericIdentifierType, index: number): number {
    const priorityWeight = 1000;
    const itemWeight = 1;
    const actionWeight = 1;

    const priorityScore = (renderers.length - index) * priorityWeight;
    const itemScore = obj.items.length * itemWeight;
    const actionScore = obj.actions.length * actionWeight;

    return priorityScore + itemScore + actionScore;
  }
}
