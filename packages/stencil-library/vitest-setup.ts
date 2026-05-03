import { beforeAll } from 'vitest';

// Polyfill `self` before component imports (DataCache references self.caches)
if (typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis;
}

// Polyfill HTMLTextAreaElement.select() for Stencil's mock DOM
// (needed by copy-button.tsx's fallback clipboard code)
if (typeof HTMLTextAreaElement !== 'undefined' && !HTMLTextAreaElement.prototype.select) {
  HTMLTextAreaElement.prototype.select = function () {};
}

// Polyfill Element.prototype.getAttributeNames() for Stencil's mock-doc
// (needed by Chai's inspectHTML when formatting assertion diffs with DOM elements)
if (typeof Element !== 'undefined' && !Element.prototype.getAttributeNames) {
  Element.prototype.getAttributeNames = function() {
    return Array.from(this.attributes || []).map((a: Attr) => a.name);
  };
}

// Disable the hydration class check in @stencil/vitest's render().
// Stencil's mock-doc does not apply the 'hydrated' CSS class, causing
// waitForHydrated() to poll for the full 5 s timeout on every render() call.
// The render.js code checks `typeof __STENCIL_HYDRATED_FLAG__ !== 'undefined'`
// so we need to make it a true global variable.
(globalThis as any).__STENCIL_HYDRATED_FLAG__ = null;

// Polyfill Node type constants on the document object for axe-core.
// axe-core checks `node.nodeType === document.ELEMENT_NODE` but mock-doc's
// document does not expose these constants, causing _getFlattenedTree to fail.
if (typeof document !== 'undefined' && document.ELEMENT_NODE === undefined) {
  const nodeTypes: Record<string, number> = {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
  };
  for (const [key, value] of Object.entries(nodeTypes)) {
    if ((document as any)[key] === undefined) {
      (document as any)[key] = value;
    }
  }
}

// Import the pre-built Stencil loader to register all components via
// bootstrapLazy(). The stencil-test CLI builds components before running
// tests, so the dist/ output is available. Without this import, custom
// elements are never defined and render() produces bare HTML elements
// with no component behavior.
beforeAll(async () => {
  await import('./dist/pid-component/pid-component.esm.js');
});

export {};
