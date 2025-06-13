import { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'Internal/Copy Button',
  component: 'copy-button',
  argTypes: {
    value: {
      description: 'The text to copy (required)',
      control: {
        required: true,
        type: 'text',
      },
    },
  },
  args: {
    value: 'This is an example.',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 'This is an example.',
  },
  parameters: {
    docs: {
      source: {
        code: `
<copy-button value="This is an example."></copy-button>
        `,
      },
    },
  },
};
