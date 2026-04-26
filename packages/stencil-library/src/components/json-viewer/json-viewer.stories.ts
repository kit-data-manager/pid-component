import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The json-viewer component provides a way to display JSON data in an interactive,
 * collapsible tree view or formatted code view.
 */
const meta: Meta = {
  title: 'Internal/JSON Viewer',
  component: 'json-viewer',
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'The JSON data to display. Can be a JSON string or a JavaScript object.',
      control: 'object',
      table: {
        type: { summary: 'string | object' },
      },
    },
    viewMode: {
      description: 'The view mode to use for displaying JSON data',
      control: {
        type: 'select',
      },
      options: ['tree', 'code'],
      table: {
        defaultValue: { summary: 'tree' },
        type: { summary: '"tree" | "code"' },
      },
    },
    maxHeight: {
      description: 'Maximum height of the viewer in pixels. Set to 0 for no limit.',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '500' },
        type: { summary: 'number' },
      },
    },
    showLineNumbers: {
      description: 'Whether to show line numbers in code view',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'true' },
        type: { summary: 'boolean' },
      },
    },
    expandAll: {
      description: 'Whether to expand all nodes in tree view initially',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    theme: {
      description: 'Theme for syntax highlighting. "system" uses the user\'s OS preference.',
      control: {
        type: 'select',
      },
      options: ['light', 'dark', 'system'],
      table: {
        defaultValue: { summary: 'system' },
        type: { summary: '"light" | "dark" | "system"' },
      },
    },
  },
  args: {
    data: {
      string: 'Hello, world!',
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: {
        a: 1,
        b: 2,
        c: 3,
        nested: {
          x: 'nested value',
          y: [4, 5, 6],
        },
      },
    },
    viewMode: 'tree',
    maxHeight: 500,
    showLineNumbers: true,
    expandAll: false,
    theme: 'light',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Shared render function: creates a json-viewer element from Storybook args
 * so that the Controls panel is interactive.
 */
function renderJsonViewer(args: Record<string, unknown>) {
  const jsonData = typeof args.data === 'object' ? JSON.stringify(args.data) : args.data;

  const jsonViewer = document.createElement('json-viewer');
  jsonViewer.setAttribute('data', jsonData as string);

  if (args.viewMode) {
    jsonViewer.setAttribute('view-mode', args.viewMode as string);
  }
  if (args.maxHeight !== undefined) {
    jsonViewer.setAttribute('max-height', String(args.maxHeight));
  }
  if (args.showLineNumbers !== undefined) {
    jsonViewer.setAttribute('show-line-numbers', String(args.showLineNumbers));
  }
  if (args.expandAll) {
    jsonViewer.setAttribute('expand-all', '');
  }
  if (args.theme) {
    jsonViewer.setAttribute('theme', args.theme as string);
  }

  const container = document.createElement('div');
  container.className = 'p-4 border rounded-sm';
  container.appendChild(jsonViewer);

  return container;
}

/**
 * Default JSON viewer with tree view
 */
export const Default: Story = {
  id: 'json-viewer-default',
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  theme="light"
  view-mode="tree"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer with all nodes expanded by default
 */
export const ExpandedByDefault: Story = {
  id: 'json-viewer-expanded-by-default',
  args: {
    expandAll: true,
  },
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  expand-all
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer with dark theme
 */
export const DarkTheme: Story = {
  id: 'json-viewer-dark-theme',
  args: {
    theme: 'dark',
  },
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  theme="dark"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer using system theme preference
 */
export const SystemTheme: Story = {
  id: 'json-viewer-system-theme',
  args: {
    theme: 'system',
  },
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42}'
  theme="system"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer in code view mode
 */
export const CodeView: Story = {
  id: 'json-viewer-code-view',
  args: {
    viewMode: 'code',
  },
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  view-mode="code"
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer with no line numbers in code view
 */
export const NoLineNumbers: Story = {
  id: 'json-viewer-no-line-numbers',
  args: {
    viewMode: 'code',
    showLineNumbers: false,
  },
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  view-mode="code"
  show-line-numbers="false"
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer with complex nested data
 */
export const ComplexData: Story = {
  id: 'json-viewer-complex-data',
  args: {
    data: {
      id: '12345',
      created: '2023-06-15T10:00:00Z',
      user: {
        id: 'user_789',
        name: 'John Smith',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
          timezone: 'America/New_York',
        },
      },
      items: [
        {
          id: 'item_1',
          name: 'Product A',
          price: 19.99,
          tags: ['electronics', 'sale'],
        },
        {
          id: 'item_2',
          name: 'Product B',
          price: 29.99,
          tags: ['home', 'new'],
        },
        {
          id: 'item_3',
          name: 'Product C',
          price: 14.99,
          tags: ['electronics', 'new'],
        },
      ],
      metadata: {
        source: 'web',
        processingTime: 125.4,
        version: '1.0.3',
      },
    },
    expandAll: true,
  },
  render: args => renderJsonViewer(args),
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"id":"12345","created":"2023-06-15T10:00:00Z","user":{"id":"user_789","name":"John Smith","email":"john@example.com","preferences":{"theme":"dark","notifications":true,"timezone":"America/New_York"}},"items":[{"id":"item_1","name":"Product A","price":19.99,"tags":["electronics","sale"]},{"id":"item_2","name":"Product B","price":29.99,"tags":["home","new"]},{"id":"item_3","name":"Product C","price":14.99,"tags":["electronics","new"]}],"metadata":{"source":"web","processingTime":125.4,"version":"1.0.3"}}'
  expand-all
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};
