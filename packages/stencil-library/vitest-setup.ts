// Polyfill `self` before component imports (DataCache references self.caches)
if (typeof globalThis.self === 'undefined') {
  (globalThis as any).self = globalThis;
}

// Polyfill HTMLTextAreaElement.select() for Stencil's mock DOM
// (needed by copy-button.tsx's fallback clipboard code)
if (typeof HTMLTextAreaElement !== 'undefined' && !HTMLTextAreaElement.prototype.select) {
  HTMLTextAreaElement.prototype.select = function () {};
}

export {};
