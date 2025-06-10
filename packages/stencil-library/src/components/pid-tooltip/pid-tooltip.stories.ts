import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'pid-tooltip',
  component: 'pid-tooltip',
  argTypes: {
    text: {
      description: 'The text to display in the tooltip',
      control: {
        type: 'text',
      },
    },
    position: {
      description: 'The position of the tooltip',
      control: {
        type: 'select',
        options: ['top', 'bottom', 'left', 'right'],
      },
      table: {
        defaultValue: {
          summary: 'top',
        },
        type: {
          summary: 'string',
        },
      },
    },
    maxWidth: {
      description: 'The maximum width of the tooltip',
      control: {
        type: 'text',
      },
      table: {
        defaultValue: {
          summary: '250px',
        },
        type: {
          summary: 'string',
        },
      },
    },
    maxHeight: {
      description: 'The maximum height of the tooltip',
      control: {
        type: 'text',
      },
      table: {
        defaultValue: {
          summary: '150px',
        },
        type: {
          summary: 'string',
        },
      },
    },
  },
  args: {
    text: 'This is a tooltip',
    position: 'top',
    maxWidth: '250px',
    maxHeight: '150px',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    text: 'This is a tooltip',
    position: 'top',
  },
  render: args => html`
    <div class="p-10">
      <pid-tooltip text=${args.text} position=${args.position} maxWidth=${args.maxWidth} maxHeight=${args.maxHeight}>
        <span slot="trigger">Hover me</span>
      </pid-tooltip>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-tooltip text="This is a tooltip" position="top">
  <span slot="trigger">Hover me</span>
</pid-tooltip>
        `,
      },
    },
  },
};

export const BottomPosition: Story = {
  args: {
    text: 'This tooltip appears at the bottom',
    position: 'bottom',
  },
  render: args => html`
    <div class="p-10">
      <pid-tooltip text=${args.text} position=${args.position} maxWidth=${args.maxWidth} maxHeight=${args.maxHeight}>
        <span slot="trigger">Hover me (bottom)</span>
      </pid-tooltip>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-tooltip text="This tooltip appears at the bottom" position="bottom">
  <span slot="trigger">Hover me (bottom)</span>
</pid-tooltip>
        `,
      },
    },
  },
};

export const LeftPosition: Story = {
  args: {
    text: 'This tooltip appears on the left',
    position: 'left',
  },
  render: args => html`
    <div class="p-10">
      <pid-tooltip text=${args.text} position=${args.position} maxWidth=${args.maxWidth} maxHeight=${args.maxHeight}>
        <span slot="trigger">Hover me (left)</span>
      </pid-tooltip>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-tooltip text="This tooltip appears on the left" position="left">
  <span slot="trigger">Hover me (left)</span>
</pid-tooltip>
        `,
      },
    },
  },
};

export const RightPosition: Story = {
  args: {
    text: 'This tooltip appears on the right',
    position: 'right',
  },
  render: args => html`
    <div class="p-10">
      <pid-tooltip text=${args.text} position=${args.position} maxWidth=${args.maxWidth} maxHeight=${args.maxHeight}>
        <span slot="trigger">Hover me (right)</span>
      </pid-tooltip>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-tooltip text="This tooltip appears on the right" position="right">
  <span slot="trigger">Hover me (right)</span>
</pid-tooltip>
        `,
      },
    },
  },
};

export const LongText: Story = {
  args: {
    text: 'This is a tooltip with a very long text. It should wrap and be limited by the maxWidth and maxHeight properties. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    position: 'top',
  },
  render: args => html`
    <div class="p-10">
      <pid-tooltip text=${args.text} position=${args.position} maxWidth=${args.maxWidth} maxHeight=${args.maxHeight}>
        <span slot="trigger">Hover me (long text)</span>
      </pid-tooltip>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-tooltip text="This is a tooltip with a very long text..." position="top">
  <span slot="trigger">Hover me (long text)</span>
</pid-tooltip>
        `,
      },
    },
  },
};

export const CustomSizes: Story = {
  args: {
    text: 'This tooltip has custom maxWidth and maxHeight',
    position: 'top',
    maxWidth: '300px',
    maxHeight: '100px',
  },
  render: args => html`
    <div class="p-10">
      <pid-tooltip text=${args.text} position=${args.position} maxWidth=${args.maxWidth} maxHeight=${args.maxHeight}>
        <span slot="trigger">Hover me (custom sizes)</span>
      </pid-tooltip>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-tooltip
  text="This tooltip has custom maxWidth and maxHeight"
  position="top"
  maxWidth="300px"
  maxHeight="100px"
>
  <span slot="trigger">Hover me (custom sizes)</span>
</pid-tooltip>
        `,
      },
    },
  },
};
