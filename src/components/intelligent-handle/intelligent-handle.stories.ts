import {Meta, StoryObj} from "@storybook/web-components"
import {html} from "lit";

const meta: Meta = {
  title: "prototypes/intelligent-handle",
  component: "intelligent-handle",
  tags: ["autodocs"],
  argTypes: {
    handle: {
      description: "The handle to highlight (required)",
      control: {
        required: true,
        type: "text"
      }
    },
    changingColors: {
      description: "Determines whether the integrated table changes colors every other row",
      defaultValue: true,
      control: {
        type: "boolean",
      }
    },
    openStatus: {
      description: "Determines whether the component is opened by default",
      defaultValue: false,
      control: {
        type: "boolean",
      }
    },
    showSubcomponents: {
      description: "Determines whether the subcomponents are shown",
      defaultValue: true,
      control: {
        type: "boolean",
      }
    },
    levelOfSubcomponents: {
      description: "The maximum level of subcomponents to show. ",
      defaultValue: 1,
      control: {
        type: "number",
      }
    },
    currentLevelOfSubcomponents: {
      description: "The current elevation level of the subcomponents.",
      defaultValue: 0,
      control: {
        type: "number",
      }
    }
  },
  args: {
    handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
    changingColors: true,
    openStatus: false,
    showSubcomponents: true,
    levelOfSubcomponents: 2,
    currentLevelOfSubcomponents: 0,
  }
}
const textDecorator = (story) => html`<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
  pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  ${story()} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
  dolore
  magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
  pariatur.
  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`
export default meta;
type Story = StoryObj

export const Default: Story = {
  args: {
    handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
  }, parameters: {
    docs: {
      source: {
        code: `<intelligent-handle handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343" changingColors="true" openStatus=false"></intelligent-handle>`
      }
    }
  }
}

export const HandleInText: Story = {
  args: {
    handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<intelligent-handle handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343"></intelligent-handle>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<intelligent-handle handle="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6"></intelligent-handle>
</p>`
      }
    }
  }
}
