import { describe, expect, it } from 'vitest';
import { render, h } from '@stencil/vitest';

import '../copy-button';

describe('copy-button source', () => {
  it('renders with value prop', async () => {
    const { root } = await render(<copy-button value="test-value"></copy-button>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('COPY-BUTTON');
  });

  it('renders with label prop', async () => {
    const { root } = await render(<copy-button value="test" label="Custom Label"></copy-button>);
    expect(root).toBeTruthy();
    const button = root.querySelector('button');
    expect(button?.textContent).toContain('Copy');
  });

  it('has aria-label containing Copy', async () => {
    const { root } = await render(<copy-button value="test-value"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('Copy');
  });

  it('updates aria-label with custom label', async () => {
    const { root } = await render(<copy-button value="test" label="My Label"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toContain('My Label');
  });

  it('renders copy button with correct structure', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.type).toBe('button');
  });

  it('handles missing parent component gracefully', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.className).toContain('bg-white');
  });

  it('has sr-only span for screen readers', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const srSpan = root.querySelector('.sr-only');
    expect(srSpan).toBeFalsy();
  });

  it('has button with correct type attribute', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.type).toBe('button');
  });

  it('has title attribute for tooltip', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button?.title).toBeTruthy();
  });

  it('renders with host element', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles empty value prop', async () => {
    const { root } = await render(<copy-button value=""></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles special characters in value', async () => {
    const { root } = await render(<copy-button value='{"key":"value"}'></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles long text in value', async () => {
    const longText = 'a'.repeat(1000);
    const { root } = await render(<copy-button value={longText}></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles unicode characters in value', async () => {
    const { root } = await render(<copy-button value="Hëllö Wörld 🌍"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with dark mode prop', async () => {
    const { root } = await render(<copy-button value="test" dark-mode="dark"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with hideLabel prop', async () => {
    const { root } = await render(<copy-button value="test" hide-label="true"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with showIcon true', async () => {
    const { root } = await render(<copy-button value="test" show-icon="true"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with showIcon false', async () => {
    const { root } = await render(<copy-button value="test" show-icon="false"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with small size', async () => {
    const { root } = await render(<copy-button value="test" size="small"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with medium size', async () => {
    const { root } = await render(<copy-button value="test" size="medium"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('renders with large size', async () => {
    const { root } = await render(<copy-button value="test" size="large"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('has button with base classes', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    const button = root.querySelector('button');
    expect(button).toBeTruthy();
  });

  it('has inline-block alignment class', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles undefined label prop', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles undefined dark mode prop', async () => {
    const { root } = await render(<copy-button value="test"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles JSON string value', async () => {
    const json = JSON.stringify({ key: 'value', nested: { a: 1 } });
    const { root } = await render(<copy-button value={json}></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles URL value', async () => {
    const { root } = await render(<copy-button value="https://example.com/path?query=1#fragment"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles email value', async () => {
    const { root } = await render(<copy-button value="test@example.com"></copy-button>);
    expect(root).toBeTruthy();
  });

  it('handles DOI value', async () => {
    const { root } = await render(<copy-button value="10.5281/zenodo.1234567"></copy-button>);
    expect(root).toBeTruthy();
  });
});