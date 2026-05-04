/**
 * Main entry point for automatic PID detection on webpages.
 *
 * Not all renderers participate in auto-detection by default. Each renderer
 * has an `autoDiscoverableByDefault` flag in the registry (`utils.ts`). When
 * no explicit `renderers` list is provided, only renderers with this flag set
 * to `true` are used. To activate additional renderers (or restrict to a
 * subset), pass them in the `renderers` config option.
 *
 * Usage:
 * ```typescript
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * // Uses only auto-discoverable renderers (DOI, ORCiD, Handle, etc.)
 * const controller = initPidDetection({ root: document.body });
 *
 * // Explicitly activate specific renderers (including non-default ones)
 * const controller = initPidDetection({
 *   root: document.body,
 *   renderers: ['DOIType', 'ORCIDType', 'HandleType', 'EmailType'],
 *   darkMode: 'system',
 *   observe: true,
 * });
 *
 * // Later:
 * controller.stop();     // pause MutationObserver
 * controller.rescan();   // re-scan the DOM
 * controller.destroy();  // tear down everything
 * ```
 */

import type { DetectionMatch, PidDetectionConfig, PidDetectionController, ReplacementRecord } from './types';
import { scanDom } from './DomScanner';
import { replaceMatches, restoreOriginalText } from './TextReplacer';
import { detectBestFit, sanitizeToken } from './detection-registry';

/** Batch size for inserting components via requestIdleCallback */
const INSERT_BATCH_SIZE = 10;

/**
 * Initialize automatic PID detection on a webpage.
 *
 * Scans the DOM for text that matches known PID patterns, then replaces
 * matching text with <pid-component> elements.
 * Original text stays visible until the component has fully loaded.
 *
 * When no `renderers` list is provided, only renderers whose
 * `autoDiscoverableByDefault` flag is `true` in the registry participate.
 * Pass an explicit `renderers` array to activate specific renderers
 * (including those that are not auto-discoverable by default).
 *
 * @param config Configuration options
 * @returns Controller for lifecycle management
 */
export function initPidDetection(config: PidDetectionConfig = {}): PidDetectionController {
  const root = config.root || document.body;
  const orderedRenderers = config.renderers;

  // State
  let observer: MutationObserver | null = null;
  let allRecords: ReplacementRecord[] = [];
  let destroyed = false;

  /**
   * Detect PIDs in text using the renderer registry.
   */
  function detectMatches(text: string): DetectionMatch[] {
    const DELIMITER_REGEX = /[\s,;()[\]{}<>"']+/;
    const matches: DetectionMatch[] = [];

    let remaining = text;
    let offset = 0;

    while (remaining.length > 0) {
      const delimMatch = DELIMITER_REGEX.exec(remaining);

      let token: string;
      let tokenStart: number;

      if (delimMatch === null) {
        token = remaining;
        tokenStart = offset;
        remaining = '';
      } else {
        if (delimMatch.index > 0) {
          token = remaining.substring(0, delimMatch.index);
          tokenStart = offset;
        } else {
          offset += delimMatch[0].length;
          remaining = remaining.substring(delimMatch[0].length);
          continue;
        }
        offset += delimMatch.index + delimMatch[0].length;
        remaining = remaining.substring(delimMatch.index + delimMatch[0].length);
      }

      if (token.length < 2) continue;

      const { sanitized, leadingStripped } = sanitizeToken(token);
      if (sanitized.length < 2) continue;

      const rendererKey = detectBestFit(sanitized, orderedRenderers, config.fallbackToAll ?? true);
      if (rendererKey !== null) {
        matches.push({
          start: tokenStart + leadingStripped,
          end: tokenStart + leadingStripped + sanitized.length,
          value: sanitized,
          rendererKey,
        });
      }
    }

    return matches;
  }

  /**
   * Run a full scan of the DOM tree.
   */
  async function runScan() {
    if (destroyed) return;

    const textNodes = await scanDom(root, config.exclude);

    // Process text nodes in batches
    const batches = chunkArray(textNodes, INSERT_BATCH_SIZE);

    for (const batch of batches) {
      if (destroyed) return;

      await new Promise<void>((resolve) => {
        const requestIdle =
          typeof requestIdleCallback !== 'undefined'
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 0) as unknown as number;

        requestIdle(async () => {
          for (const scannedNode of batch) {
            if (destroyed) break;

            // Check that the text node is still in the DOM
            if (!scannedNode.textNode.parentNode) continue;

            const matches = detectMatches(scannedNode.text);

            if (matches.length > 0) {
              const records = replaceMatches(scannedNode.textNode, matches, config);
              allRecords.push(...records);
            }
          }
          resolve();
        });
      });
    }
  }

  // Set up MutationObserver if requested
  if (config.observe) {
    observer = new MutationObserver((mutations) => {
      if (destroyed) return;

      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            // Skip our own wrapper elements
            if (element.classList?.contains('pid-auto-detect-wrapper')) continue;
            if (element.tagName === 'PID-COMPONENT') continue;

            // Scan the new subtree
            scanDom(element, config.exclude).then(async (textNodes) => {
              for (const scannedNode of textNodes) {
                if (destroyed) break;
                if (!scannedNode.textNode.parentNode) continue;

                const matches = detectMatches(scannedNode.text);
                if (matches.length > 0) {
                  const records = replaceMatches(scannedNode.textNode, matches, config);
                  allRecords.push(...records);
                }
              }
            });
          }
        }
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  }

  // Start the initial scan
  runScan();

  // Return the controller
  return {
    stop() {
      if (observer) {
        observer.disconnect();
      }
    },

    rescan() {
      if (!destroyed) {
        runScan();
      }
    },

    destroy() {
      destroyed = true;

      // Disconnect observer
      if (observer) {
        observer.disconnect();
        observer = null;
      }

      // Restore all original text nodes
      restoreOriginalText(allRecords);
      allRecords = [];
    },
  };
}

/**
 * Split an array into chunks of a given size.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
