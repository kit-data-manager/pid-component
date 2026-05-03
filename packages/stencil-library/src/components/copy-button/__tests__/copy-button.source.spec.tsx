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

  it('has button element', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
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

  it('button has type attribute', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('button has title attribute', async () => {
    const { root } = await render(<copy-button value="test" label="Custom"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('title')).toContain('Copy Custom');
  });

  it('renders sr-only span when copied state is not directly testable', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const srOnly = root.querySelector('.sr-only');
    expect(srOnly).toBeNull();
  });
});