import {Meta, StoryObj} from "@storybook/web-components"
import {html} from "lit";

const meta: Meta = {
  title: "prototypes/foldable-component",
  component: "foldable-component",
  tags: ["autodocs"],
  argTypes: {
    changingColors: {
      description: "Determines whether the integrated table changes colors every other row",
      defaultValue: true,
      control: {
        type: "boolean",
      }
    },
    openStatus: {
      description: "Determines whether the component is opened by default",
      defaultValue: true,
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
    changingColors: true,
    openStatus: true,
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
}

export const HandleInText: Story = {
  decorators: [textDecorator],
}
