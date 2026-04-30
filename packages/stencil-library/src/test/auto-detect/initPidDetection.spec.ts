import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initPidDetection } from '../../auto-detect/initPidDetection';
import * as DomScanner from '../../auto-detect/DomScanner';
import * as TextReplacer from '../../auto-detect/TextReplacer';
import * as DetectionRegistry from '../../auto-detect/detection-registry';
import { DOI_examples } from '../../../../../examples/doi/values';

vi.mock('../../components/json-viewer/json-viewer', () => ({}));

// ─── Spies ───────────────────────────────────────────────────────────

let spyScanDom: any;
let spyReplaceMatches: any;
let spyRestoreOriginalText: any;
let spyDetectBestFit: any;
let spySanitizeToken: any;

// ─── Helpers ─────────────────────────────────────────────────────────

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

beforeEach(() => {
  // Set up spies on imported modules
  spyScanDom = vi.spyOn(DomScanner, 'scanDom').mockResolvedValue([]);
  spyReplaceMatches = vi.spyOn(TextReplacer, 'replaceMatches').mockReturnValue([]);
  spyRestoreOriginalText = vi.spyOn(TextReplacer, 'restoreOriginalText').mockImplementation(() => {
  });
  spyDetectBestFit = vi.spyOn(DetectionRegistry, 'detectBestFit').mockReturnValue(null);
  spySanitizeToken = vi.spyOn(DetectionRegistry, 'sanitizeToken').mockImplementation(
    (token: string) => ({ sanitized: token, leadingStripped: 0 }),
  );

  // Provide synchronous requestIdleCallback
  (globalThis as any).requestIdleCallback = (cb: () => void) => {
    cb();
    return 0;
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (globalThis as any).requestIdleCallback;
});

/**
 * Flush microtasks so the internal runScan() promise chain settles.
 */
function flushMicrotasks() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('initPidDetection', () => {
  // ─── Controller shape ──────────────────────────────────────────────

  describe('controller interface', () => {
    it('returns a controller with stop, rescan, and destroy methods', () => {
      const controller = initPidDetection();

      expect(typeof controller.stop).toBe('function');
      expect(typeof controller.rescan).toBe('function');
      expect(typeof controller.destroy).toBe('function');

      controller.destroy();
    });
  });

  // ─── DOM scanning ──────────────────────────────────────────────────

  describe('DOM scanning', () => {
    it('calls scanDom with the root element', async () => {
      const root = document.createElement('div');
      const controller = initPidDetection({ root });
      await flushMicrotasks();

      expect(spyScanDom).toHaveBeenCalledWith(root, undefined);
      controller.destroy();
    });

    it('defaults root to document.body when not provided', async () => {
      const controller = initPidDetection();
      await flushMicrotasks();

      expect(spyScanDom).toHaveBeenCalledWith(document.body, undefined);
      controller.destroy();
    });

    it('passes the exclude selector to scanDom', async () => {
      const root = document.createElement('div');
      const controller = initPidDetection({ root, exclude: '.skip-me' });
      await flushMicrotasks();

      expect(spyScanDom).toHaveBeenCalledWith(root, '.skip-me');
      controller.destroy();
    });
  });

  // ─── Detection ─────────────────────────────────────────────────────

  describe('detection', () => {
    it('calls detectBestFit for each text token (main-thread fallback)', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode('hello world');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: 'hello world' },
      ]);

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      // "hello" and "world" are the two tokens from "hello world"
      expect(spyDetectBestFit).toHaveBeenCalledWith('hello', undefined, true);
      expect(spyDetectBestFit).toHaveBeenCalledWith('world', undefined, true);
      controller.destroy();
    });

    it('creates pid-components for detected matches via replaceMatches', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: DOI_examples.VALID_BARE },
      ]);
      spyDetectBestFit.mockReturnValue('DOIType');

      const config = { root };
      const controller = initPidDetection(config);
      await flushMicrotasks();

      expect(spyReplaceMatches).toHaveBeenCalled();
      const callArgs = spyReplaceMatches.mock.calls[0];
      expect(callArgs[0]).toBe(textNode);
      // matches array should contain a match with rendererKey 'DOIType'
      expect(callArgs[1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ value: DOI_examples.VALID_BARE, rendererKey: 'DOIType' }),
        ]),
      );
      controller.destroy();
    });

    it('does not call replaceMatches when no matches are found', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode('plain text here');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: 'plain text here' },
      ]);

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      expect(spyReplaceMatches).not.toHaveBeenCalled();
      controller.destroy();
    });

    it('passes the renderers config to detectBestFit as orderedRenderers', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: DOI_examples.VALID_BARE },
      ]);

      const renderers = ['DOIType', 'ORCIDType'];
      const controller = initPidDetection({ root, renderers });
      await flushMicrotasks();

      expect(spyDetectBestFit).toHaveBeenCalledWith(DOI_examples.VALID_BARE, renderers, true);
      controller.destroy();
    });

    it('passes config through to replaceMatches', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: DOI_examples.VALID_BARE },
      ]);
      spyDetectBestFit.mockReturnValue('DOIType');

      const config = { root, darkMode: 'dark' as const, settings: [{ type: 'test', values: [] }] };
      const controller = initPidDetection(config);
      await flushMicrotasks();

      expect(spyReplaceMatches).toHaveBeenCalled();
      const passedConfig = spyReplaceMatches.mock.calls[0][2];
      expect(passedConfig.darkMode).toBe('dark');
      expect(passedConfig.settings).toEqual([{ type: 'test', values: [] }]);
      controller.destroy();
    });
  });

  // ─── detectOnMainThread internals ──────────────────────────────────

  describe('detectOnMainThread (main-thread fallback)', () => {
    it('tokenizes text by whitespace and delimiters', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode('foo, bar; baz');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: 'foo, bar; baz' },
      ]);

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      const sanitizedValues = spySanitizeToken.mock.calls.map((c: any[]) => c[0]);
      expect(sanitizedValues).toContain('foo');
      expect(sanitizedValues).toContain('bar');
      expect(sanitizedValues).toContain('baz');
      controller.destroy();
    });

    it('sanitizes tokens before detection', async () => {
      const root = document.createElement('div');
      // Use text without delimiter chars so the token includes the surrounding punctuation
      // that sanitizeToken should strip. Hyphens and dots are NOT delimiters.
      const textNode = document.createTextNode('...value...');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: '...value...' },
      ]);
      // Simulate stripping leading/trailing dots
      spySanitizeToken.mockReturnValue({ sanitized: 'value', leadingStripped: 3 });

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      // The whole text is one token (no delimiter characters present)
      expect(spySanitizeToken).toHaveBeenCalledWith('...value...');
      expect(spyDetectBestFit).toHaveBeenCalledWith('value', undefined, true);
      controller.destroy();
    });

    it('skips tokens shorter than 2 characters', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode('a bb');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: 'a bb' },
      ]);

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      // "a" is < 2 chars, should be skipped; "bb" should be checked
      const detectCalls = spyDetectBestFit.mock.calls.map((c: any[]) => c[0]);
      expect(detectCalls).not.toContain('a');
      expect(detectCalls).toContain('bb');
      controller.destroy();
    });

    it('skips tokens that sanitize to fewer than 2 characters', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode('(x) hello');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: '(x) hello' },
      ]);
      spySanitizeToken.mockImplementation((t: string) => {
        if (t === '(x)') return { sanitized: 'x', leadingStripped: 1 };
        return { sanitized: t, leadingStripped: 0 };
      });

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      // "(x)" sanitizes to "x" (length 1), should be skipped
      const detectCalls = spyDetectBestFit.mock.calls.map((c: any[]) => c[0]);
      expect(detectCalls).not.toContain('x');
      expect(detectCalls).toContain('hello');
      controller.destroy();
    });

    it('computes correct start/end positions accounting for sanitization', async () => {
      const root = document.createElement('div');
      // Use a text that has no delimiter chars — dots/colons/slashes are NOT
      // in the DELIMITER_REGEX, so the whole string is one token.
      const textNode = document.createTextNode('...10.5281/foo...');
      root.appendChild(textNode);

      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: '...10.5281/foo...' },
      ]);
      // sanitizeToken strips 3 leading dots and 3 trailing dots
      spySanitizeToken.mockReturnValue({ sanitized: '10.5281/foo', leadingStripped: 3 });
      spyDetectBestFit.mockReturnValue('DOIType');

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      expect(spyReplaceMatches).toHaveBeenCalled();
      const matches = spyReplaceMatches.mock.calls[0][1];
      expect(matches[0].start).toBe(3); // 0 (tokenStart) + 3 (leadingStripped)
      expect(matches[0].end).toBe(14); // 3 + 11 (length of '10.5281/foo')
      expect(matches[0].value).toBe('10.5281/foo');
      controller.destroy();
    });
  });

  // ─── Lifecycle ─────────────────────────────────────────────────────

  describe('lifecycle methods', () => {
    it('destroy() calls restoreOriginalText with accumulated records', async () => {
      const root = document.createElement('div');
      const textNode = document.createTextNode(DOI_examples.VALID_BARE);
      root.appendChild(textNode);

      const fakeRecord = { wrapper: document.createElement('span'), originalText: DOI_examples.VALID_BARE };
      spyScanDom.mockResolvedValueOnce([
        { id: 0, textNode, text: DOI_examples.VALID_BARE },
      ]);
      spyDetectBestFit.mockReturnValue('DOIType');
      spyReplaceMatches.mockReturnValue([fakeRecord]);

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      controller.destroy();

      expect(spyRestoreOriginalText).toHaveBeenCalledWith([fakeRecord]);
    });

    it('destroy() prevents further scans', async () => {
      const root = document.createElement('div');

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      spyScanDom.mockClear();
      controller.destroy();
      controller.rescan();
      await flushMicrotasks();

      // rescan after destroy should not trigger scanDom
      expect(spyScanDom).not.toHaveBeenCalled();
    });

    it('rescan() triggers a new scanDom call', async () => {
      const root = document.createElement('div');

      const controller = initPidDetection({ root });
      await flushMicrotasks();

      spyScanDom.mockClear();
      controller.rescan();
      await flushMicrotasks();

      expect(spyScanDom).toHaveBeenCalledWith(root, undefined);
      controller.destroy();
    });
  });

  // ─── MutationObserver ──────────────────────────────────────────────

  describe('MutationObserver (observe: true)', () => {
    it('stop() disconnects the MutationObserver', async () => {
      const root = document.createElement('div');
      const disconnectSpy = vi.fn();

      const OriginalMutationObserver = globalThis.MutationObserver;
      (globalThis as any).MutationObserver = class {
        observe = vi.fn();
        disconnect = disconnectSpy;
        takeRecords = vi.fn().mockReturnValue([]);

        constructor(public callback: MutationCallback) {
        }
      };

      const controller = initPidDetection({ root, observe: true });
      await flushMicrotasks();

      controller.stop();
      expect(disconnectSpy).toHaveBeenCalled();

      controller.destroy();
      globalThis.MutationObserver = OriginalMutationObserver;
    });

    it('destroy() disconnects the MutationObserver', async () => {
      const root = document.createElement('div');
      const disconnectSpy = vi.fn();

      const OriginalMutationObserver = globalThis.MutationObserver;
      (globalThis as any).MutationObserver = class {
        observe = vi.fn();
        disconnect = disconnectSpy;
        takeRecords = vi.fn().mockReturnValue([]);

        constructor(public callback: MutationCallback) {
        }
      };

      const controller = initPidDetection({ root, observe: true });
      await flushMicrotasks();

      controller.destroy();
      expect(disconnectSpy).toHaveBeenCalled();

      globalThis.MutationObserver = OriginalMutationObserver;
    });

    it('scans new element nodes added to the DOM', async () => {
      const root = document.createElement('div');
      let observerCallback: MutationCallback | null = null;

      const OriginalMutationObserver = globalThis.MutationObserver;
      (globalThis as any).MutationObserver = class {
        observe = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn().mockReturnValue([]);

        constructor(cb: MutationCallback) {
          observerCallback = cb;
        }
      };

      const controller = initPidDetection({ root, observe: true });
      await flushMicrotasks();

      // Clear the initial scan calls
      spyScanDom.mockClear();

      // Simulate a mutation: a new element is added
      const newElement = document.createElement('p');
      newElement.textContent = 'New content';
      const mutation = {
        type: 'childList',
        addedNodes: [newElement],
        removedNodes: [],
        target: root,
      } as unknown as MutationRecord;

      spyScanDom.mockResolvedValueOnce([]);

      observerCallback!([mutation], {} as MutationObserver);
      await flushMicrotasks();

      expect(spyScanDom).toHaveBeenCalledWith(newElement, undefined);

      controller.destroy();
      globalThis.MutationObserver = OriginalMutationObserver;
    });

    it('skips pid-auto-detect-wrapper elements in MutationObserver', async () => {
      const root = document.createElement('div');
      let observerCallback: MutationCallback | null = null;

      const OriginalMutationObserver = globalThis.MutationObserver;
      (globalThis as any).MutationObserver = class {
        observe = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn().mockReturnValue([]);

        constructor(cb: MutationCallback) {
          observerCallback = cb;
        }
      };

      const controller = initPidDetection({ root, observe: true });
      await flushMicrotasks();
      spyScanDom.mockClear();

      // Simulate a mutation with a wrapper element (should be skipped)
      const wrapper = document.createElement('span');
      wrapper.classList.add('pid-auto-detect-wrapper');
      const mutation = {
        type: 'childList',
        addedNodes: [wrapper],
        removedNodes: [],
        target: root,
      } as unknown as MutationRecord;

      observerCallback!([mutation], {} as MutationObserver);
      await flushMicrotasks();

      expect(spyScanDom).not.toHaveBeenCalled();

      controller.destroy();
      globalThis.MutationObserver = OriginalMutationObserver;
    });

    it('skips PID-COMPONENT elements in MutationObserver', async () => {
      const root = document.createElement('div');
      let observerCallback: MutationCallback | null = null;

      const OriginalMutationObserver = globalThis.MutationObserver;
      (globalThis as any).MutationObserver = class {
        observe = vi.fn();
        disconnect = vi.fn();
        takeRecords = vi.fn().mockReturnValue([]);

        constructor(cb: MutationCallback) {
          observerCallback = cb;
        }
      };

      const controller = initPidDetection({ root, observe: true });
      await flushMicrotasks();
      spyScanDom.mockClear();

      const pidComp = document.createElement('pid-component');
      const mutation = {
        type: 'childList',
        addedNodes: [pidComp],
        removedNodes: [],
        target: root,
      } as unknown as MutationRecord;

      observerCallback!([mutation], {} as MutationObserver);
      await flushMicrotasks();

      expect(spyScanDom).not.toHaveBeenCalled();

      controller.destroy();
      globalThis.MutationObserver = OriginalMutationObserver;
    });
  });
});
