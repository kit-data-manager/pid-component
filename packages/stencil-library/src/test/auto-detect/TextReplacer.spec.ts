import { replaceMatches, restoreOriginalText } from '../../auto-detect/TextReplacer';
import type { DetectionMatch, PidDetectionConfig } from '../../auto-detect/types';

describe('TextReplacer', () => {
  // Polyfill MutationObserver and patch replaceChild for DocumentFragment
  // inside beforeEach so the correct document reference is used.
  beforeEach(() => {
    if (typeof (globalThis as any).MutationObserver === 'undefined') {
      (globalThis as any).MutationObserver = class MutationObserver {
        constructor(_callback: Function) { /* noop */
        }

        observe() { /* noop */
        }

        disconnect() { /* noop */
        }

        takeRecords() {
          return [];
        }
      };
    }

    // Stencil's MockDocument doesn't support replaceChild with DocumentFragment.
    // Monkey-patch the prototype to handle it properly.
    const proto = Object.getPrototypeOf(document.createElement('div'));
    if (proto && !proto.__patchedReplaceChild) {
      const origReplaceChild = proto.replaceChild;
      proto.replaceChild = function(newChild: any, oldChild: any) {
        if (newChild && newChild.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          const children = Array.from(newChild.childNodes) as Node[];
          for (const child of children) {
            this.insertBefore(child, oldChild);
          }
          this.removeChild(oldChild);
          return oldChild;
        }
        return origReplaceChild.call(this, newChild, oldChild);
      };
      proto.__patchedReplaceChild = true;
    }

    // Polyfill normalize() — Stencil's MockDocument doesn't include it.
    if (proto && !proto.normalize) {
      proto.normalize = function() {
        // Merge adjacent text nodes
        const children: Node[] = Array.from(this.childNodes);
        for (let i = children.length - 1; i > 0; i--) {
          const curr = children[i];
          const prev = children[i - 1];
          if (curr.nodeType === Node.TEXT_NODE && prev.nodeType === Node.TEXT_NODE) {
            (prev as Text).textContent = ((prev as Text).textContent || '') + ((curr as Text).textContent || '');
            this.removeChild(curr);
          }
        }
      };
    }
  });

  /** Helper: create a text node inside a parent <div> */
  function createTextNodeInParent(text: string): { parent: HTMLDivElement; textNode: Text } {
    const parent = document.createElement('div') as HTMLDivElement;
    const textNode = document.createTextNode(text);
    parent.appendChild(textNode);
    return { parent, textNode };
  }

  /** Minimal config for tests */
  const baseConfig: PidDetectionConfig = {};

  describe('replaceMatches()', () => {
    it('replaces a single match with a wrapper containing pid-component', () => {
      const { parent, textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      expect(records.length).toBe(1);
      const wrapper = parent.querySelector('.pid-auto-detect-wrapper');
      expect(wrapper).not.toBeNull();
      const pidComp = wrapper!.querySelector('pid-component');
      expect(pidComp).not.toBeNull();
      expect(pidComp!.getAttribute('value')).toBe('10.5281/zenodo.1234567');
    });

    it('keeps non-matched text before and after as plain text nodes', () => {
      const { parent, textNode } = createTextNodeInParent('See 10.5281/zenodo.1234567 for details');
      const matches: DetectionMatch[] = [
        { start: 4, end: 26, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];

      replaceMatches(textNode, matches, baseConfig);

      // Structure: TextNode("See ") + wrapper + TextNode(" for details")
      const childNodes = Array.from(parent.childNodes);
      expect(childNodes.length).toBe(3);

      expect(childNodes[0].nodeType).toBe(Node.TEXT_NODE);
      expect(childNodes[0].textContent).toBe('See ');

      expect((childNodes[1] as HTMLElement).className).toContain('pid-auto-detect-wrapper');

      expect(childNodes[2].nodeType).toBe(Node.TEXT_NODE);
      expect(childNodes[2].textContent).toBe(' for details');
    });

    it('handles multiple matches in one text node', () => {
      const text = '10.5281/a and 10.5281/b';
      const { parent, textNode } = createTextNodeInParent(text);
      const matches: DetectionMatch[] = [
        { start: 0, end: 9, value: '10.5281/a', rendererKey: 'DOIType' },
        { start: 14, end: 23, value: '10.5281/b', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      expect(records.length).toBe(2);
      const wrappers = parent.querySelectorAll('.pid-auto-detect-wrapper');
      expect(wrappers.length).toBe(2);
    });

    it('deduplicates overlapping matches', () => {
      const text = 'overlap test value';
      const { parent, textNode } = createTextNodeInParent(text);
      // Two matches that overlap: [0,10) and [5,15)
      const matches: DetectionMatch[] = [
        { start: 0, end: 10, value: 'overlap te', rendererKey: 'DOIType' },
        { start: 5, end: 15, value: 'ap test va', rendererKey: 'HandleType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      // Only the first (after sorting by start) should survive dedup
      expect(records.length).toBe(1);
      const wrappers = parent.querySelectorAll('.pid-auto-detect-wrapper');
      expect(wrappers.length).toBe(1);
    });

    it('applies config props (darkMode) to created pid-component', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];
      const config: PidDetectionConfig = { darkMode: 'dark' };

      const records = replaceMatches(textNode, matches, config);

      expect(records[0].pidComponent.getAttribute('dark-mode')).toBe('dark');
    });

    it('applies config props (settings as string) to created pid-component', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];
      const settingsStr = '[{"type":"DOIType","values":[]}]';
      const config: PidDetectionConfig = { settings: settingsStr };

      const records = replaceMatches(textNode, matches, config);

      expect(records[0].pidComponent.getAttribute('settings')).toBe(settingsStr);
    });

    it('applies config props (settings as object) to created pid-component', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];
      const settingsObj = [{ type: 'DOIType', values: [{ name: 'showCitation', value: true }] }];
      const config: PidDetectionConfig = { settings: settingsObj };

      const records = replaceMatches(textNode, matches, config);

      expect(records[0].pidComponent.getAttribute('settings')).toBe(JSON.stringify(settingsObj));
    });

    it('sets aria-hidden="true" on the hidden pid-component', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      expect(records[0].pidComponent.getAttribute('aria-hidden')).toBe('true');
    });

    it('sets renderers attribute on pid-component with the detected renderer key', () => {
      const { textNode } = createTextNodeInParent('0009-0005-2800-4833');
      const matches: DetectionMatch[] = [
        { start: 0, end: 19, value: '0009-0005-2800-4833', rendererKey: 'ORCIDType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      expect(records[0].pidComponent.getAttribute('renderers')).toBe('["ORCIDType"]');
    });

    it('returns ReplacementRecords with correct data', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      expect(records.length).toBe(1);
      expect(records[0].originalText).toBe('10.5281/zenodo.1234567');
      expect(records[0].wrapper).toBeTruthy();
      expect(records[0].wrapper.tagName).toBeDefined();
      expect(records[0].pidComponent).toBeTruthy();
      expect(records[0].pidComponent.tagName.toLowerCase()).toBe('pid-component');
      expect(records[0].originalSpan).toBeTruthy();
      expect(records[0].observer).toBeTruthy();
      expect(typeof records[0].observer.disconnect).toBe('function');
    });

    it('returns empty records when textNode has no parent', () => {
      const textNode = document.createTextNode('orphan text');
      const matches: DetectionMatch[] = [
        { start: 0, end: 11, value: 'orphan text', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      expect(records.length).toBe(0);
    });

    it('applies levelOfSubcomponents config', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];
      const config: PidDetectionConfig = { levelOfSubcomponents: 3 };

      const records = replaceMatches(textNode, matches, config);

      expect(records[0].pidComponent.getAttribute('level-of-subcomponents')).toBe('3');
    });

    it('applies fallback-to-all attribute from config', () => {
      const { textNode } = createTextNodeInParent('10.5281/zenodo.1234567');
      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];
      const config: PidDetectionConfig = { fallbackToAll: false };

      const records = replaceMatches(textNode, matches, config);

      expect(records[0].pidComponent.getAttribute('fallback-to-all')).toBe('false');
    });
  });

  describe('restoreOriginalText()', () => {
    it('removes wrappers and puts text back', () => {
      const { parent, textNode } = createTextNodeInParent('See 10.5281/zenodo.1234567 here');
      const matches: DetectionMatch[] = [
        { start: 4, end: 26, value: '10.5281/zenodo.1234567', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);

      // Verify wrapper exists before restore
      expect(parent.querySelector('.pid-auto-detect-wrapper')).not.toBeNull();

      restoreOriginalText(records);

      // Wrapper should be gone
      expect(parent.querySelector('.pid-auto-detect-wrapper')).toBeNull();
      // The restored text should be present in the parent
      expect(parent.textContent).toContain('10.5281/zenodo.1234567');
    });

    it('normalizes adjacent text nodes after restoration', () => {
      const { parent, textNode } = createTextNodeInParent('before DOI after');
      const matches: DetectionMatch[] = [
        { start: 7, end: 10, value: 'DOI', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, baseConfig);
      restoreOriginalText(records);

      // After unwrapToText + normalize, the text content should be coherent
      expect(parent.textContent).toContain('DOI');
    });
  });
});
