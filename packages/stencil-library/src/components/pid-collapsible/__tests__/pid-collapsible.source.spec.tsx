import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

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

import '../pid-collapsible';

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

  it('renders with darkMode prop', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="dark">
        <span slot="summary">Title</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    expect(root.darkMode).toBe('dark');
  });

  it('renders with lineHeight prop', async () => {
    const { root } = await render(
      <pid-collapsible line-height={30}>
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.lineHeight).toBe(30);
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

  it('renders with initialHeight prop', async () => {
    const { root } = await render(
      <pid-collapsible initial-height="400px">
        <span slot="summary">Title</span>
      </pid-collapsible>,
    );
    expect(root.initialHeight).toBe('400px');
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
});
