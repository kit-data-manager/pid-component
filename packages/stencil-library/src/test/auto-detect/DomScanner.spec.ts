import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scanDom } from '../../auto-detect/DomScanner';
import { DOI_examples } from '../../../../../examples/doi/values';

// Polyfill NodeFilter constants for Stencil's test environment
if (typeof (globalThis as any).NodeFilter === 'undefined') {
  (globalThis as any).NodeFilter = {
    FILTER_ACCEPT: 1,
    FILTER_REJECT: 2,
    FILTER_SKIP: 3,
    SHOW_ALL: 0xffffffff,
    SHOW_ELEMENT: 0x1,
    SHOW_TEXT: 0x4,
  };
}

describe('DomScanner', () => {
  beforeEach(() => {
    // Provide a synchronous requestIdleCallback so scanDom resolves immediately
    (globalThis as any).requestIdleCallback = (cb: (deadline: { timeRemaining: () => number }) => void) => {
      cb({ timeRemaining: () => 50 });
      return 0;
    };

    // Polyfill createTreeWalker on the current document
    const NF = (globalThis as any).NodeFilter;

    (document as any).createTreeWalker = function(
      root: Node,
      whatToShow: number,
      filter?: { acceptNode(node: Node): number },
    ) {
      const showElement = !!(whatToShow & NF.SHOW_ELEMENT);
      const showText = !!(whatToShow & NF.SHOW_TEXT);

      const nodes: Node[] = [];

      function walk(node: Node) {
        const children = Array.from(node.childNodes);
        for (const child of children) {
          if (child.nodeType === Node.ELEMENT_NODE && showElement) {
            if (filter) {
              const result = filter.acceptNode(child);
              if (result === NF.FILTER_REJECT) continue;
              if (result === NF.FILTER_ACCEPT) nodes.push(child);
            }
            walk(child);
          } else if (child.nodeType === Node.TEXT_NODE && showText) {
            if (filter) {
              const result = filter.acceptNode(child);
              if (result === NF.FILTER_ACCEPT) nodes.push(child);
            } else {
              nodes.push(child);
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            walk(child);
          }
        }
      }

      walk(root);

      let index = -1;
      return {
        currentNode: root,
        nextNode(): Node | null {
          index++;
          if (index < nodes.length) {
            this.currentNode = nodes[index];
            return nodes[index];
          }
          return null;
        },
      };
    };
  });

  afterEach(() => {
    delete (globalThis as any).requestIdleCallback;
  });

  describe('scanDom()', () => {
    it('collects text nodes from a simple paragraph', async () => {
      const root = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = 'Hello world';
      root.appendChild(p);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Hello world');
    });

    it('skips <script> elements and their children', async () => {
      const root = document.createElement('div');
      const p = document.createElement('p');
      p.textContent = 'Visible text';
      root.appendChild(p);

      const script = document.createElement('script');
      script.textContent = 'var x = 42;';
      root.appendChild(script);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips <style> elements', async () => {
      const root = document.createElement('div');
      const style = document.createElement('style');
      style.textContent = 'body { color: red; }';
      root.appendChild(style);

      const p = document.createElement('p');
      p.textContent = 'Visible text';
      root.appendChild(p);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips <textarea> elements', async () => {
      const root = document.createElement('div');
      const textarea = document.createElement('textarea');
      textarea.textContent = 'Some user input';
      root.appendChild(textarea);

      const p = document.createElement('p');
      p.textContent = 'Visible text';
      root.appendChild(p);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips <pid-component> elements', async () => {
      const root = document.createElement('div');
      const pidComp = document.createElement('pid-component');
      pidComp.textContent = DOI_examples.VALID_BARE;
      root.appendChild(pidComp);

      const p = document.createElement('p');
      p.textContent = 'Visible text';
      root.appendChild(p);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips elements with contenteditable attribute', async () => {
      const root = document.createElement('div');
      const editable = document.createElement('div');
      editable.setAttribute('contenteditable', 'true');
      editable.textContent = 'Editable content';
      root.appendChild(editable);

      const p = document.createElement('p');
      p.textContent = 'Regular text';
      root.appendChild(p);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Regular text');
    });

    it('skips elements matching exclude CSS selector', async () => {
      const root = document.createElement('div');
      const excluded = document.createElement('div');
      excluded.className = 'no-scan';
      excluded.textContent = 'Should be excluded';
      root.appendChild(excluded);

      const p = document.createElement('p');
      p.textContent = 'Should be included';
      root.appendChild(p);

      const results = await scanDom(root, '.no-scan', 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Should be included');
    });

    it('ignores text nodes with less than 2 chars after trimming', async () => {
      const root = document.createElement('div');
      const span1 = document.createElement('span');
      span1.textContent = 'x';
      root.appendChild(span1);

      const span2 = document.createElement('span');
      span2.textContent = '  ';
      root.appendChild(span2);

      const span3 = document.createElement('span');
      span3.textContent = 'OK';
      root.appendChild(span3);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('OK');
    });

    it('handles nested elements correctly', async () => {
      const root = document.createElement('div');
      const outer = document.createElement('div');
      const inner = document.createElement('span');
      inner.textContent = 'Nested text';
      outer.appendChild(inner);
      root.appendChild(outer);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Nested text');
    });

    it('returns unique IDs for each text node', async () => {
      const root = document.createElement('div');
      const p1 = document.createElement('p');
      p1.textContent = 'First paragraph';
      root.appendChild(p1);

      const p2 = document.createElement('p');
      p2.textContent = 'Second paragraph';
      root.appendChild(p2);

      const p3 = document.createElement('p');
      p3.textContent = 'Third paragraph';
      root.appendChild(p3);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(3);
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('returns correct text content for each scanned node', async () => {
      const root = document.createElement('div');
      const p1 = document.createElement('p');
      p1.textContent = 'Hello world';
      root.appendChild(p1);

      const p2 = document.createElement('p');
      p2.textContent = DOI_examples.VALID_BARE;
      root.appendChild(p2);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(2);
      expect(results[0].text).toBe('Hello world');
      expect(results[1].text).toBe(DOI_examples.VALID_BARE);
    });

    it('skips already-processed elements (with data-pid-auto-detected attribute)', async () => {
      const root = document.createElement('div');
      const processed = document.createElement('span');
      processed.setAttribute('data-pid-auto-detected', 'true');
      processed.textContent = 'Already processed';
      root.appendChild(processed);

      const p = document.createElement('p');
      p.textContent = 'Not processed';
      root.appendChild(p);

      const results = await scanDom(root, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Not processed');
    });
  });
});
