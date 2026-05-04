import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useEffect, useRef } from 'react';
import type { PidDetectionConfig, PidDetectionController } from '@kit-data-manager/pid-component';
import { initPidDetection } from '@kit-data-manager/pid-component';

// ---------------------------------------------------------------------------
// Helper component
// ---------------------------------------------------------------------------
function AutoDetectContainer({
                               config,
                               children,
                             }: {
  config?: Partial<PidDetectionConfig>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctrl = initPidDetection({ root: ref.current, ...config });
    return () => ctrl.destroy();
  }, [config]);
  return <div ref={ref}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
/**
 * The `initPidDetection()` function scans a DOM subtree for persistent
 * identifiers and replaces them with interactive `<pid-component>` elements.
 *
 * In a Next.js application, use `'use client'` components with a ref and
 * `useEffect` to run auto-detection after hydration.
 *
 * ```tsx
 * 'use client';
 * import { useRef, useEffect } from 'react';
 * import { initPidDetection } from '@kit-data-manager/pid-component';
 *
 * export default function ResearchPage() {
 *   const ref = useRef<HTMLDivElement>(null);
 *   useEffect(() => {
 *     if (!ref.current) return;
 *     const ctrl = initPidDetection({ root: ref.current });
 *     return () => ctrl.destroy();
 *   }, []);
 *   return <div ref={ref}>DOI: 10.1234/example</div>;
 * }
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
  render: () => (
    <AutoDetectContainer config={{ darkMode: 'light' }}>
      <div style={{ maxWidth: 800, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
        <h3 style={{ marginBottom: 12 }}>Research Paper Metadata</h3>
        <p>
          This dataset is published as an FDO at
          21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created
          by researcher 0009-0005-2800-4833. The work was conducted at
          https://ror.org/04t3en479 and is available under the
          https://spdx.org/licenses/Apache-2.0 license. Please have a
          look at DOI 10.1109/eScience65000.2025.00022.
        </p>
        <p style={{ marginTop: 12 }}>
          For questions, contact the author at someone@example.com or
          visit https://scc.kit.edu for more information.
        </p>
      </div>
    </AutoDetectContainer>
  ),
};

/** Only DOI and ORCiD renderers are active; other PID types stay as plain text. */
export const FilteredRenderers: Story = {
  render: () => (
    <AutoDetectContainer
      config={{ renderers: ['DOIType', 'ORCIDType'], darkMode: 'light' }}
    >
      <div style={{ maxWidth: 800, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
        <h3 style={{ marginBottom: 12 }}>Filtered Detection (DOI + ORCiD only)</h3>
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
  ),
};

/** Dark mode auto-detection on a dark background. */
export const DarkMode: Story = {
  render: () => (
    <AutoDetectContainer config={{ darkMode: 'dark' }}>
      <div
        style={{
          maxWidth: 800,
          fontFamily: 'sans-serif',
          lineHeight: 1.8,
          background: '#1a1a2e',
          color: '#eee',
          padding: 24,
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 12, color: '#eee' }}>Dark Mode Auto-Detection</h3>
        <p>
          The dataset 10.1109/eScience65000.2025.00022 by researcher
          0009-0005-2800-4833 is available at https://scc.kit.edu under
          the https://spdx.org/licenses/Apache-2.0 license.
        </p>
      </div>
    </AutoDetectContainer>
  ),
};

/** Elements matching the exclude CSS selector are skipped. */
export const ExcludeElements: Story = {
  render: () => (
    <AutoDetectContainer config={{ exclude: '.no-detect', darkMode: 'light' }}>
      <div style={{ maxWidth: 800, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
        <h3 style={{ marginBottom: 12 }}>Auto-Detection with Excluded Elements</h3>
        <p>
          This Handle PID should be detected:
          21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6
        </p>
        <div
          className="no-detect"
          style={{
            background: '#f0f0f0',
            padding: 12,
            borderRadius: 4,
            fontFamily: 'monospace',
            marginTop: 12,
          }}
        >
          <strong>Excluded zone (code example):</strong>
          <br />
          curl https://doi.org/10.1109/eScience65000.2025.00022
          <br />
          curl https://ror.org/04t3en479
        </div>
        <p style={{ marginTop: 12 }}>
          This ORCiD should also be detected: 0009-0005-2800-4833
        </p>
      </div>
    </AutoDetectContainer>
  ),
};

/** Auto-detection inside an HTML table. */
export const TableWithPIDs: Story = {
  render: () => (
    <AutoDetectContainer config={{ darkMode: 'light' }}>
      <div style={{ maxWidth: 800, fontFamily: 'sans-serif' }}>
        <h3 style={{ marginBottom: 12 }}>Research Outputs</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
          <tr style={{ borderBottom: '2px solid #ddd' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
            <th style={{ textAlign: 'left', padding: 8 }}>DOI</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Author ORCiD</th>
            <th style={{ textAlign: 'left', padding: 8 }}>License</th>
          </tr>
          </thead>
          <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: 8 }}>Dataset A</td>
            <td style={{ padding: 8 }}>10.5445/IR/1000185135</td>
            <td style={{ padding: 8 }}>0009-0005-2800-4833</td>
            <td style={{ padding: 8 }}>https://spdx.org/licenses/Apache-2.0</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: 8 }}>Dataset B</td>
            <td style={{ padding: 8 }}>10.5445/IR/1000178054</td>
            <td style={{ padding: 8 }}>0009-0005-2800-4833</td>
            <td style={{ padding: 8 }}>https://spdx.org/licenses/MIT</td>
          </tr>
          </tbody>
        </table>
      </div>
    </AutoDetectContainer>
  ),
};

/** Punctuation around PIDs is correctly sanitized. */
export const PunctuationHandling: Story = {
  render: () => (
    <AutoDetectContainer config={{ darkMode: 'light' }}>
      <div style={{ maxWidth: 800, fontFamily: 'sans-serif', lineHeight: 1.8 }}>
        <h3 style={{ marginBottom: 12 }}>Punctuation Sanitization</h3>
        <p>
          The dataset (10.1109/eScience65000.2025.00022) was created by
          &quot;0009-0005-2800-4833&quot;. See also:
          21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6, which is
          related. Licensed under https://spdx.org/licenses/Apache-2.0.
        </p>
      </div>
    </AutoDetectContainer>
  ),
};

/** Controller lifecycle: destroy and rescan buttons. */
export const ControllerLifecycle: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const ctrlRef = useRef<PidDetectionController | null>(null);

    const start = () => {
      if (!ref.current) return;
      ctrlRef.current = initPidDetection({
        root: ref.current,
        darkMode: 'light',
      });
    };

    useEffect(() => {
      start();
      return () => ctrlRef.current?.destroy();
    }, []);

    return (
      <div style={{ maxWidth: 800, fontFamily: 'sans-serif' }}>
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => ctrlRef.current?.destroy()}
            style={{
              padding: '8px 16px',
              marginRight: 8,
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#f5f5f5',
            }}
          >
            Destroy
          </button>
          <button
            onClick={start}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: '#f5f5f5',
            }}
          >
            Rescan
          </button>
        </div>
        <div ref={ref} style={{ lineHeight: 1.8 }}>
          <p>
            This dataset (DOI: 10.1109/eScience65000.2025.00022) was
            created by researcher 0009-0005-2800-4833. Click
            &quot;Destroy&quot; to restore the original text, or
            &quot;Rescan&quot; to re-detect PIDs.
          </p>
        </div>
      </div>
    );
  },
};
