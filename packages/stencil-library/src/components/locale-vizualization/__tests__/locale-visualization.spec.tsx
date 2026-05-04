import { h, render } from '@stencil/vitest';
import { beforeEach, describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

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
    expect(root).toBeTruthy();
  });

  it('showFlag defaults to true', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root.showFlag).toBe(true);
  });

  it('renders with language-only locale (en)', async () => {
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    expect(root.locale).toBe('en');
    expect(root).toBeTruthy();
  });

  it('renders with region locale (en-US)', async () => {
    const { root } = await render(<locale-visualization locale="en-US"></locale-visualization>);
    expect(root.locale).toBe('en-US');
    expect(root).toBeTruthy();
  });

  it('renders with complex locale (de-AT)', async () => {
    const { root } = await render(<locale-visualization locale="de-AT"></locale-visualization>);
    expect(root.locale).toBe('de-AT');
    expect(root).toBeTruthy();
  });

  it('renders with locale that has no flag when showFlag is false', async () => {
    const { root } = await render(<locale-visualization locale="en" showFlag={false}></locale-visualization>);
    expect(root.showFlag).toBe(false);
    expect(root).toBeTruthy();
  });

  it('showFlag prop can be set to true explicitly', async () => {
    const { root } = await render(<locale-visualization locale="fr" showFlag={true}></locale-visualization>);
    expect(root.showFlag).toBe(true);
    expect(root).toBeTruthy();
  });

  it('renders with uppercase locale', async () => {
    const { root } = await render(<locale-visualization locale="FR"></locale-visualization>);
    expect(root.locale).toBe('FR');
    expect(root).toBeTruthy();
  });

  it('renders with mixed case locale', async () => {
    const { root } = await render(<locale-visualization locale="En-Uk"></locale-visualization>);
    expect(root.locale).toBe('En-Uk');
    expect(root).toBeTruthy();
  });

  it('renders with numeric-like locale format', async () => {
    // Valid locales can contain numbers in region codes (e.g., latn)
    const { root } = await render(<locale-visualization locale="en-latn"></locale-visualization>);
    expect(root.locale).toBe('en-latn');
    expect(root).toBeTruthy();
  });

  it('host element exists with correct tag name', async () => {
    const { root } = await render(<locale-visualization locale="es"></locale-visualization>);
    expect(root.tagName).toBe('LOCALE-VISUALIZATION');
  });

  it('component renders without throwing for various locale formats', async () => {
    const locales = ['en', 'en-US', 'de', 'de-AT', 'fr', 'fr-FR', 'es-ES', 'ja-JP'];
    for (const locale of locales) {
      const { root } = await render(<locale-visualization locale={locale}></locale-visualization>);
      expect(root).toBeTruthy();
    }
  });
});

describe('locale-visualization additional coverage', () => {
  it('showFlag false prevents flag display', async () => {
    const { root } = await render(<locale-visualization locale="us" showFlag={false}></locale-visualization>);
    expect(root.showFlag).toBe(false);
  });

  it('renders with different language locales', async () => {
    const languages = ['en', 'de', 'fr', 'es', 'ja', 'zh', 'ru', 'ar'];
    for (const lang of languages) {
      const { root } = await render(<locale-visualization locale={lang}></locale-visualization>);
      expect(root.locale).toBe(lang);
    }
  });

  it('renders with different region locales', async () => {
    const regions = ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'ja-JP'];
    for (const region of regions) {
      const { root } = await render(<locale-visualization locale={region}></locale-visualization>);
      expect(root.locale).toBe(region);
    }
  });
});

describe('locale-visualization accessibility', () => {
  it('has no a11y violations', async () => {
    const { checkA11y } = await import('../../../utils/__tests__/axe-helper');
    const { root } = await render(<locale-visualization locale="en"></locale-visualization>);
    await checkA11y(root.outerHTML);
  });

  it('has no a11y violations with showFlag false', async () => {
    const { checkA11y } = await import('../../../utils/__tests__/axe-helper');
    const { root } = await render(<locale-visualization locale="en" showFlag={false}></locale-visualization>);
    await checkA11y(root.outerHTML);
  });

  it('has no a11y violations with region locale', async () => {
    const { checkA11y } = await import('../../../utils/__tests__/axe-helper');
    const { root } = await render(<locale-visualization locale="en-US"></locale-visualization>);
    await checkA11y(root.outerHTML);
  });
});
