import { Meta, StoryObj } from '@storybook/web-components-vite';
import { DATE_examples } from '../../../../../examples';

const meta: Meta = {
  title: 'Renderer/Date',
  component: 'pid-component',
  tags: ['autodocs'],
  args: {
    value: DATE_examples.ISO_8601,
    openByDefault: false,
  },
  argTypes: {
    value: {
      description: 'The date value to parse and render',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: DATE_examples.ISO_8601,
  },
};

export const ISO8601WithTime: Story = {
  name: 'ISO 8601 with Time',
  args: {
    value: DATE_examples.ISO_8601_ALT,
  },
};

export const DateOnly: Story = {
  name: 'Date Only',
  args: {
    value: DATE_examples.DATE_ONLY,
  },
};

export const DateTimeShort: Story = {
  name: 'DateTime Short',
  args: {
    value: DATE_examples.DATETIME_SHORT,
  },
};

export const DarkMode: Story = {
  name: 'Dark Mode',
  args: {
    value: DATE_examples.ISO_8601,
    darkMode: 'dark',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};
