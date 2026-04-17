import { Parser } from './Parser';
import { renderers } from './utils';

// Patterns for each PID/identifier type, combined into one regex for a single-pass scan.
// Alternatives (ordered most-specific first):
//   DOI        — 10.XXXX/...   (CrossRef / DataCite)
//   ROR        — https?://ror.org/<9-char alphanum>
//   ORCiD      — XXXX-XXXX-XXXX-XXXX(X)   (16-digit with dashes, last digit may be X)
//   Handle PID — <prefix>/<suffix>  where prefix is alphanumeric + dots
const DOI_PATTERN = '10\\.\\d{4,9}\\/[-._;()/:A-Z0-9]+';
const ROR_PATTERN = 'https?:\\/\\/ror\\.org\\/[0-9a-z]{9}';
const ORCID_PATTERN = '\\d{4}-\\d{4}-\\d{4}-\\d{3}[0-9X]';
const HANDLE_PATTERN = '[0-9A-Za-z]+\\.[0-9A-Za-z]+\\/[^\\s<>"\'\\])}]+';

export const PID_CANDIDATE_REGEX = new RegExp(
  `(${DOI_PATTERN}|${ROR_PATTERN}|${ORCID_PATTERN}|${HANDLE_PATTERN})(?=[\\s<>"')\\]},;:!?]|$)`,
  'gi',
);

/**
 * Configuration for the automatic PID detection.
 * All properties are forwarded verbatim to every auto-injected pid-component,
 * so users only need to configure one place.
 */
export interface PidAutoDetectConfig {
  /** CSS selector for the area to scan. Defaults to 'body'. */
  targetSelector?: string;

  /** @see pid-component#settings */
  settings?: string;
  /** @see pid-component#openByDefault */
  openByDefault?: boolean;
  /** @see pid-component#amountOfItems */
  amountOfItems?: number;
  /** @see pid-component#levelOfSubcomponents */
  levelOfSubcomponents?: number;
  /** @see pid-component#hideSubcomponents */
  hideSubcomponents?: boolean;
  /** @see pid-component#emphasizeComponent */
  emphasizeComponent?: boolean;
  /** @see pid-component#showTopLevelCopy */
  showTopLevelCopy?: boolean;
  /** @see pid-component#defaultTTL */
  defaultTTL?: number;
  /** @see pid-component#width */
  width?: string;
  /** @see pid-component#height */
  height?: string;
  /** @see pid-component#darkMode */
  darkMode?: 'light' | 'dark' | 'system';
}

const ENHANCED_ATTR = 'data-pid-enhanced';
const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);
const FALLBACK_PRIORITY = renderers.length - 1;

/**
 * Scans a target DOM area for PIDs and progressively replaces them with
 * pid-component elements. Used by both the global entry-point init and
 * the pid-wrapper custom element.
 */
export class PidAutoDetector {
  private readonly config: Required<Pick<PidAutoDetectConfig, 'targetSelector'>> & PidAutoDetectConfig;
  private observer?: MutationObserver;

  constructor(config: PidAutoDetectConfig = {}) {
    this.config = { targetSelector: 'body', ...config };
  }

  /** Begin scanning the target area and observing mutations. */
  async start(): Promise<void> {
    const root = this.getTargetRoot();
    if (!root) return;
    await this.scanNode(root);
    this.observeMutations(root);
  }

  /** Disconnect the MutationObserver. */
  stop(): void {
    this.observer?.disconnect();
  }

  private getTargetRoot(): Element | null {
    try {
      return document.querySelector(this.config.targetSelector) ?? document.body;
    } catch (e) {
      console.warn(`pid-component: invalid targetSelector "${this.config.targetSelector}". Falling back to document.body.`, e);
      return document.body;
    }
  }

  private observeMutations(root: Element): void {
    this.observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const addedNode of Array.from(mutation.addedNodes)) {
          if (!(addedNode instanceof HTMLElement) || addedNode.tagName === 'PID-COMPONENT') continue;
          void this.scanNode(addedNode);
        }
      }
    });
    this.observer.observe(root, { childList: true, subtree: true });
  }

  private async scanNode(root: Node): Promise<void> {
    const textNodes = this.getCandidateTextNodes(root);
    for (let i = 0; i < textNodes.length; i++) {
      await this.replaceCandidatesInTextNode(textNodes[i]);
      if (i % 10 === 0) await this.yieldToMainThread();
    }
  }

  private getCandidateTextNodes(root: Node): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();

    while (currentNode) {
      const textNode = currentNode as Text;
      const parent = textNode.parentElement;
      const text = textNode.textContent?.trim() ?? '';

      if (
        parent &&
        text.length > 0 &&
        !parent.closest(`[${ENHANCED_ATTR}], pid-component, pid-wrapper`) &&
        !IGNORED_TAGS.has(parent.tagName) &&
        new RegExp(PID_CANDIDATE_REGEX.source, 'i').test(text)
      ) {
        textNodes.push(textNode);
      }

      currentNode = walker.nextNode();
    }

    return textNodes;
  }

  private async replaceCandidatesInTextNode(textNode: Text): Promise<void> {
    const text = textNode.textContent ?? '';
    PID_CANDIDATE_REGEX.lastIndex = 0;
    const matches = Array.from(text.matchAll(PID_CANDIDATE_REGEX));
    if (matches.length === 0) return;

    const validationResults = await Promise.all(
      matches.map(async match => {
        const rawMatch = match[0];
        const leading = rawMatch.match(/^[('"[{]+/)?.[0] ?? '';
        const trailing = rawMatch.match(/[)\]}'".,;:!?]+$/)?.[0] ?? '';
        const candidate = rawMatch.slice(leading.length, rawMatch.length - trailing.length);

        if (!candidate) return { isSupported: false, candidate, leading, trailing };

        let estimatedPriority = FALLBACK_PRIORITY;
        try {
          estimatedPriority = await Parser.getEstimatedPriority(candidate);
        } catch (e) {
          console.warn('pid-component: skipping candidate after parser error:', candidate, e);
        }
        return {
          isSupported: estimatedPriority < FALLBACK_PRIORITY,
          candidate,
          leading,
          trailing,
        };
      }),
    );

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    let replacementApplied = false;

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const result = validationResults[i];
      if (match.index === undefined) continue;

      fragment.append(text.slice(cursor, match.index));
      cursor = match.index + match[0].length;

      if (result.leading) fragment.append(result.leading);

      if (result.isSupported) {
        fragment.appendChild(this.createDeferredReplacement(result.candidate));
        replacementApplied = true;
      } else {
        fragment.append(result.candidate);
      }

      if (result.trailing) fragment.append(result.trailing);
    }

    fragment.append(text.slice(cursor));

    if (replacementApplied && textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  private createDeferredReplacement(value: string): HTMLElement {
    const container = document.createElement('span');
    container.setAttribute(ENHANCED_ATTR, 'true');

    const original = document.createElement('span');
    original.textContent = value;

    const component = document.createElement('pid-component');

    // Per-instance value
    component.setAttribute('value', value);

    // Forward all config props. Use HTML hyphenated attribute names so they work
    // regardless of whether the custom element has been upgraded yet.
    const cfg = this.config;
    if (cfg.settings !== undefined)            component.setAttribute('settings', cfg.settings);
    if (cfg.openByDefault !== undefined)       component.setAttribute('open-by-default', String(cfg.openByDefault));
    if (cfg.amountOfItems !== undefined)       component.setAttribute('amount-of-items', String(cfg.amountOfItems));
    if (cfg.levelOfSubcomponents !== undefined) component.setAttribute('level-of-subcomponents', String(cfg.levelOfSubcomponents));
    if (cfg.hideSubcomponents !== undefined)   component.setAttribute('hide-subcomponents', String(cfg.hideSubcomponents));
    if (cfg.emphasizeComponent !== undefined)  component.setAttribute('emphasize-component', String(cfg.emphasizeComponent));
    if (cfg.showTopLevelCopy !== undefined)    component.setAttribute('show-top-level-copy', String(cfg.showTopLevelCopy));
    if (cfg.defaultTTL !== undefined)          component.setAttribute('default-t-t-l', String(cfg.defaultTTL));
    if (cfg.darkMode !== undefined)            component.setAttribute('dark-mode', cfg.darkMode);
    if (cfg.width !== undefined)               component.setAttribute('width', cfg.width);
    if (cfg.height !== undefined)              component.setAttribute('height', cfg.height);

    component.style.display = 'none';

    component.addEventListener(
      'pid-component-ready',
      () => {
        original.style.display = 'none';
        component.style.display = 'inline-block';
      },
      { once: true },
    );

    component.addEventListener(
      'pid-component-error',
      () => {
        component.remove();
      },
      { once: true },
    );

    container.append(original, component);
    return container;
  }

  private async yieldToMainThread(): Promise<void> {
    if ('requestIdleCallback' in window) {
      await new Promise<void>(resolve => {
        requestIdleCallback(() => resolve(), { timeout: 200 });
      });
    } else {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  }
}
