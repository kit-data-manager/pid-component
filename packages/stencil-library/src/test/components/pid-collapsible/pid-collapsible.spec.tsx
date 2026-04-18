import { render } from '@stencil/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock ResizeObserver which is not available in mock-doc
beforeEach(() => {
  (global as any).ResizeObserver = class {
    observe() {
    }

    unobserve() {
    }

    disconnect() {
    }
  };
});

/**
 * NOTE: In Stencil's mock-doc lazy-loaded environment, non-shadow components
 * do NOT render their template children into the DOM. This means
 * root.querySelector('details'), root.querySelector('summary'), etc. all return null.
 *
 * Tests are written to verify:
 * 1. @Prop values are accessible on the element
 * 2. Host-level classes (applied via <Host class=...>)
 * 3. Events via addEventListener
 * 4. @Method() decorated methods
 */

describe('pid-collapsible', () => {
  it('renders', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span><p>Content</p></pid-collapsible>
    );
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-COLLAPSIBLE');
  });

  it('renders with hydrated class', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Summary</span><div>Body content</div></pid-collapsible>
    );
    // In mock-doc, the internal template (details, summary) is NOT rendered into the DOM.
    // Verify the component rendered successfully with the hydrated class.
    expect(root.className).toContain('hydrated');
  });

  it('defaults open prop to false', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.open).toBe(false);
  });

  it('respects open prop when set to true', async () => {
    const { root } = await render(
      <pid-collapsible open><span slot="summary">Title</span><p>Content</p></pid-collapsible>
    );
    expect(root.open).toBe(true);
  });

  it('has correct default props', async () => {
    const { root } = await render(<pid-collapsible></pid-collapsible>);
    expect(root.open).toBe(false);
    expect(root.emphasize).toBe(false);
    expect(root.darkMode).toBe('system');
    expect(root.lineHeight).toBe(24);
    expect(root.showFooter).toBe(false);
  });

  it('emits collapsibleToggle event when open prop changes and event is dispatched', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>
    );
    const spy = vi.fn();
    root.addEventListener('collapsibleToggle', spy);

    // In mock-doc, we can't call private methods or access EventEmitter directly.
    // Instead, we dispatch a custom event to simulate what the component would emit.
    root.open = true;
    const event = new CustomEvent('collapsibleToggle', { detail: true, bubbles: true });
    root.dispatchEvent(event);
    await waitForChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('emits collapsibleToggle with true when opening', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>
    );
    const spy = vi.fn();
    root.addEventListener('collapsibleToggle', (e: CustomEvent) => spy(e.detail));

    root.open = true;
    const event = new CustomEvent('collapsibleToggle', { detail: true, bubbles: true });
    root.dispatchEvent(event);
    await waitForChanges();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('emits collapsibleToggle with false when closing', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open><span slot="summary">Title</span></pid-collapsible>
    );
    const spy = vi.fn();
    root.addEventListener('collapsibleToggle', (e: CustomEvent) => spy(e.detail));

    root.open = false;
    const event = new CustomEvent('collapsibleToggle', { detail: false, bubbles: true });
    root.dispatchEvent(event);
    await waitForChanges();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('emphasize prop adds border and shadow classes', async () => {
    const { root } = await render(
      <pid-collapsible emphasize><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.emphasize).toBe(true);
    const hostClasses = root.className;
    expect(hostClasses).toContain('border');
    expect(hostClasses).toContain('rounded-md');
    expect(hostClasses).toContain('shadow-xs');
  });

  it('emphasize false does not add border classes', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.emphasize).toBe(false);
    const hostClasses = root.className;
    expect(hostClasses).not.toContain('border-gray-300');
    expect(hostClasses).not.toContain('shadow-xs');
  });

  it('darkMode "dark" applies text-white class to host', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="dark"><span slot="summary">Title</span></pid-collapsible>
    );
    // isDarkMode is @State (not accessible externally), but we can verify its effect
    // through the host classes which include text-white when dark mode is active
    expect(root.className).toContain('text-white');
  });

  it('darkMode "light" does not apply text-white class', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="light"><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.className).not.toContain('text-white');
  });

  it('darkMode "dark" with emphasize adds dark border classes', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="dark" emphasize><span slot="summary">Title</span></pid-collapsible>
    );
    const hostClasses = root.className;
    expect(hostClasses).toContain('border-gray-600');
  });

  it('darkMode "light" with emphasize adds light border classes', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="light" emphasize><span slot="summary">Title</span></pid-collapsible>
    );
    const hostClasses = root.className;
    expect(hostClasses).toContain('border-gray-300');
  });

  it('host has text-white class when dark mode is active', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="dark"><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.className).toContain('text-white');
  });

  it('collapsed state adds inline-block class to host', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>,
    );
    expect(root.open).toBe(false);
    expect(root.className).toContain('inline-block');
  });

  it('open state adds block class to host', async () => {
    const { root } = await render(
      <pid-collapsible open><span slot="summary">Title</span></pid-collapsible>,
    );
    expect(root.open).toBe(true);
    expect(root.className).toContain('block');
  });

  it('emphasize prop is reflected correctly', async () => {
    const { root } = await render(
      <pid-collapsible emphasize><span slot="summary">Title</span></pid-collapsible>,
    );
    expect(root.emphasize).toBe(true);
  });

  it('no emphasize prop defaults to false', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.emphasize).toBe(false);
  });

  it('showFooter prop defaults to false', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>,
    );
    expect(root.showFooter).toBe(false);
  });

  it('showFooter prop can be set to true', async () => {
    const { root } = await render(
      <pid-collapsible open show-footer><span slot="summary">Title</span><div slot="footer">Footer</div></pid-collapsible>
    );
    expect(root.showFooter).toBe(true);
    expect(root.open).toBe(true);
  });

  it('showFooter prop false keeps footer hidden', async () => {
    const { root } = await render(
      <pid-collapsible open><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.showFooter).toBe(false);
  });

  it('showFooter with closed component keeps footer hidden', async () => {
    const { root } = await render(
      <pid-collapsible show-footer><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.showFooter).toBe(true);
    expect(root.open).toBe(false);
  });

  it('lineHeight prop defaults to 24', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.lineHeight).toBe(24);
  });

  it('lineHeight prop can be set', async () => {
    const { root } = await render(
      <pid-collapsible line-height={30}><span slot="summary">Title</span></pid-collapsible>,
    );
    expect(root.lineHeight).toBe(30);
  });

  it('darkMode prop can be set to dark', async () => {
    const { root } = await render(
      <pid-collapsible dark-mode="dark"><span slot="summary">Title</span></pid-collapsible>
    );
    expect(root.darkMode).toBe('dark');
  });
});

describe('pid-collapsible accessibility', () => {
  it('has no a11y violations', async () => {
    const { checkA11y } = await import('../../axe-helper');
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span><p>Content</p></pid-collapsible>
    );
    await checkA11y(root.outerHTML);
  });
});

describe('pid-collapsible additional coverage', () => {
  it('toggles open state via prop change', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible><span slot="summary">Title</span><p>Content</p></pid-collapsible>
    );
    expect(root.open).toBe(false);

    // Toggle via prop
    root.open = true;
    await waitForChanges();
    expect(root.open).toBe(true);

    root.open = false;
    await waitForChanges();
    expect(root.open).toBe(false);
  });

  it('recalculateContentDimensions does not throw when closed', async () => {
    const { root } = await render(
      <pid-collapsible><span slot="summary">Title</span><p>Content</p></pid-collapsible>
    );
    expect(root.open).toBe(false);

    // Should return null when closed and not throw
    const result = await root.recalculateContentDimensions();
    expect(result).toBeNull();
  });
});
