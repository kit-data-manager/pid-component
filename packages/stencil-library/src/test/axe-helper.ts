/**
 * Helper for running axe-core accessibility tests in Stencil's mock DOM environment.
 *
 * axe-core captures `window` at load time. Stencil creates its mock window
 * before each test suite, so we must ensure the polyfills are on `window`
 * BEFORE axe-core is first loaded, and we must defer the import.
 */

import { expect } from 'vitest';

export function applyAxePolyfills() {
  const w = window as any;
  w.NamedNodeMap = w.NamedNodeMap || function NamedNodeMap() {
  };
  w.HTMLHtmlElement = w.HTMLHtmlElement || function HTMLHtmlElement() {
  };
  w.HTMLBodyElement = w.HTMLBodyElement || function HTMLBodyElement() {
  };
  w.HTMLCollection = w.HTMLCollection || function HTMLCollection() {
  };

  try {
    const div = document.createElement('div');
    const proto = Object.getPrototypeOf(div);
    if (proto) {
      if (!proto.hasAttributes) {
        proto.hasAttributes = function() {
          return this.attributes && this.attributes.length > 0;
        };
      }
      const parentProto = Object.getPrototypeOf(proto);
      if (parentProto && !parentProto.hasAttributes) {
        parentProto.hasAttributes = function() {
          return this.attributes && this.attributes.length > 0;
        };
      }
    }
    if (document.body && !document.body.hasAttributes) {
      (document.body as any).hasAttributes = function() {
        return this.attributes && this.attributes.length > 0;
      };
    }
  } catch {
    // ignore
  }
}

/**
 * Run an axe accessibility check on the given HTML string.
 *
 * @param html - The HTML string to test (typically from `page.root.outerHTML`)
 * @returns Promise that rejects if violations are found
 */
export async function checkA11y(html: string): Promise<void> {
  // Ensure polyfills are on window before axe-core loads
  applyAxePolyfills();

  // Dynamically import axe-core
  const axe = await import('axe-core');
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const results = await axe.default.run(container, {
      rules: {
        // Disable rules that are not relevant for isolated component testing
        region: { enabled: false },
        'page-has-heading-one': { enabled: false },
        'landmark-one-main': { enabled: false },
      },
    });

    expect(results.violations).toEqual([]);
  } finally {
    document.body.removeChild(container);
  }
}
