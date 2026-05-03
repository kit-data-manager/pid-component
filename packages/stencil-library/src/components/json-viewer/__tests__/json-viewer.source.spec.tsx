import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, h } from '@stencil/vitest';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

import '../json-viewer';

describe('json-viewer source', () => {
  it('renders with data prop as string', async () => {
    const { root } = await render(<json-viewer data='{"key":"value"}'></json-viewer>);
    expect(root).toBeTruthy();
    expect(root.tagName).toBe('JSON-VIEWER');
  });

  it('renders with data prop as object', async () => {
    const { root } = await render(<json-viewer data={{ name: 'test', count: 42 }}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with viewMode prop', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' view-mode="code"></json-viewer>);
    expect(root.viewMode).toBe('code');
  });

  it('renders with maxHeight prop', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={300}></json-viewer>);
    expect(root.maxHeight).toBe(300);
  });

  it('renders with showLineNumbers prop', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' show-line-numbers={true}></json-viewer>);
    expect(root.showLineNumbers).toBe(true);
  });

  it('renders with theme prop', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="dark"></json-viewer>);
    expect(root.theme).toBe('dark');
  });

  it('renders with invalid JSON string', async () => {
    const { root } = await render(<json-viewer data="not valid json"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with empty object', async () => {
    const { root } = await render(<json-viewer data="{}"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with empty array', async () => {
    const { root } = await render(<json-viewer data="[]"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with nested objects', async () => {
    const { root } = await render(
      <json-viewer data='{"a":{"b":{"c":1}}}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with arrays of objects', async () => {
    const { root } = await render(
      <json-viewer data='[{"id":1},{"id":2}]'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with special JSON characters', async () => {
    const { root } = await render(
      <json-viewer data='{"text":"Hello\\nWorld"}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with unicode characters', async () => {
    const { root } = await render(<json-viewer data='{"emoji":"😀"}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with large numbers', async () => {
    const { root } = await render(<json-viewer data='{"big":1e20}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with decimal numbers', async () => {
    const { root } = await render(
      <json-viewer data='{"decimal":3.14159}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with negative numbers', async () => {
    const { root } = await render(<json-viewer data='{"negative":-42}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with zero', async () => {
    const { root } = await render(<json-viewer data='{"zero":0}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with whitespace in JSON', async () => {
    const { root } = await render(
      <json-viewer data='{ "key" : "value" }'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with theme light', async () => {
    const { root } = await render(
      <json-viewer data='{"a":1}' theme="light"></json-viewer>,
    );
    expect(root.theme).toBe('light');
  });

  it('renders with theme system', async () => {
    const { root } = await render(
      <json-viewer data='{"a":1}' theme="system"></json-viewer>,
    );
    expect(root.theme).toBe('system');
  });

  it('renders host element with classes', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.className).toBeTruthy();
  });
});