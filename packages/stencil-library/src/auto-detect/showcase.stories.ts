import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * Full-page showcase examples demonstrating automatic PID detection across
 * all supported identifier types. Each story renders a realistic research
 * data catalog page and runs `initPidDetection()` to enrich all PIDs.
 *
 * The page includes: Handle PIDs, DOIs, ORCiDs, ROR IDs, SPDX license URLs,
 * email addresses, URLs, dates (ISO 8601), and locale codes — all detected
 * and rendered as interactive `<pid-component>` elements.
 *
 * Four variants are provided to show how the same result is achieved in
 * Vanilla HTML, React, Vue 3, and Angular.
 */
const meta: Meta = {
  title: 'Showcase',
  tags: ['autodocs', '!test'],
};

export default meta;
type Story = StoryObj;

// ─── Shared HTML for the realistic research page ────────────────────────────

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
export const VanillaHTML: Story = {
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
    // @ts-ignore - @storybook/test is available at runtime in Storybook
    const { expect } = await import('@storybook/test');
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

/**
 * The same research data catalog page implemented as a **React** application.
 * Uses `useEffect` + `useRef` for auto-detection with proper cleanup.
 */
export const ReactShowcase: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `<div id="showcase-react">${SHOWCASE_HTML}</div>`;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#showcase-react') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'The full catalog page as a React component. Auto-detection runs in `useEffect` with cleanup via `controller.destroy()`.',
      },
      source: {
        code: `
// CatalogPage.tsx
import { useEffect, useRef } from 'react';
import { initPidDetection } from '@kit-data-manager/pid-component';

export default function CatalogPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const controller = initPidDetection({
      root: ref.current,
      darkMode: 'system',
    });
    return () => controller.destroy();
  }, []);

  return (
    <div ref={ref}>
      <h1>FAIR Digital Object Catalog</h1>

      <h2>Dataset Record</h2>
      <table>
        <tbody>
          <tr><td>FDO PID</td><td>21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</td></tr>
          <tr><td>DOI</td><td>10.1109/eScience65000.2025.00022</td></tr>
          <tr><td>Created</td><td>2024-06-15T09:30:00.000+02:00</td></tr>
          <tr><td>Language</td><td>en-US</td></tr>
          <tr><td>License</td><td>https://spdx.org/licenses/Apache-2.0</td></tr>
          <tr><td>Landing Page</td><td>https://scc.kit.edu</td></tr>
        </tbody>
      </table>

      <h2>Authors</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <strong>Author 1</strong>
          <p>ORCiD: 0009-0005-2800-4833</p>
          <p>Email: maximilian.inckmann@kit.edu</p>
          <p>Affiliation: https://ror.org/04t3en479</p>
        </div>
        <div>
          <strong>Author 2</strong>
          <p>ORCiD: 0000-0001-6575-1022</p>
          <p>Email: andreas.pfeil@kit.edu</p>
          <p>Affiliation: https://ror.org/04t3en479</p>
        </div>
      </div>

      <h2>Related Publications</h2>
      <ul>
        <li>M. Inckmann et al., DOI: 10.5445/IR/1000185135</li>
        <li>A. Pfeil et al., DOI: 10.5445/IR/1000178054. Published 2023-11-20T00:00:00.000+01:00.</li>
      </ul>

      <h2>Abstract</h2>
      <p>
        This dataset (21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6) presents results from KIT
        (https://ror.org/04t3en479). Licensed under https://spdx.org/licenses/MIT.
        Related DOI: 10.1109/eScience65000.2025.00022. Contact: maximilian.inckmann@kit.edu.
        Primary language: en-US, supplementary: de-DE.
      </p>
    </div>
  );
}
        `,
      },
    },
  },
};

/**
 * The same research data catalog page implemented as a **Vue 3** application.
 * Uses the Composition API with `onMounted` / `onUnmounted` for lifecycle management.
 */
export const VueShowcase: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `<div id="showcase-vue">${SHOWCASE_HTML}</div>`;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#showcase-vue') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'The full catalog page as a Vue 3 component. Auto-detection uses the Composition API with `onMounted` / `onUnmounted`.',
      },
      source: {
        code: `
<!-- CatalogPage.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { initPidDetection, type PidDetectionController } from '@kit-data-manager/pid-component';

const catalogEl = ref<HTMLDivElement | null>(null);
let controller: PidDetectionController | null = null;

onMounted(() => {
  if (catalogEl.value) {
    controller = initPidDetection({
      root: catalogEl.value,
      darkMode: 'system',
    });
  }
});

onUnmounted(() => controller?.destroy());
</script>

<template>
  <div ref="catalogEl">
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
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
      <div>
        <strong>Author 1</strong>
        <p>ORCiD: 0009-0005-2800-4833</p>
        <p>Email: maximilian.inckmann@kit.edu</p>
        <p>Affiliation: https://ror.org/04t3en479</p>
      </div>
      <div>
        <strong>Author 2</strong>
        <p>ORCiD: 0000-0001-6575-1022</p>
        <p>Email: andreas.pfeil@kit.edu</p>
        <p>Affiliation: https://ror.org/04t3en479</p>
      </div>
    </div>

    <h2>Related Publications</h2>
    <ul>
      <li>M. Inckmann et al., DOI: 10.5445/IR/1000185135</li>
      <li>A. Pfeil et al., DOI: 10.5445/IR/1000178054. Published 2023-11-20T00:00:00.000+01:00.</li>
    </ul>

    <h2>Abstract</h2>
    <p>
      This dataset (21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6) presents results from KIT
      (https://ror.org/04t3en479). Licensed under https://spdx.org/licenses/MIT.
      Related DOI: 10.1109/eScience65000.2025.00022. Contact: maximilian.inckmann@kit.edu.
      Primary language: en-US, supplementary: de-DE.
    </p>
  </div>
</template>
        `,
      },
    },
  },
};

/**
 * The same research data catalog page implemented as an **Angular** application.
 * Uses `AfterViewInit` / `OnDestroy` lifecycle hooks and `@ViewChild` for the element reference.
 */
export const AngularShowcase: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `<div id="showcase-angular">${SHOWCASE_HTML}</div>`;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#showcase-angular') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story:
          'The full catalog page as an Angular standalone component. Auto-detection uses `AfterViewInit` / `OnDestroy` lifecycle hooks.',
      },
      source: {
        code: `
// catalog-page.component.ts
import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  initPidDetection,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  template: \\\`
    <div #catalog>
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
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px">
        <div>
          <strong>Author 1</strong>
          <p>ORCiD: 0009-0005-2800-4833</p>
          <p>Email: maximilian.inckmann&#64;kit.edu</p>
          <p>Affiliation: https://ror.org/04t3en479</p>
        </div>
        <div>
          <strong>Author 2</strong>
          <p>ORCiD: 0000-0001-6575-1022</p>
          <p>Email: andreas.pfeil&#64;kit.edu</p>
          <p>Affiliation: https://ror.org/04t3en479</p>
        </div>
      </div>

      <h2>Related Publications</h2>
      <ul>
        <li>M. Inckmann et al., DOI: 10.5445/IR/1000185135</li>
        <li>A. Pfeil et al., DOI: 10.5445/IR/1000178054.
            Published 2023-11-20T00:00:00.000+01:00.</li>
      </ul>

      <h2>Abstract</h2>
      <p>
        This dataset (21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6)
        presents results from KIT (https://ror.org/04t3en479).
        Licensed under https://spdx.org/licenses/MIT.
        Related DOI: 10.1109/eScience65000.2025.00022.
        Contact: maximilian.inckmann&#64;kit.edu.
        Primary language: en-US, supplementary: de-DE.
      </p>
    </div>
  \\\`,
})
export class CatalogPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('catalog') catalogEl!: ElementRef<HTMLDivElement>;
  private controller?: PidDetectionController;

  ngAfterViewInit(): void {
    this.controller = initPidDetection({
      root: this.catalogEl.nativeElement,
      darkMode: 'system',
    });
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}
        `,
      },
    },
  },
};
