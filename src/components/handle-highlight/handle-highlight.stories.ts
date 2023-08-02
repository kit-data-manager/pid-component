import {Meta, StoryObj} from "@storybook/html"

const meta: Meta = {
  title: "handle-highlight",
  component: "handle-highlight",
  tags: ["autodocs"],
  argTypes: {
    handle: {
      description: "The handle to highlight (required)",
      control: {
        required: true,
        type: "text"
      }
    },
    linkTo: {
      description: "Where the web component links to",
      options: ["fairdoscope", "resolveRef", "disable"],
      defaultValue: ["fairdoscope"],
      control: {
        type: "radio",
      }
    },
    filled: {
      description: "Chooses between filled and outlined style",
      defaultValue: false,
      control: {
        type: "boolean",
      }
    },
  },
  args: {
    handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
    filled: false,
  }
}
export default meta;
type Story = StoryObj

export const Default: Story = {
  args: {
    handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
    filled: false,
  }, parameters: {
    docs: {
      source: {
        code: `<handle-highlight handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343"></handle-highlight>`
      }
    }
  }
}

export const Filled: Story = {
  args: {
    handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
    filled: true,
  }, parameters: {
    docs: {
      source: {
        code: `<handle-highlight handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343" filled></handle-highlight>`
      }
    }
  }
}

export const LinkDeactivated: Story = {
  storyName: "Link deactivated",
  args: {
    handle: "21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6",
    linkTo: "disable",
  }, parameters: {
    docs: {
      source: {
        code: `<handle-highlight handle="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6" linkTo="disable"></handle-highlight>`
      }
    }
  }
}

export const LinkResolved: Story = {
  storyName: "Link resolving via Handle Resolver",
  args: {
    handle: "10.5281/zenodo.5872645",
    linkTo: "resolveRef",
  }, parameters: {
    docs: {
      source: {
        code: `<handle-highlight handle="10.5281/zenodo.5872645" linkTo="resolveRef"></handle-highlight>`
      }
    }
  }
}

export const HandleInText = (args: {
  handle: string,
  linkTo: ["fairdoscope", "resolveRef", "disable"],
  filled: boolean,
}) => `
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<handle-highlight handle="${args.handle}" linkTo="${args.linkTo}" filled="${args.filled}"></handle-highlight>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`;
HandleInText.args = {
  handle: "21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343",
}
HandleInText.parameters = {
  docs: {
    source: {
      code: `
<p>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
<handle-highlight handle="21.11152/B88E78D4-E1EE-40F7-96CE-EC1AFCFF6343"></handle-highlight>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`
    }
  }
}
HandleInText.bind({})
