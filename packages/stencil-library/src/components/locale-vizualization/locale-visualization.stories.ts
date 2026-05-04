import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The locale-visualization component renders a locale code (e.g. "de-DE", "en-US")
 * with its human-readable language name and an optional country flag emoji.
 */
const meta: Meta = {
  title: 'Internal/Locale Visualization',
  component: 'locale-visualization',
  tags: ['autodocs'],
  argTypes: {
    locale: {
      description: 'The locale code to visualize (e.g. "de-DE", "en-US", "fr-FR")',
      control: {
        type: 'text',
      },
      table: {
        type: { summary: 'string' },
      },
    },
    showFlag: {
      description: 'Whether to show the country flag emoji alongside the locale name',
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: { summary: 'true' },
        type: { summary: 'boolean' },
      },
    },
  },
  args: {
    locale: 'de-DE',
    showFlag: true,
  },
};
export default meta;
type Story = StoryObj;

/**
 * Default locale visualization showing a German locale with flag
 */
export const Default: Story = {
  id: 'locale-visualization-default',
  args: {
    locale: 'de-DE',
  },
  parameters: {
    docs: {
      source: {
        code: `
<locale-visualization locale="de-DE"></locale-visualization>
        `,
      },
    },
  },
};

/**
 * Locale visualization without the country flag
 */
export const WithoutFlag: Story = {
  id: 'locale-visualization-without-flag',
  args: {
    locale: 'en-US',
    showFlag: false,
  },
  parameters: {
    docs: {
      source: {
        code: `
<locale-visualization locale="en-US" show-flag="false"></locale-visualization>
        `,
      },
    },
  },
};
