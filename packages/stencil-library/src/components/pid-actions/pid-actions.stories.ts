import { Meta, StoryObj } from '@storybook/web-components-vite';
import { FoldableAction } from '../../utils/FoldableAction';

// Create mock FoldableAction objects for the story
const mockActions = [
  new FoldableAction(1, 'View Details', 'https://example.com/details', 'primary'),
  new FoldableAction(2, 'Edit', 'https://example.com/edit', 'secondary'),
  new FoldableAction(3, 'Delete', 'https://example.com/delete', 'danger'),
  new FoldableAction(4, 'Share', 'https://example.com/share', 'primary'),
  new FoldableAction(5, 'Download', 'https://example.com/download', 'secondary'),
  new FoldableAction(6, 'Archive', 'https://example.com/archive', 'danger'),
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

// Helper function to create stories
const createStory = (actions: FoldableAction[]) => {
  return {
    render: () => {
      // Use a div with Tailwind classes for container
      const container = document.createElement('div');
      container.className = 'p-4 border rounded'; // Using Tailwind classes

      // Create pid-actions element
      const pidActions = document.createElement('pid-actions');

      // Create plain object array from FoldableAction instances
      const actionObjects = actions.map(action => ({
        priority: action.priority,
        title: action.title,
        link: action.link,
        style: action.style,
      }));

      // Set the actions property manually
      // @ts-expect-error - Property assignment is expected to work at runtime
      pidActions.actions = actionObjects;

      // Append to container
      container.appendChild(pidActions);

      return container;
    },
    parameters: {
      docs: {
        source: {
          code: `
<pid-actions></pid-actions>
<script>
  document.querySelector('pid-actions').actions = ${JSON.stringify(
    mockActions.map(a => ({
      priority: a.priority,
      title: a.title,
      link: a.link,
      style: a.style,
    })),
    null,
    2,
  )};
</script>
          `,
        },
      },
    },
  };
};

export const Default: Story = {
  args: {
    actions: mockActions,
  },
  ...createStory(mockActions),
};

export const PrimaryOnly: Story = {
  args: {
    actions: [mockActions[0]],
  },
  ...createStory([mockActions[0]]),
};

export const SecondaryOnly: Story = {
  args: {
    actions: [mockActions[1]],
  },
  ...createStory([mockActions[1]]),
};

export const DangerOnly: Story = {
  args: {
    actions: [mockActions[2]],
  },
  ...createStory([mockActions[2]]),
};
