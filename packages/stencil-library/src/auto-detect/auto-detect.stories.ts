import { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, userEvent } from 'storybook/test';
import {
  DOI_examples,
  HANDLE_examples,
  ORCID_examples,
  ROR_examples,
  SPDX_examples,
  URL_examples,
  EMAIL_examples,
  DATE_examples,
  LOCALE_examples,
} from '../../../../examples';

/**
 * The `initPidDetection()` function enables automatic detection and rendering
 * of PIDs on a webpage. It scans text content within a root element, identifies
 * PID patterns (DOIs, ORCiDs, Handle PIDs, ROR IDs, SPDX license URLs, emails,
 * URLs, etc.), and replaces them with interactive `<pid-component>` elements.
 *
 * Original text remains visible until the component has fully loaded, ensuring
 * no layout shift or broken content. If a component fails to load, the original
 * text is restored automatically.
 *
 * **Key features:**
 * - Scans any DOM subtree for PIDs embedded in text
 * - Sanitizes surrounding punctuation (dots, commas, quotes, brackets, etc.)
 * - Supports an ordered renderer preselection for performance and control
 * - Optional MutationObserver for dynamic content (SPAs)
 * - Controller API with `stop()`, `rescan()`, and `destroy()` methods
 * - Screen-reader accessible (aria-hidden toggling)
 *
 * Not all renderers participate in auto-detection by default. Each renderer
 * has an `autoDiscoverableByDefault` flag in the registry. When no explicit
 * `renderers` list is provided, only renderers with this flag set to `true`
 * are used (currently: `DateType`, `ORCIDType`, `DOIType`, `HandleType`,
 * `RORType`, `SPDXType`). To activate additional renderers like `EmailType`,
 * `URLType`, `LocaleType`, or `JSONType`, pass them explicitly.
 *
 * **Import and use:**
 * ```typescript
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * // Uses only auto-discoverable renderers by default
 * const controller = initPidDetection({
 *   root: document.getElementById('my-content'),
 * });
 *
 * // Explicitly activate additional renderers
 * const controller = initPidDetection({
 *   root: document.getElementById('my-content'),
 *   renderers: ['DOIType', 'ORCIDType', 'HandleType', 'EmailType', 'URLType'],
 *   darkMode: 'system',
 *   observe: true,
 * });
 *
 * // Later:
 * controller.stop();     // pause MutationObserver
 * controller.rescan();   // re-scan the DOM
 * controller.destroy();  // tear down everything, restore original text
 * ```
 */
const meta: Meta = {
  title: 'auto-detection',
  tags: ['autodocs', '!test'],
  id: '02-pid-component-auto-detection',
  docs: {
    toc: true,
  },
  argTypes: {
    darkMode: {
      description: 'Dark mode setting for all auto-detected components.',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        category: 'Appearance',
        type: { summary: '"light" | "dark" | "system"' },
        defaultValue: { summary: 'light' },
      },
    },
    renderers: {
      description:
        'Ordered list of renderer keys to activate (comma-separated for this demo). If empty, only renderers with `autoDiscoverableByDefault: true` are used. Set explicitly to activate non-default renderers like `EmailType`, `URLType`, `LocaleType`. Available keys: `DateType`, `ORCIDType`, `DOIType`, `HandleType`, `RORType`, `SPDXType`, `EmailType`, `URLType`, `LocaleType`, `JSONType`.',
      control: { type: 'text' },
      table: {
        category: 'Detection',
        type: { summary: 'string[]' },
        defaultValue: { summary: 'auto-discoverable renderers only' },
      },
    },
    fallbackToAll: {
      description:
        'When `renderers` is set and no listed renderer matches a token, fall back to the full default renderer registry. Set to `false` to strictly restrict detection to only the listed renderers.',
      control: { type: 'boolean' },
      table: {
        category: 'Detection',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    exclude: {
      description:
        'CSS selector for elements to exclude from scanning. Elements matching this selector (and their descendants) will be skipped.',
      control: { type: 'text' },
      table: {
        category: 'Detection',
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
    observe: {
      description:
        'Enable a MutationObserver to automatically scan new DOM nodes as they are added to the root. Essential for SPAs where content loads dynamically.',
      control: { type: 'boolean' },
      table: {
        category: 'Detection',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    settings: {
      description:
        'Centralized settings for all auto-detected pid-components. A JSON string with per-renderer configuration (e.g., citation styles, TTL, affiliation settings).',
      control: { type: 'text' },
      table: {
        category: 'Component Configuration',
        type: { summary: 'string' },
        defaultValue: { summary: '[]' },
      },
    },
    levelOfSubcomponents: {
      description: 'Maximum depth of nested subcomponents for all auto-detected components.',
      control: { type: 'number', min: 0 },
      table: {
        category: 'Component Configuration',
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    itemsPerPage: {
      description: 'Number of items to show per page in the data table of each auto-detected component.',
      control: { type: 'number', min: 1 },
      table: {
        category: 'Component Configuration',
        type: { summary: 'number' },
        defaultValue: { summary: '10' },
      },
    },
    emphasizeComponent: {
      description: 'Whether to emphasize detected components with a border and shadow.',
      control: { type: 'boolean' },
      table: {
        category: 'Appearance',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    showTopLevelCopy: {
      description: 'Whether to show a copy button on top-level auto-detected components.',
      control: { type: 'boolean' },
      table: {
        category: 'Appearance',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    defaultTTL: {
      description: 'Time-to-live for IndexedDB cache entries in milliseconds.',
      control: { type: 'number', min: 0 },
      table: {
        category: 'Component Configuration',
        type: { summary: 'number' },
        defaultValue: { summary: '86400000 (24h)' },
      },
    },
  },
  args: {
    darkMode: 'light',
    renderers: '',
    fallbackToAll: true,
    exclude: '',
    observe: false,
    settings: '[]',
    levelOfSubcomponents: 1,
    itemsPerPage: 10,
    emphasizeComponent: false,
    showTopLevelCopy: true,
  },
};

export default meta;
type Story = StoryObj;

/**
 * Helper to build PidDetectionConfig from Storybook args.
 */
function buildConfig(args: Record<string, unknown>, root: HTMLElement) {
  const rendererList = args.renderers
    ? (args.renderers as string).split(',').map((s: string) => s.trim()).filter(Boolean)
    : undefined;

  return {
    root,
    darkMode: args.darkMode as 'light' | 'dark' | 'system',
    renderers: rendererList && rendererList.length > 0 ? rendererList : undefined,
    fallbackToAll: args.fallbackToAll as boolean,
    exclude: (args.exclude as string) || undefined,
    observe: args.observe as boolean,
    settings: (args.settings as string) || undefined,
    levelOfSubcomponents: args.levelOfSubcomponents as number,
    itemsPerPage: args.itemsPerPage as number,
    emphasizeComponent: args.emphasizeComponent as boolean,
    showTopLevelCopy: args.showTopLevelCopy as boolean,
    defaultTTL: args.defaultTTL as number | undefined,
  };
}

/**
 * A paragraph containing multiple PIDs of different types embedded in regular text.
 * `initPidDetection()` scans the text, detects the PIDs, and replaces them with
 * interactive `<pid-component>` elements while keeping the surrounding text intact.
 *
 * This example includes: a Handle PID, an ORCiD, a ROR ID, an SPDX license URL,
 * a DOI, an email address, and a URL.
 */
export const MixedPidsInText: Story = {
  id: 'auto-detect-mixed-pids',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-mixed" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Research Paper Metadata</h3>
        <p>
          This dataset is published as an FDO at ${HANDLE_examples.FDO_TYPED} and was created
          by researcher ${ORCID_examples.VALID}. The work was conducted at
          ${ROR_examples.VALID} and is available under the
          ${SPDX_examples.APACHE_2_0} license.
          Please also have a look at DOI ${DOI_examples.CROSSREF_JOURNAL_PAPER}.
        </p>
        <p style="margin-top: 12px;">
          For questions, contact the author at ${EMAIL_examples.VALID} or visit
          ${URL_examples.KIT_WEBSITE} for more information.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-mixed') as HTMLElement;
      if (root) initPidDetection(buildConfig(args, root));
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates auto-detection of multiple PID types embedded in regular text: Handle PID, ORCiD, ROR, SPDX license URL, DOI, email, and URL. Use the controls to experiment with different configuration options.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

// Without a renderers list, only auto-discoverable renderers are used
// (DOI, ORCiD, Handle, ROR, SPDX, Date). Email and URL require explicit opt-in.
const controller = initPidDetection({
  root: document.getElementById('my-content'),
  darkMode: 'light',
});
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for auto-detection to scan and create components
    await new Promise(r => setTimeout(r, 5000));
    const wrappers = canvasElement.querySelectorAll('.pid-auto-detect-wrapper');
    await expect(wrappers.length).toBeGreaterThan(0);
    // Check that pid-components were created
    const pidComponents = canvasElement.querySelectorAll('pid-component');
    await expect(pidComponents.length).toBeGreaterThan(0);
  },
};

/**
 * Auto-detection restricted to only DOIs and ORCiDs via the explicit `renderers` config.
 * Other PID types (including auto-discoverable ones like Handle PIDs, ROR, SPDX)
 * are left as plain text because an explicit list overrides the defaults.
 */
export const FilteredRenderers: Story = {
  id: 'auto-detect-filtered-renderers',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-filtered" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Filtered Detection (DOI + ORCiD only)</h3>
        <p>
          This dataset is published as an FDO at ${HANDLE_examples.FDO_TYPED} and was created
          by researcher ${ORCID_examples.VALID}. The work was conducted at
          ${ROR_examples.VALID} and is available under the
          ${SPDX_examples.MIT} license.
          Please have a look at DOI ${DOI_examples.CROSSREF_JOURNAL_PAPER}.
          Only the DOI and ORCiD in this text will be detected and rendered as components.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-filtered') as HTMLElement;
      if (root) {
        initPidDetection({
          ...buildConfig(args, root),
          renderers: ['DOIType', 'ORCIDType'],
        });
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Restricts auto-detection to only DOIType and ORCIDType renderers. Handle PIDs, ROR IDs, URLs, emails, and other patterns in the text are intentionally left as plain text.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  renderers: ['DOIType', 'ORCIDType'],
});
        `,
      },
    },
  },
};

/**
 * Demonstrates the controller lifecycle: start detection, then destroy
 * to restore original text. Click "Destroy" to remove all auto-detected
 * components and restore the original text.
 */
export const ControllerLifecycle: Story = {
  id: 'auto-detect-controller-lifecycle',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="max-width: 800px; font-family: sans-serif;">
        <div style="margin-bottom: 16px;">
          <button id="btn-destroy" style="padding: 8px 16px; margin-right: 8px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5;">
            Destroy
          </button>
          <button id="btn-rescan" style="padding: 8px 16px; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f5f5f5;">
            Rescan
          </button>
        </div>
        <div id="auto-detect-demo-lifecycle" style="line-height: 1.8;">
          <p>
            This dataset (DOI: ${DOI_examples.CROSSREF_JOURNAL_PAPER}) was created by researcher
            ${ORCID_examples.VALID}. Click "Destroy" to restore the original text,
            or "Rescan" to re-detect PIDs after destroying.
          </p>
        </div>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-lifecycle') as HTMLElement;
      if (!root) return;

      const cfg = buildConfig(args, root);
      let controller = initPidDetection(cfg);

      container.querySelector('#btn-destroy')?.addEventListener('click', () => {
        controller.destroy();
      });

      container.querySelector('#btn-rescan')?.addEventListener('click', () => {
        controller = initPidDetection(cfg);
      });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the controller lifecycle. Click **Destroy** to remove all auto-detected components and restore the original text. Click **Rescan** to re-run detection. The controller returned by `initPidDetection()` provides `stop()`, `rescan()`, and `destroy()` methods.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
});

// Later:
controller.destroy();  // removes all components, restores text
controller.rescan();   // re-scan the DOM
controller.stop();     // pause MutationObserver (if enabled)
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Wait for initial detection
    await new Promise(r => setTimeout(r, 3000));
    const wrappersBefore = canvasElement.querySelectorAll('.pid-auto-detect-wrapper');
    await expect(wrappersBefore.length).toBeGreaterThan(0);

    // Click Destroy button
    const destroyBtn = canvasElement.querySelector('#btn-destroy');
    await userEvent.click(destroyBtn!);
    await new Promise(r => setTimeout(r, 500));

    // Wrappers should be removed
    const wrappersAfter = canvasElement.querySelectorAll('.pid-auto-detect-wrapper');
    await expect(wrappersAfter.length).toBe(0);
  },
};

/**
 * Demonstrates auto-detection in dark mode on a dark background.
 */
export const DarkMode: Story = {
  id: 'auto-detect-dark-mode',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-dark" style="max-width: 800px; font-family: sans-serif; line-height: 1.8; background: #1a1a2e; color: #eee; padding: 24px; border-radius: 8px;">
        <h3 style="margin-bottom: 12px; color: #eee;">Dark Mode Auto-Detection</h3>
        <p>
          The dataset ${DOI_examples.CROSSREF_JOURNAL_PAPER} by researcher ${ORCID_examples.VALID}
          is available at ${URL_examples.KIT_WEBSITE} under the
          ${SPDX_examples.APACHE_2_0} license.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-dark') as HTMLElement;
      if (root) {
        initPidDetection({
          ...buildConfig(args, root),
          darkMode: 'dark',
        });
      }
    }, 100);

    return container;
  },
  globals: {
    backgrounds: { value: 'dark' },
  },
  parameters: {
    docs: {
      description: {
        story: 'Auto-detection with `darkMode: "dark"`. All detected components inherit the dark theme.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  darkMode: 'dark',
});
        `,
      },
    },
  },
};

/**
 * Demonstrates the `exclude` option to skip specific elements during scanning.
 * The code block is excluded from scanning, so PIDs inside it stay as plain text.
 */
export const ExcludeElements: Story = {
  id: 'auto-detect-exclude-elements',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-exclude" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Auto-Detection with Excluded Elements</h3>
        <p>
          This Handle PID should be detected: ${HANDLE_examples.FDO_TYPED}
        </p>
        <div class="no-detect" style="background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; margin-top: 12px;">
          <strong>Excluded zone (code example):</strong><br>
          curl ${DOI_examples.CROSSREF_JOURNAL_PAPER}<br>
          curl ${ROR_examples.VALID}<br>
          curl https://hdl.handle.net/${HANDLE_examples.FDO_TYPED}
        </div>
        <p style="margin-top: 12px;">
          This ORCiD should also be detected: ${ORCID_examples.VALID}
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-exclude') as HTMLElement;
      if (root) {
        initPidDetection({
          ...buildConfig(args, root),
          exclude: '.no-detect',
        });
      }
    }, 100);

    return container;
  },
  args: {
    exclude: '.no-detect',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `exclude` CSS selector to skip elements matching `.no-detect`. PIDs inside the code example block are left as plain text while PIDs outside it are detected normally.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  exclude: '.no-detect',
});
        `,
      },
    },
  },
};

/**
 * Demonstrates auto-detection in an HTML table.
 * This shows that auto-detection works across different HTML structures,
 * not just paragraphs.
 */
export const TableWithPids: Story = {
  id: 'auto-detect-table',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-table" style="max-width: 800px; font-family: sans-serif;">
        <h3 style="margin-bottom: 12px;">Research Outputs</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #ddd;">
              <th style="text-align: left; padding: 8px;">Title</th>
              <th style="text-align: left; padding: 8px;">DOI</th>
              <th style="text-align: left; padding: 8px;">Author ORCiD</th>
              <th style="text-align: left; padding: 8px;">License</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">Dataset A</td>
              <td style="padding: 8px;">${DOI_examples.DATACITE_JOURNAL_PAPER}</td>
              <td style="padding: 8px;">${ORCID_examples.VALID}</td>
              <td style="padding: 8px;">${SPDX_examples.APACHE_2_0}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">Dataset B</td>
              <td style="padding: 8px;">${DOI_examples.DATACITE_SLIDES}</td>
              <td style="padding: 8px;">${ORCID_examples.VALID}</td>
              <td style="padding: 8px;">${SPDX_examples.MIT}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-table') as HTMLElement;
      if (root) {
        initPidDetection(buildConfig(args, root));
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Auto-detection works in tables and other HTML structures. DOIs, ORCiDs, and SPDX license URLs in table cells are detected and rendered as interactive components.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.querySelector('table'),
});
        `,
      },
    },
  },
};

/**
 * Demonstrates punctuation sanitization. PIDs surrounded by punctuation
 * (dots, commas, parentheses, quotes, etc.) are correctly extracted
 * and rendered.
 */
export const PunctuationHandling: Story = {
  id: 'auto-detect-punctuation',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-punctuation" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Punctuation Sanitization</h3>
        <p>
          The dataset (${DOI_examples.CROSSREF_JOURNAL_PAPER}) was created by "${ORCID_examples.VALID}".
          See also: ${HANDLE_examples.FDO_TYPED}, which is related.
          Licensed under ${SPDX_examples.APACHE_2_0}.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-punctuation') as HTMLElement;
      if (root) initPidDetection(buildConfig(args, root));
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates automatic sanitization of surrounding punctuation. PIDs wrapped in parentheses, quotes, or followed by commas/periods are correctly extracted and rendered. The surrounding punctuation stays in place as regular text.',
      },
      source: {
        code: `
// PIDs surrounded by punctuation are automatically sanitized:
// (10.1234/foo)  →  detects "10.1234/foo"
// "0009-0005-2800-4833".  →  detects "0009-0005-2800-4833"
// 21.T11981/xxx,  →  detects "21.T11981/xxx"

import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
});
        `,
      },
    },
  },
};

/**
 * Demonstrates passing centralized settings to all auto-detected components.
 * In this example, the DOI citation style is set to IEEE.
 */
export const WithSettings: Story = {
  id: 'auto-detect-with-settings',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-settings" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Custom Settings (IEEE Citation Style)</h3>
        <p>
          This paper has DOI ${DOI_examples.CROSSREF_JOURNAL_PAPER} and was authored by
          ${ORCID_examples.VALID}.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-settings') as HTMLElement;
      if (root) {
        initPidDetection({
          ...buildConfig(args, root),
          settings: '[{"type":"DOIType","values":[{"name":"citationStyle","value":"IEEE"}]}]',
        });
      }
    }, 100);

    return container;
  },
  args: {
    settings: '[{"type":"DOIType","values":[{"name":"citationStyle","value":"IEEE"}]}]',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Passes centralized settings to all auto-detected components via the `settings` option. In this example, the DOI citation style is set to IEEE for all detected DOIs.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  settings: '[{"type":"DOIType","values":[{"name":"citationStyle","value":"IEEE"}]}]',
});
        `,
      },
    },
  },
};

const SHOWCASE_HTML = `
<div style="max-width: 900px; margin: 0 auto; font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; line-height: 1.7;">

  <header style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 1.6em; margin: 0 0 4px;">FAIR Digital Object Catalog</h1>
    <p style="color: #555; margin: 0;">Demonstrating automatic PID detection across all supported identifier types</p>
  </header>

  <!-- Section 1: Dataset record with Handle PID and DOI -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 1.25em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Dataset Record</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.95em;">
      <tbody>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; width: 180px; color: #555;">FDO PID</td>
          <td style="padding: 10px 12px;">${HANDLE_examples.FDO_TYPED}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">DOI</td>
          <td style="padding: 10px 12px;">${DOI_examples.CROSSREF_JOURNAL_PAPER}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">Created</td>
          <td style="padding: 10px 12px;">${DATE_examples.ISO_8601_ALT}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">Language</td>
          <td style="padding: 10px 12px;">${LOCALE_examples.EN_US}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">License</td>
          <td style="padding: 10px 12px;">${SPDX_examples.APACHE_2_0}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">Landing Page</td>
          <td style="padding: 10px 12px;">${URL_examples.KIT_WEBSITE}</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- Section 2: Authors -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 1.25em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Authors</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
        <div style="font-weight: 600;">Author 1</div>
        <div style="margin-top: 4px;">ORCiD: ${ORCID_examples.VALID}</div>
        <div style="margin-top: 2px;">Email: ${EMAIL_examples.KIT_EMAIL}</div>
        <div style="margin-top: 2px;">Affiliation: ${ROR_examples.VALID}</div>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
        <div style="font-weight: 600;">Author 2</div>
        <div style="margin-top: 4px;">ORCiD: ${ORCID_examples.VALID_SECOND}</div>
        <div style="margin-top: 2px;">Email: ${EMAIL_examples.KIT_EMAIL_ALT}</div>
        <div style="margin-top: 2px;">Affiliation: ${ROR_examples.VALID}</div>
      </div>
    </div>
  </section>

  <!-- Section 3: Related publications -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 1.25em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Related Publications</h2>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">
        M. Inckmann et al., "The PID Component," DOI: ${DOI_examples.DATACITE_JOURNAL_PAPER}
      </li>
      <li style="margin-bottom: 8px;">
        A. Pfeil et al., "FAIR Digital Objects in Practice," DOI: ${DOI_examples.DATACITE_SLIDES}.
        Published ${DATE_examples.DATETIME_SHORT}.
      </li>
    </ul>
  </section>

  <!-- Section 4: Free-text abstract -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 1.25em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Abstract</h2>
    <p>
      This dataset (${HANDLE_examples.FDO_TYPED}) presents the results of
      a study conducted at the Karlsruhe Institute of Technology (${ROR_examples.VALID}).
      The corresponding software is available under the ${SPDX_examples.MIT} license
      and can be accessed at ${URL_examples.KIT_WEBSITE}. For questions, please contact the lead
      author at ${EMAIL_examples.KIT_EMAIL} or visit the project page.
    </p>
    <p style="margin-top: 12px;">
      The research builds upon earlier work published as ${DOI_examples.CROSSREF_JOURNAL_PAPER} and extends it
      with FAIR Digital Object capabilities. The primary language of this publication is ${LOCALE_examples.EN_US},
      with supplementary materials available in ${LOCALE_examples.DE_DE}.
    </p>
  </section>

  <footer style="border-top: 1px solid #e5e7eb; padding-top: 12px; color: #888; font-size: 0.85em;">
    All identifiers on this page are automatically detected and rendered by <code>initPidDetection()</code>.
  </footer>
</div>
`;

// ─── Stories ─────────────────────────────────────────────────────────────────

/**
 * A complete research data catalog page using **vanilla HTML** and
 * `initPidDetection()`. Every identifier type supported by the pid-component
 * is embedded in the page: Handle PIDs, DOIs, ORCiDs, ROR IDs, SPDX URLs,
 * emails, URLs, ISO 8601 dates, and locale codes.
 *
 * Auto-detected PIDs default to **non-emphasized** mode, blending seamlessly
 * into surrounding text. No framework is required — just a `<script>` tag and
 * one function call.
 */
export const Showcase: Story = {
  id: 'auto-detect-showcase',
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `<div id="showcase-vanilla">${SHOWCASE_HTML}</div>`;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#showcase-vanilla') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  play: async ({ canvasElement }) => {
    // Wait for auto-detection and component rendering
    await new Promise(r => setTimeout(r, 8000));
    const pidComponents = canvasElement.querySelectorAll('pid-component');
    await expect(pidComponents.length).toBeGreaterThan(0);
  },
  parameters: {
    docs: {
      description: {
        story:
          'A full research data catalog page with all identifier types, enriched by `initPidDetection()`. Auto-detected PIDs render as non-emphasized (no border/shadow) by default, blending into the surrounding text. No framework needed — just vanilla HTML.',
      },
      source: {
        code: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>FAIR Digital Object Catalog</title>
  <script type="module"
    src="https://unpkg.com/@kit-data-manager/pid-component/dist/pid-component/pid-component.esm.js">
  </script>
</head>
<body>
  <div id="catalog">
    <h1>FAIR Digital Object Catalog</h1>

    <h2>Dataset Record</h2>
    <table>
      <tr><td>FDO PID</td><td>21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</td></tr>
      <tr><td>DOI</td><td>10.1109/eScience65000.2025.00022</td></tr>
      <tr><td>Created</td><td>2024-06-15T09:30:00.000+02:00</td></tr>
      <tr><td>Language</td><td>en-US</td></tr>
      <tr><td>License</td><td>https://spdx.org/licenses/Apache-2.0</td></tr>
      <tr><td>Landing Page</td><td>https://scc.kit.edu</td></tr>
    </table>

    <h2>Authors</h2>
    <p>ORCiD: 0009-0005-2800-4833 — Email: maximilian.inckmann@kit.edu</p>
    <p>Affiliation: https://ror.org/04t3en479</p>

    <h2>Abstract</h2>
    <p>
      This dataset (21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6) presents
      results from KIT (https://ror.org/04t3en479). The software is licensed
      under https://spdx.org/licenses/MIT. Related DOI: 10.5445/IR/1000185135.
    </p>
  </div>

  <script type="module">
    import { initPidDetection }
      from 'https://unpkg.com/@kit-data-manager/pid-component/dist/esm/index.js';

    // Auto-detected PIDs use only auto-discoverable renderers by default
    initPidDetection({
      root: document.getElementById('catalog'),
      darkMode: 'system',
    });
  </script>
</body>
</html>
        `,
      },
    },
  },
};

/**
 * A comprehensive **ResearchDemo** combining auto-detection with explicit
 * `<pid-component>` elements in varied configurations:
 *
 * - **Non-emphasized** (default for auto-detection): PIDs blend into text
 * - **Emphasized**: PIDs have border, shadow, and a chevron toggle
 * - **Hidden subcomponents**: Preview-only, no expandable details
 * - **Active subcomponents**: Open by default with full data table
 *
 * Covers all renderer types: Handle, DOI, ORCiD, ROR, SPDX, Email, URL,
 * Date, Locale, and JSON. Double-click any expanded component to collapse it.
 */
export const ResearchDemo: Story = {
  id: 'auto-detect-research-demo',
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
<div style="max-width: 960px; margin: 0 auto; font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; line-height: 1.7;">

  <header style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 32px;">
    <h1 style="font-size: 1.6em; margin: 0 0 4px;">ResearchDemo</h1>
    <p style="color: #555; margin: 0;">Showcasing pid-component features: emphasized, non-emphasized, hidden subcomponents, active subcomponents, and all renderer types</p>
  </header>

  <!-- ═══════ Section 1: Auto-detected PIDs (non-emphasized, default) ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Auto-Detected PIDs <span style="font-size: 0.75em; color: #888; font-weight: normal;">(non-emphasized, default)</span>
    </h2>
    <div id="auto-detect-zone" style="line-height: 1.8;">
      <p>
        This dataset is published as a FAIR Digital Object at ${HANDLE_examples.FDO_TYPED}
        and was created by researcher ${ORCID_examples.VALID}. The work was conducted at
        ${ROR_examples.VALID} and is available under the ${SPDX_examples.APACHE_2_0} license.
        The corresponding paper has DOI ${DOI_examples.CROSSREF_JOURNAL_PAPER}.
      </p>
      <p style="margin-top: 12px;">
        For questions, contact ${EMAIL_examples.KIT_EMAIL} or visit ${URL_examples.KIT_WEBSITE}.
        The publication date is ${DATE_examples.ISO_8601_ALT} and the primary language is ${LOCALE_examples.EN_US}.
      </p>
    </div>
  </section>

  <!-- ═══════ Section 2: Emphasized components ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Emphasized Components <span style="font-size: 0.75em; color: #888; font-weight: normal;">(border + shadow + chevron)</span>
    </h2>
    <p style="margin-bottom: 12px;">These components stand out from surrounding text with a visible border, shadow, and a chevron toggle indicator. Click to expand, double-click to collapse.</p>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start;">
      <pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" emphasize-component="true"></pid-component>
      <pid-component value="${ORCID_examples.VALID}" emphasize-component="true"></pid-component>
      <pid-component value="${ROR_examples.VALID}" emphasize-component="true"></pid-component>
      <pid-component value="${SPDX_examples.MIT}" emphasize-component="true"></pid-component>
    </div>
  </section>

  <!-- ═══════ Section 3: Non-emphasized components ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Non-Emphasized Components <span style="font-size: 0.75em; color: #888; font-weight: normal;">(inline, no border)</span>
    </h2>
    <p>
      The following identifiers are embedded inline and blend seamlessly into this paragraph:
      DOI <pid-component value="${DOI_examples.CROSSREF_JOURNAL_PAPER}" emphasize-component="false"></pid-component>,
      ORCiD <pid-component value="${ORCID_examples.VALID}" emphasize-component="false"></pid-component>,
      ROR <pid-component value="${ROR_examples.VALID}" emphasize-component="false"></pid-component>,
      and license <pid-component value="${SPDX_examples.MIT_BARE}" emphasize-component="false"></pid-component>.
      Click any identifier to expand it; emphasis is temporarily applied when expanded.
    </p>
  </section>

  <!-- ═══════ Section 4: Hidden subcomponents ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Hidden Subcomponents <span style="font-size: 0.75em; color: #888; font-weight: normal;">(preview only, no expand)</span>
    </h2>
    <p style="margin-bottom: 12px;">These components only show the preview (renderer output) without any expandable details or data table. Useful for compact displays.</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.95em;">
      <thead>
        <tr style="border-bottom: 2px solid #ddd;">
          <th style="text-align: left; padding: 8px;">Type</th>
          <th style="text-align: left; padding: 8px;">Identifier</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">Handle PID</td>
          <td style="padding: 8px;"><pid-component value="${HANDLE_examples.FDO_TYPED}" hide-subcomponents="true" emphasize-component="false"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">DOI</td>
          <td style="padding: 8px;"><pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" hide-subcomponents="true" emphasize-component="true"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">ORCiD</td>
          <td style="padding: 8px;"><pid-component value="${ORCID_examples.VALID}" hide-subcomponents="true" emphasize-component="false"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">URL</td>
          <td style="padding: 8px;"><pid-component value="${URL_examples.KIT_WEBSITE}" hide-subcomponents="true"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">Email</td>
          <td style="padding: 8px;"><pid-component value="${EMAIL_examples.KIT_EMAIL}" hide-subcomponents="true"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">Date</td>
          <td style="padding: 8px;"><pid-component value="${DATE_examples.ISO_8601_ALT}" hide-subcomponents="true"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">Locale</td>
          <td style="padding: 8px;"><pid-component value="${LOCALE_examples.DE_DE}" hide-subcomponents="true"></pid-component></td>
        </tr>
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-weight: 600; color: #555;">SPDX</td>
          <td style="padding: 8px;"><pid-component value="${SPDX_examples.APACHE_2_0}" hide-subcomponents="true"></pid-component></td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- ═══════ Section 5: Active subcomponents (open by default) ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Active Subcomponents <span style="font-size: 0.75em; color: #888; font-weight: normal;">(open by default with data table)</span>
    </h2>
    <p style="margin-bottom: 12px;">These components start expanded, showing the full data table, pagination, actions, and nested subcomponents. Double-click to collapse.</p>

    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 1em; color: #555; margin-bottom: 8px;">DOI (DataCite - Journal Paper)</h3>
      <pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" open-by-default="true" emphasize-component="true"></pid-component>
    </div>

    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 1em; color: #555; margin-bottom: 8px;">ORCiD (Researcher Profile)</h3>
      <pid-component value="${ORCID_examples.VALID}" open-by-default="true" emphasize-component="true"></pid-component>
    </div>

    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 1em; color: #555; margin-bottom: 8px;">JSON Object (Inline Data)</h3>
      <pid-component value='{"project": "pid-component", "version": "0.4.0", "renderers": ["DOI", "ORCiD", "Handle", "ROR", "SPDX", "URL", "Email", "Date", "Locale", "JSON"]}' open-by-default="true" emphasize-component="true"></pid-component>
    </div>
  </section>

  <!-- ═══════ Section 6: Mixed usage in prose ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Mixed Inline Usage <span style="font-size: 0.75em; color: #888; font-weight: normal;">(varied modes in running text)</span>
    </h2>
    <p style="line-height: 1.9;">
      The Typed PID Maker is an entry point to integrate digital resources into the FAIR Digital Object ecosystem.
      It allows creating PIDs for resources such as
      <pid-component value="${HANDLE_examples.FDO_TYPED}" emphasize-component="false"></pid-component>
      and provides them with the necessary metadata to ensure discoverability. The lead author
      <pid-component value="${ORCID_examples.VALID}" emphasize-component="true"></pid-component>
      published the work at <pid-component value="${DOI_examples.CROSSREF_JOURNAL_PAPER}" emphasize-component="false"></pid-component>
      under the <pid-component value="${SPDX_examples.MIT_BARE}" hide-subcomponents="true" emphasize-component="false"></pid-component> license.
      The software is available in <pid-component value="${LOCALE_examples.EN_US}" hide-subcomponents="true" emphasize-component="false"></pid-component>
      and <pid-component value="${LOCALE_examples.DE_DE}" hide-subcomponents="true" emphasize-component="false"></pid-component>,
      hosted at <pid-component value="${ROR_examples.VALID}" emphasize-component="true"></pid-component>.
    </p>
  </section>

  <!-- ═══════ Section 7: Renderer-specific features ═══════ -->
  <section style="margin-bottom: 36px;">
    <h2 style="font-size: 1.2em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">
      Renderer Preselection <span style="font-size: 0.75em; color: #888; font-weight: normal;">(restricting detection to specific types)</span>
    </h2>
    <p style="margin-bottom: 12px;">The <code>renderers</code> prop controls which types are tried. The first component restricts to DOI only; the second uses Handle before DOI (changing priority).</p>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start;">
      <pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" renderers='["DOIType"]' emphasize-component="true"></pid-component>
      <pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" renderers='["HandleType", "DOIType"]' emphasize-component="true"></pid-component>
    </div>
  </section>

  <footer style="border-top: 1px solid #e5e7eb; padding-top: 12px; color: #888; font-size: 0.85em;">
    Auto-detected PIDs use non-emphasized mode by default. Explicit <code>&lt;pid-component&gt;</code> elements are configured individually.
    Double-click any expanded component to collapse it.
  </footer>
</div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-zone') as HTMLElement;
      if (root) {
        initPidDetection(buildConfig(args, root));
      }
    }, 100);

    return container;
  },
  play: async ({ canvasElement }) => {
    // Wait for auto-detection and component rendering
    await new Promise(r => setTimeout(r, 8000));
    const pidComponents = canvasElement.querySelectorAll('pid-component');
    await expect(pidComponents.length).toBeGreaterThan(0);
  },
  parameters: {
    docs: {
      description: {
        story:
          'A comprehensive demo mixing auto-detected PIDs (non-emphasized by default) with explicitly placed `<pid-component>` elements in varied configurations: emphasized, non-emphasized, hidden subcomponents, and active (open by default) subcomponents. Covers all renderer types: Handle, DOI, ORCiD, ROR, SPDX, Email, URL, Date, Locale, JSON. Double-click any expanded component to collapse it.',
      },
      source: {
        code: `
<!-- Auto-detected PIDs: non-emphasized by default -->
<div id="content">
  <p>This dataset 21.T11981/... by researcher 0009-0005-2800-4833...</p>
</div>
<script type="module">
  import { initPidDetection } from '@kit-data-manager/pid-component';
  initPidDetection({ root: document.getElementById('content') });
</script>

<!-- Emphasized -->
<pid-component value="10.5445/IR/1000185135" emphasize-component="true"></pid-component>

<!-- Non-emphasized (inline) -->
<pid-component value="0009-0005-2800-4833" emphasize-component="false"></pid-component>

<!-- Hidden subcomponents (preview only) -->
<pid-component value="21.T11981/..." hide-subcomponents="true"></pid-component>

<!-- Active subcomponents (open by default) -->
<pid-component value="10.5445/IR/1000185135" open-by-default="true"></pid-component>

<!-- Renderer preselection -->
<pid-component value="10.5445/IR/1000185135" renderers='["DOIType"]'></pid-component>
        `,
      },
    },
  },
};
