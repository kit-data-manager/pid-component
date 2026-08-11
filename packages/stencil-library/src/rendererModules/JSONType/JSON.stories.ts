import { Meta, StoryObj } from '@storybook/web-components-vite';
import { JSON_examples } from '../../../../../examples';

const meta: Meta = {
  title: 'Renderer/JSON',
  component: 'pid-component',
  tags: ['autodocs'],
  args: {
    value: JSON_examples.NESTED,
    openByDefault: false,
  },
  argTypes: {
    value: {
      description: 'The JSON value to parse and render',
      control: { type: 'text' },
    },
    openByDefault: {
      description: 'Whether to show the component in its expanded state by default',
      control: { type: 'boolean' },
    },
    settings: {
      description: 'Settings for the JSON renderer',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    value: JSON_examples.NESTED,
  },
};

export const Simple: Story = {
  name: 'Simple Object',
  args: {
    value: JSON_examples.SIMPLE,
  },
};

export const Array: Story = {
  name: 'Array',
  args: {
    value: JSON_examples.ARRAY,
  },
};

export const Dataset: Story = {
  name: 'Dataset',
  args: {
    value: JSON_examples.DATASET,
  },
};

export const Expanded: Story = {
  name: 'Expanded View',
  args: {
    value: JSON_examples.NESTED,
    openByDefault: true,
  },
};

export const DarkMode: Story = {
  name: 'Dark Mode',
  args: {
    value: JSON_examples.NESTED,
    openByDefault: true,
    darkMode: 'dark',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
};
