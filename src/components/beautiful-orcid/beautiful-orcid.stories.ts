import {Meta, StoryObj} from "@storybook/web-components"
import {html} from "lit";

const meta: Meta = {
  title: "beautiful-orcid",
  component: "beautiful-orcid",
  tags: ["autodocs"],
  argTypes: {
    orcid: {
      name: "orcid",
      description: "The ORCiD to display in the component.",
      control: {
        type: "text",
        required: true,
      }
    },
    showAffiliation: {
      name: "showAffiliation",
      description: "Whether to show the affiliation of the person.",
      defaultValue: true,
      control: {
        type: "boolean"
      }
    },
    showDepartment: {
      name: "showDepartment",
      description: "Whether to show the department of the person, if available.",
      defaultValue: true,
      control: {
        type: "boolean"
      }
    },
    affiliationAt: {
      name: "affiliationAt",
      description: "The date at which to show the affiliation of the person. Defaults to the current date.",
      defaultValue: new Date(),
      control: {
        type: "date"
      }
    }
  },
  args: {
    orcid: "0009-0005-2800-4833",
    showAffiliation: true,
    showDepartment: true,
    affiliationAt: new Date(),
  }
}
export default meta;
type Story = StoryObj
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

export const Default: Story = {
  args: {
    orcid: "0009-0005-2800-4833",
  }, parameters: {
    docs: {
      source: {
        code: `<beautiful-orcid orcid="0009-0005-2800-4833"></beautiful-orcid>`
      }
    }
  }
}

export const WithoutAffiliation: Story = {
  args: {
    orcid: "0009-0005-2800-4833",
    showAffiliation: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<beautiful-orcid orcid="0009-0005-2800-4833" showAffiliation="false"></beautiful-orcid>`
      }
    }
  }
}

export const WithoutDepartment: Story = {
  args: {
    orcid: "0009-0005-2800-4833",
    showDepartment: false,
  },
  parameters: {
    docs: {
      source: {
        code: `<beautiful-orcid orcid="0009-0005-2800-4833" showDepartment="false"></beautiful-orcid>`
      }
    }
  }
}

export const orcidInText: Story = {
  name: "ORCiD in text",
  args: {
    orcid: "0009-0005-2800-4833",
    showAffiliation: true,
    showDepartment: true,
    affiliationAt: new Date(),
  },
  decorators: [
    textDecorator
  ]
}

export const orcidWithoutAffiliationInText: Story = {
  name: "ORCiD without affiliation in text",
  args: {
    orcid: "0009-0005-2800-4833",
    showAffiliation: false,
  },
  decorators: [
    textDecorator
  ]
}
