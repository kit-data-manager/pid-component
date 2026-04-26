import { html } from 'lit';
import { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, waitFor } from 'storybook/test';
import {
  DOI_examples,
  HANDLE_examples,
  ORCID_examples,
  ROR_examples,
  SPDX_examples,
  URL_examples,
  EMAIL_examples,
  DATE_examples,
  JSON_examples,
  LOCALE_examples,
} from '../../../../../examples';


/**
 * The pid-component is a versatile component for displaying and interacting with
 * persistent identifiers (PIDs). It supports various display modes, subcomponent
 * management, and adaptive pagination.
 */
const meta: Meta = {
  title: 'pid-component',
  id: '01-pid-component',
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
        defaultValue: { summary: 'false' },
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
      description: 'Determines whether subcomponents should generally be shown or not. If true, no nested sub-components are rendered.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    emphasizeComponent: {
      description: 'Determines whether components should be emphasized towards their surrounding by border and shadow-sm',
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
    defaultTTL: {
      description: 'Default time-to-live for cached responses in milliseconds (default: 86400000 = 24 hours)',
      control: { type: 'number', min: 0 },
      table: {
        defaultValue: { summary: '86400000' },
        type: { summary: 'number' },
      },
    },
    width: {
      description: 'Initial width of the component (e.g. "500px", "50%"). If not set, defaults to 500px on large screens, 400px on medium, 300px on small.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    height: {
      description: 'Initial height of the component (e.g. "300px", "50vh"). If not set, defaults to 300px.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    darkMode: {
      description: 'The dark mode setting for the component',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        type: { summary: '"light" | "dark" | "system"' },
        defaultValue: { summary: 'light' },
      },
    },
    renderers: {
      description:
        'An ordered list of renderer keys to try first (JSON string array, non-binding preselection). These are tried in order; if none match, the full registry is used (unless fallbackToAll is false).',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    fallbackToAll: {
      description:
        'When renderers is set and no listed renderer matches, fall back to the full default renderer registry. Set to false to strictly restrict to listed renderers only.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
  args: {
    value: HANDLE_examples.FDO_BARE,
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

/**
 * Default story showing a Handle PID in its collapsed initial state.
 * Click the component to expand and see the resolved record.
 */
export const Default: Story = {
  id: 'pid-component-default',
  args: {
    value: HANDLE_examples.FDO_BARE,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='${HANDLE_examples.FDO_BARE}'></pid-component>
        `,
      },
    },
  },
};

/**
 * Resolves a Handle PID and displays its record entries (URL, checksum, etc.)
 * in a structured, expandable table. Starts expanded.
 */
export const Handle: Story = {
  id: 'pid-component-handle',
  // Exclude from vitest: this test requires network access to resolve PIDs
  // from handle.net and can time out in CI environments.
  tags: ['!test'],
  args: {
    value: HANDLE_examples.FDO_BARE,
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='${HANDLE_examples.FDO_BARE}' open-by-default='true'></pid-component>
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for component to hydrate (requires network access to resolve the PID)
    await waitFor(() => {
      const pidComponent = canvasElement.querySelector('pid-component');
      expect(pidComponent).toBeTruthy();
      expect(pidComponent!.classList.contains('hydrated')).toBeTruthy();
    }, { timeout: 30000 });
  },
};

/**
 * Shows a Handle PID with subcomponents disabled. Only the collapsed
 * preview is shown -- clicking will not expand to show the resolved record.
 * Useful when you want a compact, non-interactive identifier display.
 */
export const HandleWithoutSubcomponent: Story = {
  id: 'pid-component-handle-without-subcomponent',
  args: {
    value: HANDLE_examples.FDO_BARE,
    hideSubcomponents: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='${HANDLE_examples.FDO_BARE}' hide-subcomponents='true'></pid-component>
        `,
      },
    },
  },
};

/**
 * Resolves an ORCiD and displays the researcher's name, biography, and
 * affiliations fetched from the ORCID API. Starts expanded.
 */
export const ORCID: Story = {
  id: 'pid-component-orcid',
  args: {
    value: ORCID_examples.VALID,
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='${ORCID_examples.VALID}' open-by-default='true'></pid-component>
        `,
      },
    },
  },
};

/**
 * Resolves a ROR ID and displays the organization name, acronyms, location,
 * and related organizations. Starts expanded.
 */
export const ROR: Story = {
  id: 'pid-component-ror',
  args: {
    value: ROR_examples.VALID,
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${ROR_examples.VALID}' open-by-default='true'></pid-component>`,
      },
    },
  },
};

/**
 * Recognizes an SPDX license URL and displays the license name with a link
 * to the full license text. Starts expanded.
 */
export const SPDXLong: Story = {
  id: 'pid-component-spdx-long',
  args: {
    value: SPDX_examples.APACHE_2_0,
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${SPDX_examples.APACHE_2_0}' open-by-default='true'></pid-component>`,
      },
    },
  },
};

/**
 * Recognizes a bare SPDX license identifier (without URL prefix).
 * Shows a compact preview -- click to expand.
 */
export const SPDXShort: Story = {
  id: 'pid-component-spdx-short',
  args: {
    value: SPDX_examples.APACHE_2_0_BARE,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${SPDX_examples.APACHE_2_0_BARE}'></pid-component>`,
      },
    },
  },
};

/**
 * Detects an ISO 8601 date string and renders it in a human-readable,
 * locale-aware format. Dates are simple types with no expandable details.
 */
export const Date: Story = {
  id: 'pid-component-date',
  args: {
    value: DATE_examples.ISO_8601,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${DATE_examples.ISO_8601}'></pid-component>`,
      },
    },
  },
};

/**
 * Renders a URL as a clickable external link. URLs are simple types with
 * no expandable details.
 */
export const URL: Story = {
  id: 'pid-component-url',
  args: {
    value: URL_examples.KIT_WEBSITE,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${URL_examples.KIT_WEBSITE}'></pid-component>`,
      },
    },
  },
};

/**
 * Renders an email address as a clickable mailto link.
 */
export const Email: Story = {
  id: 'pid-component-email',
  args: {
    value: EMAIL_examples.VALID,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${EMAIL_examples.VALID}'></pid-component>`,
      },
    },
  },
};

/**
 * Handles comma-separated email addresses and renders each one
 * as a clickable mailto link.
 */
export const CommaSeperatedMails: Story = {
  id: 'pid-component-comma-separated-mails',
  args: {
    value: `${EMAIL_examples.VALID}, ${EMAIL_examples.VALID_ALT}`,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${EMAIL_examples.VALID}, ${EMAIL_examples.VALID_ALT}'></pid-component>`,
      },
    },
  },
};

/**
 * When the value does not match any known identifier type, the component
 * renders it as plain text. This is the catch-all fallback behavior.
 */
export const Fallback: Story = {
  id: 'pid-component-fallback',
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

/**
 * Demonstrates recursive rendering: a Handle record that contains an ORCiD
 * as one of its values. The ORCiD is automatically detected and rendered
 * as a nested sub-component inside the Handle record.
 */
export const ORCIDInRecord: Story = {
  id: 'pid-component-orcid-in-record',
  args: {
    value: HANDLE_examples.FDO_TYPED,
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${HANDLE_examples.FDO_TYPED}' open-by-default='true'></pid-component>`,
      },
    },
  },
};

/**
 * Same Handle record as above, but with `amountOfItems` set to 100 so
 * all record entries are visible on a single page without pagination.
 */
export const ORCIDInRecordWithoutLimit: Story = {
  id: 'pid-component-orcid-in-record-without-limit',
  args: {
    value: HANDLE_examples.FDO_TYPED,
    amountOfItems: 100,
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `<pid-component value='${HANDLE_examples.FDO_TYPED}' amount-of-items='100' open-by-default='true'></pid-component>`,
      },
    },
  },
};

/**
 * Demonstrates per-type settings: the `settings` prop passes configuration
 * to the ORCiD sub-component, showing the affiliation valid at a specific
 * date (2000-02-01).
 */
export const ORCIDInRecordWithSettings: Story = {
  id: 'pid-component-orcid-in-record-with-settings',
  args: {
    value: HANDLE_examples.FDO_TYPED,
    settings: '[{"type":"ORCIDType","values":[{"name":"affiliationAt","value":949363200000},{"name":"showAffiliation","value":true}]}]',
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value='${HANDLE_examples.FDO_TYPED}' settings='[{"type":"ORCIDType","values":[{"name":"affiliationAt","value":949363200000},{"name":"showAffiliation","value":true}]}]'></pid-component>
        `,
      },
    },
  },
};

/**
 * Shows the component inline within a paragraph of text. The component
 * starts collapsed and blends into the surrounding text. Clicking
 * expands it in place with an overlay.
 */
export const HandleInText: Story = {
  id: 'pid-component-handle-in-text',
  args: {
    value: HANDLE_examples.FDO_TYPED,
    openByDefault: false,
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <pid-component value='${HANDLE_examples.FDO_TYPED}'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='${HANDLE_examples.FDO_TYPED}'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`,
      },
    },
  },
};

/**
 * Same inline scenario but with `emphasizeComponent` set to false. The
 * component has no border or shadow, blending even more seamlessly into
 * the surrounding text.
 */
export const HandleInTextNotEmphasized: Story = {
  id: 'pid-component-handle-in-text-not-emphasized',
  args: {
    value: HANDLE_examples.FDO_TYPED,
    emphasizeComponent: false,
    openByDefault: false,
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <pid-component value='${HANDLE_examples.FDO_TYPED}' emphasize-component="false"></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='${HANDLE_examples.FDO_TYPED}' emphasize-component="false"></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`,
      },
    },
  },
};

/**
 * An ORCiD identifier used inline within running text. Starts collapsed
 * to show the compact preview alongside the surrounding content.
 */
export const ORCIDInText: Story = {
  id: 'pid-component-orcid-in-text',
  args: {
    value: ORCID_examples.VALID,
    openByDefault: false,
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <pid-component value='${ORCID_examples.VALID}'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='${ORCID_examples.VALID}'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>`,
      },
    },
  },
};

/**
 * A Handle PID inline in text with both `hideSubcomponents` and
 * `emphasizeComponent` disabled. This is the most minimal inline
 * appearance -- just the identifier text with no border, shadow,
 * or expandable content.
 */
export const HandleWithoutSubcomponentInText: Story = {
  id: 'pid-component-handle-without-subcomponent-in-text',
  args: {
    value: HANDLE_examples.FDO_BARE,
    hideSubcomponents: true,
    emphasizeComponent: false,
    openByDefault: false,
  },
  decorators: [textDecorator],
  parameters: {
    docs: {
      source: {
        code: `
<p class='align-middle items-center'>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<pid-component value='${HANDLE_examples.FDO_BARE}' hide-subcomponents='true'  emphasize-component='false'></pid-component>
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute <pid-component value='${HANDLE_examples.FDO_BARE}' hide-subcomponents='true' emphasize-component='false'></pid-component> irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>
        `,
      },
    },
  },
};

/**
 * A real-world example: a PID embedded in a descriptive paragraph about
 * the Typed PID Maker. The component starts collapsed so it reads naturally
 * as part of the sentence.
 */
export const TypedPIDMakerExampleText: Story = {
  id: 'pid-component-typed-pid-maker-text',
  args: {
    value: HANDLE_examples.FDO_TYPED,
    openByDefault: false,
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
 * Demonstrates the component in dark mode. The component and all its
 * sub-components adapt their colors for dark backgrounds.
 */
export const DarkMode: Story = {
  id: 'pid-component-dark-mode',
  args: {
    value: HANDLE_examples.FDO_BARE,
    darkMode: 'dark',
    openByDefault: true,
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value="${HANDLE_examples.FDO_BARE}" dark-mode="dark" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates the component in light mode (the default).
 */
export const LightMode: Story = {
  id: 'pid-component-light-mode',
  args: {
    value: HANDLE_examples.FDO_BARE,
    darkMode: 'light',
    openByDefault: true,
  },
  globals: {
    backgrounds: { value: 'light' },
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value="${HANDLE_examples.FDO_BARE}" dark-mode="light" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Uses the operating system's color scheme preference. The component
 * automatically switches between light and dark based on the user's
 * system setting.
 */
export const SystemMode: Story = {
  id: 'pid-component-system-mode',
  args: {
    value: HANDLE_examples.FDO_BARE,
    darkMode: 'system',
    openByDefault: true,
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-component value="${HANDLE_examples.FDO_BARE}" dark-mode="system" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with DataCite metadata - Journal Paper
 */
export const DOI_DataCite_JournalPaper: Story = {
  id: 'pid-component-doi-datacite-journal-paper',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a journal paper DOI with metadata from DataCite.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with CrossRef metadata - Journal Paper
 */
export const DOI_CrossRef_JournalPaper: Story = {
  id: 'pid-component-doi-crossref-journal-paper',
  args: {
    value: DOI_examples.CROSSREF_JOURNAL_PAPER,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a journal paper DOI with metadata from CrossRef.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.CROSSREF_JOURNAL_PAPER}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with DataCite metadata - Software on Zenodo
 */
export const DOI_DataCite_Software: Story = {
  id: 'pid-component-doi-datacite-software',
  args: {
    value: DOI_examples.DATACITE_SOFTWARE,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays software DOI from Zenodo with DataCite metadata.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.DATACITE_SOFTWARE}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with DataCite metadata - RFC Document
 */
export const DOI_DataCite_RFC: Story = {
  id: 'pid-component-doi-datacite-rfc',
  args: {
    value: DOI_examples.DATACITE_RFC,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays an RFC document DOI with DataCite metadata.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.DATACITE_RFC}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with CrossRef metadata - Book
 */
export const DOI_CrossRef_Book: Story = {
  id: 'pid-component-doi-crossref-book',
  args: {
    value: DOI_examples.CROSSREF_BOOK,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a book DOI with metadata from CrossRef.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.CROSSREF_BOOK}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with DataCite metadata - Slides/Presentation
 */
export const DOI_DataCite_Slides: Story = {
  id: 'pid-component-doi-datacite-slides',
  args: {
    value: DOI_examples.DATACITE_SLIDES,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a presentation/slides DOI with DataCite metadata.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.DATACITE_SLIDES}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with DataCite metadata - arXiv Preprint
 */
export const DOI_DataCite_Preprint: Story = {
  id: 'pid-component-doi-datacite-preprint',
  args: {
    value: DOI_examples.DATACITE_PREPRINT,
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays an arXiv preprint DOI with DataCite metadata.',
      },
      source: {
        code: `
<pid-component value="${DOI_examples.DATACITE_PREPRINT}" open-by-default="true"></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates DOI rendering with different citation styles
 */
export const DOI_CitationStyles: Story = {
  id: 'pid-component-doi-citation-styles',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    openByDefault: false,
    settings: JSON.stringify([
      {
        type: 'DOIType',
        values: [
          { name: 'citationStyle', value: 'APA' }
        ]
      }
    ]),
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how to configure citation style (APA, Chicago, IEEE, Harvard, Anglia Ruskin) via settings.',
      },
      source: {
        code: `
<pid-component
  value="${DOI_examples.DATACITE_JOURNAL_PAPER}"
  settings='[{"type":"DOIType","values":[{"name":"citationStyle","value":"APA"}]}]'
></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates rendering of a JSON object
 */
export const JSON_Object: Story = {
  id: 'pid-component-json-object',
  args: {
    value: JSON.stringify(JSON_examples.NESTED),
    openByDefault: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders a JSON object with syntax highlighting and tree view.',
      },
      source: {
        code: `
<pid-component value='${JSON.stringify(JSON_examples.NESTED)}'></pid-component>
        `,
      },
    },
  },
};

/**
 * Demonstrates rendering of a Locale
 */
export const Locale: Story = {
  id: 'pid-component-locale',
  args: {
    value: LOCALE_examples.DE_DE,
  },
  parameters: {
    docs: {
      description: {
        story: 'Renders a locale code with its flag and name.',
      },
      source: {
        code: `
<pid-component value='${LOCALE_examples.DE_DE}'></pid-component>
        `,
      },
    },
  },
};

// ==========================================
// Ordered Renderer List Stories
// ==========================================

/**
 * Restricts detection to only the DOIType renderer.
 * Since the value is a DOI, it matches and renders normally.
 */
export const RenderersMatchingDOI: Story = {
  id: 'pid-component-renderers-matching-doi',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    renderers: '["DOIType"]',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `renderers` prop to restrict detection to only DOIType. The DOI value matches, so it renders as expected.',
      },
      source: {
        code: `
<pid-component value='${DOI_examples.DATACITE_JOURNAL_PAPER}' renderers='["DOIType"]'></pid-component>
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for auto-detection and check output
    await waitFor(() => {
      const pidComponent = canvasElement.querySelector('pid-component');
      expect(pidComponent).toBeTruthy();
      expect((pidComponent as HTMLPidComponentElement).renderers).toEqual('["DOIType"]');
    }, { timeout: 5000 });
  },
};

/**
 * Preselects ORCIDType, but the value is a DOI. Since renderers is a
 * non-binding preselection, the component falls back to the full registry
 * and correctly renders it as a DOI.
 */
export const RenderersPreselectionFallback: Story = {
  id: 'pid-component-renderers-preselection-fallback',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    renderers: '["ORCIDType"]',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `renderers` prop with only ORCIDType, but the value is a DOI. Since renderers is a non-binding preselection (fallbackToAll defaults to true), the component falls back to the full registry and renders as a DOI.',
      },
      source: {
        code: `
<pid-component value='${DOI_examples.DATACITE_JOURNAL_PAPER}' renderers='["ORCIDType"]'></pid-component>
        `,
      },
    },
  },
};

/**
 * Strictly restricts detection to only ORCIDType with fallbackToAll=false.
 * Since ORCIDType doesn't match the DOI value and fallback is disabled,
 * the component renders nothing (unmatched state).
 */
export const RenderersStrictRestriction: Story = {
  id: 'pid-component-renderers-strict-restriction',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    renderers: '["ORCIDType"]',
    fallbackToAll: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Strictly restricts detection to ORCIDType only with `fallback-to-all="false"`. Since ORCIDType does not match the DOI, and fallback is disabled, the component is invisible (unmatched state).',
      },
      source: {
        code: `
<pid-component value='${DOI_examples.DATACITE_JOURNAL_PAPER}' renderers='["ORCIDType"]' fallback-to-all='false'></pid-component>
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    await new Promise(r => setTimeout(r, 3000));
    const pidComponent = canvasElement.querySelector('pid-component');
    expect(pidComponent).toBeTruthy();
    // Component should exist but be invisible (unmatched state)
    expect((pidComponent as HTMLPidComponentElement).fallbackToAll).toBe(false);
  },
};

/**
 * Demonstrates ordering priority: HandleType is listed before DOIType.
 * Since DOIs also match HandleType's regex, the Handle renderer is used
 * instead of the DOI renderer because it appears first in the ordered list.
 */
export const RenderersOrderPriority: Story = {
  id: 'pid-component-renderers-order-priority',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    renderers: '["HandleType", "DOIType"]',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The ordered list puts HandleType before DOIType. Since a DOI like `10.5445/IR/1000185135` also matches the Handle PID regex, the Handle renderer is used first because it appears earlier in the list.',
      },
      source: {
        code: `
<pid-component value='${DOI_examples.DATACITE_JOURNAL_PAPER}' renderers='["HandleType", "DOIType"]'></pid-component>
        `,
      },
    },
  },
};

/**
 * Multiple renderers in the preferred order: DOIType first, then HandleType.
 * The DOI value matches DOIType first, so the DOI renderer is used.
 */
export const RenderersCorrectOrder: Story = {
  id: 'pid-component-renderers-correct-order',
  args: {
    value: DOI_examples.DATACITE_JOURNAL_PAPER,
    renderers: '["DOIType", "HandleType"]',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The ordered list puts DOIType before HandleType. The DOI matches DOIType first, so the DOI renderer is used as expected.',
      },
      source: {
        code: `
<pid-component value='${DOI_examples.DATACITE_JOURNAL_PAPER}' renderers='["DOIType", "HandleType"]'></pid-component>
        `,
      },
    },
  },
};

