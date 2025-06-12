import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

/**
 * The copy-button component provides a simple way to copy text to the clipboard.
 * It displays a button that, when clicked, copies the specified value to the clipboard.
 */
const meta: Meta = {
  title: 'Components/Copy Button',
  component: 'copy-button',
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The value to copy to the clipboard',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    value: 'Text to be copied',
  },
  parameters: {
    actions: {
      handles: ['click'],
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Default copy button with basic styling
 */
export const Default: Story = {
  args: {
    value: 'Hello world!',
  },
  render: args => html` <copy-button value=${args.value}></copy-button>`,
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

/**
 * Copy button embedded within text content
 */
export const InText: Story = {
  args: {
    value: 'Copy this important information',
  },
  render: args => html`
    <div class="p-4 bg-gray-100 rounded">
      <p class="mb-2">Here is some important text: <strong>${args.value}</strong></p>
      <copy-button value=${args.value}></copy-button>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<div class="p-4 bg-gray-100 rounded">
  <p class="mb-2">Here is some important text: <strong>Copy this important information</strong></p>
  <copy-button value="Copy this important information"></copy-button>
</div>
        `,
      },
    },
  },
};

/**
 * Copy button with longer text content
 */
export const WithLongText: Story = {
  args: {
    value:
      'This is a very long text that demonstrates how the copy button handles larger content. This could be a JSON snippet, a URL, or any other text that a user might want to copy.',
  },
  render: args => html`
    <div class="p-4 bg-gray-100 rounded max-w-md">
      <p class="mb-2 text-sm">${args.value}</p>
      <copy-button value=${args.value}></copy-button>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<div class="p-4 bg-gray-100 rounded max-w-md">
  <p class="mb-2 text-sm">This is a very long text that demonstrates how the copy button handles larger content...</p>
  <copy-button value="This is a very long text that demonstrates how the copy button handles larger content..."></copy-button>
</div>
        `,
      },
    },
  },
};
