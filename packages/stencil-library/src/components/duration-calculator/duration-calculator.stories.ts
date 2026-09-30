import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The duration-calculator component turns an ISO 8601 duration (e.g. `P7DT2H`)
 * into an interactive tool: it shows a humanized breakdown and lets a user enter
 * a start datetime to compute the corresponding end datetime.
 *
 * It is used by the Duration renderer's body, but can also be used standalone.
 */
const meta: Meta = {
  title: 'Internal/Duration Calculator',
  component: 'duration-calculator',
  tags: ['autodocs'],
  argTypes: {
    isoDuration: {
      description: 'The ISO 8601 duration to add, e.g. P7DT2H.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    darkMode: {
      description: 'Whether to use dark-mode styling for the input, button, and result.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
  },
  args: {
    isoDuration: 'P7DT2H',
    darkMode: false,
  },
};
export default meta;
type Story = StoryObj;

/**
 * Shared render function: creates a duration-calculator element from Storybook
 * args so that the Controls panel is interactive.
 */
function renderDurationCalculator(args: Record<string, unknown>) {
  const calculator = document.createElement('duration-calculator');
  if (args.isoDuration) {
    calculator.setAttribute('iso-duration', args.isoDuration as string);
  }
  if (args.darkMode) {
    calculator.setAttribute('dark-mode', '');
  }

  const container = document.createElement('div');
  container.className = 'p-4 border rounded-sm';
  container.appendChild(calculator);
  return container;
}

/**
 * Default calculator: enter a start datetime and press "Calculate end datetime".
 */
export const Default: Story = {
  id: 'duration-calculator-default',
  render: args => renderDurationCalculator(args),
  parameters: {
    docs: {
      source: {
        code: `
<!-- Enter a start datetime, then click "Calculate end datetime". -->
<duration-calculator iso-duration="P7DT2H"></duration-calculator>
        `,
      },
    },
  },
};

/**
 * Calculator for a compound date + time duration.
 */
export const CompoundDuration: Story = {
  id: 'duration-calculator-compound',
  args: {
    isoDuration: 'P1Y2M3DT4H5M6S',
  },
  render: args => renderDurationCalculator(args),
  parameters: {
    docs: {
      source: {
        code: `
<duration-calculator iso-duration="P1Y2M3DT4H5M6S"></duration-calculator>
        `,
      },
    },
  },
};

/**
 * Calculator using a time-only duration.
 */
export const TimeOnly: Story = {
  id: 'duration-calculator-time-only',
  args: {
    isoDuration: 'PT2H30M',
  },
  render: args => renderDurationCalculator(args),
  parameters: {
    docs: {
      source: {
        code: `
<duration-calculator iso-duration="PT2H30M"></duration-calculator>
        `,
      },
    },
  },
};

/**
 * Calculator styled for dark mode.
 */
export const DarkMode: Story = {
  id: 'duration-calculator-dark-mode',
  args: {
    darkMode: true,
  },
  render: args => renderDurationCalculator(args),
  parameters: {
    docs: {
      source: {
        code: `
<duration-calculator iso-duration="P7DT2H" dark-mode="true"></duration-calculator>
        `,
      },
    },
  },
};

/**
 * Invalid duration is reported gracefully.
 */
export const InvalidDuration: Story = {
  id: 'duration-calculator-invalid',
  args: {
    isoDuration: 'not-a-duration',
  },
  render: args => renderDurationCalculator(args),
  parameters: {
    docs: {
      source: {
        code: `
<duration-calculator iso-duration="not-a-duration"></duration-calculator>
        `,
      },
    },
  },
};
