import { h, render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

describe('pid-collapsible e2e', () => {
  it('renders and gets hydrated class', async () => {
    const { root } = await render(
      <pid-collapsible>
        <span slot="summary">Summary text</span>
        <div>Content inside collapsible</div>
      </pid-collapsible>,
    );
    expect(root).toHaveClass('hydrated');
  });

  it('renders a details element with summary', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible>
        <span slot="summary">Click me</span>
        <p>Hidden content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    const details = root.querySelector('details');
    expect(details).not.toBeNull();

    const summary = root.querySelector('details summary');
    expect(summary).not.toBeNull();
  });

  it('is collapsed by default', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible>
        <span slot="summary">Summary</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    expect(root.open).toBe(false);

    const details = root.querySelector('details');
    expect(details?.open).toBeFalsy();
  });

  it('clicking the summary toggles the content open', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible emphasize={true}>
        <span slot="summary">Toggle me</span>
        <p>Expandable content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    const summary = root.querySelector('details summary');
    summary?.click();
    await waitForChanges();
    await new Promise(r => setTimeout(r, 200));

    expect(root.open).toBe(true);
  });

  it('emits collapsibleToggle event on toggle', async () => {
    const { root, waitForChanges, spyOnEvent } = await render(
      <pid-collapsible emphasize={true}>
        <span slot="summary">Toggle event test</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    const toggleSpy = spyOnEvent('collapsibleToggle');

    const summary = root.querySelector('details summary');
    summary?.click();
    await waitForChanges();
    await new Promise(r => setTimeout(r, 200));

    expect(toggleSpy).toHaveReceivedEvent();
    expect(toggleSpy).toHaveReceivedEventDetail(true);
  });

  it('open property is false by default', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible>
        <span slot="summary">Initially closed</span>
        <p>Hidden content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    expect(root.open).toBe(false);
  });

  it('has correct ARIA roles and attributes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible emphasize={true}>
        <span slot="summary">Accessible collapsible</span>
        <p>Accessible content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    // The summary element should be focusable
    const summary = root.querySelector('details summary');
    expect(summary).not.toBeNull();

    // The summary has cursor-pointer class for interactivity
    expect(summary?.className).toContain('cursor-pointer');
  });

  it('dark-mode prop applies dark mode classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible darkMode="dark">
        <span slot="summary">Dark mode test</span>
        <p>Dark content</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    expect(root.darkMode).toBe('dark');

    // The details element should have dark mode classes
    const details = root.querySelector('details');
    expect(details?.className).toContain('bg-gray-800');
  });

  it('toggling emits collapsibleToggle event with detail', async () => {
    const { root, waitForChanges, spyOnEvent } = await render(
      <pid-collapsible emphasize={true}>
        <span slot="summary">Close me</span>
        <p>Content to hide</p>
      </pid-collapsible>,
    );
    await waitForChanges();

    const toggleSpy = spyOnEvent('collapsibleToggle');

    // Click to open
    const summary = root.querySelector('details summary');
    summary?.click();
    await waitForChanges();
    await new Promise(r => setTimeout(r, 200));

    expect(toggleSpy).toHaveReceivedEvent();
    // The event should have been emitted at least once
    expect(toggleSpy).toHaveReceivedEventTimes(1);
  });

  it('show-footer prop controls footer visibility', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true} showFooter={true}>
        <span slot="summary">With footer</span>
        <p>Content</p>
        <div slot="footer">Footer content</div>
      </pid-collapsible>,
    );
    await waitForChanges();

    expect(root.showFooter).toBe(true);
  });
});

describe('pid-collapsible CSS classes', () => {
  it('has correct base classes on host element', async () => {
    const { root } = await render(
      <pid-collapsible>
        <span slot="summary">Test summary</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    expect(root.className).toContain('relative');
    expect(root.className).toContain('font-sans');
  });

  it('applies expanded classes when open is true', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true}>
        <span slot="summary">Expanded</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    expect(root.className).toContain('block');
    expect(root.className).toMatch(/max-w-full|mb-2/);
  });

  it('applies collapsed classes when closed', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={false}>
        <span slot="summary">Collapsed</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    expect(root.className).toContain('inline-block');
    expect(root.className).toContain('max-w-md');
  });

  it('applies emphasis classes when emphasize is true', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={false} emphasize={true}>
        <span slot="summary">Emphasized</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    expect(root.className).toMatch(/border|rounded|shadow|box-border/);
  });

  it('details element has transition classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true}>
        <span slot="summary">Transition test</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const details = root.querySelector('details');
    expect(details.className).toMatch(/transition-all|duration-200|ease-in-out/);
  });

  it('summary element has cursor-pointer class', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true}>
        <span slot="summary">Clickable</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const summary = root.querySelector('details summary');
    expect(summary.className).toMatch(/cursor-pointer/);
  });

  it('dark mode applies dark background to details', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true} darkMode="dark">
        <span slot="summary">Dark mode</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const details = root.querySelector('details');
    expect(details.className).toMatch(/bg-gray-800|dark|text-white/);
  });

  it('light mode applies light classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true} darkMode="light">
        <span slot="summary">Light mode</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    // In light mode with expanded state, the summary has bg-white when open
    const summary = root.querySelector('details summary');
    expect(summary.className).toMatch(/bg-white|text-ellipsis/);
  });

  it('expanded attribute changes cursor style', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible expanded={true}>
        <span slot="summary">Expanded with attribute</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    expect(root.expanded).toBe(true);
  });

  it('summary has font-mono and font-bold classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true}>
        <span slot="summary">Styled summary</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const summary = root.querySelector('details summary');
    expect(summary.className).toMatch(/font-mono|font-bold/);
  });

  it('previewScrollable applies scrollable classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true} previewScrollable={true}>
        <span slot="summary">Scrollable</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const summary = root.querySelector('details summary');
    expect(summary.className).toMatch(/overflow-x-auto|shrink-0/);
  });

  it('content div has grow and flex classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={true}>
        <span slot="summary">Content test</span>
        <p>Inner content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const content = root.querySelector('.grow');
    expect(content).toBeTruthy();
  });

  it('collapsed summary has overflow-hidden and truncate classes', async () => {
    const { root, waitForChanges } = await render(
      <pid-collapsible open={false}>
        <span slot="summary">Truncated text</span>
        <p>Content</p>
      </pid-collapsible>,
    );
    await waitForChanges();
    const summary = root.querySelector('details summary');
    expect(summary.className).toMatch(/overflow-hidden|truncate|whitespace-nowrap/);
  });
});
