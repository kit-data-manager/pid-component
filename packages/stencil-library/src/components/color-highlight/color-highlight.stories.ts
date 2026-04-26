import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

/**
 * The color-highlight component renders text with a deterministic color highlight
 * based on the text content. This is useful for visually distinguishing identifiers
 * like UUIDs or prefix parts of PIDs.
 */
const meta: Meta = {
  title: 'Internal/Color Highlight',
  component: 'color-highlight',
  tags: ['autodocs'],
  argTypes: {
    text: {
      description: 'The text to highlight with a deterministic color',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    text: '21.11152',
  },
};
const textDecorator = story =>
  html`<p class="items-center align-middle">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ${story()} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
    aute ${story()} irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
    officia deserunt mollit anim id est laborum.
  </p>`;
export default meta;
type Story = StoryObj;

/**
 * Default color highlight with a UUID-style text
 */
export const Default: Story = {
  id: 'color-highlight-default',
  args: {
    text: 'B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
  },
  parameters: {
    docs: {
      source: {
        code: `
<color-highlight text='B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343'></color-highlight>
        `,
      },
    },
  },
};

/**
 * Color-highlighted text embedded in a paragraph of text
 */
export const HighlightedTextInText: Story = {
  id: 'color-highlight-in-text',
  args: {
    text: '21.11152',
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, ... <color-highlight text='21.11152'></color-highlight> ...
Lorem ipsum dolor sit amet, ... <color-highlight text='21.11152'></color-highlight> ...
</p>
        `,
      },
    },
  },
};
