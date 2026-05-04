/**
 * DOM Scanner for automatic PID detection.
 *
 * Walks the DOM tree from a root element and extracts text nodes
 * for PID detection. Uses TreeWalker for efficient traversal and
 * requestIdleCallback for non-blocking processing.
 */

/** Elements to skip during scanning */
const SKIP_ELEMENTS = new Set([
  'SCRIPT',
  'STYLE',
  'TEXTAREA',
  'INPUT',
  'SELECT',
  'NOSCRIPT',
  'PID-COMPONENT',
  'CODE',
  'PRE',
  'SVG',
]);

/** Attribute that marks an element as already processed by the auto-detector */
const PROCESSED_ATTR = 'data-pid-auto-detected';

export interface ScannedTextNode {
  /** Unique ID for correlating with worker responses */
  id: number;
  /** Reference to the actual DOM text node */
  textNode: Text;
  /** The text content */
  text: string;
}

/**
 * Check if an element should be skipped during scanning.
 */
function shouldSkipElement(element: Element, excludeSelector?: string): boolean {
  if (SKIP_ELEMENTS.has(element.tagName)) {
    return true;
  }
  if (element.hasAttribute('contenteditable')) {
    return true;
  }
  if (element.hasAttribute(PROCESSED_ATTR)) {
    return true;
  }
  if (element.closest('.pid-auto-detect-wrapper')) {
    return true;
  }
  if (excludeSelector) {
    try {
      if (element.matches(excludeSelector)) {
        return true;
      }
    } catch {
      // Invalid selector — ignore
    }
  }
  return false;
}

/**
 * Scan the DOM tree from a root element and collect text nodes.
 * Uses requestIdleCallback to avoid blocking the main thread.
 *
 * @param root The root element to scan
 * @param excludeSelector Optional CSS selector for elements to skip
 * @param batchSize Number of text nodes to process per idle callback
 * @returns Promise resolving to an array of scanned text nodes
 */
export function scanDom(
  root: HTMLElement,
  excludeSelector?: string,
  batchSize: number = 50,
): Promise<ScannedTextNode[]> {
  return new Promise((resolve) => {
    const results: ScannedTextNode[] = [];
    let nextId = 0;

    // Create a TreeWalker that visits text nodes
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(node: Node): number {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (shouldSkipElement(element, excludeSelector)) {
              return NodeFilter.FILTER_REJECT; // Skip element and its subtree
            }
            return NodeFilter.FILTER_SKIP; // Visit children but don't collect element itself
          }

          // Text node
          const text = node.textContent?.trim();
          if (!text || text.length < 2) {
            return NodeFilter.FILTER_SKIP; // Skip empty or very short text
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );

    // Collect all candidate text nodes using idle callbacks
    const requestIdle =
      typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback
        : (cb: (deadline: { timeRemaining: () => number }) => void) =>
          setTimeout(() => cb({ timeRemaining: () => 16 }), 0) as unknown as number;

    function processNextBatch(deadline: { timeRemaining: () => number }) {
      let count = 0;

      while (count < batchSize && deadline.timeRemaining() > 0) {
        const node = walker.nextNode();
        if (node === null) {
          // Done — resolve with all results
          resolve(results);
          return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const textNode = node as Text;
          const text = textNode.textContent || '';
          if (text.trim().length >= 2) {
            results.push({
              id: nextId++,
              textNode,
              text,
            });
          }
          count++;
        }
      }

      // Schedule next batch
      requestIdle(processNextBatch);
    }

    requestIdle(processNextBatch);
  });
}
