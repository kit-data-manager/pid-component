import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'pid-component',
  component: 'pid-component',
  argTypes: {
    value: {
      description: 'The text to display (required)',
      control: {
        required: true,
        type: 'text',
      },
    },
    settings: {
      description: 'The settings to use for the component',
      control: {
        type: 'text',
      },
    },
    openByDefault: {
      name: 'open-by-default',
      description: 'Determines whether the component is opened by default',
      defaultValue: false,
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: false,
        },
        type: {
          summary: 'boolean',
        },
      },
    },
    amountOfItems: {
      name: 'amount-of-items',
      description: 'The amount of items to show in the table',
      defaultValue: 10,
      control: {
        type: 'number',
      },
      table: {
        defaultValue: {
          summary: 10,
        },
        type: {
          summary: 'number',
        },
      },
    },
    hideSubcomponents: {
      name: 'hide-subcomponents',
      description:
        'Determines whether subcomponents should generally be shown or not. If set to true, the component won\'t show any subcomponents. If not set, the component will show subcomponents, if the current level of subcomponents is not the total level of subcomponents or greater.',
      defaultValue: false,
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: false,
        },
        type: {
          summary: 'boolean',
        },
      },
    },
    emphasizeComponent: {
      name: 'emphasize-component',
      description:
        'Determines whether components should be emphasized towards their surrounding by border and shadow.',
      defaultValue: true,
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: true,
        },
        type: {
          summary: 'boolean',
        },
      },
    },
    showTopLevelCopy: {
      name: 'show-top-level-copy',
      description:
        ' Determines whether on the top level the copy button is shown.',
      defaultValue: true,
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: true,
        },
        type: {
          summary: 'boolean',
        },
      },
    },
    levelOfSubcomponents: {
      name: 'level-of-subcomponents',
      description: 'The maximum level of subcomponents to show. ',
      defaultValue: 1,
      control: {
        type: 'number',
      },
      table: {
        defaultValue: {
          summary: 1,
        },
        type: {
          summary: 'number',
        },
      },
    },
    currentLevelOfSubcomponents: {
      name: 'current-level-of-subcomponents',
      description: 'The current elevation level of the subcomponents.',
      defaultValue: 0,
      control: {
        type: 'number',
      },
      table: {
        defaultValue: {
          summary: 0,
        },
        type: {
          summary: 'number',
        },
      },
    },
    deleteCacheAfterDisconnect: {
      name: 'delete-cache-after-disconnect',
      description: 'Determines whether the cache should be deleted after the top level component is disconnected from the DOM.',
      defaultValue: true,
      control: {
        type: 'boolean',
      },
      table: {
        defaultValue: {
          summary: true,
        },
        type: {
          summary: 'boolean',
        },
      },
    },
  },
  args: {
    value: '21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343',
    settings: '[]',
    openByDefault: false,
    amountOfItems: 10,
    hideSubcomponents: false,
    emphasizeComponent: true,
    levelOfSubcomponents: 1,
    currentLevelOfSubcomponents: 0,
    deleteCacheAfterDisconnect: false,
  },
};
const textDecorator = story =>
  html`<p class='items-center align-middle'>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit
    esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
    occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ${story()} Lorem
    ipsum dolor sit amet, consectetur adipiscing elit, sed do
    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis
    aute ${story()} irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
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
    settings: '[{"type":"ORCIDConfig","values":[{"name":"affiliationAt","value":949363200000},{"name":"showAffiliation","value":true}]}]',
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
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343' hide-subcomponents='true'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343' hide-subcomponents='true'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
        `,
      },
    },
  },
};
