import { Meta, StoryObj } from '@storybook/web-components-vite';
import { FoldableAction } from '../../utils/FoldableAction';

// Create mock FoldableAction objects for the story
const mockActions = [
  new FoldableAction(1, 'View Details', 'https://example.com/details', 'primary'),
  new FoldableAction(2, 'Edit', 'https://example.com/edit', 'secondary'),
  new FoldableAction(3, 'Delete', 'https://example.com/delete', 'danger'),
];

const meta: Meta = {
  title: 'pid-actions',
  component: 'pid-actions',
  argTypes: {
    actions: {
      description: 'Array of actions to display',
      control: {
        type: 'object',
      },
    },
  },
  args: {
    actions: mockActions,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    actions: mockActions,
  },
  render: args => `
    <div class="p-4 border rounded">
      <pid-actions .actions=${args.actions}></pid-actions>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-actions></pid-actions>
        `,
      },
    },
  },
};

export const PrimaryOnly: Story = {
  args: {
    actions: [mockActions[0]],
  },
  render: args => `
    <div class="p-4 border rounded">
      <pid-actions .actions=${args.actions}></pid-actions>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-actions></pid-actions>
        `,
      },
    },
  },
};

export const SecondaryOnly: Story = {
  args: {
    actions: [mockActions[1]],
  },
  render: args => `
    <div class="p-4 border rounded">
      <pid-actions .actions=${args.actions}></pid-actions>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-actions></pid-actions>
        `,
      },
    },
  },
};

export const DangerOnly: Story = {
  args: {
    actions: [mockActions[2]],
  },
  render: args => `
    <div class="p-4 border rounded">
      <pid-actions .actions=${args.actions}></pid-actions>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-actions></pid-actions>
        `,
      },
    },
  },
};
