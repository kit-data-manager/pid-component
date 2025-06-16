import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'Renderer/Color Highlight',
  component: 'color-highlight',
  argTypes: {
    text: {
      description: 'The text to display (required)',
      control: {
        required: true,
        type: 'text',
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

export const Default: Story = {
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

export const HighlightedTextInText: Story = {
  args: {
    text: '21.11152',
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<color-highlight text='B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343'></color-highlight>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <color-highlight text='B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343'></color-highlight> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
        `,
      },
    },
  },
};
