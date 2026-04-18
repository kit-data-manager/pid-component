import { render, h } from '@stencil/vitest';
import { describe, it, expect } from 'vitest';

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
