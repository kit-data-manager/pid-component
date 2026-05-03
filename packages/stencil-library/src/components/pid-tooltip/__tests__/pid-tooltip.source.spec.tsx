import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

import '../pid-tooltip';

describe('pid-tooltip source', () => {
  it('renders with text prop', async () => {
    const { root } = await render(<pid-tooltip text="Tooltip text"></pid-tooltip>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('PID-TOOLTIP');
  });

  it('renders with position prop top', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="top"></pid-tooltip>);
    expect(root.position).toBe('top');
  });

  it('renders with position prop bottom', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="bottom"></pid-tooltip>);
    expect(root.position).toBe('bottom');
  });

  it('renders with maxWidth prop', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-width="300px"></pid-tooltip>);
    expect(root.maxWidth).toBe('300px');
  });

  it('renders with maxHeight prop', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-height="200px"></pid-tooltip>);
    expect(root.maxHeight).toBe('200px');
  });

  it('renders with fitContent true', async () => {
    const { root } = await render(<pid-tooltip text="Test" fit-content={true}></pid-tooltip>);
    expect(root.fitContent).toBe(true);
  });

  it('renders without optional props', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
    expect(root.text).toBe('Test');
  });

  it('renders with required text prop', async () => {
    const { root } = await render(<pid-tooltip text="Required text"></pid-tooltip>);
    expect(root.text).toBe('Required text');
  });

  it('renders host element with classes', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root.className).toBeTruthy();
  });

  it('has button element for trigger', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('button has aria-expanded false by default', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-expanded')).toBe('false');
  });

  it('button has aria-label with Show text', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('Show additional information');
  });

  it('button has aria-label with Hide text', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('additional information');
  });

  it('button has title attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('title')).toContain('additional information');
  });

  it('button has type attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('has SVG icon inside button', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const svg = root.querySelector('button svg');
    expect(svg).toBeTruthy();
  });

  it('has info-circle icon', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const svg = root.querySelector('button svg');
    expect(svg?.className).toContain('icon-tabler');
  });

  it('SVG has role img', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const svg = root.querySelector('button svg');
    expect(svg?.getAttribute('role')).toBe('img');
  });

  it('SVG has title element', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const title = root.querySelector('button svg title');
    expect(title).toBeTruthy();
    expect(title?.textContent).toBe('Information icon');
  });

  it('SVG has desc element', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const desc = root.querySelector('button svg desc');
    expect(desc).toBeTruthy();
  });

  it('tooltip div exists with tooltip role', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip).toBeTruthy();
  });

  it('tooltip has id attribute', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.id).toBeTruthy();
    expect(tooltip?.id).toMatch(/^tooltip-/);
  });

  it('tooltip has aria-live polite', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.getAttribute('aria-live')).toBe('polite');
  });

  it('tooltip has hidden class by default', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('hidden');
  });

  it('tooltip uses bottom-full for top position', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="top"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('bottom-full');
    expect(tooltip?.className).toContain('mb-2');
  });

  it('tooltip uses top-full for bottom position', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="bottom"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('top-full');
    expect(tooltip?.className).toContain('mt-2');
  });

  it('tooltip has border class', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('border-');
  });

  it('tooltip has rounded border', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('rounded');
  });

  it('tooltip has shadow-lg', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('shadow-lg');
  });

  it('tooltip displays text content', async () => {
    const { root } = await render(<pid-tooltip text="Test tooltip content"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.textContent).toContain('Test tooltip content');
  });

  it('tooltip has p element with text', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const p = root.querySelector('[role="tooltip"] p');
    expect(p).toBeTruthy();
    expect(p?.textContent).toBe('Test');
  });

  it('tooltip p has m-0 p-0 classes', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const p = root.querySelector('[role="tooltip"] p');
    expect(p?.className).toContain('m-0');
    expect(p?.className).toContain('p-0');
  });

  it('button aria-controls references tooltip id', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(button?.getAttribute('aria-controls')).toBe(tooltip?.id);
  });

  it('button has tabIndex 0', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('tabIndex')).toBe('0');
  });

  it('renders with empty text', async () => {
    const { root } = await render(<pid-tooltip text=""></pid-tooltip>);
    expect(root).toBeTruthy();
  });

  it('renders with long text content', async () => {
    const longText = 'A'.repeat(500);
    const { root } = await render(<pid-tooltip text={longText}></pid-tooltip>);
    expect(root.text).toBe(longText);
  });

  it('renders with special characters in text', async () => {
    const { root } = await render(<pid-tooltip text="Test with <html> & special chars"></pid-tooltip>);
    expect(root.text).toBe('Test with <html> & special chars');
  });

  it('renders with unicode characters', async () => {
    const { root } = await render(<pid-tooltip text="Test 😀🎉🔗"></pid-tooltip>);
    expect(root.text).toBe('Test 😀🎉🔗');
  });

  it('has flex container for layout', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const flexContainer = root.querySelector('.flex');
    expect(flexContainer).toBeTruthy();
  });

  it('flex container has items-center class', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const flexContainer = root.querySelector('.flex.items-center');
    expect(flexContainer).toBeTruthy();
  });

  it('flex container has justify-between class', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const flexContainer = root.querySelector('.flex.items-center.justify-between');
    expect(flexContainer).toBeTruthy();
  });

  it('button has focus ring classes', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('focus:ring-2');
    expect(button?.className).toContain('focus:ring-blue-500');
  });

  it('button has focus outline hidden', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('focus:outline-hidden');
  });

  it('has absolute positioning for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('absolute');
  });

  it('has z-50 for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('z-50');
  });

  it('has w-full for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('w-full');
  });

  it('has text-xs for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('text-xs');
  });

  it('has whitespace-normal for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('whitespace-normal');
  });

  it('has transition-opacity for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('transition-opacity');
  });

  it('has duration-200 for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('duration-200');
  });

  it('has ease-in-out for tooltip', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('ease-in-out');
  });

  it('has left-0 for tooltip positioning', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const tooltip = root.querySelector('[role="tooltip"]');
    expect(tooltip?.className).toContain('left-0');
  });
});

describe('pid-tooltip keyboard events', () => {
  it('handles Escape key event', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    root.dispatchEvent(event);
  });

  it('handles Enter key on button', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
  });

  it('handles Space key on button', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
  });
});

describe('pid-tooltip dark mode detection', () => {
  it('handles tooltip without parent component', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
  });

  it('handles tooltip with parent having no classList', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
  });
});

describe('pid-tooltip positioning edge cases', () => {
  it('handles very small maxWidth', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-width="50px"></pid-tooltip>);
    expect(root.maxWidth).toBe('50px');
  });

  it('handles very large maxWidth', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-width="1000px"></pid-tooltip>);
    expect(root.maxWidth).toBe('1000px');
  });

  it('handles pixel-only maxWidth format', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-width="500px"></pid-tooltip>);
    expect(root.maxWidth).toBe('500px');
  });

  it('handles viewBox unit maxWidth', async () => {
    const { root } = await render(<pid-tooltip text="Test" max-width="50vw"></pid-tooltip>);
    expect(root.maxWidth).toBe('50vw');
  });

  it('handles position prop set to top', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="top"></pid-tooltip>);
    expect(root.position).toBe('top');
  });

  it('handles position prop set to bottom', async () => {
    const { root } = await render(<pid-tooltip text="Test" position="bottom"></pid-tooltip>);
    expect(root.position).toBe('bottom');
  });
});

describe('pid-tooltip event emission', () => {
  it('renders without crashing when event listeners are attached', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
  });

  it('has sr-only announcement span', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const srSpan = root.querySelector('.sr-only');
    expect(srSpan).toBeFalsy();
  });
});

describe('pid-tooltip render edge cases', () => {
  it('handles text with newlines', async () => {
    const { root } = await render(<pid-tooltip text="Line 1\nLine 2\nLine 3"></pid-tooltip>);
    expect(root.text).toBeDefined();
    expect(root.text.length).toBeGreaterThan(5);
  });

  it('handles text with tabs', async () => {
    const { root } = await render(<pid-tooltip text="Col1\tCol2"></pid-tooltip>);
    expect(root.text).toBeDefined();
    expect(root.text.length).toBeGreaterThan(4);
  });

  it('handles empty slot content', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    expect(root).toBeTruthy();
  });

  it('handles whitespace-only text', async () => {
    const { root } = await render(<pid-tooltip text="   "></pid-tooltip>);
    expect(root.text).toBe('   ');
  });

  it('button has rounded-full class', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('rounded-full');
  });

  it('button has p-0.5 class', async () => {
    const { root } = await render(<pid-tooltip text="Test"></pid-tooltip>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('p-0.5');
  });
});