/**
 * Setup file for jest-axe / axe-core compatibility with Stencil's mock DOM.
 *
 * This runs via stencil.config.ts `testing.setupFilesAfterEnv` AFTER
 * Stencil sets up its MockWindow. We add missing DOM constructors
 * that axe-core requires in beforeEach so they persist across all tests.
 */

// Apply polyfills on EVERY test invocation to handle jest worker pool reuse
beforeEach(() => {
  const w = window as any;
  if (!w.NamedNodeMap) w.NamedNodeMap = function NamedNodeMap() {
  };
  if (!w.HTMLHtmlElement) w.HTMLHtmlElement = function HTMLHtmlElement() {
  };
  if (!w.HTMLBodyElement) w.HTMLBodyElement = function HTMLBodyElement() {
  };
  if (!w.HTMLCollection) w.HTMLCollection = function HTMLCollection() {
  };

  // Patch element prototypes
  try {
    const proto = Object.getPrototypeOf(document.createElement('div'));
    if (proto && !proto.hasAttributes) {
      proto.hasAttributes = function() {
        return this.attributes && this.attributes.length > 0;
      };
    }
    const parentProto = proto ? Object.getPrototypeOf(proto) : null;
    if (parentProto && !parentProto.hasAttributes) {
      parentProto.hasAttributes = function() {
        return this.attributes && this.attributes.length > 0;
      };
    }
  } catch {
    // ignore
  }

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
