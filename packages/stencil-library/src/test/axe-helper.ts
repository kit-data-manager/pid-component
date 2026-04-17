/**
 * Helper for running jest-axe accessibility tests in Stencil's mock DOM environment.
 *
 * axe-core captures `window` at load time. Stencil creates its mock window
 * before each test suite, so we must ensure the polyfills are on `window`
 * BEFORE jest-axe is first loaded, and we must defer the import.
 */

// Cache axe module per test file to avoid re-loading. Note: this is set
// per-file since each test file gets its own module scope.
let axeModule: any = null;

/**
 * Run an axe accessibility check on the given HTML string.
 *
 * @param html - The HTML string to test (typically from `page.root.outerHTML`)
 * @returns Promise that rejects if violations are found
 */
export async function checkA11y(html: string): Promise<void> {
  // Ensure polyfills are on window before axe-core loads
  const w = window as any;
  w.NamedNodeMap = w.NamedNodeMap || function NamedNodeMap() {
  };
  w.HTMLHtmlElement = w.HTMLHtmlElement || function HTMLHtmlElement() {
  };
  w.HTMLBodyElement = w.HTMLBodyElement || function HTMLBodyElement() {
  };
  w.HTMLCollection = w.HTMLCollection || function HTMLCollection() {
  };

  // Patch element prototypes at multiple levels
  try {
    const div = document.createElement('div');
    const proto = Object.getPrototypeOf(div);
    if (proto) {
      if (!proto.hasAttributes) {
        proto.hasAttributes = function() {
          return this.attributes && this.attributes.length > 0;
        };
      }
      // Patch the parent prototype chain too
      const parentProto = Object.getPrototypeOf(proto);
      if (parentProto && !parentProto.hasAttributes) {
        parentProto.hasAttributes = function() {
          return this.attributes && this.attributes.length > 0;
        };
      }
    }
    // Also patch body directly
    if (document.body && !document.body.hasAttributes) {
      (document.body as any).hasAttributes = function() {
        return this.attributes && this.attributes.length > 0;
      };
    }
  } catch {
    // ignore
  }

  // Always require jest-axe fresh — Stencil creates a new window per test file,
  // and axe-core's IIFE captures window at load time. Using require() will
  // return the cached module (same window ref) unless we resetModules first.
  // However, resetModules breaks Stencil, so we require() and accept the
  // cached axe-core. The polyfills above ensure window.NamedNodeMap exists.
  if (!axeModule) {
    axeModule = require('jest-axe');
  }
  expect.extend(axeModule.toHaveNoViolations);

  const results = await axeModule.axe(html, {
    rules: {
      // Disable rules that are not relevant for isolated component testing
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
      'landmark-one-main': { enabled: false },
    },
  });
  expect(results).toHaveNoViolations();
}
