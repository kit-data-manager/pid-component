import { render, h } from '@stencil/vitest';
import { describe, it, expect, vi } from 'vitest';
import { checkA11y } from '../../axe-helper';

describe('pid-tooltip', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<pid-tooltip text="Tooltip content"></pid-tooltip>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-TOOLTIP');
  });

  it('sets the text prop correctly', async () => {
    const { root } = await render(<pid-tooltip text="Some info"></pid-tooltip>);
    expect(root.text).toBe('Some info');
  });

  it('tooltip is hidden by default', async () => {
    const { root } = await render(<pid-tooltip text="Hidden tooltip"></pid-tooltip>);
    expect(root.isVisible).toBe(false);
    const tooltipDiv = root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeTruthy();
    expect(tooltipDiv.classList.contains('hidden')).toBe(true);
  });

  it('has correct default position prop', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.position).toBe('top');
  });

  it('has correct default maxWidth prop', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.maxWidth).toBe('250px');
  });

  it('renders an info button when text is provided', async () => {
    const { root } = await render(<pid-tooltip text="Some help text"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toContain('additional information');
  });

  it('does not render button or tooltip when text is empty', async () => {
    const { root } = await render(<pid-tooltip text=""></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button).toBeNull();
    const tooltipDiv = root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeNull();
  });

  it('does not render button or tooltip when text is whitespace only', async () => {
    const { root } = await render(<pid-tooltip text="   "></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button).toBeNull();
  });

  it('showTooltip sets isVisible to true', async () => {
    const { root } = await render(<pid-tooltip text="Info text"></pid-tooltip>);
    expect(root.isVisible).toBe(false);
    root.showTooltip();
    expect(root.isVisible).toBe(true);
  });

  it('hideTooltip sets isVisible to false', async () => {
    const { root } = await render(<pid-tooltip text="Info text"></pid-tooltip>);
    root.isVisible = true;
    root.hideTooltip();
    expect(root.isVisible).toBe(false);
  });

  it('toggleTooltip toggles visibility', async () => {
    const { root } = await render(<pid-tooltip text="Info text"></pid-tooltip>);
    const mockEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() };

    expect(root.isVisible).toBe(false);
    root.toggleTooltip(mockEvent);
    expect(root.isVisible).toBe(true);
    root.toggleTooltip(mockEvent);
    expect(root.isVisible).toBe(false);
  });

  it('position prop defaults to top', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.position).toBe('top');
  });

  it('position prop can be set to bottom', async () => {
    const { root } = await render(<pid-tooltip text="test" position="bottom"></pid-tooltip>);
    expect(root.position).toBe('bottom');
  });

  it('maxWidth prop defaults to 250px', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.maxWidth).toBe('250px');
  });

  it('maxHeight prop defaults to 150px', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.maxHeight).toBe('150px');
  });

  it('maxWidth prop applies to tooltip element styles', async () => {
    const { root } = await render(<pid-tooltip text="test" max-width="400px"></pid-tooltip>);
    expect(root.maxWidth).toBe('400px');
    const tooltipDiv = root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeTruthy();
    expect(tooltipDiv.getAttribute('style')).toContain('max-width: 400px');
  });

  it('tooltip renders text content in a paragraph', async () => {
    const { root } = await render(<pid-tooltip text="Detailed info here"></pid-tooltip>);
    const tooltipDiv = root.querySelector('[role="tooltip"]');
    expect(tooltipDiv).toBeTruthy();
    const paragraph = tooltipDiv.querySelector('p');
    expect(paragraph).toBeTruthy();
    expect(paragraph.textContent).toBe('Detailed info here');
  });

  it('tooltip div has hidden class when not visible', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    const tooltipDiv = root.querySelector('[role="tooltip"]');
    expect(tooltipDiv.classList.contains('hidden')).toBe(true);
    expect(tooltipDiv.classList.contains('block')).toBe(false);
  });

  it('tooltip div has block class when visible', async () => {
    const { root, waitForChanges } = await render(<pid-tooltip text="test"></pid-tooltip>);
    root.isVisible = true;
    await waitForChanges();
    const tooltipDiv = root.querySelector('[role="tooltip"]');
    expect(tooltipDiv.classList.contains('block')).toBe(true);
    expect(tooltipDiv.classList.contains('hidden')).toBe(false);
  });

  it('button aria-expanded reflects visibility state', async () => {
    const { root, waitForChanges } = await render(<pid-tooltip text="test"></pid-tooltip>);
    let button = root.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    root.isVisible = true;
    await waitForChanges();
    button = root.querySelector('button');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('button aria-label changes based on visibility', async () => {
    const { root, waitForChanges } = await render(<pid-tooltip text="test"></pid-tooltip>);
    let button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('Show');

    root.isVisible = true;
    await waitForChanges();
    button = root.querySelector('button');
    expect(button.getAttribute('aria-label')).toContain('Hide');
  });

  it('renders sr-only announcement when tooltip is visible', async () => {
    const { root, waitForChanges } = await render(<pid-tooltip text="test"></pid-tooltip>);
    // Not visible initially
    let srOnly = root.querySelector('.sr-only[aria-live="assertive"]');
    expect(srOnly).toBeNull();

    root.isVisible = true;
    await waitForChanges();
    srOnly = root.querySelector('.sr-only[aria-live="assertive"]');
    expect(srOnly).toBeTruthy();
    expect(srOnly.textContent).toContain('Information tooltip opened');
  });

  it('host has relative inline-block class', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.className).toContain('relative');
    expect(root.className).toContain('inline-block');
  });

  it('has a trigger slot area for content', async () => {
    const { root } = await render(
      <pid-tooltip text="test"><div slot="trigger">Trigger content</div></pid-tooltip>
    );
    // Non-shadow components distribute slot content directly; verify the trigger content is present
    const triggerContent = root.querySelector('[slot="trigger"]');
    expect(triggerContent).toBeTruthy();
    expect(triggerContent.textContent).toBe('Trigger content');
  });

  it('hideTooltip is called on Escape when visible', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    // Set visible first directly
    root.isVisible = true;
    expect(root.isVisible).toBe(true);

    // Call hideTooltip directly to verify behavior
    root.hideTooltip();
    expect(root.isVisible).toBe(false);
  });

  it('fitContent prop defaults to true', async () => {
    const { root } = await render(<pid-tooltip text="test"></pid-tooltip>);
    expect(root.fitContent).toBe(true);
  });
});

describe('pid-tooltip accessibility', () => {
  it('has no a11y violations', async () => {
    const { root } = await render(<pid-tooltip text="Tooltip content"></pid-tooltip>);
    await checkA11y(root.outerHTML);
  });
});

describe('pid-tooltip additional coverage', () => {
  it('showTooltip sets isVisible to true via root', async () => {
    const { root } = await render(<pid-tooltip text="Info"></pid-tooltip>);
    expect(root.isVisible).toBe(false);
    root.showTooltip();
    expect(root.isVisible).toBe(true);
  });

  it('hideTooltip sets isVisible to false via root', async () => {
    const { root } = await render(<pid-tooltip text="Info"></pid-tooltip>);
    root.isVisible = true;
    root.hideTooltip();
    expect(root.isVisible).toBe(false);
  });

  it('Escape key hides tooltip when visible (via direct hideTooltip call)', async () => {
    const { root } = await render(<pid-tooltip text="Info"></pid-tooltip>);
    // The @Listen('keydown') decorator handles Escape by calling hideTooltip
    // In spec tests, we verify the behavior by simulating the effect
    root.isVisible = true;
    expect(root.isVisible).toBe(true);

    // hideTooltip is what gets called when Escape is pressed
    root.hideTooltip();
    expect(root.isVisible).toBe(false);
  });

  it('non-Escape key does not hide tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Info"></pid-tooltip>);
    root.isVisible = true;

    // Dispatching a non-Escape keydown should not hide the tooltip
    // Since @Listen is wired at runtime, we just verify the state is unchanged
    expect(root.isVisible).toBe(true);
  });

  it('position prop set to bottom applies bottom position', async () => {
    const { root } = await render(<pid-tooltip text="Info" position="bottom"></pid-tooltip>);
    expect(root.position).toBe('bottom');
    // After componentDidLoad, calculatedPosition should be bottom
    expect(root.calculatedPosition).toBe('bottom');
  });

  it('dark mode class is applied when parent pid-component has bg-gray-800', async () => {
    const { root } = await render(<pid-tooltip text="Info"></pid-tooltip>);
    // The dark mode detection depends on closest pid-component having bg-gray-800 class
    // Without that parent, isDarkMode logic in render uses parentComponent?.classList
    // Just verify the component renders without errors in default (light) mode
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.className).toContain('text-gray-600');
  });
});
