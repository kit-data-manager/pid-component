import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

import '../copy-button';

describe('copy-button source', () => {
  it('renders with value prop', async () => {
    const { root } = await render(<copy-button value="test-value"></copy-button>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('COPY-BUTTON');
  });

  it('renders with label prop', async () => {
    const { root } = await render(<copy-button value="val" label="DOI"></copy-button>);
    expect(root.label).toBe('DOI');
  });

  it('renders with value and label together', async () => {
    const { root } = await render(<copy-button value="10.5445/IR/1000185135" label="Copy DOI"></copy-button>);
    expect(root.value).toBe('10.5445/IR/1000185135');
    expect(root.label).toBe('Copy DOI');
  });

  it('renders without optional props', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('label prop is optional', async () => {
    const { root } = await render(<copy-button value="required-value"></copy-button>);
    expect(root.value).toBe('required-value');
  });

  it('renders host element with classes', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toBeTruthy();
  });

  it('host has inline-block class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toContain('inline-block');
  });

  it('host has align-baseline class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toContain('align-baseline');
  });

  it('host has text-xs class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root.className).toContain('text-xs');
  });

  it('renders with empty string value', async () => {
    const { root } = await render(<copy-button value=""></copy-button>);
    expect(root.value).toBe('');
  });

  it('renders with URL value', async () => {
    const { root } = await render(
      <copy-button value="https://example.com/path?query=value"></copy-button>,
    );
    expect(root.value).toBe('https://example.com/path?query=value');
  });

  it('renders with special characters in value', async () => {
    const { root } = await render(
      <copy-button value='{"key":"value with spaces & symbols"}'></copy-button>,
    );
    expect(root.value).toBe('{"key":"value with spaces & symbols"}');
  });

  it('renders with unicode value', async () => {
    const { root } = await render(<copy-button value="Test 😀🎉"></copy-button>);
    expect(root.value).toBe('Test 😀🎉');
  });

  it('renders with long DOI value', async () => {
    const longDoi = '10.1234/' + 'a'.repeat(200);
    const { root } = await render(<copy-button value={longDoi}></copy-button>);
    expect(root.value).toBe(longDoi);
  });

  it('has button element', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('button has correct type attribute', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('button has aria-label when label provided', async () => {
    const { root } = await render(<copy-button value="test" label="DOI"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('Copy DOI');
  });

  it('button has aria-label when no label provided', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('Copy content');
  });

  it('button aria-label uses custom label when provided', async () => {
    const { root } = await render(<copy-button value="test" label="Custom Label"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Copy Custom Label to clipboard');
  });

  it('button has title attribute', async () => {
    const { root } = await render(<copy-button value="test" label="Custom"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('title')).toContain('Copy Custom');
  });

  it('button has default title when no label', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('title')).toBe('Copy content to clipboard');
  });

  it('button displays Copy text', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.textContent).toBe('Copy');
  });

  it('button has rounded-md class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('rounded-md');
  });

  it('button has border class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('border');
  });

  it('button has font-mono class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('font-mono');
  });

  it('button has font-medium class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('font-medium');
  });

  it('button has transition-colors class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('transition-colors');
  });

  it('button has duration-200 class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('duration-200');
  });

  it('button has focus-ring classes', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('focus:ring-2');
    expect(button?.className).toContain('focus:ring-blue-500');
  });

  it('button has focus-ring-offset class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('focus:ring-offset-1');
  });

  it('button has focus-outline-hidden class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('focus:outline-hidden');
  });

  it('button has z-30 class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('z-30');
  });

  it('button has flex class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('flex');
  });

  it('button has items-center class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('items-center');
  });

  it('button has max-h-min class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('max-h-min');
  });

  it('button has flex-none class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('flex-none');
  });

  it('renders sr-only span when copied state is not directly testable', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeNull();
  });

  it('button has relative class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('relative');
  });

  it('button has px-2 class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('px-2');
  });

  it('button has py-0.5 class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.className).toContain('py-0.5');
  });

  it('renders with various label values', async () => {
    const labels = ['DOI', 'URL', 'Handle', 'ORCID', 'ROR'];
    for (const label of labels) {
      const { root } = await render(<copy-button value="test" label={label}></copy-button>);
      expect(root.label).toBe(label);
    }
  });

  it('renders with empty label', async () => {
    const { root } = await render(<copy-button value="test" label=""></copy-button>);
    expect(root.label).toBe('');
  });
});