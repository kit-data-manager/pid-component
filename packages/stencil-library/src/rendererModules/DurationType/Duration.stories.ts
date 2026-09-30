import { Meta, StoryObj } from '@storybook/web-components-vite';
import { DATE_examples } from '../../../../../examples';

const meta: Meta = {
  title: 'Renderer/Duration',
  component: 'pid-component',
  tags: ['autodocs'],
  args: {
    value: DATE_examples.DURATION_7D_2H,
    openByDefault: true,
  },
  argTypes: {
    value: {
      description: 'An ISO 8601 duration (e.g. P7DT2H)',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj;

export const DateAndTime: Story = {
  name: 'Date + Time',
  args: {
    value: DATE_examples.DURATION_7D_2H,
  },
};

export const Weeks: Story = {
  name: 'Weeks',
  args: {
    value: DATE_examples.DURATION_2W,
  },
};

export const TimeOnly: Story = {
  name: 'Time Only',
  args: {
    value: DATE_examples.DURATION_T2H30M,
  },
};
