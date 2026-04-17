/**
 * Main entry point for automatic PID detection on webpages.
 *
 * Usage:
 * ```typescript
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * const controller = initPidDetection({
 *   root: document.body,
 *   renderers: ['DOIType', 'ORCIDType', 'HandleType'],
 *   settings: [...],
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

import type {
  DetectionMatch,
  PidDetectionConfig,
  PidDetectionController,
  WorkerDetectMessage,
  WorkerResultMessage,
} from './types';
import { scanDom } from './DomScanner';
import { replaceMatches, ReplacementRecord, restoreOriginalText } from './TextReplacer';
import { detectBestFit, sanitizeToken } from './detection-registry';

/** Batch size for inserting components via requestIdleCallback */
const INSERT_BATCH_SIZE = 10;

/**
 * Initialize automatic PID detection on a webpage.
 *
 * Scans the DOM for text that matches known PID patterns, then replaces
 * matching text with <pid-component> elements. Detection runs in a
 * Web Worker for performance; DOM manipulation happens on the main thread.
 * Original text stays visible until the component has fully loaded.
 *
 * @param config Configuration options
 * @returns Controller for lifecycle management
 */
export function initPidDetection(config: PidDetectionConfig = {}): PidDetectionController {
  const root = config.root || document.body;
  const orderedRenderers = config.renderers;

  // State
  let worker: Worker | null = null;
  let observer: MutationObserver | null = null;
  let allRecords: ReplacementRecord[] = [];
  let pendingCallbacks = new Map<number, (matches: DetectionMatch[]) => void>();
  let nextRequestId = 0;
  let destroyed = false;

  // Try to create the Web Worker
  try {
    worker = createWorker();
    if (worker) {
      // Configure the worker with the ordered renderer list
      worker.postMessage({ type: 'init', orderedRenderers });

      // Handle worker responses
      worker.onmessage = (event: MessageEvent<WorkerResultMessage>) => {
        const { id, matches } = event.data;
        const callback = pendingCallbacks.get(id);
        if (callback) {
          pendingCallbacks.delete(id);
          callback(matches);
        }
      };

      worker.onerror = (error) => {
        console.error('PID detection worker error:', error);
        // Fall back to main-thread detection
        worker = null;
      };
    }
  } catch {
    console.warn('Could not create Web Worker for PID detection, falling back to main thread.');
    worker = null;
  }

  /**
   * Send text to the worker for detection, or fall back to main-thread detection.
   */
  function detectText(text: string): Promise<DetectionMatch[]> {
    return new Promise((resolve) => {
      if (worker) {
        const id = nextRequestId++;
        pendingCallbacks.set(id, resolve);
        const message: WorkerDetectMessage = {
          type: 'detect',
          id,
          text,
          orderedRenderers,
        };
        worker.postMessage(message);
      } else {
        // Main-thread fallback using Parser.getBestFitQuick
        resolve(detectOnMainThread(text, orderedRenderers));
      }
    });
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

            const matches = await detectText(scannedNode.text);

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

                const matches = await detectText(scannedNode.text);
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

      // Terminate worker
      if (worker) {
        worker.terminate();
        worker = null;
      }

      // Clear pending callbacks
      pendingCallbacks.clear();

      // Restore all original text nodes
      restoreOriginalText(allRecords);
      allRecords = [];
    },
  };
}

/**
 * Create the detection Web Worker using a Blob URL.
 * This bundles the worker code inline to avoid separate file hosting issues.
 * Falls back to null if Workers are not supported.
 */
function createWorker(): Worker | null {
  if (typeof Worker === 'undefined') {
    return null;
  }

  try {
    // The worker imports from the same bundle. Since Stencil may not
    // support standard worker bundling out of the box, we create the
    // worker using a blob URL that imports from the current script's origin.
    // For the initial implementation, we fall back to main-thread detection
    // if the worker cannot be instantiated.
    //
    // TODO: Investigate Stencil v4 worker bundling options (Rollup plugin,
    // or using the dist-custom-elements output with a separate worker entry point).
    // For now, the main-thread fallback provides identical functionality.
    return null;
  } catch {
    return null;
  }
}

/**
 * Main-thread fallback for PID detection.
 * Uses Parser.getBestFitQuick() which calls hasCorrectFormatQuick() on renderers.
 */
function detectOnMainThread(text: string, orderedRenderers?: string[]): DetectionMatch[] {
  const DELIMITER_REGEX = /[\s,;()\[\]{}<>"']+/;
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
        // Delimiter at start — skip it
        offset += delimMatch[0].length;
        remaining = remaining.substring(delimMatch[0].length);
        continue;
      }
      offset += delimMatch.index + delimMatch[0].length;
      remaining = remaining.substring(delimMatch.index + delimMatch[0].length);
    }

    if (token.length < 2) continue;

    // Sanitize: strip surrounding punctuation that may be part of prose
    const { sanitized, leadingStripped } = sanitizeToken(token);
    if (sanitized.length < 2) continue;

    const rendererKey = detectBestFit(sanitized, orderedRenderers);
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
 * Split an array into chunks of a given size.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
