import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The copy-button component provides a button that copies a given value
 * to the clipboard when clicked. It shows a brief confirmation animation
 * after a successful copy.
 */
const meta: Meta = {
  title: 'Internal/Copy Button',
  component: 'copy-button',
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The text to copy to the clipboard',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'string' },
      },
    },
    label: {
      description: 'Optional custom label for the button. If not provided, a default icon-only button is rendered.',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    value: 'This is an example.',
  },
};
export default meta;
type Story = StoryObj;

/**
 * Default copy button with a sample value
 */
export const Default: Story = {
  id: 'copy-button-default',
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

/**
 * Copy button with a custom label
 */
export const WithCustomLabel: Story = {
  id: 'copy-button-with-label',
  args: {
    value: '10.5445/IR/1000185135',
    label: 'Copy DOI',
  },
  parameters: {
    docs: {
      source: {
        code: `
<copy-button value="10.5445/IR/1000185135" label="Copy DOI"></copy-button>
        `,
      },
    },
  },
};
