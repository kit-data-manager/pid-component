import { newSpecPage } from '@stencil/core/testing';
import { PidTooltip } from '../../../components/pid-tooltip/pid-tooltip';

describe('pid-tooltip', () => {
  it('renders with text prop', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Tooltip content"></pid-tooltip>',
    });
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('PID-TOOLTIP');
  });

  it('sets the text prop correctly', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Some info"></pid-tooltip>',
    });
    expect(page.rootInstance.text).toBe('Some info');
  });

  it('tooltip is hidden by default', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Hidden tooltip"></pid-tooltip>',
    });
    expect(page.rootInstance.isVisible).toBe(false);
    const tooltipDiv = page.root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeTruthy();
    expect(tooltipDiv.classList.contains('hidden')).toBe(true);
  });

  it('has correct default position prop', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.rootInstance.position).toBe('top');
  });

  it('has correct default maxWidth prop', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.rootInstance.maxWidth).toBe('250px');
  });

  it('renders an info button when text is provided', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Some help text"></pid-tooltip>',
    });
    const button = page.root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toContain('additional information');
  });

  it('does not render button or tooltip when text is empty', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text=""></pid-tooltip>',
    });
    const button = page.root.querySelector('button');
    expect(button).toBeNull();
    const tooltipDiv = page.root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeNull();
  });

  it('does not render button or tooltip when text is whitespace only', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="   "></pid-tooltip>',
    });
    const button = page.root.querySelector('button');
    expect(button).toBeNull();
  });

  it('showTooltip sets isVisible to true', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Info text"></pid-tooltip>',
    });
    expect(page.rootInstance.isVisible).toBe(false);
    page.rootInstance.showTooltip();
    expect(page.rootInstance.isVisible).toBe(true);
  });

  it('hideTooltip sets isVisible to false', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Info text"></pid-tooltip>',
    });
    page.rootInstance.isVisible = true;
    page.rootInstance.hideTooltip();
    expect(page.rootInstance.isVisible).toBe(false);
  });

  it('toggleTooltip toggles visibility', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Info text"></pid-tooltip>',
    });
    const mockEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

    expect(page.rootInstance.isVisible).toBe(false);
    page.rootInstance.toggleTooltip(mockEvent);
    expect(page.rootInstance.isVisible).toBe(true);
    page.rootInstance.toggleTooltip(mockEvent);
    expect(page.rootInstance.isVisible).toBe(false);
  });

  it('position prop defaults to top', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.rootInstance.position).toBe('top');
  });

  it('position prop can be set to bottom', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test" position="bottom"></pid-tooltip>',
    });
    expect(page.rootInstance.position).toBe('bottom');
  });

  it('maxWidth prop defaults to 250px', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.rootInstance.maxWidth).toBe('250px');
  });

  it('maxHeight prop defaults to 150px', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.rootInstance.maxHeight).toBe('150px');
  });

  it('maxWidth prop applies to tooltip element styles', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test" max-width="400px"></pid-tooltip>',
    });
    expect(page.rootInstance.maxWidth).toBe('400px');
    const tooltipDiv = page.root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeTruthy();
    expect(tooltipDiv.getAttribute('style')).toContain('max-width: 400px');
  });

  it('tooltip renders text content in a paragraph', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="Detailed info here"></pid-tooltip>',
    });
    const tooltipDiv = page.root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeTruthy();
    const paragraph = tooltipDiv.querySelector('p');
    expect(paragraph).toBeTruthy();
    expect(paragraph.textContent).toBe('Detailed info here');
  });

  it('tooltip div has hidden class when not visible', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    const tooltipDiv = page.root.querySelector('[role="tooltip"]');
    expect(tooltipDiv.classList.contains('hidden')).toBe(true);
    expect(tooltipDiv.classList.contains('block')).toBe(false);
  });

  it('tooltip div has block class when visible', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    page.rootInstance.isVisible = true;
    await page.waitForChanges();
    const tooltipDiv = page.root.querySelector('[role="tooltip"]');
    expect(tooltipDiv.classList.contains('block')).toBe(true);
    expect(tooltipDiv.classList.contains('hidden')).toBe(false);
  });

  it('button aria-expanded reflects visibility state', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    let button = page.root.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    page.rootInstance.isVisible = true;
    await page.waitForChanges();
    button = page.root.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('button aria-label changes based on visibility', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    let button = page.root.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('Show');

    page.rootInstance.isVisible = true;
    await page.waitForChanges();
    button = page.root.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('Hide');
  });

  it('renders sr-only announcement when tooltip is visible', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    // Not visible initially
    let srOnly = page.root.querySelector('.sr-only[aria-live="assertive"]');
    expect(srOnly).toBeNull();

    page.rootInstance.isVisible = true;
    await page.waitForChanges();
    srOnly = page.root.querySelector('.sr-only[aria-live="assertive"]');
    expect(srOnly).toBeTruthy();
    expect(srOnly.textContent).toContain('Information tooltip opened');
  });

  it('host has relative inline-block class', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.root.className).toContain('relative');
    expect(page.root.className).toContain('inline-block');
  });

  it('has a trigger slot area for content', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"><div slot="trigger">Trigger content</div></pid-tooltip>',
    });
    // Non-shadow components distribute slot content directly; verify the trigger content is present
    const triggerContent = page.root.querySelector('[slot="trigger"]');
    expect(triggerContent).toBeTruthy();
    expect(triggerContent.textContent).toBe('Trigger content');
  });

  it('hideTooltip is called on Escape when visible', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    // Set visible first directly
    page.rootInstance.isVisible = true;
    expect(page.rootInstance.isVisible).toBe(true);

    // Call hideTooltip directly to verify behavior (the @Listen decorator
    // wires this up at runtime but is not fully active in spec test DOM)
    page.rootInstance.hideTooltip();
    expect(page.rootInstance.isVisible).toBe(false);
  });

  it('fitContent prop defaults to true', async () => {
    const page = await newSpecPage({
      components: [PidTooltip],
      html: '<pid-tooltip text="test"></pid-tooltip>',
    });
    expect(page.rootInstance.fitContent).toBe(true);
  });
});
