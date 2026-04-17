import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The `initPidDetection()` function enables automatic detection and rendering
 * of PIDs on a webpage. It scans text content within a root element, identifies
 * PID patterns (DOIs, ORCiDs, Handle PIDs, etc.), and replaces them with
 * interactive `<pid-component>` elements.
 *
 * Original text remains visible until the component has fully loaded, ensuring
 * no layout shift or broken content.
 *
 * Import and use it like this:
 * ```typescript
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * const controller = initPidDetection({
 *   root: document.getElementById('my-content'),
 *   renderers: ['DOIType', 'ORCIDType', 'HandleType'],
 *   darkMode: 'system',
 * });
 *
 * // Later: controller.stop(), controller.rescan(), or controller.destroy()
 * ```
 */
const meta: Meta = {
  title: 'Auto-Detection',
  tags: ['autodocs'],
  argTypes: {
    darkMode: {
      description: 'Dark mode setting for all auto-detected components',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'light' },
      },
    },
    renderers: {
      description:
        'Ordered list of renderer keys to try (comma-separated for this demo). Only these renderers are used during detection.',
      control: { type: 'text' },
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: 'all renderers' },
      },
    },
    fallbackToAll: {
      description:
        'When renderers is set and no listed renderer matches, fall back to the full default renderer registry. Set to false to strictly restrict.',
      control: { type: 'boolean' },
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
  args: {
    darkMode: 'light',
    renderers: '',
    fallbackToAll: true,
  },
};

export default meta;
type Story = StoryObj;

/**
 * A paragraph containing multiple PIDs of different types embedded in regular text.
 * `initPidDetection()` scans the text, detects the PIDs, and replaces them with
 * interactive `<pid-component>` elements while keeping the surrounding text intact.
 */
export const MixedPIDsInText: Story = {
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-mixed" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Research Paper Metadata</h3>
        <p>
          This is an example that is not published as an FDO here 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the Apache-2.0 license. Please have a look at DOI 10.1109/eScience65000.2025.00022.
        </p>
        <p style="margin-top: 12px;">
          For questions, contact the author at someone@example.com or visit
          https://scc.kit.edu for more information.
        </p>
      </div>
    `;

    // Use setTimeout to ensure DOM is ready before scanning
    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-mixed') as HTMLElement;
      if (root) {
        const rendererList = args.renderers
          ? (args.renderers as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : undefined;

        initPidDetection({
          root,
          darkMode: args.darkMode as 'light' | 'dark' | 'system',
          renderers: rendererList,
          fallbackToAll: args.fallbackToAll as boolean,
        });
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates auto-detection of multiple PID types (DOI, ORCiD, ROR, SPDX, Email, URL) embedded in regular text. The `initPidDetection()` function scans the text and replaces detected PIDs with interactive components.',
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
};

/**
 * Auto-detection restricted to only DOIs and ORCiDs.
 * Other PID types (URLs, emails, etc.) in the text are left as plain text.
 */
export const FilteredRenderers: Story = {
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-filtered" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Filtered Detection (DOI + ORCiD only)</h3>
        <p>
          This is an example that is not published as an FDO here 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the Apache-2.0 license. Please have a look at DOI 10.1109/eScience65000.2025.00022. Only the DOI and ORCiD in this text will be detected
          and rendered as components.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-filtered') as HTMLElement;
      if (root) {
        initPidDetection({
          root,
          renderers: ['DOIType', 'ORCIDType'],
          darkMode: args.darkMode as 'light' | 'dark' | 'system',
        });
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Restricts auto-detection to only DOIType and ORCIDType renderers. URLs, emails, and other patterns in the text are intentionally left as plain text.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  renderers: ['DOIType', 'ORCIDType'],
  darkMode: 'light',
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
            This is an example that is not published as an FDO here 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the Apache-2.0 license. Please have a look at DOI 10.1109/eScience65000.2025.00022.
           Click "Destroy" to restore the original text,
            or "Rescan" to re-detect PIDs after destroying.
          </p>
        </div>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-lifecycle') as HTMLElement;
      if (!root) return;

      let controller = initPidDetection({
        root,
        renderers: ['DOIType', 'ORCIDType'],
        darkMode: args.darkMode as 'light' | 'dark' | 'system',
      });

      const btnDestroy = container.querySelector('#btn-destroy');
      const btnRescan = container.querySelector('#btn-rescan');

      btnDestroy?.addEventListener('click', () => {
        controller.destroy();
      });

      btnRescan?.addEventListener('click', () => {
        controller = initPidDetection({
          root,
          renderers: ['DOIType', 'ORCIDType'],
          darkMode: args.darkMode as 'light' | 'dark' | 'system',
        });
      });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the controller lifecycle. Click "Destroy" to remove all auto-detected components and restore original text. Click "Rescan" to re-run detection.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.getElementById('my-content'),
  renderers: ['DOIType', 'ORCIDType'],
});

// Later:
controller.destroy();  // removes all components, restores text
controller.rescan();   // re-scan the DOM
        `,
      },
    },
  },
};

/**
 * Demonstrates auto-detection in dark mode on a dark background.
 */
export const DarkMode: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-dark" style="max-width: 800px; font-family: sans-serif; line-height: 1.8; background: #1a1a2e; color: #eee; padding: 24px; border-radius: 8px;">
        <h3 style="margin-bottom: 12px; color: #eee;">Dark Mode Auto-Detection</h3>
        <p>
          This is an example that is not published as an FDO here 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the Apache-2.0 license. Please have a look at DOI 10.1109/eScience65000.2025.00022.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-dark') as HTMLElement;
      if (root) {
        initPidDetection({
          root,
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
        story: 'Auto-detection with dark mode enabled. All detected components inherit the dark theme.',
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
 * The code block is excluded from scanning, so the DOI inside it stays as plain text.
 */
export const ExcludeElements: Story = {
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div id="auto-detect-demo-exclude" style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Auto-Detection with Excluded Elements</h3>
        <p>
          This should be detected: 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6
        </p>
        <div class="no-detect" style="background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; margin-top: 12px;">
          <strong>Excluded zone (code example):</strong><br>
          curl https://doi.org/10.1109/eScience65000.2025.00022
          curl https://ror.org/04t3en479
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
          root,
          exclude: '.no-detect',
          darkMode: args.darkMode as 'light' | 'dark' | 'system',
        });
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `exclude` CSS selector to skip elements matching `.no-detect`. The DOI inside the code example block is left as plain text.',
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
 * Demonstrates a table with PIDs that get auto-detected.
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
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">Dataset A</td>
              <td style="padding: 8px;">10.5445/IR/1000185135</td>
              <td style="padding: 8px;">0009-0005-2800-4833</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px;">Dataset B</td>
              <td style="padding: 8px;">10.5445/IR/1000178054</td>
              <td style="padding: 8px;">0009-0005-2800-4833</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#auto-detect-demo-table') as HTMLElement;
      if (root) {
        initPidDetection({
          root,
          renderers: ['DOIType', 'ORCIDType'],
          darkMode: args.darkMode as 'light' | 'dark' | 'system',
        });
      }
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Auto-detection works in tables and other HTML structures. DOIs and ORCiDs in table cells are detected and rendered as interactive components.',
      },
      source: {
        code: `
import { initPidDetection } from '@kit-data-manager/pid-component';

const controller = initPidDetection({
  root: document.querySelector('table'),
  renderers: ['DOIType', 'ORCIDType'],
});
        `,
      },
    },
  },
};
