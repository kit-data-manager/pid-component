import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The json-viewer component provides a way to display JSON data in an interactive,
 * collapsible tree view or formatted code view.
 */
const meta: Meta = {
  title: 'Components/JSON Viewer',
  component: 'json-viewer',
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'The JSON data to display (string or object)',
      control: 'object',
      table: {
        type: { summary: 'string | object' },
      },
    },
    expanded: {
      description: 'Whether all nodes should be expanded by default',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    rootName: {
      description: 'The name of the root node',
      control: { type: 'text' },
      table: {
        defaultValue: { summary: 'root' },
        type: { summary: 'string' },
      },
    },
    sortKeys: {
      description: 'Whether to sort object keys alphabetically',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    theme: {
      description: 'The color theme to use',
      control: {
        type: 'select',
        options: ['light', 'dark'],
      },
      table: {
        defaultValue: { summary: 'light' },
        type: { summary: 'string' },
      },
    },
    viewMode: {
      description: 'The view mode to use (tree or code)',
      control: {
        type: 'select',
        options: ['tree', 'code'],
      },
      table: {
        defaultValue: { summary: 'tree' },
        type: { summary: 'string' },
      },
    },
    maxHeight: {
      description: 'Maximum height of the viewer in pixels',
      control: { type: 'number' },
      table: {
        type: { summary: 'number' },
      },
    },
    expandAll: {
      description: 'Whether to expand all nodes (alternative to expanded)',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
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
    expanded: false,
    rootName: 'root',
    sortKeys: false,
    theme: 'light',
    viewMode: 'tree',
    maxHeight: 500,
    expandAll: false,
    showLineNumbers: true,
  },
};

export default meta;
type Story = StoryObj;

/**
 * Default JSON viewer with tree view
 */
export const Default: Story = {
  render: args => {
    // Convert object to string if needed
    const jsonData = typeof args.data === 'object' ? JSON.stringify(args.data) : args.data;

    // Create the element
    const jsonViewer = document.createElement('json-viewer');
    jsonViewer.setAttribute('data', jsonData);

    if (args.expanded) {
      jsonViewer.setAttribute('expanded', '');
    }

    if (args.rootName) {
      jsonViewer.setAttribute('root-name', args.rootName);
    }

    if (args.sortKeys) {
      jsonViewer.setAttribute('sort-keys', '');
    }

    if (args.theme) {
      jsonViewer.setAttribute('theme', args.theme);
    }

    if (args.viewMode) {
      jsonViewer.setAttribute('view-mode', args.viewMode);
    }

    if (args.maxHeight) {
      jsonViewer.setAttribute('max-height', args.maxHeight.toString());
    }

    if (args.expandAll) {
      jsonViewer.setAttribute('expand-all', '');
    }

    if (args.showLineNumbers !== undefined) {
      jsonViewer.setAttribute('show-line-numbers', args.showLineNumbers.toString());
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'p-4 border rounded';
    container.appendChild(jsonViewer);

    return container;
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  root-name="root"
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
  args: {
    expanded: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  expanded
  root-name="root"
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer with a custom root name
 */
export const CustomRootName: Story = {
  args: {
    rootName: 'config',
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  root-name="config"
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};

/**
 * JSON viewer with keys sorted alphabetically
 */
export const SortedKeys: Story = {
  args: {
    sortKeys: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  sort-keys
  root-name="root"
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
  args: {
    theme: 'dark',
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  theme="dark"
  root-name="root"
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
  args: {
    viewMode: 'code',
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  view-mode="code"
  theme="light"
  root-name="root"
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
  args: {
    viewMode: 'code',
    showLineNumbers: false,
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"string":"Hello, world!","number":42,"boolean":true,"null":null,"array":[1,2,3],"object":{"a":1,"b":2,"c":3,"nested":{"x":"nested value","y":[4,5,6]}}}'
  view-mode="code"
  show-line-numbers="false"
  theme="light"
  root-name="root"
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
    expanded: true,
    rootName: 'order',
  },
  parameters: {
    docs: {
      source: {
        code: `
<json-viewer
  data='{"id":"12345","created":"2023-06-15T10:00:00Z","user":{"id":"user_789","name":"John Smith","email":"john@example.com","preferences":{"theme":"dark","notifications":true,"timezone":"America/New_York"}},"items":[{"id":"item_1","name":"Product A","price":19.99,"tags":["electronics","sale"]},{"id":"item_2","name":"Product B","price":29.99,"tags":["home","new"]},{"id":"item_3","name":"Product C","price":14.99,"tags":["electronics","new"]}],"metadata":{"source":"web","processingTime":125.4,"version":"1.0.3"}}'
  expanded
  root-name="order"
  theme="light"
></json-viewer>
        `,
      },
    },
  },
};
