import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

/**
 * The pid-pagination component provides a flexible pagination control with support for
 * standard and adaptive pagination modes.
 */
const meta: Meta = {
  title: 'Components/Pagination',
  component: 'pid-pagination',
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      description: 'Current page (0-based index)',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '0' },
        type: { summary: 'number' },
      },
    },
    totalItems: {
      description: 'Total number of items',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '0' },
        type: { summary: 'number' },
      },
    },
    itemsPerPage: {
      description: 'Number of items per page',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '10' },
        type: { summary: 'number' },
      },
    },
    adaptivePagination: {
      description: 'Enable adaptive pagination mode',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    pageSizes: {
      description: 'Available page sizes',
      control: { type: 'object' },
      table: {
        defaultValue: { summary: '[5, 10, 25, 50, 100]' },
        type: { summary: 'number[]' },
      },
    },
    showItemsPerPageControl: {
      description: 'Whether to show the items per page control',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'true' },
        type: { summary: 'boolean' },
      },
    },
  },
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
    adaptivePagination: false,
    showItemsPerPageControl: true,
  },
};

export default meta;
type Story = StoryObj;

// Reusable container component for consistent presentation
const PaginationContainer = (args, width = '500px', styles = {}) => {
  const containerStyles = {
    width,
    border: '1px solid #ccc',
    padding: '10px',
    ...styles,
  };

  return html`
    <div style=${containerStyles}>
      <pid-pagination
        currentPage=${args.currentPage}
        totalItems=${args.totalItems}
        itemsPerPage=${args.itemsPerPage}
        adaptivePagination=${args.adaptivePagination}
        showItemsPerPageControl=${args.showItemsPerPageControl}
        @pageChange=${e => console.log('Page changed to', e.detail)}
        @itemsPerPageChange=${e => console.log('Items per page changed to', e.detail)}
      ></pid-pagination>
    </div>
  `;
};

/**
 * Default pagination with standard settings.
 */
export const Default: Story = {
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
    adaptivePagination: false,
  },
  render: args => PaginationContainer(args),
  parameters: {
    docs: {
      source: {
        code: `
<pid-pagination
  currentPage="0"
  totalItems="100"
  itemsPerPage="10"
></pid-pagination>
        `,
      },
    },
  },
};

/**
 * Pagination with more items per page.
 */
export const WithMoreItemsPerPage: Story = {
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 20,
  },
  render: args => PaginationContainer(args),
  parameters: {
    docs: {
      source: {
        code: `
<pid-pagination
  currentPage="0"
  totalItems="100"
  itemsPerPage="20"
></pid-pagination>
        `,
      },
    },
  },
};

/**
 * Pagination starting on the second page.
 */
export const OnSecondPage: Story = {
  args: {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  },
  render: args => PaginationContainer(args),
  parameters: {
    docs: {
      source: {
        code: `
<pid-pagination
  currentPage="1"
  totalItems="100"
  itemsPerPage="10"
></pid-pagination>
        `,
      },
    },
  },
};

/**
 * Pagination with few items that fit on a single page.
 */
export const WithFewItems: Story = {
  args: {
    currentPage: 0,
    totalItems: 5,
    itemsPerPage: 10,
  },
  render: args => PaginationContainer(args),
  parameters: {
    docs: {
      source: {
        code: `
<pid-pagination
  currentPage="0"
  totalItems="5"
  itemsPerPage="10"
></pid-pagination>
        `,
      },
    },
  },
};

/**
 * Pagination with adaptive mode enabled, which adjusts the number of items
 * per page based on available space.
 */
export const WithAdaptivePagination: Story = {
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
    adaptivePagination: true,
  },
  render: args => PaginationContainer(args),
  parameters: {
    docs: {
      source: {
        code: `
<pid-pagination
  currentPage="0"
  totalItems="100"
  itemsPerPage="10"
  adaptivePagination="true"
></pid-pagination>
        `,
      },
    },
  },
};

/**
 * Adaptive pagination in a small container, demonstrating how the component
 * adjusts to limited space.
 */
export const SmallContainer: Story = {
  args: {
    currentPage: 0,
    totalItems: 50,
    itemsPerPage: 10,
    adaptivePagination: true,
  },
  render: args => html`
    <div style="width: 500px; height: 150px; border: 1px solid #cc0000; padding: 10px; background-color: #ffeeee;" class="rounded-md">
      <h3 class="mt-0 mb-2 text-sm font-medium">Small Container (Limited Height)</h3>
      <pid-pagination
        currentPage="0"
        totalItems=${args.totalItems}
        itemsPerPage="10"
        adaptivePagination=${args.adaptivePagination}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-pagination>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<div style="width: 500px; height: 150px; border: 1px solid #cc0000; padding: 10px; background-color: #ffeeee;" class="rounded-md">
  <h3 class="mt-0 mb-2 text-sm font-medium">Small Container (Limited Height)</h3>
  <pid-pagination
    currentPage="0"
    totalItems="50"
    itemsPerPage="10"
    adaptivePagination="true"
  ></pid-pagination>
</div>
        `,
      },
    },
  },
};

/**
 * Adaptive pagination in a large container, showing how the component
 * can display more items per page when space allows.
 */
export const LargeContainer: Story = {
  args: {
    currentPage: 0,
    totalItems: 150,
    itemsPerPage: 10,
    adaptivePagination: true,
  },
  render: args => html`
    <div style="width: 800px; height: 300px; border: 1px solid #00cc00; padding: 10px; background-color: #eeffee;" class="rounded-md">
      <h3 class="mt-0 mb-2 text-sm font-medium">Large Container</h3>
      <pid-pagination
        currentPage="0"
        totalItems=${args.totalItems}
        itemsPerPage="10"
        adaptivePagination=${args.adaptivePagination}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-pagination>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<div style="width: 800px; height: 300px; border: 1px solid #00cc00; padding: 10px; background-color: #eeffee;" class="rounded-md">
  <h3 class="mt-0 mb-2 text-sm font-medium">Large Container</h3>
  <pid-pagination
    currentPage="0"
    totalItems="150"
    itemsPerPage="10"
    adaptivePagination="true"
  ></pid-pagination>
</div>
        `,
      },
    },
  },
};
