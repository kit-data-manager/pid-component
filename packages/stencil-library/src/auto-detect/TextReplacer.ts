/**
 * Text Replacer for automatic PID detection.
 *
 * Takes detection results and replaces ONLY the matched PID substrings
 * with <pid-component> elements. Non-matching text stays as plain text
 * nodes — no extra wrapper spans for non-PID content.
 *
 * The original text of each PID remains visible until the component
 * has fully loaded, then swaps. Screen readers are not impacted:
 * the original text span is marked aria-hidden once the component loads,
 * and the pid-component takes over.
 */

import type { DetectionMatch, PidDetectionConfig } from './types';

/** CSS class for the wrapper span around auto-detected PIDs */
const WRAPPER_CLASS = 'pid-auto-detect-wrapper';

/** Attribute marking wrapper elements for cleanup and scanning exclusion */
const WRAPPER_ATTR = 'data-pid-auto-detected';

/**
 * Tracks a single replacement for later restoration.
 */
export interface ReplacementRecord {
  /** The wrapper element that was inserted */
  wrapper: HTMLElement;
  /** The original full text of the parent text node (for restore) */
  originalText: string;
  /** Reference to preceding text node (may be null) */
  precedingTextNode: Text | null;
  /** Reference to following text node (may be null) */
  followingTextNode: Text | null;
  /** The pid-component element */
  pidComponent: HTMLElement;
  /** Observer watching for component load */
  observer: MutationObserver;
  /** The original text span inside the wrapper */
  originalSpan: HTMLElement;
}

/**
 * Replace detected PID matches in a text node with <pid-component> elements.
 * Only the matched substrings are wrapped. Non-matched text stays as bare
 * text nodes — no extra elements created for non-PID content.
 *
 * @param textNode The text node containing detected PIDs
 * @param matches The detected matches and their positions
 * @param config The detection configuration for component props
 * @returns Array of replacement records for later cleanup
 */
export function replaceMatches(
  textNode: Text,
  matches: DetectionMatch[],
  config: PidDetectionConfig,
): ReplacementRecord[] {
  const records: ReplacementRecord[] = [];
  const parent = textNode.parentNode;
  if (!parent) return records;

  const fullText = textNode.textContent || '';

  // Sort matches by start position, deduplicate overlaps
  const sortedMatches = [...matches]
    .sort((a, b) => a.start - b.start)
    .filter((match, i, arr) => i === 0 || match.start >= arr[i - 1].end);

  // Build a document fragment: text nodes for gaps, wrappers for matches
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of sortedMatches) {
    // Text before this match → plain text node (no wrapper)
    if (match.start > lastIndex) {
      fragment.appendChild(document.createTextNode(fullText.substring(lastIndex, match.start)));
    }

    // Create a minimal wrapper for the matched PID only
    const wrapper = document.createElement('span');
    wrapper.className = WRAPPER_CLASS;
    wrapper.setAttribute(WRAPPER_ATTR, 'true');
    // Inline display, no visual change from surrounding text
    wrapper.style.display = 'inline';

    // Original text span — visible initially, hidden after component loads
    const originalSpan = document.createElement('span');
    originalSpan.textContent = match.value;
    wrapper.appendChild(originalSpan);

    // Create the pid-component (hidden initially)
    const pidComponent = document.createElement('pid-component');
    pidComponent.setAttribute('value', match.value);
    pidComponent.setAttribute('renderers', JSON.stringify([match.rendererKey]));
    pidComponent.setAttribute('fallback-to-all', String(config.fallbackToAll ?? true));
    pidComponent.style.display = 'none';
    // Ensure screen readers skip the hidden component until it's ready
    pidComponent.setAttribute('aria-hidden', 'true');

    // Apply centralized configuration
    applyConfig(pidComponent, config);

    wrapper.appendChild(pidComponent);

    // Set up observer to swap visibility when the component loads
    const observer = createSwapObserver(originalSpan, pidComponent, wrapper);

    fragment.appendChild(wrapper);

    records.push({
      wrapper,
      originalText: match.value,
      precedingTextNode: null, // filled after insertion
      followingTextNode: null,
      pidComponent,
      observer,
      originalSpan,
    });

    lastIndex = match.end;
  }

  // Remaining text after last match → plain text node
  if (lastIndex < fullText.length) {
    fragment.appendChild(document.createTextNode(fullText.substring(lastIndex)));
  }

  // Replace the original text node with the fragment
  parent.replaceChild(fragment, textNode);

  return records;
}

/**
 * Apply configuration props to a pid-component element.
 */
function applyConfig(pidComponent: HTMLElement, config: PidDetectionConfig): void {
  if (config.settings) {
    const settingsStr =
      typeof config.settings === 'string'
        ? config.settings
        : JSON.stringify(config.settings);
    pidComponent.setAttribute('settings', settingsStr);
  }
  if (config.darkMode) {
    pidComponent.setAttribute('dark-mode', config.darkMode);
  }
  if (config.levelOfSubcomponents !== undefined) {
    pidComponent.setAttribute('level-of-subcomponents', String(config.levelOfSubcomponents));
  }
  if (config.amountOfItems !== undefined) {
    pidComponent.setAttribute('amount-of-items', String(config.amountOfItems));
  }
  if (config.emphasizeComponent !== undefined) {
    pidComponent.setAttribute('emphasize-component', String(config.emphasizeComponent));
  }
  if (config.showTopLevelCopy !== undefined) {
    pidComponent.setAttribute('show-top-level-copy', String(config.showTopLevelCopy));
  }
  if (config.defaultTTL !== undefined) {
    pidComponent.setAttribute('default-t-t-l', String(config.defaultTTL));
  }
}

/**
 * Creates a MutationObserver that watches a pid-component for load/error/unmatched.
 *
 * The Stencil component sets `class` on its Host element once rendered.
 * We poll for the shadow root content and check if the component rendered
 * meaningful content vs. an error or unmatched state.
 */
function createSwapObserver(
  originalSpan: HTMLElement,
  pidComponent: HTMLElement,
  wrapper: HTMLElement,
): MutationObserver {
  let swapped = false;

  function trySwap() {
    if (swapped) return;

    const shadowRoot = pidComponent.shadowRoot;
    if (!shadowRoot) return;

    // The pid-component Host sets style="display: none" when unmatched
    const hostEl = pidComponent as HTMLElement;
    const hostDisplay = hostEl.style.display;

    // If the component hid itself (unmatched), clean up
    if (hostDisplay === 'none' && pidComponent.hasAttribute('renderers')) {
      // The component's own render() set display:none — unmatched state.
      // But we initially set display:none too. We need to distinguish.
      // Check if shadow root has actual content (Stencil renders the Host children)
      const hostChildren = shadowRoot.querySelectorAll('*');
      if (hostChildren.length > 0) {
        // Component rendered but decided to hide itself (unmatched)
        swapped = true;
        // Keep original text, remove the component
        pidComponent.remove();
        // Unwrap: replace wrapper with just the text
        unwrapToText(wrapper, originalSpan.textContent || '');
        observer.disconnect();
        return;
      }
    }

    // Check if the component has rendered meaningful content
    // Look for common rendered elements inside the shadow DOM
    const hasRenderedContent = shadowRoot.querySelector('span, a, div, svg');
    if (!hasRenderedContent) return;

    // Check for error state — look for text-red-600 error span
    const errorEl = shadowRoot.querySelector('.text-red-600, [role="alert"]');
    if (errorEl) {
      // Error state — keep original text
      swapped = true;
      pidComponent.remove();
      unwrapToText(wrapper, originalSpan.textContent || '');
      observer.disconnect();
      return;
    }

    // Component rendered successfully — swap
    swapped = true;
    originalSpan.style.display = 'none';
    originalSpan.setAttribute('aria-hidden', 'true');
    pidComponent.style.display = '';
    pidComponent.removeAttribute('aria-hidden');
    observer.disconnect();
  }

  const observer = new MutationObserver(trySwap);

  // Observe the pid-component for changes
  observer.observe(pidComponent, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  // Also observe shadow root when available
  const attachShadowObserver = () => {
    if (pidComponent.shadowRoot) {
      observer.observe(pidComponent.shadowRoot, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      // Try immediately in case content is already there
      trySwap();
    } else {
      // Poll for shadow root attachment (Stencil lazy-loads)
      const checkInterval = setInterval(() => {
        if (pidComponent.shadowRoot) {
          clearInterval(checkInterval);
          observer.observe(pidComponent.shadowRoot, {
            childList: true,
            subtree: true,
            attributes: true,
          });
          trySwap();
        }
      }, 50);
      // Safety timeout — stop polling after 10s
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  };

  attachShadowObserver();

  return observer;
}

/**
 * Replace a wrapper element with a plain text node.
 * Used when a component fails to render — restore original text seamlessly.
 */
function unwrapToText(wrapper: HTMLElement, text: string): void {
  const parent = wrapper.parentNode;
  if (!parent) return;
  const textNode = document.createTextNode(text);
  parent.replaceChild(textNode, wrapper);
  parent.normalize(); // merge adjacent text nodes
}

/**
 * Restore original text nodes from replacement records.
 * Used during destroy() to clean up all auto-detected components.
 */
export function restoreOriginalText(records: ReplacementRecord[]): void {
  for (const record of records) {
    record.observer.disconnect();
    unwrapToText(record.wrapper, record.originalText);
  }
}
