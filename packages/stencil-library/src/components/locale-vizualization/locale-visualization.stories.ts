import { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Renderer/Locale Visualization',
  component: 'locale-visualization',
  argTypes: {
    locale: {
      description: 'The locale to visualize.',
      control: {
        required: true,
        type: 'text',
      },
    },
    showFlag: {
      description: 'Whether to show the flag of the region.',
      control: {
        required: false,
        type: 'boolean',
        default: true,
      },
    },
  },
  args: {
    locale: 'de-DE',
    showFlag: true,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    locale: 'de-DE',
  },
  parameters: {
    docs: {
      source: {
        code: `
<locale-visualization locale="de-DE"></locale-visualization>
        `,
      },
    },
  },
};

export const WithoutFlag: Story = {
  args: {
    locale: 'en-US',
    showFlag: false,
  },
  parameters: {
    docs: {
      source: {
        code: `
<locale-visualization locale="de-DE" show-flag="false"></locale-visualization>
        `,
      },
    },
  },
};
