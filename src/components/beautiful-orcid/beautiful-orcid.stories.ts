import {Meta, StoryObj} from "@storybook/html"

const meta: Meta = {
  title: "beautiful-orcid",
  component: "beautiful-orcid",
  tags: ["autodocs"],
  argTypes: {
    orcid: {
      name: "ORCID",
      description: "ORCID iD",
      control: {
        type: "text",
        required: true,
      }
    }
  },
  args: {
    orcid: "0009-0005-2800-4833",
  }
}
export default meta;
type Story = StoryObj

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


export const orcidInText = (args: {orcid: string}) => `
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<beautiful-orcid orcid="${args.orcid}"></beautiful-orcid>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`;
orcidInText.args = {
  orcid: "0009-0005-2800-4833",
}
orcidInText.parameters = {
  docs: {
    source: {
      code: `
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<beautiful-orcid orcid="0009-0005-2800-4833"></beautiful-orcid>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`
    }
  }
}
orcidInText.bind({})
