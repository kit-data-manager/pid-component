import type { Meta, StoryObj } from '@storybook/react-vite';
import { PidComponent } from '../lib';

const meta: Meta<typeof PidComponent> = {
  title: 'PidComponent',
  component: PidComponent,
  parameters: {
    docs: {
      description: {
        component:
          'React wrapper for the PID Component web component. Resolves and displays metadata for persistent identifiers (Handle, DOI, ORCID, …). Install via `npm install @kit-data-manager/react-pid-component`.',
      },
    },
  },
  argTypes: {
    value: {
      description: 'The persistent identifier to resolve',
      control: 'text',
    },
    darkMode: {
      description: 'Color scheme: "dark", "light", or "system"',
      control: 'select',
      options: ['dark', 'light', 'system'],
    },
    renderers: {
      description: 'JSON array of renderer names to use (e.g. \'["DOIType"]\')',
      control: 'text',
    },
    fallbackToAll: {
      description: 'Whether to fall back to all renderers when none match',
      control: 'boolean',
    },
    emphasizeComponent: {
      description: 'Whether to visually emphasize the component',
      control: 'boolean',
    },
    openByDefault: {
      description: 'Whether the component is expanded on mount',
      control: 'boolean',
    },
    amountOfItems: {
      description: 'Number of items to display per page',
      control: 'number',
    },
    levelOfSubcomponents: {
      description: 'Maximum nesting depth for sub-components',
      control: 'number',
    },
    width: {
      description: 'CSS width of the component',
      control: 'text',
    },
    height: {
      description: 'CSS height of the component',
      control: 'text',
    },
    showTopLevelCopy: {
      description: 'Whether to show a copy button at the top level',
      control: 'boolean',
    },
    defaultTTL: {
      description: 'Default time-to-live for cached responses (seconds)',
      control: 'number',
    },
    hideSubcomponents: {
      description: 'Whether to hide nested sub-components',
      control: 'boolean',
    },
    currentLevelOfSubcomponents: {
      description: 'Current nesting depth (used internally)',
      control: 'number',
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

/** Renders the component with a default DOI value. */
export const Default: Story = {
  id: 'react-pid-component-default',
  args: {
    value: '10.5445/ir/1000185135',
  },
};

/** Resolves a Handle System identifier. */
export const HandleResolution: Story = {
  id: 'react-pid-component-handle-resolution',
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
  },
};

/** Resolves a DOI registered with DataCite. */
export const DOI_DataCite: Story = {
  id: 'react-pid-component-doi-datacite',
  args: {
    value: '10.5445/ir/1000185135',
  },
};

/** Resolves a DOI registered with CrossRef. */
export const DOI_CrossRef: Story = {
  id: 'react-pid-component-doi-crossref',
  args: {
    value: '10.1109/eScience65000.2025.00022',
  },
};

/** Resolves an ORCID identifier. */
export const ORCID: Story = {
  id: 'react-pid-component-orcid',
  args: {
    value: '0009-0005-2800-4833',
  },
};

/** Forces the dark color scheme. */
export const DarkMode: Story = {
  id: 'react-pid-component-dark-mode',
  args: {
    value: '10.5445/ir/1000185135',
    darkMode: 'dark',
  },
};

/** Forces the light color scheme. */
export const LightMode: Story = {
  id: 'react-pid-component-light-mode',
  args: {
    value: '10.5445/ir/1000185135',
    darkMode: 'light',
  },
};

/** Follows the operating system color scheme. */
export const SystemMode: Story = {
  id: 'react-pid-component-system-mode',
  args: {
    value: '10.5445/ir/1000185135',
    darkMode: 'system',
  },
};

/** Only uses the specified renderers (here: DOIType). */
export const WithRendererSelection: Story = {
  id: 'react-pid-component-renderer-selection',
  args: {
    value: '10.5445/ir/1000185135',
    renderers: '["DOIType"]',
  },
};

/** Component starts in the expanded state. */
export const OpenByDefault: Story = {
  id: 'react-pid-component-open-by-default',
  args: {
    value: '10.5445/ir/1000185135',
    openByDefault: true,
  },
};
