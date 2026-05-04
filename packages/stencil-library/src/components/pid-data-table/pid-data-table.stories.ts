import { Meta, StoryObj } from '@storybook/web-components-vite';
import { FoldableItem } from '../../utils/FoldableItem';

// Create mock data items
const createMockItems = (count: number): FoldableItem[] => {
  return Array.from({ length: count }, (_, i) => {
    // Create FoldableItem with proper constructor arguments
    return new FoldableItem(
      i, // priority
      `Property ${i + 1}`, // keyTitle
      `Value for property ${i + 1}. This is a sample value that demonstrates the content.`, // value
      `Tooltip for Property ${i + 1}`, // keyTooltip
      `https://example.com/property/${i + 1}`, // keyLink
      undefined, // valueRegex
      false, // renderDynamically
    );
  });
};

/**
 * The pid-data-table component displays a paginated table of key-value items,
 * with optional subcomponent rendering for nested identifiers.
 */
const meta: Meta = {
  title: 'Internal/Data Table',
  component: 'pid-data-table',
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of items to display in the table. Each item has a key (title) and a value.',
      control: 'object',
      table: {
        type: {
          summary: 'FoldableItem[]',
        },
        defaultValue: {
          summary: '[]',
        },
      },
    },
    itemsPerPage: {
      description: 'Number of items to show per page',
      control: {
        type: 'number',
        min: 1,
      },
      table: {
        defaultValue: {
          summary: '10',
        },
        type: {
          summary: 'number',
        },
      },
    },
    currentPage: {
      description: 'Current page (0-based index)',
      control: {
        type: 'number',
        min: 0,
      },
      table: {
        defaultValue: {
          summary: '0',
        },
        type: {
          summary: 'number',
        },
      },
    },
    pageSizes: {
      description: 'Available page sizes shown in the items-per-page dropdown',
      control: {
        type: 'object',
      },
      table: {
        defaultValue: {
          summary: '[5, 10, 25, 50, 100]',
        },
        type: {
          summary: 'number[]',
        },
      },
    },
    loadSubcomponents: {
      description: 'Whether to load and render subcomponents for values that are recognized identifiers',
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: 'false',
        },
        type: {
          summary: 'boolean',
        },
      },
    },
    hideSubcomponents: {
      description: 'Whether to completely hide subcomponents regardless of nesting level',
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: 'false',
        },
        type: {
          summary: 'boolean',
        },
      },
    },
    currentLevelOfSubcomponents: {
      description: 'Current nesting depth of subcomponents (used internally for recursion tracking)',
      control: {
        type: 'number',
        min: 0,
      },
      table: {
        defaultValue: {
          summary: '0',
        },
        type: {
          summary: 'number',
        },
      },
    },
    levelOfSubcomponents: {
      description: 'Maximum allowed nesting depth for subcomponents',
      control: {
        type: 'number',
        min: 0,
      },
      table: {
        defaultValue: {
          summary: '1',
        },
        type: {
          summary: 'number',
        },
      },
    },
    settings: {
      description: 'Stringified JSON settings to pass to subcomponents (e.g. citation style, TTL)',
      control: {
        type: 'text',
      },
      table: {
        defaultValue: {
          summary: '[]',
        },
        type: {
          summary: 'string',
        },
      },
    },
    darkMode: {
      description: 'The dark mode setting for the component',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        type: { summary: '"light" | "dark" | "system"' },
        defaultValue: { summary: 'system' },
      },
    },
  },
  args: {
    items: createMockItems(25),
    itemsPerPage: 10,
    currentPage: 0,
    pageSizes: [5, 10, 25, 50, 100],
    loadSubcomponents: false,
    hideSubcomponents: false,
    currentLevelOfSubcomponents: 0,
    levelOfSubcomponents: 1,
    settings: '[]',
    darkMode: 'light',
  },
  parameters: {
    actions: {
      handles: ['pageChange', 'itemsPerPageChange'],
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Shared render function: creates a pid-data-table element from Storybook args
 * so that the Controls panel is interactive.
 */
function renderDataTable(args: Record<string, unknown>) {
  const dataTable = document.createElement('pid-data-table') as HTMLElement & {
    items: FoldableItem[];
    [key: string]: unknown;
  };

  // Apply all properties from args
  Object.entries(args).forEach(([key, value]) => {
    if (key === 'items') {
      dataTable.items = value as FoldableItem[];
    } else if (key === 'pageSizes') {
      (dataTable as unknown as { pageSizes: number[] }).pageSizes = value as number[];
    } else {
      dataTable[key] = value;
    }
  });

  const container = document.createElement('div');
  container.className = 'p-4 max-w-3xl';
  container.appendChild(dataTable);

  return container;
}

/**
 * Default data table with 25 items and 10 items per page
 */
export const Default: Story = {
  id: 'data-table-default',
  render: args => renderDataTable(args),
};

/**
 * Data table with a smaller page size of 5
 */
export const SmallPageSize: Story = {
  id: 'data-table-small-page-size',
  args: {
    itemsPerPage: 5,
  },
  render: args => renderDataTable(args),
};

/**
 * Data table showing all 25 items on a single page
 */
export const LargePageSize: Story = {
  id: 'data-table-large-page-size',
  args: {
    itemsPerPage: 25,
  },
  render: args => renderDataTable(args),
};

/**
 * Data table with subcomponent loading enabled
 */
export const WithSubcomponents: Story = {
  id: 'data-table-with-subcomponents',
  args: {
    items: createMockItems(15),
    itemsPerPage: 10,
    loadSubcomponents: true,
  },
  render: args => renderDataTable(args),
};

/**
 * Data table in dark mode
 */
export const DarkMode: Story = {
  id: 'data-table-dark-mode',
  args: {
    darkMode: 'dark',
  },
  render: args => renderDataTable(args),
};

/**
 * Data table in light mode
 */
export const LightMode: Story = {
  id: 'data-table-light-mode',
  args: {
    darkMode: 'light',
  },
  render: args => renderDataTable(args),
};

/**
 * Data table using system dark mode preference
 */
export const SystemMode: Story = {
  id: 'data-table-system-mode',
  args: {
    darkMode: 'system',
  },
  render: args => renderDataTable(args),
};
