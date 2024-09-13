import { Meta, StoryObj } from '@storybook/web-components';

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
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
  },
  parameters: {
    docs: {
      source: {
        code: `
<copy-button value="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343"></copy-button>
        `,
      },
    },
  },
};
