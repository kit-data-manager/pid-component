/**
 * Setup file for axe-core compatibility with Stencil's mock DOM.
 *
 * This was previously configured via stencil.config.ts `testing.setupFilesAfterEnv`.
 * Now it is loaded via vitest-setup.ts. We add missing DOM constructors
 * that axe-core requires in beforeEach so they persist across all tests.
 */

import { beforeEach } from 'vitest';
import { applyAxePolyfills } from './axe-helper';

// Polyfill `self` for modules that reference it (e.g. DataCache.ts uses `'caches' in self`)
if (typeof (globalThis as any).self === 'undefined') {
  (globalThis as any).self = globalThis;
}

// Apply polyfills on EVERY test invocation to handle worker pool reuse
beforeEach(() => {
  applyAxePolyfills();

  // Polyfill HTMLTextAreaElement.select() — Stencil's mock DOM doesn't provide it,
  // but copy-button.tsx's fallback clipboard code calls it.
  try {
    const textareaProto = Object.getPrototypeOf(document.createElement('textarea'));
    if (textareaProto && !textareaProto.select) {
      textareaProto.select = function() {
      };
    }
  } catch {
    // ignore
  }
});
