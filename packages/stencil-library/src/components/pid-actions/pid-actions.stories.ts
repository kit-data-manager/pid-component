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
      description: 'Array of actions to display. Each action has a priority, title, link, and style (primary, secondary, or danger).',
      control: 'object',
      table: {
        type: { summary: 'FoldableAction[]' },
        defaultValue: { summary: '[]' },
      },
    },
    actionsId: {
      description: 'Optional ID for the actions container, used for ARIA references to improve accessibility',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
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
    actions: mockActions,
    darkMode: 'system',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Helper: renders a pid-actions element from Storybook args so that the
 * Controls panel is interactive.
 */
function renderActions(args: Record<string, unknown>, containerClass = 'p-4 border rounded-sm bg-white') {
  const container = document.createElement('div');
  container.className = containerClass;

  const pidActions = document.createElement('pid-actions') as HTMLElement & { actions: unknown };
  const actions = args.actions as FoldableAction[];
  pidActions.actions = actions.map(action => ({
    priority: action.priority,
    title: action.title,
    link: action.link,
    style: action.style,
  }));
  pidActions.setAttribute('darkMode', (args.darkMode as string) || 'system');
  if (args.actionsId) {
    pidActions.setAttribute('actionsId', args.actionsId as string);
  }

  container.appendChild(pidActions);
  return container;
}

/**
 * Default story showing all action types
 */
export const Default: Story = {
  id: 'actions-default',
  args: {
    actions: mockActions,
    darkMode: 'system',
  },
  render: args => renderActions(args),
  parameters: {
    docs: {
      source: {
        code: `
<pid-actions darkMode="system"></pid-actions>
<script>
  document.querySelector('pid-actions').actions = ${JSON.stringify(
          mockActions.map(a => ({ priority: a.priority, title: a.title, link: a.link, style: a.style })),
          null,
          2,
        )};
</script>
        `,
      },
    },
  },
};

/**
 * Story showing only primary actions
 */
export const PrimaryOnly: Story = {
  id: 'actions-primary-only',
  args: {
    actions: [mockActions[0], mockActions[3]],
    darkMode: 'system',
  },
  render: args => renderActions(args),
};

/**
 * Story showing only secondary actions
 */
export const SecondaryOnly: Story = {
  id: 'actions-secondary-only',
  args: {
    actions: [mockActions[1], mockActions[4]],
    darkMode: 'system',
  },
  render: args => renderActions(args),
};

/**
 * Story showing only danger actions
 */
export const DangerOnly: Story = {
  id: 'actions-danger-only',
  args: {
    actions: [mockActions[2]],
    darkMode: 'system',
  },
  render: args => renderActions(args),
};

/**
 * Story showing actions with custom priority order
 */
export const CustomPriorityOrder: Story = {
  id: 'actions-custom-priority-order',
  args: {
    actions: [
      new FoldableAction(3, 'Third Priority', 'https://example.com/3', 'secondary'),
      new FoldableAction(1, 'First Priority', 'https://example.com/1', 'primary'),
      new FoldableAction(2, 'Second Priority', 'https://example.com/2', 'danger'),
    ],
    darkMode: 'system',
  },
  render: args => renderActions(args),
};

/**
 * Story showing actions in light mode
 */
export const LightMode: Story = {
  id: 'actions-light-mode',
  args: {
    actions: mockActions,
    darkMode: 'light',
  },
  render: args => renderActions(args),
};

/**
 * Story showing actions in dark mode
 */
export const DarkMode: Story = {
  id: 'actions-dark-mode',
  args: {
    actions: mockActions,
    darkMode: 'dark',
  },
  render: args => renderActions(args),
};

/**
 * Story showing many actions that will wrap to multiple lines
 */
export const ManyActions: Story = {
  id: 'actions-many-actions',
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
  render: args => renderActions(args, 'p-4 border rounded-sm bg-white max-w-md'),
};
