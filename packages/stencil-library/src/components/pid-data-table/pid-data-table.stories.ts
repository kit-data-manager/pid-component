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

const meta: Meta = {
  title: 'Internal/Data Table',
  component: 'pid-data-table',
  argTypes: {
    items: {
      description: 'Array of items to display in the table',
      control: 'object',
      table: {
        type: {
          summary: 'FoldableItem[]',
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
      description: 'Available page sizes',
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
      description: 'Whether to load subcomponents',
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
      description: 'Whether to hide subcomponents',
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
      description: 'Current level of subcomponents',
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
      description: 'Total level of subcomponents',
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
      description: 'Settings to pass to subcomponents',
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
    adaptivePagination: {
      description: 'Enable adaptive pagination mode',
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
    darkMode: {
      description: 'The dark mode setting for the component',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        type: { summary: 'string' },
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
    adaptivePagination: false,
    darkMode: 'system',
  },
  parameters: {
    actions: {
      handles: ['pageChange', 'itemsPerPageChange'],
    },
  },
};

export default meta;
type Story = StoryObj;

// Helper function to create data table story
const createDataTableStory = (props: Record<string, unknown>) => {
  return {
    render: () => {
      // Create data table element
      const dataTable = document.createElement('pid-data-table');

      // Apply all properties
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'items') {
          // Special handling for items array
          dataTable.items = value as FoldableItem[];
        } else {
          dataTable[key] = value;
        }
      });

      // Create container with styling
      const container = document.createElement('div');
      container.className = 'p-4 max-w-3xl';
      container.appendChild(dataTable);

      return container;
    },
  };
};

export const Default: Story = createDataTableStory({
  items: createMockItems(25),
  itemsPerPage: 10,
});

export const SmallPageSize: Story = createDataTableStory({
  items: createMockItems(25),
  itemsPerPage: 5,
});

export const LargePageSize: Story = createDataTableStory({
  items: createMockItems(25),
  itemsPerPage: 25,
});

export const WithSubcomponents: Story = createDataTableStory({
  items: createMockItems(15),
  itemsPerPage: 10,
  loadSubcomponents: true,
});

export const AdaptivePagination: Story = createDataTableStory({
  items: createMockItems(50),
  itemsPerPage: 10,
  adaptivePagination: true,
});

export const DarkMode: Story = createDataTableStory({
  items: createMockItems(25),
  itemsPerPage: 10,
  darkMode: 'dark',
});

export const LightMode: Story = createDataTableStory({
  items: createMockItems(25),
  itemsPerPage: 10,
  darkMode: 'light',
});

export const SystemMode: Story = createDataTableStory({
  items: createMockItems(25),
  itemsPerPage: 10,
  darkMode: 'system',
});
