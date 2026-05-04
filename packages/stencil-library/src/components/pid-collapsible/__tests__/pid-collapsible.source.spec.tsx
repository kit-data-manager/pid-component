import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@stencil/vitest';
import '../pid-collapsible';

beforeEach(() => {
  (global as any).ResizeObserver = class {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
  };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

describe('pid-collapsible source', () => {
  it('renders', async () => {
    const { root } = await render(
      <pid-collapsible>
        <span slot="summary">Title</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-COLLAPSIBLE');
  });

  it('renders with open prop', async () => {
    const { root } = await render(
      <pid-collapsible open>
        <span slot="summary">Title</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    expect(root.open).toBe(true);
  });

  it('renders with emphasize prop', async () => {
    const { root } = await render(
      <pid-collapsible emphasize>
        <span slot="summary">Title</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    expect(root.emphasize).toBe(true);
  });

  it('renders with darkMode dark', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="dark">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.darkMode).toBe('dark');
  });

  it('renders with darkMode light', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="light">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.darkMode).toBe('light');
  });

  it('renders with darkMode system', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="system">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.darkMode).toBe('system');
  });

  it('renders with lineHeight prop', async () => {
    const { root } = await render(
      <pid-collapsible line-height={30}>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.lineHeight).toBe(30);
  });

  it('renders with lineHeight 16', async () => {
    const { root } = await render(
      <pid-collapsible line-height={16}>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.lineHeight).toBe(16);
  });

  it('renders with lineHeight 48', async () => {
    const { root } = await render(
      <pid-collapsible line-height={48}>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.lineHeight).toBe(48);
  });

  it('renders with showFooter prop', async () => {
    const { root } = await render(
      <pid-collapsible show-footer>
        <span slot="summary">Title</span>
        <div slot="footer">Footer</div>
      </pid-collapsible>,
    );
    expect(root.showFooter).toBe(true);
  });

  it('renders with expanded prop', async () => {
    const { root } = await render(
      <pid-collapsible expanded>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.expanded).toBe(true);
  });

  it('renders with previewScrollable prop', async () => {
    const { root } = await render(
      <pid-collapsible preview-scrollable>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.previewScrollable).toBe(true);
  });

  it('renders with initialWidth prop', async () => {
    const { root } = await render(
      <pid-collapsible initial-width="600px">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialWidth).toBe('600px');
  });

  it('renders with initialWidth 800px', async () => {
    const { root } = await render(
      <pid-collapsible initial-width="800px">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialWidth).toBe('800px');
  });

  it('renders with initialWidth 50%', async () => {
    const { root } = await render(
      <pid-collapsible initial-width="50%">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialWidth).toBe('50%');
  });

  it('renders with initialHeight prop', async () => {
    const { root } = await render(
      <pid-collapsible initial-height="400px">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialHeight).toBe('400px');
  });

  it('renders with initialHeight 600px', async () => {
    const { root } = await render(
      <pid-collapsible initial-height="600px">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialHeight).toBe('600px');
  });

  it('renders with initialHeight 50vh', async () => {
    const { root } = await render(
      <pid-collapsible initial-height="50vh">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialHeight).toBe('50vh');
  });

  it('renders with slot content', async () => {
    const { root } = await render(
      <pid-collapsible>
        <span slot="summary">Custom Summary</span>
        <div>Custom Content</div>
        <span slot="footer">Custom Footer</span>
      </pid-collapsible>,
    );
    expect(root).toBeTruthy();
  });

  it('renders host element with classes', async () => {
    const { root } = await render(
      <pid-collapsible>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.className).toBeTruthy();
  });

  it('renders with all dark mode values', async () => {
    const { root: root1 } = await render(
      <pid-collapsible dark-mode="light">
        <span slot="summary">Light</span>
      </pid-collapsible>,
    );
    expect(root1.darkMode).toBe('light');

    const { root: root2 } = await render(
      <pid-collapsible dark-mode="dark">
        <span slot="summary">Dark</span>
      </pid-collapsible>,
    );
    expect(root2.darkMode).toBe('dark');

    const { root: root3 } = await render(
      <pid-collapsible dark-mode="system">
        <span slot="summary">System</span>
      </pid-collapsible>,
    );
    expect(root3.darkMode).toBe('system');
  });

  it('renders with different line height values', async () => {
    const { root: root1 } = await render(
      <pid-collapsible line-height={16}>
        <span slot="summary">Small</span>
      </pid-collapsible>,
    );
    expect(root1.lineHeight).toBe(16);

    const { root: root2 } = await render(
      <pid-collapsible line-height={32}>
        <span slot="summary">Large</span>
      </pid-collapsible>,
    );
    expect(root2.lineHeight).toBe(32);
  });

  it('renders with all boolean props true', async () => {
    const { root } = await render(
      <pid-collapsible open emphasize show-footer expanded preview-scrollable>
        <span slot="summary">Title</span>
        <div slot="footer">Footer</div>
      </pid-collapsible>,
    );
    expect(root.open).toBe(true);
    expect(root.emphasize).toBe(true);
    expect(root.showFooter).toBe(true);
    expect(root.expanded).toBe(true);
    expect(root.previewScrollable).toBe(true);
  });

  it('renders with combined props', async () => {
    const { root } = await render(
      <pid-collapsible
        open
        emphasize
        dark-mode="dark"
        initial-width="700px"
        initial-height="500px"
        line-height={32}
        show-footer
      >
        <span slot="summary">Title</span>
        <div slot="footer">Footer</div>
      </pid-collapsible>,
    );
    expect(root.open).toBe(true);
    expect(root.emphasize).toBe(true);
    expect(root.darkMode).toBe('dark');
    expect(root.initialWidth).toBe('700px');
    expect(root.initialHeight).toBe('500px');
    expect(root.lineHeight).toBe(32);
    expect(root.showFooter).toBe(true);
  });

  it('renders with multiple prop variations', async () => {
    const variants = [
      { darkMode: 'dark', lineHeight: 20 },
      { darkMode: 'light', lineHeight: 28 },
      { darkMode: 'system', lineHeight: 36 },
    ];
    for (const variant of variants) {
      const { root } = await render(
        <pid-collapsible dark-mode={variant.darkMode} line-height={variant.lineHeight}>
          <span slot="summary">Title</span>
        </pid-collapsible>,
      );
      expect(root.darkMode).toBe(variant.darkMode);
      expect(root.lineHeight).toBe(variant.lineHeight);
    }
  });

  it('renders with different width values', async () => {
    const widths = ['300px', '400px', '500px', '600px', '700px', '800px', '100%'];
    for (const width of widths) {
      const { root } = await render(
        <pid-collapsible initial-width={width}>
          <span slot="summary">Title</span>
        </pid-collapsible>,
      );
      expect(root.initialWidth).toBe(width);
    }
  });

  it('renders with different height values', async () => {
    const heights = ['200px', '300px', '400px', '500px', '600px', '50vh', '80vh'];
    for (const height of heights) {
      const { root } = await render(
        <pid-collapsible initial-height={height}>
          <span slot="summary">Title</span>
        </pid-collapsible>,
      );
      expect(root.initialHeight).toBe(height);
    }
  });

  it('renders with nested content', async () => {
    const { root } = await render(
      <pid-collapsible>
        <span slot="summary">Parent Summary</span>
        <div>
          <pid-collapsible>
            <span slot="summary">Child Summary</span>
            <p>Child Content</p>
          </pid-collapsible>
        </div>
      </pid-collapsible>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with large lineHeight values', async () => {
    const { root } = await render(
      <pid-collapsible line-height={72}>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.lineHeight).toBe(72);
  });

  it('renders with small lineHeight values', async () => {
    const { root } = await render(
      <pid-collapsible line-height={8}>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.lineHeight).toBe(8);
  });
});
