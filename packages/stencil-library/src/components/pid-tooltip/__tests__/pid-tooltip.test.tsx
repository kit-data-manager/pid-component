import { h, render } from '@stencil/vitest';
import { describe, expect, it } from 'vitest';
// h is the JSX factory required at runtime by TSX – do not remove
void h;

describe('pid-tooltip e2e', () => {
  it('renders and gets hydrated class', async () => {
    const { root } = await render(
      <pid-tooltip text="This is tooltip text"><span slot="trigger">Hover me</span></pid-tooltip>,
    );
    expect(root).toHaveClass('hydrated');
  });

  it('renders with text content', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Helpful information"><span slot="trigger">Info</span></pid-tooltip>,
    );
    await waitForChanges();

    expect(root.text).toBe('Helpful information');
  });

  it('tooltip trigger button exists', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Tooltip text"><span slot="trigger">Label</span></pid-tooltip>,
    );
    await waitForChanges();

    // The component renders a button for toggling the tooltip
    const button = root.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('has correct aria attributes on trigger button', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Accessible tooltip"><span slot="trigger">Label</span></pid-tooltip>,
    );
    await waitForChanges();

    const button = root.querySelector('button');
    expect(button).not.toBeNull();

    // Button should have aria-expanded
    const ariaExpanded = button?.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('false');

    // Button should have aria-controls pointing to tooltip ID
    const ariaControls = button?.getAttribute('aria-controls');
    expect(ariaControls).toBeTruthy();

    // Button should have aria-label
    const ariaLabel = button?.getAttribute('aria-label');
    expect(ariaLabel).toContain('additional information');
  });

  it('has tooltip element with role="tooltip"', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Role test"><span slot="trigger">Trigger</span></pid-tooltip>,
    );
    await waitForChanges();

    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip).not.toBeNull();
  });

  it('tooltip is hidden by default', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Hidden tooltip"><span slot="trigger">Trigger</span></pid-tooltip>,
    );
    await waitForChanges();

    const tooltip = root.querySelector('[role="tooltip"]');
    // The tooltip should have the 'hidden' class when not visible
    const classes = tooltip?.className;
    expect(classes).toContain('hidden');
  });

  it('max-width prop applies', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Width test" maxWidth="300px"><span slot="trigger">Trigger</span></pid-tooltip>,
    );
    await waitForChanges();

    expect(root.maxWidth).toBe('300px');
  });

  it('max-height prop applies', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="Height test" maxHeight="200px"><span slot="trigger">Trigger</span></pid-tooltip>,
    );
    await waitForChanges();

    expect(root.maxHeight).toBe('200px');
  });

  it('does not render button when text is empty', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text=""><span slot="trigger">No tooltip</span></pid-tooltip>,
    );
    await waitForChanges();

    const button = root.querySelector('button');
    expect(button).toBeNull();
  });

  it('tooltip id matches aria-controls on button', async () => {
    const { root, waitForChanges } = await render(
      <pid-tooltip text="ID check"><span slot="trigger">Trigger</span></pid-tooltip>,
    );
    await waitForChanges();

    const button = root.querySelector('button');
    const tooltip = root.querySelector('[role="tooltip"]');

    const ariaControls = button?.getAttribute('aria-controls');
    const tooltipId = tooltip?.getAttribute('id');
    expect(ariaControls).toBe(tooltipId);
  });

  it('position prop defaults to top', async () => {
    const { root } = await render(
      <pid-tooltip text="Position test"><span slot="trigger">Trigger</span></pid-tooltip>,
    );
    expect(root.position).toBe('top');
  });
});
