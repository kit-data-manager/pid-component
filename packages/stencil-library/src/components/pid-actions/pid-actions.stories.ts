import { Meta, StoryObj } from '@storybook/web-components-vite';
import { FoldableAction } from '../../utils/FoldableAction';

/**
 * The pid-actions component displays a set of action buttons that can be used
 * for navigation or triggering operations. It supports different styles for
 * primary, secondary, and danger actions.
 */

// Create sample actions for demonstration
const mockActions = [
  new FoldableAction(1, 'Primary Action', 'https://example.com/primary', 'primary'),
  new FoldableAction(2, 'Secondary Action', 'https://example.com/secondary', 'secondary'),
  new FoldableAction(3, 'Danger Action', 'https://example.com/danger', 'danger'),
  new FoldableAction(4, 'Another Primary', 'https://example.com/another', 'primary'),
  new FoldableAction(5, 'Another Secondary', 'https://example.com/another-secondary', 'secondary'),
];

const meta: Meta = {
  title: 'Internal/PID Actions',
  component: 'pid-actions',
  tags: ['autodocs'],
  argTypes: {
    actions: {
      description: 'Array of actions to display',
      control: 'object',
      table: {
        type: { summary: 'FoldableAction[]' },
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
    actions: mockActions,
    darkMode: 'system',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Helper function to create a story with different sets of actions
 */
const createStory = (actions: FoldableAction[], darkMode: 'light' | 'dark' | 'system' = 'system') => {
  return {
    render: () => {
      // Use a div with Tailwind classes for container
      const container = document.createElement('div');
      container.className = 'p-4 border rounded bg-white'; // Using Tailwind classes

      // Create pid-actions element
      const pidActions = document.createElement('pid-actions');

      // Create plain object array from FoldableAction instances
      // Set the actions property manually
      // @ts-expect-error - Property assignment is expected to work at runtime
      pidActions.actions = actions.map(action => ({
        priority: action.priority,
        title: action.title,
        link: action.link,
        style: action.style,
      }));

      // Set the darkMode property
      pidActions.setAttribute('darkMode', darkMode);

      // Append to container
      container.appendChild(pidActions);

      return container;
    },
    parameters: {
      docs: {
        source: {
          code: `
<pid-actions darkMode="${darkMode}"></pid-actions>
<script>
  document.querySelector('pid-actions').actions = ${JSON.stringify(
    actions.map(a => ({
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

/**
 * Default story showing all action types
 */
export const Default: Story = {
  args: {
    actions: mockActions,
    darkMode: 'system',
  },
  ...createStory(mockActions, 'system'),
};

/**
 * Story showing only primary actions
 */
export const PrimaryOnly: Story = {
  args: {
    actions: [mockActions[0], mockActions[3]],
    darkMode: 'system',
  },
  ...createStory([mockActions[0], mockActions[3]], 'system'),
};

/**
 * Story showing only secondary actions
 */
export const SecondaryOnly: Story = {
  args: {
    actions: [mockActions[1], mockActions[4]],
    darkMode: 'system',
  },
  ...createStory([mockActions[1], mockActions[4]], 'system'),
};

/**
 * Story showing only danger actions
 */
export const DangerOnly: Story = {
  args: {
    actions: [mockActions[2]],
    darkMode: 'system',
  },
  ...createStory([mockActions[2]], 'system'),
};

/**
 * Story showing actions with custom priority order
 */
export const CustomPriorityOrder: Story = {
  args: {
    actions: [
      new FoldableAction(3, 'Third Priority', 'https://example.com/3', 'secondary'),
      new FoldableAction(1, 'First Priority', 'https://example.com/1', 'primary'),
      new FoldableAction(2, 'Second Priority', 'https://example.com/2', 'danger'),
    ],
    darkMode: 'system',
  },
  ...createStory(
    [
      new FoldableAction(3, 'Third Priority', 'https://example.com/3', 'secondary'),
      new FoldableAction(1, 'First Priority', 'https://example.com/1', 'primary'),
      new FoldableAction(2, 'Second Priority', 'https://example.com/2', 'danger'),
    ],
    'system',
  ),
};

/**
 * Story showing actions in light mode
 */
export const LightMode: Story = {
  args: {
    actions: mockActions,
    darkMode: 'light',
  },
  ...createStory(mockActions, 'light'),
};

/**
 * Story showing actions in dark mode
 */
export const DarkMode: Story = {
  args: {
    actions: mockActions,
    darkMode: 'dark',
  },
  ...createStory(mockActions, 'dark'),
};

/**
 * Story showing many actions that will wrap to multiple lines
 */
export const ManyActions: Story = {
  args: {
    actions: [
      ...mockActions,
      new FoldableAction(6, 'Extra Action 1', 'https://example.com/extra1', 'primary'),
      new FoldableAction(7, 'Extra Action 2', 'https://example.com/extra2', 'secondary'),
      new FoldableAction(8, 'Extra Action 3', 'https://example.com/extra3', 'danger'),
      new FoldableAction(9, 'Extra Action 4', 'https://example.com/extra4', 'primary'),
    ],
    darkMode: 'system',
  },
  render: () => {
    // Use a div with Tailwind classes for container
    const container = document.createElement('div');
    container.className = 'p-4 border rounded bg-white max-w-md'; // Using Tailwind classes with width constraint

    // Create pid-actions element
    const pidActions = document.createElement('pid-actions');

    // Create actions
    const actions = [
      ...mockActions,
      new FoldableAction(6, 'Extra Action 1', 'https://example.com/extra1', 'primary'),
      new FoldableAction(7, 'Extra Action 2', 'https://example.com/extra2', 'secondary'),
      new FoldableAction(8, 'Extra Action 3', 'https://example.com/extra3', 'danger'),
      new FoldableAction(9, 'Extra Action 4', 'https://example.com/extra4', 'primary'),
    ];

    // Create plain object array from FoldableAction instances
    // Set the actions property manually
    // @ts-expect-error - Property assignment is expected to work at runtime
    pidActions.actions = actions.map(action => ({
      priority: action.priority,
      title: action.title,
      link: action.link,
      style: action.style,
    }));

    // Set the darkMode property
    pidActions.setAttribute('darkMode', 'system');

    // Append to container
    container.appendChild(pidActions);

    return container;
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-actions darkMode="system"></pid-actions>
<script>
  document.querySelector('pid-actions').actions = [
    ...mockActions,
    { priority: 6, title: "Extra Action 1", link: "https://example.com/extra1", style: "primary" },
    { priority: 7, title: "Extra Action 2", link: "https://example.com/extra2", style: "secondary" },
    { priority: 8, title: "Extra Action 3", link: "https://example.com/extra3", style: "danger" },
    { priority: 9, title: "Extra Action 4", link: "https://example.com/extra4", style: "primary" }
  ];
</script>
        `,
      },
    },
  },
};
