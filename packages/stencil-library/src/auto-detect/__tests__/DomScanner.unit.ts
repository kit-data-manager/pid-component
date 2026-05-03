import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { scanDom } from '../../auto-detect/DomScanner';

const DOI_examples = {
  VALID_BARE: '10.52825/ocp.v5i.1411',
};

describe('DomScanner', () => {
  beforeEach(() => {
    vi.stubGlobal('Node', {
      TEXT_NODE: 3,
      ELEMENT_NODE: 1,
    });

    vi.stubGlobal('NodeFilter', {
      FILTER_ACCEPT: 1,
      FILTER_REJECT: 2,
      FILTER_SKIP: 3,
      SHOW_ALL: 0xffffffff,
      SHOW_ELEMENT: 0x1,
      SHOW_TEXT: 0x4,
    });

    (globalThis as any).requestIdleCallback = (cb: (deadline: { timeRemaining: () => number }) => void) => {
      cb({ timeRemaining: () => 50 });
      return 0;
    };
  });

  afterEach(() => {
    delete (globalThis as any).requestIdleCallback;
    vi.restoreAllMocks();
  });

  describe('scanDom()', () => {
    it('collects text nodes from a simple paragraph', async () => {
      const mockTextNode = { textContent: 'Hello world', nodeType: 3 };
      const mockElement = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [mockTextNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: mockElement,
        nextNode: vi.fn()
          .mockReturnValueOnce(mockTextNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(mockElement as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Hello world');
    });

    it('skips <script> elements and their children', async () => {
      const visibleTextNode = { textContent: 'Visible text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const scriptTextNode = { textContent: 'var x = 42;', nodeType: 3 };
      const script = {
        tagName: 'SCRIPT',
        nodeType: 1,
        childNodes: [scriptTextNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p, script],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(script)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips <style> elements', async () => {
      const visibleTextNode = { textContent: 'Visible text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const styleTextNode = { textContent: 'body { color: red; }', nodeType: 3 };
      const style = {
        tagName: 'STYLE',
        nodeType: 1,
        childNodes: [styleTextNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [style, p],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(style)
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips <textarea> elements', async () => {
      const textareaTextNode = { textContent: 'Some user input', nodeType: 3 };
      const textarea = {
        tagName: 'TEXTAREA',
        nodeType: 1,
        childNodes: [textareaTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const visibleTextNode = { textContent: 'Visible text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [textarea, p],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(textarea)
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips <pid-component> elements', async () => {
      const visibleTextNode = { textContent: 'Visible text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const pidTextNode = { textContent: '10.5281/zenodo.123', nodeType: 3 };
      const pid = {
        tagName: 'PID-COMPONENT',
        nodeType: 1,
        childNodes: [pidTextNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p, pid],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(pid)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips elements with contenteditable attribute', async () => {
      const visibleTextNode = { textContent: 'Visible text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const editableTextNode = { textContent: 'Editable text', nodeType: 3 };
      const editable = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [editableTextNode],
        hasAttribute: vi.fn((name: string) => name === 'contenteditable'),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p, editable],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(editable)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('skips elements matching exclude CSS selector', async () => {
      const visibleTextNode = { textContent: 'Visible text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn(() => false),
        matches: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const excludedTextNode = { textContent: 'Excluded text', nodeType: 3 };
      const excluded = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [excludedTextNode],
        hasAttribute: vi.fn(() => false),
        matches: vi.fn(() => true),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p, excluded],
        hasAttribute: vi.fn(() => false),
        matches: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(excluded)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, '.exclude-me', 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible text');
    });

    it('ignores text nodes with less than 2 chars after trimming', async () => {
      const longTextNode = { textContent: 'Hello world', nodeType: 3 };
      const shortTextNode = { textContent: 'x', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [longTextNode, shortTextNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(longTextNode)
          .mockReturnValueOnce(shortTextNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Hello world');
    });

    it('handles nested elements correctly', async () => {
      const textNode = { textContent: 'Deep text', nodeType: 3 };
      const inner = {
        tagName: 'SPAN',
        nodeType: 1,
        childNodes: [textNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const outer = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [inner],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [outer],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(outer)
          .mockReturnValueOnce(inner)
          .mockReturnValueOnce(textNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Deep text');
    });

    it('returns unique IDs for each text node', async () => {
      const textNode1 = { textContent: 'Text 1', nodeType: 3 };
      const textNode2 = { textContent: 'Text 2', nodeType: 3 };
      const p1 = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [textNode1],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const p2 = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [textNode2],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p1, p2],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p1)
          .mockReturnValueOnce(textNode1)
          .mockReturnValueOnce(p2)
          .mockReturnValueOnce(textNode2)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(2);
      expect(results[0].id).toBe(0);
      expect(results[1].id).toBe(1);
    });

    it('returns correct text content for each scanned node', async () => {
      const textNode1 = { textContent: 'First text', nodeType: 3 };
      const textNode2 = { textContent: 'Second text', nodeType: 3 };
      const p1 = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [textNode1],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const p2 = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [textNode2],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p1, p2],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p1)
          .mockReturnValueOnce(textNode1)
          .mockReturnValueOnce(p2)
          .mockReturnValueOnce(textNode2)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(2);
      expect(results[0].text).toBe('First text');
      expect(results[1].text).toBe('Second text');
    });

    it('skips already-processed elements (with data-pid-auto-detected attribute)', async () => {
      const processedTextNode = { textContent: 'Processed', nodeType: 3 };
      const processed = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [processedTextNode],
        hasAttribute: vi.fn((name: string) => name === 'data-pid-auto-detected'),
        closest: vi.fn(() => null),
      };
      const visibleTextNode = { textContent: 'Visible', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [visibleTextNode],
        hasAttribute: vi.fn((name: string) => name === 'data-pid-auto-detected'),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [processed, p],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(processed)
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(visibleTextNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
      expect(results[0].text).toBe('Visible');
    });

    it('skips elements inside .pid-auto-detect-wrapper', async () => {
      const textNode = { textContent: 'Inside wrapper', nodeType: 3 };
      const wrapped = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [textNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => true),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [wrapped],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(wrapped)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(0);
    });

    it('handles missing requestIdleCallback gracefully', async () => {
      delete (globalThis as any).requestIdleCallback;

      const textNode = { textContent: 'Test text', nodeType: 3 };
      const p = {
        tagName: 'P',
        nodeType: 1,
        childNodes: [textNode],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };
      const root = {
        tagName: 'DIV',
        nodeType: 1,
        childNodes: [p],
        hasAttribute: vi.fn(() => false),
        closest: vi.fn(() => null),
      };

      const mockWalker = {
        currentNode: root,
        nextNode: vi.fn()
          .mockReturnValueOnce(p)
          .mockReturnValueOnce(textNode)
          .mockReturnValueOnce(null),
      };

      const createTreeWalkerMock = vi.fn(() => mockWalker);
      vi.stubGlobal('document', {
        createTreeWalker: createTreeWalkerMock,
      });

      const results = await scanDom(root as any, undefined, 100);

      expect(results.length).toBe(1);
    });
  });
});