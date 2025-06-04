import { Meta, StoryObj } from '@storybook/web-components-vite';

const meta: Meta = {
  title: 'copy-button',
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
    value: 'Hello world!',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: 'Hello world!',
  },
  parameters: {
    docs: {
      source: {
        code: `
<copy-button value="Hello world!"></copy-button>
        `,
      },
    },
  },
};
