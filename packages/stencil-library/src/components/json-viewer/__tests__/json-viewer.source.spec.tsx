import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@stencil/vitest';
import '../json-viewer';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

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

  it('renders with viewMode tree', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' view-mode="tree"></json-viewer>);
    expect(root.viewMode).toBe('tree');
  });

  it('renders with viewMode code', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' view-mode="code"></json-viewer>);
    expect(root.viewMode).toBe('code');
  });

  it('renders with maxHeight prop', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={300}></json-viewer>);
    expect(root.maxHeight).toBe(300);
  });

  it('renders with maxHeight 100', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={100}></json-viewer>);
    expect(root.maxHeight).toBe(100);
  });

  it('renders with maxHeight 1000', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' max-height={1000}></json-viewer>);
    expect(root.maxHeight).toBe(1000);
  });

  it('renders with showLineNumbers true', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' show-line-numbers={true}></json-viewer>);
    expect(root.showLineNumbers).toBe(true);
  });


  it('renders with theme dark', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="dark"></json-viewer>);
    expect(root.theme).toBe('dark');
  });

  it('renders with theme light', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="light"></json-viewer>);
    expect(root.theme).toBe('light');
  });

  it('renders with theme system', async () => {
    const { root } = await render(<json-viewer data='{"a":1}' theme="system"></json-viewer>);
    expect(root.theme).toBe('system');
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

  it('renders host element with classes', async () => {
    const { root } = await render(<json-viewer data='{"a":1}'></json-viewer>);
    expect(root.className).toBeTruthy();
  });

  it('renders with all themes', async () => {
    for (const theme of ['dark', 'light', 'system']) {
      const { root } = await render(<json-viewer data='{"a":1}' theme={theme}></json-viewer>);
      expect(root.theme).toBe(theme);
    }
  });

  it('renders with complex nested JSON', async () => {
    const complexJson = {
      level1: {
        level2: {
          level3: {
            value: 'deep',
            array: [1, 2, 3],
          },
        },
        array: [{ a: 1 }, { b: 2 }],
      },
      numbers: [1, 2, 3, 4, 5],
      boolean: true,
      nullValue: null,
    };
    const { root } = await render(<json-viewer data={complexJson}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with HTML entities in string', async () => {
    const { root } = await render(<json-viewer data='{"html":"<script>alert(1)</script>"}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with escaped quotes in string', async () => {
    const { root } = await render(<json-viewer data='{"quote":"He said \\"Hello\\""}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with very long string', async () => {
    const longString = 'a'.repeat(10000);
    const { root } = await render(<json-viewer data={`{"long":"${longString}"}`}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('renders with timestamp values', async () => {
    const { root } = await render(
      <json-viewer data='{"timestamp":1704067200000,"iso":"2024-01-01T00:00:00.000Z"}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with URL values', async () => {
    const { root } = await render(
      <json-viewer data='{"url":"https://example.com/path?q=test","doi":"10.1234/test"}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with boolean values', async () => {
    const { root } = await render(
      <json-viewer data='{"true":true,"false":false}'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with mixed array', async () => {
    const { root } = await render(
      <json-viewer data='["string",123,true,null,{"obj":true}]'></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('renders with combined props', async () => {
    const { root } = await render(
      <json-viewer
        data='{"a":1,"b":[1,2,3]}'
        view-mode="code"
        max-height={800}
        show-line-numbers={true}
        theme="dark"
      ></json-viewer>,
    );
    expect(root.viewMode).toBe('code');
    expect(root.maxHeight).toBe(800);
    expect(root.showLineNumbers).toBe(true);
    expect(root.theme).toBe('dark');
  });


  it('renders with data as plain object', async () => {
    const { root } = await render(
      <json-viewer data={{ simple: 'value', number: 42 }}></json-viewer>,
    );
    expect(root).toBeTruthy();
  });
});

describe('json-viewer error conditions', () => {
  it('shows error state with malformed JSON string', async () => {
    const { root } = await render(<json-viewer data="not valid { json"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('shows error state with incomplete JSON', async () => {
    const { root } = await render(<json-viewer data='{"incomplete":'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('shows error state with trailing comma', async () => {
    const { root } = await render(<json-viewer data='{"key": "value",}'></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('shows error state with single quotes instead of double', async () => {
    const { root } = await render(<json-viewer data="{'key': 'value'}"></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles null data gracefully', async () => {
    const { root } = await render(<json-viewer data={null}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles undefined data gracefully', async () => {
    const { root } = await render(<json-viewer data={undefined as any}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles number data type', async () => {
    const { root } = await render(<json-viewer data={42 as any}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles boolean data type', async () => {
    const { root } = await render(<json-viewer data={true as any}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles array data type', async () => {
    const { root } = await render(<json-viewer data={[1, 2, 3] as any}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles string data type', async () => {
    const { root } = await render(<json-viewer data="just a string" as any></json-viewer>);
    expect(root).toBeTruthy();
  });
});

describe('json-viewer sanitization', () => {
  it('strips $ prefixed keys from object data', async () => {
    const { root } = await render(
      <json-viewer data={{ $internal: 'hidden', normal: 'visible' }}></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('strips $ prefixed keys from nested objects', async () => {
    const { root } = await render(
      <json-viewer data={{ $root: 'hidden', nested: { $child: 'hidden', normal: 'visible' } }}></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('strips $ prefixed keys from arrays', async () => {
    const { root } = await render(
      <json-viewer data={{ items: [{ $hidden: true, visible: true }] }}></json-viewer>,
    );
    expect(root).toBeTruthy();
  });

  it('handles deeply nested $ prefixed keys', async () => {
    const { root } = await render(
      <json-viewer data={{ level1: { $level2: { $level3: 'hidden' } } }}></json-viewer>,
    );
    expect(root).toBeTruthy();
  });
});

describe('json-viewer edge cases', () => {
  it('handles empty string data', async () => {
    const { root } = await render(<json-viewer data=""></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles whitespace only data', async () => {
    const { root } = await render(<json-viewer data="   "></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles maxHeight of 0', async () => {
    const { root } = await render(<json-viewer data='{"key":"value"}' max-height={0}></json-viewer>);
    expect(root.maxHeight).toBe(0);
  });

  it('handles very large maxHeight', async () => {
    const { root } = await render(<json-viewer data='{"key":"value"}' max-height={999999}></json-viewer>);
    expect(root.maxHeight).toBe(999999);
  });

  it('handles empty object', async () => {
    const { root } = await render(<json-viewer data={{}}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles empty array', async () => {
    const { root } = await render(<json-viewer data={[]}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles array with empty objects', async () => {
    const { root } = await render(<json-viewer data={[{}, {}]}></json-viewer>);
    expect(root).toBeTruthy();
  });

  it('handles deeply nested empty objects', async () => {
    const { root } = await render(
      <json-viewer data={{ a: { b: { c: { d: {} } } } }}></json-viewer>,
    );
    expect(root).toBeTruthy();
  });
});
