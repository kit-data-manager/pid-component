import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initPidDetection } from '../../auto-detect/initPidDetection';

const {
  mockScanDom,
  mockReplaceMatches,
  mockRestoreOriginalText,
  mockDetectBestFit,
  mockSanitizeToken,
} = vi.hoisted(() => ({
  mockScanDom: vi.fn().mockResolvedValue([]),
  mockReplaceMatches: vi.fn().mockReturnValue([]),
  mockRestoreOriginalText: vi.fn(),
  mockDetectBestFit: vi.fn().mockReturnValue(null),
  mockSanitizeToken: vi.fn().mockImplementation((token: string) => ({
    sanitized: token,
    leadingStripped: 0,
  })),
}));

vi.mock('../../auto-detect/DomScanner', () => ({
  scanDom: mockScanDom,
}));

vi.mock('../../auto-detect/TextReplacer', () => ({
  replaceMatches: mockReplaceMatches,
  restoreOriginalText: mockRestoreOriginalText,
}));

vi.mock('../../auto-detect/detection-registry', () => ({
  detectBestFit: mockDetectBestFit,
  sanitizeToken: mockSanitizeToken,
}));

vi.mock('../../components/json-viewer/json-viewer', () => ({}));

describe('initPidDetection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDetectBestFit.mockReturnValue(null);
    mockSanitizeToken.mockImplementation((token: string) => ({
      sanitized: token,
      leadingStripped: 0,
    }));
    mockScanDom.mockResolvedValue([]);
    mockReplaceMatches.mockReturnValue([]);

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

    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        setAttribute: vi.fn(),
        style: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        contains: vi.fn(() => false),
        createTextNode: vi.fn((text: string) => ({ textContent: text })),
        childNodes: [],
        insertBefore: vi.fn(),
        replaceChild: vi.fn(),
      })),
      createElementNS: vi.fn(() => ({})),
      createTextNode: vi.fn((text: string) => ({ textContent: text })),
      createDocumentFragment: vi.fn(() => ({
        appendChild: vi.fn(),
        childNodes: [],
      })),
      querySelector: vi.fn(() => null),
      querySelectorAll: vi.fn(() => []),
      getElementById: vi.fn(() => null),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });
  });

  describe('basic functionality', () => {
    it('creates a controller with destroy method', () => {
      const root = document.createElement('div');
      const controller = initPidDetection({ root });

      expect(controller).toBeDefined();
      expect(typeof controller.destroy).toBe('function');
      expect(typeof controller.stop).toBe('function');
      expect(typeof controller.rescan).toBe('function');
    });

    it('scans the DOM on initialization', async () => {
      const root = document.createElement('div');
      initPidDetection({ root });

      await Promise.resolve();

      expect(mockScanDom).toHaveBeenCalled();
    });

    it('does not throw when called without options', () => {
      expect(() => {
        initPidDetection();
      }).not.toThrow();
    });

    it('handles root element that is not document.body', () => {
      const root = document.createElement('div');
      const controller = initPidDetection({ root });

      expect(controller).toBeDefined();
    });
  });

  describe('controller methods', () => {
    it('stop() disconnects the MutationObserver when observe is true', () => {
      const root = document.createElement('div');
      const mockDisconnect = vi.fn();
      vi.stubGlobal('MutationObserver', class MutationObserver {
        disconnect = mockDisconnect;

        constructor(_callback: Function) {
        }

        observe() {
        }
      });

      const controller = initPidDetection({ root, observe: true });
      controller.stop();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('rescan() calls scanDom again', async () => {
      const root = document.createElement('div');
      mockScanDom.mockResolvedValue([]);

      initPidDetection({ root });
      await Promise.resolve();
      mockScanDom.mockClear();

      const controller = initPidDetection({ root });
      controller.rescan();

      expect(mockScanDom).toHaveBeenCalled();
    });

    it('destroy() disconnects observer and calls restoreOriginalText', () => {
      const root = document.createElement('div');
      const mockDisconnect = vi.fn();
      vi.stubGlobal('MutationObserver', class MutationObserver {
        disconnect = mockDisconnect;

        constructor(_callback: Function) {
        }

        observe() {
        }
      });

      mockReplaceMatches.mockReturnValue([
        { wrapper: {}, originalText: 'test', observer: { disconnect: vi.fn() } },
      ]);

      const controller = initPidDetection({ root, observe: true });
      controller.destroy();

      expect(mockDisconnect).toHaveBeenCalled();
      expect(mockRestoreOriginalText).toHaveBeenCalled();
    });

    it('destroy() handles case when observer is not set', () => {
      const root = document.createElement('div');

      const controller = initPidDetection({ root, observe: false });
      controller.destroy();

      expect(mockRestoreOriginalText).toHaveBeenCalled();
    });
  });

  describe('lifecycle methods', () => {
    it('destroy() restores original text for accumulated records', () => {
      const root = document.createElement('div');
      const mockDisconnect = vi.fn();
      vi.stubGlobal('MutationObserver', class MutationObserver {
        disconnect = mockDisconnect;

        constructor(_callback: Function) {
        }

        observe() {
        }
      });

      mockReplaceMatches.mockReturnValue([
        { wrapper: {}, originalText: 'original', observer: { disconnect: vi.fn() } },
      ]);

      const controller = initPidDetection({ root, observe: true });
      controller.destroy();

      expect(mockRestoreOriginalText).toHaveBeenCalled();
    });
  });
});
