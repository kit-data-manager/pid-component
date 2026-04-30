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

import type { DetectionMatch, PidDetectionConfig, ReplacementRecord } from './types';

/** CSS class for the wrapper span around auto-detected PIDs */
const WRAPPER_CLASS = 'pid-auto-detect-wrapper';

/** Attribute marking wrapper elements for cleanup and scanning exclusion */
const WRAPPER_ATTR = 'data-pid-auto-detected';

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

    // Create the pid-component (invisible but rendered — NOT display:none,
    // which would prevent the shadow DOM from rendering in some browsers)
    const pidComponent = document.createElement('pid-component');
    pidComponent.setAttribute('value', match.value);
    pidComponent.setAttribute('renderers', JSON.stringify([match.rendererKey]));
    pidComponent.setAttribute('fallback-to-all', String(config.fallbackToAll ?? true));
    // Use visibility/position to hide while allowing full rendering
    pidComponent.style.cssText = 'visibility:hidden;position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
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
  if (config.itemsPerPage !== undefined) {
    pidComponent.setAttribute('items-per-page', String(config.itemsPerPage));
  }
  // Default to non-emphasized for auto-detected components (blends into text)
  pidComponent.setAttribute('emphasize-component', String(config.emphasizeComponent ?? false));
  if (config.showTopLevelCopy !== undefined) {
    pidComponent.setAttribute('show-top-level-copy', String(config.showTopLevelCopy));
  }
  if (config.defaultTTL !== undefined) {
    pidComponent.setAttribute('default-t-t-l', String(config.defaultTTL));
  }
}

/**
 * Creates a swap observer that detects when a pid-component finishes rendering.
 *
 * Strategy: the component starts hidden via visibility:hidden + position:absolute.
 * We poll the shadow DOM for content. The component goes through three phases:
 *   1. Loading: shadow root contains a spinner (<svg class="...animate-spin...">)
 *   2. Loaded: shadow root contains preview content (no spinner, no error)
 *   3. Error: shadow root contains an error element ([role="alert"])
 *   4. Unmatched: the Host element inside the shadow root has display:none
 *
 * Once we detect loaded/error/unmatched, we swap or clean up.
 */
function createSwapObserver(
  originalSpan: HTMLElement,
  pidComponent: HTMLElement,
  wrapper: HTMLElement,
): MutationObserver {
  let swapped = false;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let safetyTimer: ReturnType<typeof setTimeout> | null = null;

  function cleanup() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (safetyTimer) {
      clearTimeout(safetyTimer);
      safetyTimer = null;
    }
    observer.disconnect();
  }

  function handleError() {
    swapped = true;
    cleanup();
    pidComponent.remove();
    unwrapToText(wrapper, originalSpan.textContent || '');
  }

  function handleSuccess() {
    swapped = true;
    cleanup();
    // Hide original text, show component
    originalSpan.style.display = 'none';
    originalSpan.setAttribute('aria-hidden', 'true');
    // Reset the component's hidden styles to make it visible and in-flow
    pidComponent.style.cssText = '';
    pidComponent.removeAttribute('aria-hidden');
  }

  function trySwap() {
    if (swapped) return;

    const shadowRoot = pidComponent.shadowRoot;
    if (!shadowRoot) return;

    // Check for the Stencil Host element inside shadow root
    // Stencil renders a <host-element> or applies classes/styles directly.
    // We check for actual rendered child elements.
    const allElements = shadowRoot.querySelectorAll('*');
    if (allElements.length === 0) return; // Not yet rendered

    // Check for unmatched state: the component's render() sets display:none on the Host.
    // The Host element in shadow DOM is the root — check the first-level element.
    const hostInShadow = shadowRoot.querySelector('[class*="relative"]');
    if (hostInShadow) {
      const hostStyle = (hostInShadow as HTMLElement).style;
      if (hostStyle && hostStyle.display === 'none') {
        handleError(); // Unmatched — treat like error, restore text
        return;
      }
    }

    // Check for error state
    const errorEl = shadowRoot.querySelector('[role="alert"]');
    if (errorEl) {
      handleError();
      return;
    }

    // Check if still loading — look for the spinner
    const spinner = shadowRoot.querySelector('.animate-spin');
    if (spinner) return; // Still loading, wait

    // Check for successfully rendered preview content
    // The loaded state has either:
    // - A span with role="button" (preview with expand)
    // - A <pid-collapsible> element (full component with items)
    // - A link (<a>) for URLType
    // - Any meaningful content that isn't the spinner or error
    const preview = shadowRoot.querySelector('[role="button"], pid-collapsible, a[href], copy-button, color-highlight, locale-visualization');
    if (preview) {
      handleSuccess();
      return;
    }

    // Fallback: if there are multiple elements and no spinner/error, assume loaded
    // This handles renderer types we haven't explicitly listed above
    if (allElements.length > 2 && !spinner && !errorEl) {
      handleSuccess();
      return;
    }
  }

  const observer = new MutationObserver(trySwap);

  // Start polling for shadow root and content
  pollTimer = setInterval(() => {
    if (swapped) {
      cleanup();
      return;
    }

    if (pidComponent.shadowRoot) {
      // Observe shadow root mutations
      try {
        observer.observe(pidComponent.shadowRoot, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      } catch {
        // Already observing — ignore
      }
      trySwap();
    }
  }, 100);

  // Safety timeout — after 15s, give up and keep original text
  safetyTimer = setTimeout(() => {
    if (!swapped) {
      // Check one last time
      trySwap();
      if (!swapped) {
        // Timed out waiting — keep original text visible, remove hidden component
        handleError();
      }
    }
  }, 15000);

  // Also observe the pid-component itself for attribute changes
  observer.observe(pidComponent, {
    attributes: true,
    childList: true,
  });

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
