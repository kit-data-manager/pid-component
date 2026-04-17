// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, h, Prop } from '@stencil/core';
import { Parser } from '../../utils/Parser';
import { renderers } from '../../utils/utils';

const PID_CANDIDATE_REGEX =
  /(10\.\d{4,9}\/[-._;()/:A-Z0-9]+|https?:\/\/ror\.org\/[0-9a-z]{9}|\d{4}-\d{4}-\d{4}-\d{3}[0-9X]|[0-9A-Za-z]+\.[0-9A-Za-z]+\/[^\s<>"'\])}]+)(?=[\s<>"')\]}.,;:!?]|$)/gi;

@Component({
  tag: 'pid-wrapper',
  shadow: false,
})
export class PidWrapper {
  /**
   * CSS selector for the area in which identifiers should be detected.
   * Defaults to the full document body.
   */
  @Prop() targetSelector: string = 'body';

  private observer?: MutationObserver;
  private readonly enhancedNodeAttribute = 'data-pid-wrapper-enhanced';
  private readonly ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);
  private readonly fallbackPriority = renderers.length - 1;

  async componentDidLoad() {
    await this.scanCurrentDocument();
    this.observeMutations();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  private async scanCurrentDocument() {
    const root = this.getTargetRoot();
    if (!root) return;
    await this.scanNode(root);
  }

  private observeMutations() {
    const root = this.getTargetRoot();
    if (!root) return;

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

  private async scanNode(root: Node) {
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
        !parent.closest(`${this.getEnhancedNodeSelector()}, pid-component, pid-wrapper`) &&
        !this.ignoredTags.has(parent.tagName) &&
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

        if (!candidate) {
          return {
            isSupported: false,
            candidate,
            leading,
            trailing,
          };
        }

        let estimatedPriority = this.fallbackPriority;
        try {
          estimatedPriority = await Parser.getEstimatedPriority(candidate);
        } catch (e) {
          console.debug('Skipping candidate after parser error:', candidate, e);
        }
        return {
          isSupported: estimatedPriority < this.fallbackPriority,
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

      if (result.leading) {
        fragment.append(result.leading);
      }

      if (result.isSupported) {
        fragment.appendChild(this.createDeferredReplacement(result.candidate));
        replacementApplied = true;
      } else {
        fragment.append(result.candidate);
      }

      if (result.trailing) {
        fragment.append(result.trailing);
      }
    }

    fragment.append(text.slice(cursor));

    if (replacementApplied && textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }

  private createDeferredReplacement(value: string): HTMLElement {
    const container = document.createElement('span');
    container.setAttribute(this.enhancedNodeAttribute, 'true');

    const original = document.createElement('span');
    original.textContent = value;

    const component = document.createElement('pid-component');
    component.setAttribute('value', value);
    component.setAttribute('emphasize-component', 'false');
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

  private getEnhancedNodeSelector(): string {
    return `[${this.enhancedNodeAttribute}]`;
  }

  private getTargetRoot(): Element | HTMLElement | null {
    try {
      return document.querySelector(this.targetSelector) ?? document.body;
    } catch (e) {
      console.warn(`Invalid target selector "${this.targetSelector}". Falling back to document.body.`, e);
      return document.body;
    }
  }

  private async yieldToMainThread(): Promise<void> {
    if ('requestIdleCallback' in window) {
      await new Promise<void>(resolve => {
        requestIdleCallback(() => resolve(), { timeout: 50 });
      });
    } else {
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
  }

  render() {
    return <slot />;
  }
}
