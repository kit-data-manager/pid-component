import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'pid-pagination',
  component: 'pid-pagination',
  argTypes: {
    currentPage: {
      description: 'Current page (0-based index)',
      control: {
        type: 'number',
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
    totalItems: {
      description: 'Total number of items',
      control: {
        type: 'number',
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
    itemsPerPage: {
      description: 'Number of items per page',
      control: {
        type: 'number',
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
  },
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 10,
  },
  render: args => html` <pid-pagination currentPage=${args.currentPage} totalItems=${args.totalItems} itemsPerPage=${args.itemsPerPage}></pid-pagination> `,
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

export const WithMoreItemsPerPage: Story = {
  args: {
    currentPage: 0,
    totalItems: 100,
    itemsPerPage: 20,
  },
  render: args => html` <pid-pagination currentPage=${args.currentPage} totalItems=${args.totalItems} itemsPerPage=${args.itemsPerPage}></pid-pagination> `,
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

export const OnSecondPage: Story = {
  args: {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  },
  render: args => html` <pid-pagination currentPage=${args.currentPage} totalItems=${args.totalItems} itemsPerPage=${args.itemsPerPage}></pid-pagination> `,
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

export const WithFewItems: Story = {
  args: {
    currentPage: 0,
    totalItems: 5,
    itemsPerPage: 10,
  },
  render: args => html` <pid-pagination currentPage=${args.currentPage} totalItems=${args.totalItems} itemsPerPage=${args.itemsPerPage}></pid-pagination> `,
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
