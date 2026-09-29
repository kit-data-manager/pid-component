import { Meta, StoryObj } from '@storybook/web-components-vite';
import { DATE_examples } from '../../../../../examples';

const meta: Meta = {
  title: 'Renderer/ReducedDate',
  component: 'pid-component',
  tags: ['autodocs'],
  args: {
    value: DATE_examples.REDUCED_MONTH,
    openByDefault: false,
  },
  argTypes: {
    value: {
      description: 'A reduced-precision ISO 8601 date (YYYY or YYYY-MM)',
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj;

export const YearOnly: Story = {
  name: 'Year Only',
  args: {
    value: DATE_examples.REDUCED_YEAR,
  },
};

export const YearMonth: Story = {
  name: 'Year Month',
  args: {
    value: DATE_examples.REDUCED_MONTH,
  },
};
