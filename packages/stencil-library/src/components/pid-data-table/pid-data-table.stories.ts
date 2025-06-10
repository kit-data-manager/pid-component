import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { FoldableItem } from '../../utils/FoldableItem';

// Create mock FoldableItem objects for the story
const mockItems = [
  new FoldableItem(1, 'Name', 'John Doe', 'The name of the person', 'https://example.com/john', null, false),
  new FoldableItem(2, 'Email', 'john.doe@example.com', 'The email address of the person', 'mailto:john.doe@example.com', null, false),
  new FoldableItem(3, 'Phone', '+1 123-456-7890', 'The phone number of the person', 'tel:+11234567890', null, false),
  new FoldableItem(4, 'Address', '123 Main St, Anytown, USA', 'The address of the person', 'https://maps.google.com/?q=123+Main+St,+Anytown,+USA', null, false),
  new FoldableItem(5, 'Birthday', '1990-01-01', 'The birthday of the person', null, null, false),
  new FoldableItem(6, 'Website', 'https://example.com', 'The website of the person', 'https://example.com', null, false),
  new FoldableItem(7, 'Bio', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.', 'The biography of the person', null, null, false),
  new FoldableItem(8, 'Twitter', '@johndoe', 'The Twitter handle of the person', 'https://twitter.com/johndoe', null, false),
  new FoldableItem(9, 'GitHub', 'johndoe', 'The GitHub username of the person', 'https://github.com/johndoe', null, false),
  new FoldableItem(10, 'LinkedIn', 'johndoe', 'The LinkedIn username of the person', 'https://linkedin.com/in/johndoe', null, false),
  new FoldableItem(11, 'Facebook', 'johndoe', 'The Facebook username of the person', 'https://facebook.com/johndoe', null, false),
  new FoldableItem(12, 'Instagram', 'johndoe', 'The Instagram username of the person', 'https://instagram.com/johndoe', null, false),
];

const meta: Meta = {
  title: 'pid-data-table',
  component: 'pid-data-table',
  argTypes: {
    items: {
      description: 'Array of items to display in the table',
      control: {
        type: 'object',
      },
    },
    itemsPerPage: {
      description: 'Number of items to show per page',
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
  },
  args: {
    items: mockItems,
    itemsPerPage: 5,
    currentPage: 0,
    loadSubcomponents: false,
    hideSubcomponents: false,
    currentLevelOfSubcomponents: 0,
    levelOfSubcomponents: 1,
    settings: '[]',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    items: mockItems,
    itemsPerPage: 5,
  },
  render: args => html`
    <div style="width: 800px; border: 1px solid #ccc; padding: 10px; margin: 20px;">
      <pid-data-table
        .items=${args.items}
        itemsPerPage=${args.itemsPerPage}
        currentPage=${args.currentPage}
        loadSubcomponents=${args.loadSubcomponents}
        hideSubcomponents=${args.hideSubcomponents}
        currentLevelOfSubcomponents=${args.currentLevelOfSubcomponents}
        levelOfSubcomponents=${args.levelOfSubcomponents}
        settings=${args.settings}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-data-table>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-data-table
  itemsPerPage="5"
  currentPage="0"
  loadSubcomponents="false"
  hideSubcomponents="false"
  currentLevelOfSubcomponents="0"
  levelOfSubcomponents="1"
  settings="[]"
></pid-data-table>
        `,
      },
    },
  },
};

export const WithMoreItemsPerPage: Story = {
  args: {
    items: mockItems,
    itemsPerPage: 10,
  },
  render: args => html`
    <div style="width: 800px; border: 1px solid #ccc; padding: 10px; margin: 20px;">
      <pid-data-table
        .items=${args.items}
        itemsPerPage=${args.itemsPerPage}
        currentPage=${args.currentPage}
        loadSubcomponents=${args.loadSubcomponents}
        hideSubcomponents=${args.hideSubcomponents}
        currentLevelOfSubcomponents=${args.currentLevelOfSubcomponents}
        levelOfSubcomponents=${args.levelOfSubcomponents}
        settings=${args.settings}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-data-table>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-data-table
  itemsPerPage="10"
  currentPage="0"
  loadSubcomponents="false"
  hideSubcomponents="false"
  currentLevelOfSubcomponents="0"
  levelOfSubcomponents="1"
  settings="[]"
></pid-data-table>
        `,
      },
    },
  },
};

export const WithLoadSubcomponents: Story = {
  args: {
    items: mockItems,
    itemsPerPage: 5,
    loadSubcomponents: true,
  },
  render: args => html`
    <div style="width: 800px; border: 1px solid #ccc; padding: 10px; margin: 20px;">
      <pid-data-table
        .items=${args.items}
        itemsPerPage=${args.itemsPerPage}
        currentPage=${args.currentPage}
        loadSubcomponents=${args.loadSubcomponents}
        hideSubcomponents=${args.hideSubcomponents}
        currentLevelOfSubcomponents=${args.currentLevelOfSubcomponents}
        levelOfSubcomponents=${args.levelOfSubcomponents}
        settings=${args.settings}
        @pageChange=${e => console.log('Page changed to', e.detail)}
      ></pid-data-table>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-data-table
  itemsPerPage="5"
  currentPage="0"
  loadSubcomponents="true"
  hideSubcomponents="false"
  currentLevelOfSubcomponents="0"
  levelOfSubcomponents="1"
  settings="[]"
></pid-data-table>
        `,
      },
    },
  },
};
