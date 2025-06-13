import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'Internal/Collapsible',
  component: 'pid-collapsible',
  argTypes: {
    open: {
      description: 'Whether the collapsible is open by default',
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
    emphasize: {
      description: 'Whether to emphasize the component with border and shadow',
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
    expanded: {
      description: 'Whether the component is in expanded mode (full size)',
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
    initialWidth: {
      description: 'Initial width when expanded',
      control: {
        type: 'text',
      },
    },
    initialHeight: {
      description: 'Initial height when expanded',
      control: {
        type: 'text',
      },
    },
    lineHeight: {
      description: 'Line height for collapsed state',
      control: {
        type: 'number',
      },
      table: {
        defaultValue: {
          summary: '24',
        },
        type: {
          summary: 'number',
        },
      },
    },
  },
  args: {
    open: false,
    emphasize: true,
    expanded: false,
    lineHeight: 24,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    open: false,
    emphasize: true,
  },
  render: args => html`
    <pid-collapsible
      open=${args.open}
      emphasize=${args.emphasize}
      expanded=${args.expanded}
      initialWidth=${args.initialWidth}
      initialHeight=${args.initialHeight}
      lineHeight=${args.lineHeight}
    >
      <span slot="summary">Collapsible Component</span>
      <div>
        <p>This is the content of the collapsible component.</p>
        <p>It can contain any HTML content.</p>
      </div>
    </pid-collapsible>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible open="false" emphasize="true">
  <span slot="summary">Collapsible Component</span>
  <div>
    <p>This is the content of the collapsible component.</p>
    <p>It can contain any HTML content.</p>
  </div>
</pid-collapsible>
        `,
      },
    },
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    emphasize: true,
  },
  render: args => html`
    <pid-collapsible
      open=${args.open}
      emphasize=${args.emphasize}
      expanded=${args.expanded}
      initialWidth=${args.initialWidth}
      initialHeight=${args.initialHeight}
      lineHeight=${args.lineHeight}
    >
      <span slot="summary">Collapsible Component (Open by Default)</span>
      <div>
        <p>This is the content of the collapsible component.</p>
        <p>It can contain any HTML content.</p>
      </div>
    </pid-collapsible>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible open="true" emphasize="true">
  <span slot="summary">Collapsible Component (Open by Default)</span>
  <div>
    <p>This is the content of the collapsible component.</p>
    <p>It can contain any HTML content.</p>
  </div>
</pid-collapsible>
        `,
      },
    },
  },
};

export const WithSummaryActions: Story = {
  args: {
    open: false,
    emphasize: true,
  },
  render: args => html`
    <pid-collapsible
      open=${args.open}
      emphasize=${args.emphasize}
      expanded=${args.expanded}
      initialWidth=${args.initialWidth}
      initialHeight=${args.initialHeight}
      lineHeight=${args.lineHeight}
    >
      <span slot="summary">Collapsible with Actions</span>
      <button slot="summary-actions" class="bg-blue-500 text-white px-2 py-1 rounded">Action</button>
      <div>
        <p>This collapsible has an action button in the summary.</p>
      </div>
    </pid-collapsible>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible open="false" emphasize="true">
  <span slot="summary">Collapsible with Actions</span>
  <button slot="summary-actions" class="bg-blue-500 text-white px-2 py-1 rounded">Action</button>
  <div>
    <p>This collapsible has an action button in the summary.</p>
  </div>
</pid-collapsible>
        `,
      },
    },
  },
};
