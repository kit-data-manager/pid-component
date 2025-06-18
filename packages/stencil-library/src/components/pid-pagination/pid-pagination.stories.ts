import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

/**
 * The pid-pagination component provides a flexible pagination control with support for
 * standard and adaptive pagination modes.
 */
const meta: Meta = {
  title: 'Internal/Pagination',
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
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
    adaptivePagination: false,
    showItemsPerPageControl: true,
    darkMode: 'light',
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
