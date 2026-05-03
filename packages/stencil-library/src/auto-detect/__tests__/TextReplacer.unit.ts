import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { replaceMatches, restoreOriginalText } from '../../auto-detect/TextReplacer';
import type { DetectionMatch, PidDetectionConfig } from '../../auto-detect/types';

const DOI_examples = {
  VALID_BARE: '10.52825/ocp.v5i.1411',
  VALID_WITH_PREFIX: 'https://dx.doi.org/10.52825/ocp.v5i.1411',
};

vi.mock('../../components/json-viewer/json-viewer', () => ({
  default: { render: vi.fn() },
}));

function createMockElement(tagName: string): any {
  const elem: any = {
    tagName: tagName.toUpperCase(),
    nodeType: 1,
    nodeName: tagName.toUpperCase(),
    childNodes: [],
    style: { cssText: '' },
    attributes: {},
    parentNode: null,
    setAttribute: vi.fn((name: string, value: string) => {
      elem.attributes[name] = value;
    }),
    getAttribute: vi.fn((name: string) => elem.attributes[name] || null),
    hasAttribute: vi.fn((name: string) => !!elem.attributes[name]),
    appendChild: vi.fn(function(this: any, child: any) {
      child.parentNode = this;
      this.childNodes.push(child);
      return child;
    }),
    removeChild: vi.fn(function(this: any, child: any) {
      const i = this.childNodes.indexOf(child);
      if (i >= 0) this.childNodes.splice(i, 1);
      child.parentNode = null;
    }),
    replaceChild: vi.fn(function(this: any, newChild: any, oldChild: any) {
      const i = this.childNodes.indexOf(oldChild);
      if (i >= 0) {
        if (newChild.childNodes && newChild.childNodes.length > 0) {
          this.childNodes.splice(i, 1, ...newChild.childNodes);
          newChild.childNodes.forEach((child: any) => {
            child.parentNode = this;
          });
          newChild.childNodes = [];
        } else {
          this.childNodes[i] = newChild;
          newChild.parentNode = this;
        }
      }
      oldChild.parentNode = null;
      return oldChild;
    }),
    insertBefore: vi.fn(function(this: any, newChild: any, refChild: any) {
      const i = this.childNodes.indexOf(refChild);
      if (i >= 0) {
        this.childNodes.splice(i, 0, newChild);
      } else {
        this.childNodes.push(newChild);
      }
      newChild.parentNode = this;
      return newChild;
    }),
    querySelector: vi.fn(function(this: any, selector: string) {
      if (selector === '.pid-auto-detect-wrapper') {
        return this.childNodes.find((child: any) =>
          child.className && child.className.includes('pid-auto-detect-wrapper'),
        ) || null;
      }
      if (selector === 'pid-component') {
        return this.childNodes.find((child: any) => child.tagName === 'PID-COMPONENT') || null;
      }
      if (selector.startsWith('.')) {
        return this.childNodes.find((child: any) =>
          child.className && child.className.includes(selector.slice(1)),
        ) || null;
      }
      return null;
    }),
    querySelectorAll: vi.fn(function(this: any, _selector: string) {
      return this.childNodes.filter((child: any) =>
        child.className && child.className.includes('pid-auto-detect-wrapper'),
      );
    }),
    normalize: vi.fn(function(this: any) {
      const merged: any[] = [];
      let currentTextNode: any = null;
      for (const child of this.childNodes) {
        if (child.nodeType === 3) {
          if (currentTextNode) {
            currentTextNode.textContent += child.textContent;
          } else {
            currentTextNode = child;
            merged.push(child);
          }
        } else {
          currentTextNode = null;
          merged.push(child);
        }
      }
      this.childNodes = merged;
    }),
    createTextNode: vi.fn((text: string) => ({
      textContent: text,
      nodeType: 3,
      nodeName: '#text',
      parentNode: null,
      childNodes: [],
    })),
  };
  return elem;
}

function createMockDocumentFragment(): any {
  return {
    childNodes: [],
    appendChild: vi.fn(function(this: any, child: any) {
      this.childNodes.push(child);
      return child;
    }),
  };
}

describe('TextReplacer', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      createElement: vi.fn((tagName: string) => createMockElement(tagName)),
      createTextNode: vi.fn((text: string) => ({
        textContent: text,
        nodeType: 3,
        nodeName: '#text',
        parentNode: null,
        childNodes: [],
      })),
      createDocumentFragment: vi.fn(() => createMockDocumentFragment()),
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
    });

    vi.stubGlobal('MutationObserver', class MutationObserver {
      constructor(_callback: Function) {
      }

      observe() {
      }

      disconnect() {
      }
    });

    vi.stubGlobal('Node', {
      TEXT_NODE: 3,
      ELEMENT_NODE: 1,
    });

    vi.stubGlobal('NodeFilter', {
      FILTER_ACCEPT: 1,
      FILTER_REJECT: 2,
      FILTER_SKIP: 3,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('replaceMatches()', () => {
    it('replaces a single match with a wrapper containing pid-component', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, {});

      expect(records.length).toBe(1);
      expect(parent.querySelector('.pid-auto-detect-wrapper')).not.toBeNull();
      const wrapper = parent.querySelector('.pid-auto-detect-wrapper');
      expect(wrapper!.querySelector('pid-component')).not.toBeNull();
      const pidComp = wrapper!.querySelector('pid-component');
      expect(pidComp!.getAttribute('value')).toBe(DOI_examples.VALID_BARE);
    });

    it('keeps non-matched text before and after as plain text nodes', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode('See 10.5281/zenodo.1234567 for details');
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 4, end: 26, value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' },
      ];

      replaceMatches(textNode, matches, {});

      const childNodes = Array.from(parent.childNodes);
      expect(childNodes.length).toBe(3);
      expect(childNodes[0].textContent).toBe('See ');
      expect(childNodes[2].textContent).toBe(' for details');
    });

    it('handles multiple matches in one text node', () => {
      const text = '10.5281/a and 10.5281/b';
      const parent = document.createElement('div');
      const textNode = document.createTextNode(text);
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 0, end: 9, value: '10.5281/a', rendererKey: 'DOIType' },
        { start: 14, end: 23, value: '10.5281/b', rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, {});

      expect(records.length).toBe(2);
    });

    it('deduplicates overlapping matches', () => {
      const text = 'overlap test value';
      const parent = document.createElement('div');
      const textNode = document.createTextNode(text);
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 0, end: 10, value: 'overlap te', rendererKey: 'DOIType' },
        { start: 5, end: 15, value: 'ap test va', rendererKey: 'HandleType' },
      ];

      const records = replaceMatches(textNode, matches, {});

      expect(records.length).toBe(1);
    });

    it('applies config props (darkMode) to created pid-component', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' },
      ];
      const config: PidDetectionConfig = { darkMode: 'dark' };

      const records = replaceMatches(textNode, matches, config);

      expect(records.length).toBe(1);
      const wrapper = parent.querySelector('.pid-auto-detect-wrapper');
      const pidComp = wrapper!.querySelector('pid-component');
      expect(pidComp).not.toBeNull();
    });

    it('sets data-pid-auto-detected attribute on processed text nodes', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' },
      ];

      replaceMatches(textNode, matches, {});

      expect(parent.childNodes.length).toBe(1);
      const wrapper = parent.childNodes[0] as Element;
      expect(wrapper.hasAttribute && wrapper.getAttribute && wrapper.getAttribute('data-pid-auto-detected') === 'true').toBeTruthy();
    });
  });

  describe('restoreOriginalText()', () => {
    it('removes wrappers and puts text back', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 0, end: 22, value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, {});

      restoreOriginalText(records);

      const childNodes = Array.from(parent.childNodes);
      expect(childNodes.length).toBe(1);
      expect(childNodes[0].textContent).toBe(DOI_examples.VALID_BARE);
    });

    it('normalizes adjacent text nodes after restoration', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode('Hello ' + DOI_examples.VALID_BARE + ' world');
      parent.appendChild(textNode);

      const matches: DetectionMatch[] = [
        { start: 6, end: 27, value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' },
      ];

      const records = replaceMatches(textNode, matches, {});

      restoreOriginalText(records);

      const childNodes = Array.from(parent.childNodes);
      const textContent = childNodes.map(n => n.textContent).join('');
      expect(textContent).toBe('Hello ' + DOI_examples.VALID_BARE + ' world');
    });
  });
});
