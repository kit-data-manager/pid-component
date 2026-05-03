import { beforeAll } from 'vitest';

if (typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis;
}

if (typeof HTMLTextAreaElement !== 'undefined' && !HTMLTextAreaElement.prototype.select) {
  HTMLTextAreaElement.prototype.select = function() {
  };
}

if (typeof Element !== 'undefined' && !Element.prototype.getAttributeNames) {
  Element.prototype.getAttributeNames = function() {
    return Array.from(this.attributes || []).map((a: Attr) => a.name);
  };
}

(globalThis as any).__STENCIL_HYDRATED_FLAG__ = null;

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

beforeAll(async () => {
});

export {};
