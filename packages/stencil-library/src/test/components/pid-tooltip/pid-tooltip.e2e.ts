import { newE2EPage } from '@stencil/core/testing';

describe('pid-tooltip e2e', () => {
  it('renders and gets hydrated class', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="This is tooltip text"><span slot="trigger">Hover me</span></pid-tooltip>',
    );
    const element = await page.find('pid-tooltip');
    expect(element).toHaveClass('hydrated');
  });

  it('renders with text content', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Helpful information"><span slot="trigger">Info</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const element = await page.find('pid-tooltip');
    expect(await element.getProperty('text')).toBe('Helpful information');
  });

  it('tooltip trigger button exists', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Tooltip text"><span slot="trigger">Label</span></pid-tooltip>',
    );
    await page.waitForChanges();

    // The component renders a button for toggling the tooltip
    const button = await page.find('pid-tooltip button');
    expect(button).not.toBeNull();
    expect(button.getAttribute('type')).toBe('button');
  });

  it('has correct aria attributes on trigger button', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Accessible tooltip"><span slot="trigger">Label</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const button = await page.find('pid-tooltip button');
    expect(button).not.toBeNull();

    // Button should have aria-expanded
    const ariaExpanded = button.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('false');

    // Button should have aria-controls pointing to tooltip ID
    const ariaControls = button.getAttribute('aria-controls');
    expect(ariaControls).toBeTruthy();

    // Button should have aria-label
    const ariaLabel = button.getAttribute('aria-label');
    expect(ariaLabel).toContain('additional information');
  });

  it('has tooltip element with role="tooltip"', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Role test"><span slot="trigger">Trigger</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const tooltip = await page.find('pid-tooltip [role="tooltip"]');
    expect(tooltip).not.toBeNull();
  });

  it('tooltip is hidden by default', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Hidden tooltip"><span slot="trigger">Trigger</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const tooltip = await page.find('pid-tooltip [role="tooltip"]');
    // The tooltip should have the 'hidden' class when not visible
    const classes = tooltip.className;
    expect(classes).toContain('hidden');
  });

  it('max-width prop applies', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Width test" max-width="300px"><span slot="trigger">Trigger</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const element = await page.find('pid-tooltip');
    expect(await element.getProperty('maxWidth')).toBe('300px');
  });

  it('max-height prop applies', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Height test" max-height="200px"><span slot="trigger">Trigger</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const element = await page.find('pid-tooltip');
    expect(await element.getProperty('maxHeight')).toBe('200px');
  });

  it('does not render button when text is empty', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text=""><span slot="trigger">No tooltip</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const button = await page.find('pid-tooltip button');
    expect(button).toBeNull();
  });

  it('tooltip id matches aria-controls on button', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="ID check"><span slot="trigger">Trigger</span></pid-tooltip>',
    );
    await page.waitForChanges();

    const button = await page.find('pid-tooltip button');
    const tooltip = await page.find('pid-tooltip [role="tooltip"]');

    const ariaControls = button.getAttribute('aria-controls');
    const tooltipId = tooltip.getAttribute('id');
    expect(ariaControls).toBe(tooltipId);
  });

  it('position prop defaults to top', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<pid-tooltip text="Position test"><span slot="trigger">Trigger</span></pid-tooltip>',
    );
    const element = await page.find('pid-tooltip');
    expect(await element.getProperty('position')).toBe('top');
  });
});
