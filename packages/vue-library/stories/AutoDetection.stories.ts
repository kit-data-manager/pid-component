import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent, h, onMounted, onUnmounted, ref } from 'vue';
import type { PidDetectionConfig, PidDetectionController } from '@kit-data-manager/pid-component';
import { initPidDetection } from '@kit-data-manager/pid-component';

// ---------------------------------------------------------------------------
// Helper component
// ---------------------------------------------------------------------------
const AutoDetectContainer = defineComponent({
  props: {
    config: { type: Object as () => Partial<PidDetectionConfig>, default: () => ({}) },
  },
  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null);
    let ctrl: PidDetectionController | undefined;

    onMounted(() => {
      if (root.value) {
        ctrl = initPidDetection({ root: root.value, ...props.config });
      }
    });

    onUnmounted(() => ctrl?.destroy());

    return () => h('div', { ref: root }, slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
/**
 * The `initPidDetection()` function scans a DOM subtree for persistent
 * identifiers and replaces them with interactive `<pid-component>` elements.
 *
 * In Vue, use a template ref and call `initPidDetection()` in `onMounted`.
 * The returned controller provides `stop()`, `rescan()`, and `destroy()`.
 *
 * ```vue
 * <script setup lang="ts">
 * import { ref, onMounted, onUnmounted } from 'vue';
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * const el = ref<HTMLElement>();
 * let ctrl: ReturnType<typeof initPidDetection>;
 *
 * onMounted(() => {
 *   if (el.value) ctrl = initPidDetection({ root: el.value });
 * });
 * onUnmounted(() => ctrl?.destroy());
 * </script>
 *
 * <template>
 *   <div ref="el">DOI: 10.1234/example</div>
 * </template>
 * ```
 */
const meta: Meta = {
  title: 'Auto-Detection',
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Multiple PID types embedded in a research-paper-style paragraph. */
export const MixedPIDsInText: Story = {
  render: () => ({
    components: { AutoDetectContainer },
    template: `
      <AutoDetectContainer :config="{ darkMode: 'light' }">
        <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
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
        </div>
      </AutoDetectContainer>
    `,
  }),
};

/** Only DOI and ORCiD renderers are active; other PID types stay as plain text. */
export const FilteredRenderers: Story = {
  render: () => ({
    components: { AutoDetectContainer },
    template: `
      <AutoDetectContainer :config="{ renderers: ['DOIType', 'ORCIDType'], darkMode: 'light' }">
        <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
          <h3 style="margin-bottom: 12px">Filtered Detection (DOI + ORCiD only)</h3>
          <p>
            This dataset is published at
            21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
            by researcher 0009-0005-2800-4833. Available under
            https://spdx.org/licenses/MIT. DOI:
            10.1109/eScience65000.2025.00022. Only DOI and ORCiD will be
            detected.
          </p>
        </div>
      </AutoDetectContainer>
    `,
  }),
};

/** Dark mode auto-detection on a dark background. */
export const DarkMode: Story = {
  render: () => ({
    components: { AutoDetectContainer },
    template: `
      <AutoDetectContainer :config="{ darkMode: 'dark' }">
        <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8; background: #1a1a2e; color: #eee; padding: 24px; border-radius: 8px">
          <h3 style="margin-bottom: 12px; color: #eee">Dark Mode Auto-Detection</h3>
          <p>
            The dataset 10.1109/eScience65000.2025.00022 by researcher
            0009-0005-2800-4833 is available at https://scc.kit.edu under
            the https://spdx.org/licenses/Apache-2.0 license.
          </p>
        </div>
      </AutoDetectContainer>
    `,
  }),
};

/** Elements matching the exclude CSS selector are skipped. */
export const ExcludeElements: Story = {
  render: () => ({
    components: { AutoDetectContainer },
    template: `
      <AutoDetectContainer :config="{ exclude: '.no-detect', darkMode: 'light' }">
        <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
          <h3 style="margin-bottom: 12px">Auto-Detection with Excluded Elements</h3>
          <p>This Handle PID should be detected: 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</p>
          <div class="no-detect" style="background: #f0f0f0; padding: 12px; border-radius: 4px; font-family: monospace; margin-top: 12px">
            <strong>Excluded zone (code example):</strong><br>
            curl https://doi.org/10.1109/eScience65000.2025.00022<br>
            curl https://ror.org/04t3en479
          </div>
          <p style="margin-top: 12px">This ORCiD should also be detected: 0009-0005-2800-4833</p>
        </div>
      </AutoDetectContainer>
    `,
  }),
};

/** Auto-detection inside an HTML table. */
export const TableWithPIDs: Story = {
  render: () => ({
    components: { AutoDetectContainer },
    template: `
      <AutoDetectContainer :config="{ darkMode: 'light' }">
        <div style="max-width: 800px; font-family: sans-serif">
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
        </div>
      </AutoDetectContainer>
    `,
  }),
};

/** Punctuation around PIDs is correctly sanitized. */
export const PunctuationHandling: Story = {
  render: () => ({
    components: { AutoDetectContainer },
    template: `
      <AutoDetectContainer :config="{ darkMode: 'light' }">
        <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8">
          <h3 style="margin-bottom: 12px">Punctuation Sanitization</h3>
          <p>
            The dataset (10.1109/eScience65000.2025.00022) was created by
            "0009-0005-2800-4833". See also:
            21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6, which is
            related. Licensed under https://spdx.org/licenses/Apache-2.0.
          </p>
        </div>
      </AutoDetectContainer>
    `,
  }),
};
