import type { Meta, StoryObj } from '@storybook/angular';

/**
 * The `initPidDetection()` function scans a DOM subtree for persistent
 * identifiers (DOIs, ORCiDs, Handle PIDs, ROR IDs, SPDX licenses, URLs,
 * emails, etc.) and replaces them with interactive `<pid-component>` elements.
 *
 * In Angular, call `initPidDetection()` in `ngAfterViewInit` and clean up
 * in `ngOnDestroy`.
 *
 * ```typescript
 * import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
 * import { initPidDetection, PidDetectionController } from '@kit-data-manager/pid-component';
 *
 * @Component({
 *   template: `<div #content>DOI: 10.1234/example</div>`,
 * })
 * export class MyComponent implements AfterViewInit, OnDestroy {
 *   @ViewChild('content') content!: ElementRef<HTMLElement>;
 *   private ctrl?: PidDetectionController;
 *
 *   ngAfterViewInit() {
 *     this.ctrl = initPidDetection({ root: this.content.nativeElement });
 *   }
 *   ngOnDestroy() {
 *     this.ctrl?.destroy();
 *   }
 * }
 * ```
 */
const meta: Meta = {
  title: 'Auto-Detection',
  tags: ['autodocs'],
  render: (args) => {
    // Each story overrides render, so this is just a default.
    return { template: '<div></div>' };
  },
};
export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// Shared helper: creates a container, runs initPidDetection after render
// ---------------------------------------------------------------------------
function autoDetectRender(
  html: string,
  configOverrides: Record<string, unknown> = {},
) {
  return {
    template: `<div #root>${html}</div>`,
    props: {},
    // Angular Storybook renders the template; we attach auto-detection
    // via a setTimeout to let Angular finish rendering first.
    moduleMetadata: {},
    // Use a decorator-style approach with the Storybook render
    userDefinedTemplate: true,
  };
}

/** Multiple PID types embedded in a research-paper-style paragraph. */
export const MixedPIDsInText: Story = {
  render: () => ({
    template: `<div id="ad-mixed" style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
      <h3 style="margin-bottom: 12px">Research Paper Metadata</h3>
      <p>
        This dataset is published as an FDO at
        21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
        by researcher 0009-0005-2800-4833. The work was conducted at
        https://ror.org/04t3en479 and is available under the
        https://spdx.org/licenses/Apache-2.0 license. Please have a
        look at DOI 10.1109/eScience65000.2025.00022.
      </p>
      <p style="margin-top: 12px">
        For questions, contact the author at someone@example.com or
        visit https://scc.kit.edu for more information.
      </p>
    </div>`,
    props: {},
  }),
  play: async ({ canvasElement }) => {
    const { initPidDetection } = await import('@kit-data-manager/pid-component');
    const root = canvasElement.querySelector('#ad-mixed') as HTMLElement;
    if (root) initPidDetection({ root, darkMode: 'light' });
  },
};

/** Only DOI and ORCiD renderers are active; other PID types stay as plain text. */
export const FilteredRenderers: Story = {
  render: () => ({
    template: `<div id="ad-filtered" style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
      <h3 style="margin-bottom: 12px">Filtered Detection (DOI + ORCiD only)</h3>
      <p>
        This dataset is published at
        21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
        by researcher 0009-0005-2800-4833. Available under
        https://spdx.org/licenses/MIT. DOI:
        10.1109/eScience65000.2025.00022. Only DOI and ORCiD will be
        detected.
      </p>
    </div>`,
    props: {},
  }),
  play: async ({ canvasElement }) => {
    const { initPidDetection } = await import('@kit-data-manager/pid-component');
    const root = canvasElement.querySelector('#ad-filtered') as HTMLElement;
    if (root) initPidDetection({ root, renderers: ['DOIType', 'ORCIDType'], darkMode: 'light' });
  },
};

/** Dark mode auto-detection on a dark background. */
export const DarkMode: Story = {
  render: () => ({
    template: `<div id="ad-dark" style="max-width: 800px; font-family: sans-serif; line-height: 1.8; background: #1a1a2e; color: #eee; padding: 24px; border-radius: 8px">
      <h3 style="margin-bottom: 12px; color: #eee">Dark Mode Auto-Detection</h3>
      <p>
        The dataset 10.1109/eScience65000.2025.00022 by researcher
        0009-0005-2800-4833 is available at https://scc.kit.edu under
        the https://spdx.org/licenses/Apache-2.0 license.
      </p>
    </div>`,
    props: {},
  }),
  play: async ({ canvasElement }) => {
    const { initPidDetection } = await import('@kit-data-manager/pid-component');
    const root = canvasElement.querySelector('#ad-dark') as HTMLElement;
    if (root) initPidDetection({ root, darkMode: 'dark' });
  },
};

/** Elements matching the exclude CSS selector are skipped. */
export const ExcludeElements: Story = {
  render: () => ({
    template: `<div id="ad-exclude" style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
      <h3 style="margin-bottom: 12px">Auto-Detection with Excluded Elements</h3>
      <p>This Handle PID should be detected: 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</p>
      <div class="no-detect" style="background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; margin-top: 12px">
        <strong>Excluded zone (code example):</strong><br>
        curl https://doi.org/10.1109/eScience65000.2025.00022<br>
        curl https://ror.org/04t3en479
      </div>
      <p style="margin-top: 12px">This ORCiD should also be detected: 0009-0005-2800-4833</p>
    </div>`,
    props: {},
  }),
  play: async ({ canvasElement }) => {
    const { initPidDetection } = await import('@kit-data-manager/pid-component');
    const root = canvasElement.querySelector('#ad-exclude') as HTMLElement;
    if (root) initPidDetection({ root, exclude: '.no-detect', darkMode: 'light' });
  },
};

/** Auto-detection inside an HTML table. */
export const TableWithPIDs: Story = {
  render: () => ({
    template: `<div id="ad-table" style="max-width: 800px; font-family: sans-serif">
      <h3 style="margin-bottom: 12px">Research Outputs</h3>
      <table style="width: 100%; border-collapse: collapse">
        <thead>
          <tr style="border-bottom: 2px solid #ddd">
            <th style="text-align: left; padding: 8px">Title</th>
            <th style="text-align: left; padding: 8px">DOI</th>
            <th style="text-align: left; padding: 8px">Author ORCiD</th>
            <th style="text-align: left; padding: 8px">License</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee">
            <td style="padding: 8px">Dataset A</td>
            <td style="padding: 8px">10.5445/IR/1000185135</td>
            <td style="padding: 8px">0009-0005-2800-4833</td>
            <td style="padding: 8px">https://spdx.org/licenses/Apache-2.0</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee">
            <td style="padding: 8px">Dataset B</td>
            <td style="padding: 8px">10.5445/IR/1000178054</td>
            <td style="padding: 8px">0009-0005-2800-4833</td>
            <td style="padding: 8px">https://spdx.org/licenses/MIT</td>
          </tr>
        </tbody>
      </table>
    </div>`,
    props: {},
  }),
  play: async ({ canvasElement }) => {
    const { initPidDetection } = await import('@kit-data-manager/pid-component');
    const root = canvasElement.querySelector('#ad-table') as HTMLElement;
    if (root) initPidDetection({ root, darkMode: 'light' });
  },
};

/** Punctuation around PIDs is correctly sanitized. */
export const PunctuationHandling: Story = {
  render: () => ({
    template: `<div id="ad-punct" style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
      <h3 style="margin-bottom: 12px">Punctuation Sanitization</h3>
      <p>
        The dataset (10.1109/eScience65000.2025.00022) was created by
        "0009-0005-2800-4833". See also:
        21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6, which is
        related. Licensed under https://spdx.org/licenses/Apache-2.0.
      </p>
    </div>`,
    props: {},
  }),
  play: async ({ canvasElement }) => {
    const { initPidDetection } = await import('@kit-data-manager/pid-component');
    const root = canvasElement.querySelector('#ad-punct') as HTMLElement;
    if (root) initPidDetection({ root, darkMode: 'light' });
  },
};
