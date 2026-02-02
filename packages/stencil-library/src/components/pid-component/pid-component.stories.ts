import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The pid-component is a versatile component for displaying and interacting with
 * persistent identifiers (PIDs). It supports various display modes, subcomponent
 * management, and adaptive pagination.
 */
const meta: Meta = {
  title: 'PID-Component',
  component: 'pid-component',
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The value to parse, evaluate and render',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    settings: {
      description: 'A stringified JSON object containing settings for this component',
      control: { type: 'text' },
      table: {
        defaultValue: { summary: '[]' },
        type: { summary: 'string' },
      },
    },
    openByDefault: {
      description: 'Determines whether the component is open or not by default',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
    amountOfItems: {
      description: 'The number of items to show in the table per page',
      control: {
        type: 'number',
        min: 1,
      },
      table: {
        defaultValue: { summary: '10' },
        type: { summary: 'number' },
      },
    },
    levelOfSubcomponents: {
      description: 'The total number of levels of subcomponents to show',
      control: {
        type: 'number',
        min: 0,
      },
      table: {
        defaultValue: { summary: '1' },
        type: { summary: 'number' },
      },
    },
    currentLevelOfSubcomponents: {
      description: 'The current level of subcomponents',
      control: {
        type: 'number',
        min: 0,
      },
      table: {
        defaultValue: { summary: '0' },
        type: { summary: 'number' },
      },
    },
    hideSubcomponents: {
      description: 'Determines whether subcomponents should generally be shown or not',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
      },
    },
    emphasizeComponent: {
      description: 'Determines whether components should be emphasized towards their surrounding by border and shadow',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'true' },
        type: { summary: 'boolean' },
      },
    },
    showTopLevelCopy: {
      description: 'Determines whether on the top level the copy button is shown',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'true' },
        type: { summary: 'boolean' },
      },
    },
    darkMode: {
      description: 'The dark mode setting for the component',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'system' },
      },
    },
  },
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    settings: '[]',
    openByDefault: false,
    amountOfItems: 10,
    levelOfSubcomponents: 1,
    currentLevelOfSubcomponents: 0,
    hideSubcomponents: false,
    emphasizeComponent: true,
    showTopLevelCopy: true,
    darkMode: 'light',
  },
};

const textDecorator = (story: () => unknown) =>
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
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343'></pid-component>
        `,
      },
    },
  },
};

export const Handle: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343'></pid-component>
        `,
      },
    },
  },
};

export const HandleWithoutSubcomponent: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    hideSubcomponents: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343' hide-subcomponents='true'></pid-component>
        `,
      },
    },
  },
};

export const ORCID: Story = {
  args: {
    value: '0009-0005-2800-4833',
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='0009-0005-2800-4833'></pid-component>
        `,
      },
    },
  },
};

export const ROR: Story = {
  args: {
    value: 'https://ror.org/04t3en479',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='https://ror.org/04t3en479'></pid-component>`,
      },
    },
  },
};

export const SPDXLong: Story = {
  args: {
    value: 'https://spdx.org/licenses/Apache-2.0',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='https://spdx.org/licenses/Apache-2.0'></pid-component>`,
      },
    },
  },
};

export const SPDXShort: Story = {
  args: {
    value: 'Apache-2.0',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='Apache-2.0'></pid-component>`,
      },
    },
  },
};

export const Date: Story = {
  args: {
    value: '2022-11-11T08:01:20.557+00:00',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='2022-11-11T08:01:20.557+00:00'></pid-component>`,
      },
    },
  },
};

export const URL: Story = {
  args: {
    value: 'https://scc.kit.edu',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='https://scc.kit.edu'></pid-component>`,
      },
    },
  },
};

export const Email: Story = {
  args: {
    value: 'someone@example.com',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='someone@example.com'></pid-component>`,
      },
    },
  },
};

export const CommaSeperatedMails: Story = {
  args: {
    value: 'someone@example.com, john.doe@demo.example',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='someone@example.com, john.doe@demo.example'></pid-component>`,
      },
    },
  },
};

export const Fallback: Story = {
  args: {
    value: 'This is a fallback test',
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='This is a fallback test'></pid-component>`,
      },
    },
  },
};

export const ORCIDInRecord = {
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
    openStatus: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='This is a fallback test'></pid-component>`,
      },
    },
  },
};

export const ORCIDInRecordWithoutLimit = {
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
    amountOfItems: 100,
    openStatus: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6' amount-of-items='100' open-by-default='true'></pid-component>`,
      },
    },
  },
};

export const ORCIDInRecordWithSettings = {
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
    settings: '[{"type":"ORCIDType","values":[{"name":"affiliationAt","value":949363200000},{"name":"showAffiliation","value":true}]}]',
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343' settings='[{"type":"ORCIDConfig","values":[{"name":"affiliationAt","value":949363200000},{"name":"showAffiliation","value":true}]}]'></pid-component>
        `,
      },
    },
  },
};

export const HandleInText: Story = {
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <pid-component value='21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`,
      },
    },
  },
};

export const HandleInTextNotEmphasized: Story = {
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
    emphasizeComponent: false,
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <pid-component value='21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6' emphasize-component="false"></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6' emphasize-component="false"></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`,
      },
    },
  },
};

export const ORCIDInText: Story = {
  args: {
    value: '0009-0005-2800-4833',
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <pid-component value='0009-0005-2800-4833'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='0009-0005-2800-4833'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`,
      },
    },
  },
};

export const HandleWithoutSubcomponentInText: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    hideSubcomponents: true,
    emphasizeComponent: false,
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343' hide-subcomponents='true'  emphasize-component='false'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343' hide-subcomponents='true' emphasize-component='false'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
        `,
      },
    },
  },
};

export const TypedPIDMakerExampleText: Story = {
  args: {
    value: '21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6',
  },
  decorators: [
    (story: () => unknown) => html`
      <p class="w-2/3 items-center align-middle">
        The Typed PID Maker is an entry point to integrate digital resources into the FAIR Digital Object (FAIR DO) ecosystem. It allows creating PIDs for resources and to provide
        them with the necessary metadata to ensure that the resources can be found and understood. <br />
        As a result, a machine-readable representation of all kinds of research artifacts allows act on such FAIR Digital Objects which present themselves as PID, e.g., ${story()},
        but carry much more than just a pointer to a landing page.
      </p>
    `,
  ],
};

/**
 * Demonstrates the component in dark mode
 */
export const DarkMode: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    darkMode: 'dark',
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343" dark-mode="dark" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates the component in light mode
 */
export const LightMode: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    darkMode: 'light',
  },
  globals: {
    backgrounds: { value: 'light' },
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343" dark-mode="light" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates the component with system preference for dark mode
 */
export const SystemMode: Story = {
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    darkMode: 'system',
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343" dark-mode="system" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};
