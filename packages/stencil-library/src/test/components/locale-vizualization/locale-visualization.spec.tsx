import { render } from '@stencil/vitest';
import { beforeEach, describe, expect, it } from 'vitest';

// The locale-visualization component calls navigator.language.split('-')
// in its render method. In mock-doc, navigator.language is undefined.
// We must polyfill it before each test.
beforeEach(() => {
  if (typeof navigator !== 'undefined') {
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
      configurable: true,
    });
  }

  // Intl.DisplayNames may not be fully available in mock-doc;
  // provide a stub if needed
  if (typeof Intl === 'undefined' || !Intl.DisplayNames) {
    (globalThis as any).Intl = {
      ...(globalThis as any).Intl,
      DisplayNames: class {
        constructor(_locales: string[], _options: any) {
        }

        of(code: string) {
          return code;
        }
      },
    };
  }
});

describe('locale-visualization', () => {
  it('renders with locale prop', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('LOCALE-VISUALIZATION');
  });

  it('sets the locale prop correctly', async () => {
    const { root } = await render(<locale-visualization locale="de"></locale-visualization>);
    expect(root.locale).toBe('de');
  });

  it('renders without errors with a valid locale', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    // In mock-doc, non-shadow component inner content is not in the DOM.
    // Verify the component rendered without throwing.
    expect(root).toBeTruthy();
  });

  it('showFlag defaults to true', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root.showFlag).toBe(true);
  });
});

describe('locale-visualization accessibility', () => {
  it('has no a11y violations', async () => {
    const { checkA11y } = await import('../../axe-helper');
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    await checkA11y(root.outerHTML);
  });
});
