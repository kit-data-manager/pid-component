import { Meta, StoryObj } from '@storybook/web-components-vite';
import { expect, userEvent } from 'storybook/test';

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
 * **Import and use:**
 * ```typescript
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * const controller = initPidDetection({
 *   root: document.getElementById('my-content'),
 *   renderers: ['DOIType', 'ORCIDType', 'HandleType'],
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
  title: 'Auto-Detection',
  tags: ['autodocs', '!test'],
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
        'Ordered list of renderer keys to try first (comma-separated for this demo). These serve as a non-binding preselection: if none match, the full registry is tried (unless `fallbackToAll` is `false`). Available keys: `DateType`, `ORCIDType`, `DOIType`, `HandleType`, `RORType`, `SPDXType`, `EmailType`, `URLType`, `LocaleType`, `JSONType`.',
      control: { type: 'text' },
      table: {
        category: 'Detection',
        type: { summary: 'string[]' },
        defaultValue: { summary: 'all renderers' },
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
    amountOfItems: {
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
        defaultValue: { summary: 'true' },
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
    amountOfItems: 10,
    emphasizeComponent: true,
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
    amountOfItems: args.amountOfItems as number,
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
export const MixedPIDsInText: Story = {
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-mixed" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Research Paper Metadata</h3>
        <p>
          This dataset is published as an FDO at 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the
          https://spdx.org/licenses/Apache-2.0 license.
          Please have a look at DOI 10.1109/eScience65000.2025.00022.
        </p>
        <p style="margin-top: 12px;">
          For questions, contact the author at someone@example.com or visit
          https://scc.kit.edu for more information.
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
 * Auto-detection restricted to only DOIs and ORCiDs.
 * Other PID types (URLs, emails, Handle PIDs, etc.) in the text are left as plain text.
 */
export const FilteredRenderers: Story = {
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-filtered" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Filtered Detection (DOI + ORCiD only)</h3>
        <p>
          This dataset is published as an FDO at 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the
          https://spdx.org/licenses/MIT license.
          Please have a look at DOI 10.1109/eScience65000.2025.00022.
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
            This dataset (DOI: 10.1109/eScience65000.2025.00022) was created by researcher
            0009-0005-2800-4833. Click "Destroy" to restore the original text,
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
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-dark" style="max-width: 800px; font-family: sans-serif; line-height: 1.8; background: #1a1a2e; color: #eee; padding: 24px; border-radius: 8px;">
        <h3 style="margin-bottom: 12px; color: #eee;">Dark Mode Auto-Detection</h3>
        <p>
          The dataset 10.1109/eScience65000.2025.00022 by researcher 0009-0005-2800-4833
          is available at https://scc.kit.edu under the
          https://spdx.org/licenses/Apache-2.0 license.
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
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-exclude" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Auto-Detection with Excluded Elements</h3>
        <p>
          This Handle PID should be detected: 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6
        </p>
        <div class="no-detect" style="background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; margin-top: 12px;">
          <strong>Excluded zone (code example):</strong><br>
          curl https://doi.org/10.1109/eScience65000.2025.00022<br>
          curl https://ror.org/04t3en479<br>
          curl https://hdl.handle.net/21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6
        </div>
        <p style="margin-top: 12px;">
          This ORCiD should also be detected: 0009-0005-2800-4833
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
export const TableWithPIDs: Story = {
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
              <td style="padding: 8px;">10.5445/IR/1000185135</td>
              <td style="padding: 8px;">0009-0005-2800-4833</td>
              <td style="padding: 8px;">https://spdx.org/licenses/Apache-2.0</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">Dataset B</td>
              <td style="padding: 8px;">10.5445/IR/1000178054</td>
              <td style="padding: 8px;">0009-0005-2800-4833</td>
              <td style="padding: 8px;">https://spdx.org/licenses/MIT</td>
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
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-punctuation" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Punctuation Sanitization</h3>
        <p>
          The dataset (10.1109/eScience65000.2025.00022) was created by "0009-0005-2800-4833".
          See also: 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6, which is related.
          Licensed under https://spdx.org/licenses/Apache-2.0.
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
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-settings" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Custom Settings (IEEE Citation Style)</h3>
        <p>
          This paper has DOI 10.1109/eScience65000.2025.00022 and was authored by
          0009-0005-2800-4833.
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
          <td style="padding: 10px 12px;">21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">DOI</td>
          <td style="padding: 10px 12px;">10.1109/eScience65000.2025.00022</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">Created</td>
          <td style="padding: 10px 12px;">2024-06-15T09:30:00.000+02:00</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">Language</td>
          <td style="padding: 10px 12px;">en-US</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">License</td>
          <td style="padding: 10px 12px;">https://spdx.org/licenses/Apache-2.0</td>
        </tr>
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 10px 12px; font-weight: 600; color: #555;">Landing Page</td>
          <td style="padding: 10px 12px;">https://scc.kit.edu</td>
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
        <div style="margin-top: 4px;">ORCiD: 0009-0005-2800-4833</div>
        <div style="margin-top: 2px;">Email: maximilian.inckmann@kit.edu</div>
        <div style="margin-top: 2px;">Affiliation: https://ror.org/04t3en479</div>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb;">
        <div style="font-weight: 600;">Author 2</div>
        <div style="margin-top: 4px;">ORCiD: 0000-0001-6575-1022</div>
        <div style="margin-top: 2px;">Email: andreas.pfeil@kit.edu</div>
        <div style="margin-top: 2px;">Affiliation: https://ror.org/04t3en479</div>
      </div>
    </div>
  </section>

  <!-- Section 3: Related publications -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 1.25em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Related Publications</h2>
    <ul style="padding-left: 20px;">
      <li style="margin-bottom: 8px;">
        M. Inckmann et al., "The PID Component," DOI: 10.5445/IR/1000185135
      </li>
      <li style="margin-bottom: 8px;">
        A. Pfeil et al., "FAIR Digital Objects in Practice," DOI: 10.5445/IR/1000178054.
        Published 2023-11-20T00:00:00.000+01:00.
      </li>
    </ul>
  </section>

  <!-- Section 4: Free-text abstract -->
  <section style="margin-bottom: 32px;">
    <h2 style="font-size: 1.25em; color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Abstract</h2>
    <p>
      This dataset (21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6) presents the results of
      a study conducted at the Karlsruhe Institute of Technology (https://ror.org/04t3en479).
      The corresponding software is available under the https://spdx.org/licenses/MIT license
      and can be accessed at https://scc.kit.edu. For questions, please contact the lead
      author at maximilian.inckmann@kit.edu or visit the project page.
    </p>
    <p style="margin-top: 12px;">
      The research builds upon earlier work published as 10.1109/eScience65000.2025.00022 and extends it
      with FAIR Digital Object capabilities. The primary language of this publication is en-US,
      with supplementary materials available in de-DE.
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
 * No framework is required — just a `<script>` tag and one function call.
 */
export const Showcase: Story = {
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
          'A full research data catalog page with all identifier types, enriched by `initPidDetection()`. No framework needed — just vanilla HTML.',
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
