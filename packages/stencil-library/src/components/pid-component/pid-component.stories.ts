import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { FoldableItem } from '../../utils/FoldableItem';
import { FoldableAction } from '../../utils/FoldableAction';

/**
 * Create mock data items for the stories
 */
const createMockItems = (count: number): FoldableItem[] => {
  return Array.from({ length: count }, (_, i) => {
    return new FoldableItem(
      i, // priority
      `Property ${i + 1}`, // keyTitle
      `Value for property ${i + 1}. This is a sample value that demonstrates the content.`, // value
      `Tooltip for Property ${i + 1}`, // keyTooltip
      `https://example.com/property/${i + 1}`, // keyLink
      undefined, // valueRegex
      false, // renderDynamically
    );
  });
};

/**
 * Create mock actions for the stories
 */
const createMockActions = (count: number): FoldableAction[] => {
  const styles: ('primary' | 'secondary' | 'danger')[] = ['primary', 'secondary', 'danger'];

  return Array.from({ length: count }, (_, i) => {
    const style = styles[i % styles.length];
    return new FoldableAction(
      i, // priority
      `Action ${i + 1}`, // title
      `https://example.com/action/${i + 1}`, // link
      style, // style
    );
  });
};

/**
 * Mock implementation of GenericIdentifierType for demos
 */
class MockIdentifier {
  value: string;
  items: FoldableItem[];
  actions: FoldableAction[];

  constructor(value: string, itemCount: number = 5, actionCount: number = 2) {
    this.value = value;
    this.items = createMockItems(itemCount);
    this.actions = createMockActions(actionCount);
  }

  renderPreview() {
    return this.value;
  }

  renderBody() {
    return null;
  }
}

/**
 * The pid-component is a versatile component for displaying and interacting with
 * persistent identifiers (PIDs). It supports various display modes, subcomponent
 * management, and adaptive pagination.
 */
const meta: Meta = {
  title: 'Components/PID Component',
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
    adaptivePagination: {
      description: 'Enable adaptive pagination based on available space',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    minItemsPerPage: {
      description: 'Minimum number of items to show per page when using adaptive pagination',
      control: {
        type: 'number',
        min: 1,
      },
      table: {
        defaultValue: { summary: '5' },
        type: { summary: 'number' },
      },
    },
    maxItemsPerPage: {
      description: 'Maximum number of items to show per page when using adaptive pagination',
      control: {
        type: 'number',
        min: 1,
      },
      table: {
        defaultValue: { summary: '50' },
        type: { summary: 'number' },
      },
    },
    width: {
      description: 'Initial width of the component',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    height: {
      description: 'Initial height of the component',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: {
    value: 'Example Value',
    settings: '[]',
    openByDefault: false,
    amountOfItems: 10,
    levelOfSubcomponents: 1,
    currentLevelOfSubcomponents: 0,
    hideSubcomponents: false,
    emphasizeComponent: true,
    showTopLevelCopy: true,
    adaptivePagination: false,
    minItemsPerPage: 5,
    maxItemsPerPage: 50,
    width: '500px',
    height: '300px',
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

/**
 * Helper function to create a pid-component with mock data
 */
const createComponentWithMockData = (props: Record<string, any>) => {
  // Create container with padding and Tailwind classes
  const container = document.createElement('div');
  container.className = 'p-4 bg-white rounded-md';

  // Create and configure the component
  const component = document.createElement('pid-component');

  // Apply all properties
  Object.entries(props).forEach(([key, value]) => {
    component[key] = value;
  });

  // For demo purposes, mock the database retrieval
  // @ts-ignore - Accessing private state for demo
  component.identifierObject = new MockIdentifier(props.value, 10, 3);
  // @ts-ignore - Manually trigger state update
  component.displayStatus = 'loaded';
  // @ts-ignore - Manually populate items and actions
  component.items = createMockItems(10);
  // @ts-ignore - Manually populate actions
  component.actions = createMockActions(3);

  container.appendChild(component);
  return container;
};

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
      <p class="align-middle items-center w-1/3">
        The Typed PID Maker is an entry point to integrate digital resources into the FAIR Digital Object (FAIR DO) ecosystem. It allows creating PIDs for resources and to provide
        them with the necessary metadata to ensure that the resources can be found and understood. <br />
        As a result, a machine-readable representation of all kinds of research artifacts allows act on such FAIR Digital Objects which present themselves as PID, e.g., ${story()},
        but carry much more than just a pointer to a landing page.
      </p>
    `,
  ],
};

/**
 * Component with adaptive pagination enabled
 */
export const WithAdaptivePagination: Story = {
  args: {
    value: 'Adaptive Pagination Component',
    openByDefault: true,
    adaptivePagination: true,
    width: '600px',
    height: '400px',
  },
  render: args => {
    return createComponentWithMockData(args);
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component
  value="Adaptive Pagination Component"
  openByDefault="true"
  adaptivePagination="true"
  width="600px"
  height="400px"
></pid-component>
        `,
      },
    },
  },
};

/**
 * Component with custom dimensions
 */
export const CustomDimensions: Story = {
  args: {
    value: 'Custom Size Component',
    openByDefault: true,
    width: '700px',
    height: '350px',
  },
  render: args => {
    return createComponentWithMockData(args);
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component
  value="Custom Size Component"
  openByDefault="true"
  width="700px"
  height="350px"
></pid-component>
        `,
      },
    },
  },
};

/**
 * Component with subcomponents hidden
 */
export const HiddenSubcomponents: Story = {
  args: {
    value: 'No Subcomponents Component',
    hideSubcomponents: true,
    openByDefault: true,
  },
  render: args => {
    return createComponentWithMockData(args);
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component
  value="No Subcomponents Component"
  hideSubcomponents="true"
  openByDefault="true"
></pid-component>
        `,
      },
    },
  },
};

/**
 * Comparison of standard and adaptive pagination
 */
export const PaginationComparison: Story = {
  render: () => {
    const container = document.createElement('div');
    container.className = 'space-y-4';

    // Header
    const header = document.createElement('div');
    header.className = 'text-center p-2 bg-blue-50 rounded-md';
    header.innerHTML = 'Compare Standard (fixed) vs Adaptive Pagination';
    container.appendChild(header);

    // Wrapper for the two columns
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col md:flex-row gap-4 bg-gray-100 p-4 rounded-md';

    // Standard pagination column
    const standardCol = document.createElement('div');
    standardCol.className = 'flex-1';

    const standardLabel = document.createElement('div');
    standardLabel.className = 'font-bold mb-2 p-1 bg-white rounded-md text-center';
    standardLabel.textContent = 'Standard Pagination';
    standardCol.appendChild(standardLabel);

    const standardComponent = document.createElement('pid-component');
    standardComponent.value = 'https://example.com/sample';
    standardComponent.openByDefault = true;
    standardComponent.width = '100%';
    standardComponent.height = '400px';
    standardComponent.amountOfItems = 10;

    // Mock data for standard component
    // @ts-ignore - Accessing private state for demo
    standardComponent.identifierObject = new MockIdentifier('https://example.com/sample', 25, 3);
    // @ts-ignore - Manually trigger state update
    standardComponent.displayStatus = 'loaded';
    // @ts-ignore - Manually populate items and actions
    standardComponent.items = createMockItems(25);
    // @ts-ignore - Manually populate actions
    standardComponent.actions = createMockActions(3);

    standardCol.appendChild(standardComponent);
    wrapper.appendChild(standardCol);

    // Adaptive pagination column
    const adaptiveCol = document.createElement('div');
    adaptiveCol.className = 'flex-1';

    const adaptiveLabel = document.createElement('div');
    adaptiveLabel.className = 'font-bold mb-2 p-1 bg-white rounded-md text-center';
    adaptiveLabel.textContent = 'Adaptive Pagination';
    adaptiveCol.appendChild(adaptiveLabel);

    const adaptiveComponent = document.createElement('pid-component');
    adaptiveComponent.value = 'https://example.com/sample';
    adaptiveComponent.openByDefault = true;
    adaptiveComponent.width = '100%';
    adaptiveComponent.height = '400px';
    adaptiveComponent.adaptivePagination = true;
    adaptiveComponent.amountOfItems = 10;

    // Mock data for adaptive component
    // @ts-ignore - Accessing private state for demo
    adaptiveComponent.identifierObject = new MockIdentifier('https://example.com/sample', 25, 3);
    // @ts-ignore - Manually trigger state update
    adaptiveComponent.displayStatus = 'loaded';
    // @ts-ignore - Manually populate items and actions
    adaptiveComponent.items = createMockItems(25);
    // @ts-ignore - Manually populate actions
    adaptiveComponent.actions = createMockActions(3);

    adaptiveCol.appendChild(adaptiveComponent);
    wrapper.appendChild(adaptiveCol);

    container.appendChild(wrapper);
    return container;
  },
  parameters: {
    docs: {
      source: {
        code: `
<!-- Standard Pagination -->
<pid-component
  value="https://example.com/sample"
  openByDefault="true"
  width="100%"
  height="400px"
  amountOfItems="10"
></pid-component>

<!-- Adaptive Pagination -->
<pid-component
  value="https://example.com/sample"
  openByDefault="true"
  width="100%"
  height="400px"
  adaptivePagination="true"
  amountOfItems="10"
></pid-component>
        `,
      },
    },
  },
};
