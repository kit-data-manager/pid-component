import { Meta, StoryObj } from '@storybook/web-components-vite';

/**
 * The `pid-component` and `initPidDetection()` work in any JavaScript framework.
 * Framework-specific wrapper packages are available for React, Vue, and Angular.
 *
 * These stories demonstrate how to use the pid-component and auto-detection
 * in each framework, with complete code examples.
 *
 * **Available packages:**
 *
 * | Package | Framework | npm |
 * |---------|-----------|-----|
 * | `@kit-data-manager/pid-component` | Web Components (vanilla) | [![npm](https://img.shields.io/npm/v/@kit-data-manager/pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/pid-component) |
 * | `@kit-data-manager/react-pid-component` | React | [![npm](https://img.shields.io/npm/v/@kit-data-manager/react-pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/react-pid-component) |
 * | `@kit-data-manager/vue-pid-component` | Vue 3 | [![npm](https://img.shields.io/npm/v/@kit-data-manager/vue-pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/vue-pid-component) |
 * | `@kit-data-manager/angular-pid-component` | Angular 16+ | [![npm](https://img.shields.io/npm/v/@kit-data-manager/angular-pid-component.svg)](https://www.npmjs.com/package/@kit-data-manager/angular-pid-component) |
 *
 * The `initPidDetection()` function is framework-agnostic and is always imported
 * from the core `@kit-data-manager/pid-component` package.
 */
const meta: Meta = {
  title: 'Framework Integration',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Use the React wrapper package `@kit-data-manager/react-pid-component` for
 * type-safe React components. Auto-detection integrates via `useEffect()` +
 * `useRef()` with proper cleanup.
 */
export const React: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">React Integration</h3>
        <p>
          This demo runs as a plain web component, but below you'll find the
          complete React code for both the wrapper component and auto-detection.
        </p>
        <div id="react-demo" style="margin-top: 16px;">
          <p>
            This paper has DOI 10.1109/eScience65000.2025.00022 and was authored by
            0009-0005-2800-4833.
          </p>
        </div>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#react-demo') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story: `
### Installation

\`\`\`bash
npm install @kit-data-manager/react-pid-component @kit-data-manager/pid-component
\`\`\`

### Using the Component

\`\`\`tsx
import { PidComponent } from '@kit-data-manager/react-pid-component';

function App() {
  return (
    <PidComponent
      value="10.1109/eScience65000.2025.00022"
      darkMode="system"
      renderers='["DOIType"]'
    />
  );
}
\`\`\`

### Auto-Detection with useEffect

\`\`\`tsx
import { useEffect, useRef } from 'react';
import { initPidDetection } from '@kit-data-manager/pid-component';

function ResearchPage({ htmlContent }: { htmlContent: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const controller = initPidDetection({
      root: contentRef.current,
      darkMode: 'system',
      renderers: ['DOIType', 'ORCIDType', 'HandleType'],
    });

    // Cleanup on unmount — restores original text
    return () => controller.destroy();
  }, [htmlContent]);

  return (
    <div
      ref={contentRef}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
\`\`\`

### Custom Hook

\`\`\`tsx
import { useEffect, useRef } from 'react';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

function usePidDetection(config?: Omit<PidDetectionConfig, 'root'>) {
  const ref = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PidDetectionController | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    controllerRef.current = initPidDetection({
      ...config,
      root: ref.current,
    });

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  return { ref, controller: controllerRef };
}

// Usage:
function MyPage() {
  const { ref } = usePidDetection({ darkMode: 'system' });
  return (
    <div ref={ref}>
      <p>Paper DOI: 10.1109/eScience65000.2025.00022</p>
    </div>
  );
}
\`\`\`
        `,
      },
      source: {
        code: `
// React component wrapper
import { PidComponent } from '@kit-data-manager/react-pid-component';

<PidComponent value="10.1109/eScience65000.2025.00022" darkMode="system" />

// Auto-detection
import { initPidDetection } from '@kit-data-manager/pid-component';

useEffect(() => {
  const controller = initPidDetection({
    root: contentRef.current,
    darkMode: 'system',
  });
  return () => controller.destroy();
}, []);
        `,
      },
    },
  },
};

/**
 * Use the Vue wrapper package `@kit-data-manager/vue-pid-component` for
 * Vue 3 components with full prop typing. Auto-detection integrates via
 * `onMounted()` + `onUnmounted()` lifecycle hooks.
 */
export const Vue: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Vue 3 Integration</h3>
        <p>
          This demo runs as a plain web component, but below you'll find the
          complete Vue 3 code for both the wrapper component and auto-detection.
        </p>
        <div id="vue-demo" style="margin-top: 16px;">
          <p>
            This dataset is published at 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6 and was created by
            0009-0005-2800-4833. Licensed under https://spdx.org/licenses/Apache-2.0.
          </p>
        </div>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#vue-demo') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story: `
### Installation

\`\`\`bash
npm install @kit-data-manager/vue-pid-component @kit-data-manager/pid-component
\`\`\`

### Using the Component

\`\`\`vue
<script setup>
import { PidComponent } from '@kit-data-manager/vue-pid-component';
</script>

<template>
  <PidComponent
    value="10.1109/eScience65000.2025.00022"
    dark-mode="system"
    renderers='["DOIType"]'
  />
</template>
\`\`\`

### Auto-Detection with Composition API

\`\`\`vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { initPidDetection } from '@kit-data-manager/pid-component';

const contentEl = ref(null);
let controller;

onMounted(() => {
  if (contentEl.value) {
    controller = initPidDetection({
      root: contentEl.value,
      darkMode: 'system',
      renderers: ['DOIType', 'ORCIDType', 'HandleType'],
    });
  }
});

onUnmounted(() => controller?.destroy());
</script>

<template>
  <div ref="contentEl">
    <p>
      This paper has DOI 10.1109/eScience65000.2025.00022
      and was authored by 0009-0005-2800-4833.
    </p>
  </div>
</template>
\`\`\`

### Composable

\`\`\`typescript
// composables/usePidDetection.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

export function usePidDetection(
  elementRef: Ref<HTMLElement | null>,
  config?: Omit<PidDetectionConfig, 'root'>
) {
  let controller: PidDetectionController | null = null;

  onMounted(() => {
    if (elementRef.value) {
      controller = initPidDetection({ ...config, root: elementRef.value });
    }
  });

  onUnmounted(() => {
    controller?.destroy();
    controller = null;
  });

  return {
    rescan: () => controller?.rescan(),
    stop: () => controller?.stop(),
    destroy: () => controller?.destroy(),
  };
}
\`\`\`
        `,
      },
      source: {
        code: `
// Vue component wrapper
import { PidComponent } from '@kit-data-manager/vue-pid-component';

<PidComponent value="10.1109/eScience65000.2025.00022" dark-mode="system" />

// Auto-detection
import { initPidDetection } from '@kit-data-manager/pid-component';

onMounted(() => {
  controller = initPidDetection({ root: contentEl.value, darkMode: 'system' });
});
onUnmounted(() => controller?.destroy());
        `,
      },
    },
  },
};

/**
 * Use the Angular wrapper package `@kit-data-manager/angular-pid-component` for
 * standalone Angular components. Auto-detection integrates via
 * `ngAfterViewInit()` + `ngOnDestroy()` lifecycle hooks.
 */
export const Angular: Story = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="max-width: 800px; font-family: sans-serif; line-height: 1.8;">
        <h3 style="margin-bottom: 12px;">Angular Integration</h3>
        <p>
          This demo runs as a plain web component, but below you'll find the
          complete Angular code for both the wrapper component and auto-detection.
        </p>
        <div id="angular-demo" style="margin-top: 16px;">
          <p>
            This dataset is available at https://ror.org/04t3en479 with
            DOI 10.1109/eScience65000.2025.00022.
            Contact: someone@example.com
          </p>
        </div>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('./initPidDetection');
      const root = container.querySelector('#angular-demo') as HTMLElement;
      if (root) initPidDetection({ root, darkMode: 'light' });
    }, 100);

    return container;
  },
  parameters: {
    docs: {
      description: {
        story: `
### Installation

\`\`\`bash
npm install @kit-data-manager/angular-pid-component @kit-data-manager/pid-component
\`\`\`

### Using the Component

\`\`\`typescript
// app.component.ts
import { Component } from '@angular/core';
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PidComponent],
  template: \\\`
    <pid-component
      value="10.1109/eScience65000.2025.00022"
      dark-mode="system"
      renderers='["DOIType"]'
    ></pid-component>
  \\\`,
})
export class AppComponent {}
\`\`\`

### Auto-Detection with Lifecycle Hooks

\`\`\`typescript
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
  selector: 'app-research-page',
  standalone: true,
  template: \\\`
    <div #content>
      <p>
        This paper has DOI 10.1109/eScience65000.2025.00022
        and was authored by 0009-0005-2800-4833.
      </p>
    </div>
  \\\`,
})
export class ResearchPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('content') contentEl!: ElementRef<HTMLDivElement>;
  private controller?: PidDetectionController;

  ngAfterViewInit(): void {
    this.controller = initPidDetection({
      root: this.contentEl.nativeElement,
      darkMode: 'system',
      renderers: ['DOIType', 'ORCIDType', 'HandleType'],
    });
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }

  rescan(): void {
    this.controller?.rescan();
  }
}
\`\`\`

### Directive for Auto-Detection

\`\`\`typescript
import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

@Directive({
  selector: '[pidAutoDetect]',
  standalone: true,
})
export class PidAutoDetectDirective implements AfterViewInit, OnDestroy {
  @Input() pidAutoDetectConfig?: Omit<PidDetectionConfig, 'root'>;
  private controller?: PidDetectionController;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.controller = initPidDetection({
      ...this.pidAutoDetectConfig,
      root: this.el.nativeElement,
    });
  }

  ngOnDestroy(): void {
    this.controller?.destroy();
  }
}

// Usage in template:
// <div pidAutoDetect [pidAutoDetectConfig]="{ darkMode: 'system' }">
//   <p>Paper DOI: 10.1109/eScience65000.2025.00022</p>
// </div>
\`\`\`
        `,
      },
      source: {
        code: `
// Angular component
import { PidComponent } from '@kit-data-manager/angular-pid-component';

@Component({
  imports: [PidComponent],
  template: '<pid-component value="10.1109/eScience65000.2025.00022" dark-mode="system" />'
})

// Auto-detection
import { initPidDetection } from '@kit-data-manager/pid-component';

ngAfterViewInit() {
  this.controller = initPidDetection({
    root: this.contentEl.nativeElement,
    darkMode: 'system',
  });
}
ngOnDestroy() { this.controller?.destroy(); }
        `,
      },
    },
  },
};
