import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

/**
 * The pid-collapsible component provides a flexible container that can be expanded
 * and collapsed. It supports customization of appearance and behavior.
 */
const meta: Meta = {
  title: 'Internal/Collapsible',
  component: 'pid-collapsible',
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Whether the collapsible is open by default',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    emphasize: {
      description: 'Whether to emphasize the component with border and shadow',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    expanded: {
      description: 'Whether the component is in expanded mode (full size)',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    initialWidth: {
      description: 'Initial width when expanded',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    initialHeight: {
      description: 'Initial height when expanded',
      control: { type: 'text' },
      table: {
        type: { summary: 'string' },
      },
    },
    lineHeight: {
      description: 'Line height for collapsed state',
      control: { type: 'number' },
      table: {
        defaultValue: { summary: '24' },
        type: { summary: 'number' },
      },
    },
    showFooter: {
      description: 'Whether to show the footer section',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    resizable: {
      description: 'Whether the component can be resized',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    darkMode: {
      description: 'The dark mode setting for the component',
      control: 'select',
      options: ['light', 'dark', 'system'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'system' },
      },
    },
  },
  args: {
    open: false,
    emphasize: true,
    expanded: false,
    lineHeight: 24,
    showFooter: false,
    resizable: false,
    darkMode: 'system',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Default collapsible component in closed state
 */
export const Default: Story = {
  args: {
    open: false,
    emphasize: true,
    darkMode: 'system',
  },
  render: args => html`
    <div class="rounded-md bg-gray-50 p-4">
      <pid-collapsible
        open=${args.open}
        emphasize=${args.emphasize}
        expanded=${args.expanded}
        initialWidth=${args.initialWidth}
        initialHeight=${args.initialHeight}
        lineHeight=${args.lineHeight}
        showFooter=${args.showFooter}
        resizable=${args.resizable}
        darkMode=${args.darkMode}
        @toggle=${e => console.log('Toggle event:', e.detail)}
        @resize=${e => console.log('Resize event:', e.detail)}
      >
        <span slot="summary" class="font-medium">Collapsible Component</span>
        <div class="p-4">
          <p class="mb-2">This is the content of the collapsible component.</p>
          <p>It can contain any HTML content.</p>
        </div>
        ${args.showFooter ? html` <div slot="footer" class="p-2 text-center text-sm text-gray-500">Footer content here</div> ` : ''}
      </pid-collapsible>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible open="false" emphasize="true" darkMode="system">
  <span slot="summary">Collapsible Component</span>
  <div>
    <p>This is the content of the collapsible component.</p>
    <p>It can contain any HTML content.</p>
  </div>
</pid-collapsible>
        `,
      },
    },
  },
};

/**
 * Collapsible component that starts in the open state
 */
export const OpenByDefault: Story = {
  args: {
    open: true,
    emphasize: true,
    darkMode: 'system',
  },
  render: args => html`
    <div class="rounded-md bg-gray-50 p-4">
      <pid-collapsible
        open=${args.open}
        emphasize=${args.emphasize}
        expanded=${args.expanded}
        initialWidth=${args.initialWidth}
        initialHeight=${args.initialHeight}
        lineHeight=${args.lineHeight}
        showFooter=${args.showFooter}
        resizable=${args.resizable}
        darkMode=${args.darkMode}
        @toggle=${e => console.log('Toggle event:', e.detail)}
        @resize=${e => console.log('Resize event:', e.detail)}
      >
        <span slot="summary" class="font-medium">Collapsible Component (Open by Default)</span>
        <div class="p-4">
          <p class="mb-2">This is the content of the collapsible component.</p>
          <p>It can contain any HTML content.</p>
        </div>
        ${args.showFooter ? html` <div slot="footer" class="p-2 text-center text-sm text-gray-500">Footer content here</div> ` : ''}
      </pid-collapsible>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible open="true" emphasize="true" darkMode="system">
  <span slot="summary">Collapsible Component (Open by Default)</span>
  <div>
    <p>This is the content of the collapsible component.</p>
    <p>It can contain any HTML content.</p>
  </div>
</pid-collapsible>
        `,
      },
    },
  },
};

/**
 * Collapsible component with footer and resize capability
 */
export const WithFooterAndResize: Story = {
  args: {
    open: true,
    emphasize: true,
    showFooter: true,
    resizable: true,
    initialWidth: '500px',
    initialHeight: '300px',
    darkMode: 'system',
  },
  render: args => html`
    <div class="rounded-md bg-gray-50 p-4">
      <pid-collapsible
        open=${args.open}
        emphasize=${args.emphasize}
        expanded=${args.expanded}
        initialWidth=${args.initialWidth}
        initialHeight=${args.initialHeight}
        lineHeight=${args.lineHeight}
        showFooter=${args.showFooter}
        resizable=${args.resizable}
        darkMode=${args.darkMode}
        @toggle=${e => console.log('Toggle event:', e.detail)}
        @resize=${e => console.log('Resize event:', e.detail)}
      >
        <span slot="summary" class="font-medium">Resizable Collapsible with Footer</span>
        <div class="p-4">
          <p class="mb-2">This component has a footer and can be resized.</p>
          <p class="mb-2">Try dragging the bottom-right corner to resize.</p>
          <div class="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm"><strong>Tip:</strong> The resize handle appears in the bottom-right corner when hovering.</div>
        </div>
        <div slot="footer" class="flex items-center justify-between border-t border-gray-200 p-2">
          <span class="text-sm text-gray-500">Footer content</span>
          <div class="flex gap-2">
            <button class="rounded bg-blue-500 px-3 py-1 text-sm text-white">Action 1</button>
            <button class="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700">Action 2</button>
          </div>
        </div>
      </pid-collapsible>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible
  open="true"
  emphasize="true"
  showFooter="true"
  resizable="true"
  initialWidth="500px"
  initialHeight="300px"
  darkMode="system">
  <span slot="summary">Resizable Collapsible with Footer</span>
  <div>
    <p>This component has a footer and can be resized.</p>
    <p>Try dragging the bottom-right corner to resize.</p>
  </div>
  <div slot="footer">
    <span>Footer content</span>
    <button>Action 1</button>
    <button>Action 2</button>
  </div>
</pid-collapsible>
        `,
      },
    },
  },
};

/**
 * Adaptive collapsible component that responds to resize events
 */
export const AdaptiveWithResizeEvents: Story = {
  args: {
    open: true,
    emphasize: true,
    resizable: true,
    showFooter: true,
    initialWidth: '500px',
    initialHeight: '300px',
    darkMode: 'system',
  },
  render: args => {
    // Create a unique ID for this instance
    const resizeInfoId = `resize-info-${Math.random().toString(36).substring(2, 9)}`;

    // Setup the resize event handler
    const handleResize = e => {
      const resizeInfo = document.getElementById(resizeInfoId);
      if (resizeInfo) {
        resizeInfo.textContent = `Width: ${Math.round(e.detail.width)}px × Height: ${Math.round(e.detail.height)}px`;
      }
    };

    return html`
      <div class="rounded-md bg-gray-50 p-4">
        <div class="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-sm">Resize the component to see resize events in the footer.</div>

        <pid-collapsible
          open=${args.open}
          emphasize=${args.emphasize}
          expanded=${args.expanded}
          initialWidth=${args.initialWidth}
          initialHeight=${args.initialHeight}
          lineHeight=${args.lineHeight}
          showFooter=${args.showFooter}
          resizable=${args.resizable}
          darkMode=${args.darkMode}
          @toggle=${e => console.log('Toggle event:', e.detail)}
          @collapsibleResize=${handleResize}
        >
          <span slot="summary" class="font-medium">Adaptive Collapsible</span>
          <div class="flex-grow p-4">
            <p class="mb-2">This collapsible demonstrates the adaptive resizing feature.</p>
            <p>Resize events will be shown in the footer.</p>
          </div>
          <div slot="footer" class="bg-blue-50 p-2 text-center text-sm" id=${resizeInfoId}>Resize the component to see dimensions</div>
        </pid-collapsible>
      </div>
    `;
  },
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible
  open="true"
  emphasize="true"
  showFooter="true"
  resizable="true"
  initialWidth="500px"
  initialHeight="300px"
  darkMode="system"
  @collapsibleResize="handleResizeEvent">
  <span slot="summary">Adaptive Collapsible</span>
  <div>
    <p>This collapsible demonstrates the adaptive resizing feature.</p>
    <p>Resize events will be shown in the footer.</p>
  </div>
  <div slot="footer" id="resize-info">
    Resize the component to see dimensions
  </div>
</pid-collapsible>

<script>
  // Handle resize events
  document.querySelector('pid-collapsible').addEventListener('collapsibleResize', e => {
    const resizeInfo = document.getElementById('resize-info');
    if (resizeInfo) {
      resizeInfo.textContent = \`Width: \${Math.round(e.detail.width)}px × Height: \${Math.round(e.detail.height)}px\`;
    }
  });
</script>
        `,
      },
    },
  },
};

/**
 * Demonstrates the dark mode appearance
 */
export const DarkMode: Story = {
  args: {
    open: true,
    emphasize: true,
    darkMode: 'dark',
    showFooter: true,
  },
  render: args => html`
    <div class="rounded-md bg-gray-900 p-4">
      <pid-collapsible
        open=${args.open}
        emphasize=${args.emphasize}
        expanded=${args.expanded}
        initialWidth=${args.initialWidth}
        initialHeight=${args.initialHeight}
        lineHeight=${args.lineHeight}
        showFooter=${args.showFooter}
        resizable=${args.resizable}
        darkMode=${args.darkMode}
        @toggle=${e => console.log('Toggle event:', e.detail)}
        @resize=${e => console.log('Resize event:', e.detail)}
      >
        <span slot="summary" class="font-medium">Dark Mode Collapsible</span>
        <div class="p-4">
          <p class="mb-2">This collapsible demonstrates the dark mode appearance.</p>
          <p>Dark mode adapts the component's colors to be suitable for dark backgrounds.</p>
        </div>
        ${args.showFooter ? html` <div slot="footer" class="p-2 text-center text-sm">Footer content in dark mode</div> ` : ''}
      </pid-collapsible>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible
  open="true"
  emphasize="true"
  showFooter="true"
  darkMode="dark">
  <span slot="summary">Dark Mode Collapsible</span>
  <div>
    <p>This collapsible demonstrates the dark mode appearance.</p>
    <p>Dark mode adapts the component's colors to be suitable for dark backgrounds.</p>
  </div>
  <div slot="footer">Footer content in dark mode</div>
</pid-collapsible>
        `,
      },
    },
  },
};

/**
 * Demonstrates the light mode appearance
 */
export const LightMode: Story = {
  args: {
    open: true,
    emphasize: true,
    darkMode: 'light',
    showFooter: true,
  },
  render: args => html`
    <div class="rounded-md bg-white p-4">
      <pid-collapsible
        open=${args.open}
        emphasize=${args.emphasize}
        expanded=${args.expanded}
        initialWidth=${args.initialWidth}
        initialHeight=${args.initialHeight}
        lineHeight=${args.lineHeight}
        showFooter=${args.showFooter}
        resizable=${args.resizable}
        darkMode=${args.darkMode}
        @toggle=${e => console.log('Toggle event:', e.detail)}
        @resize=${e => console.log('Resize event:', e.detail)}
      >
        <span slot="summary" class="font-medium">Light Mode Collapsible</span>
        <div class="p-4">
          <p class="mb-2">This collapsible demonstrates the light mode appearance.</p>
          <p>Light mode is the default appearance for most interfaces.</p>
        </div>
        ${args.showFooter ? html` <div slot="footer" class="p-2 text-center text-sm">Footer content in light mode</div> ` : ''}
      </pid-collapsible>
    </div>
  `,
  parameters: {
    docs: {
      source: {
        code: `
<pid-collapsible
  open="true"
  emphasize="true"
  showFooter="true"
  darkMode="light">
  <span slot="summary">Light Mode Collapsible</span>
  <div>
    <p>This collapsible demonstrates the light mode appearance.</p>
    <p>Light mode is the default appearance for most interfaces.</p>
  </div>
  <div slot="footer">Footer content in light mode</div>
</pid-collapsible>
        `,
      },
    },
  },
};

/**
 * Showcase of different collapsible states
 */
export const CollapsibleStates: Story = {
  render: () => {
    // Define the different states to showcase
    const states = [
      {
        title: 'Default',
        open: false,
        emphasize: false,
        expanded: false,
        showFooter: false,
        darkMode: 'system',
        description: 'Default state with no emphasis, closed, and no footer.',
        bgColor: 'bg-white',
      },
      {
        title: 'Open',
        open: true,
        emphasize: false,
        expanded: false,
        showFooter: false,
        darkMode: 'system',
        description: 'Open state with no emphasis and no footer.',
        bgColor: 'bg-blue-50',
      },
      {
        title: 'Emphasized',
        open: false,
        emphasize: true,
        expanded: false,
        showFooter: false,
        darkMode: 'system',
        description: 'Closed state with emphasis and no footer.',
        bgColor: 'bg-green-50',
      },
      {
        title: 'With Footer',
        open: true,
        emphasize: true,
        expanded: false,
        showFooter: true,
        darkMode: 'system',
        description: 'Open state with emphasis and footer.',
        bgColor: 'bg-yellow-50',
      },
      {
        title: 'Expanded',
        open: true,
        emphasize: true,
        showFooter: true,
        darkMode: 'system',
        description: 'Open, emphasized, expanded state with footer.',
        bgColor: 'bg-purple-50',
      },
      {
        title: 'Dark Mode',
        open: true,
        emphasize: true,
        expanded: false,
        showFooter: true,
        darkMode: 'dark',
        description: 'Open state with emphasis, footer, and dark mode.',
        bgColor: 'bg-gray-800 text-white',
      },
    ];

    // Create a template for each state
    const stateTemplates = states.map(
      state => html`
        <div class="${state.bgColor} mb-6 rounded-lg p-4">
          <h3 class="mb-2 text-lg font-bold">${state.title}</h3>
          <p class="mb-4 text-sm">${state.description}</p>

          <pid-collapsible open=${state.open} emphasize=${state.emphasize} expanded=${state.expanded} showFooter=${state.showFooter} darkMode=${state.darkMode}>
            <span slot="summary" class="font-medium">${state.title} Example</span>
            <div class="p-4">
              <p class="mb-2">This collapsible demonstrates the <strong>${state.title}</strong> state.</p>
              <ul class="mt-2 list-disc pl-5">
                <li>Open: ${state.open}</li>
                <li>Emphasize: ${state.emphasize}</li>
                <li>Expanded: ${state.expanded}</li>
                <li>Show Footer: ${state.showFooter}</li>
                <li>Dark Mode: ${state.darkMode}</li>
              </ul>
            </div>
            ${state.showFooter ? html` <div slot="footer" class="border-t border-gray-200 p-2 text-center text-sm text-gray-500">Footer for ${state.title}</div> ` : ''}
          </pid-collapsible>
        </div>
      `,
    );

    // Combine all states into a container
    return html` <div class="space-y-4 rounded-md bg-gray-100 p-8">${stateTemplates}</div> `;
  },
  parameters: {
    docs: {
      source: {
        code: `
<!-- Example of different collapsible states -->

<!-- Default state -->
<pid-collapsible darkMode="system">
  <span slot="summary">Default Example</span>
  <div>
    <p>This collapsible demonstrates the default state.</p>
  </div>
</pid-collapsible>

<!-- Open state -->
<pid-collapsible open="true" darkMode="system">
  <span slot="summary">Open Example</span>
  <div>
    <p>This collapsible demonstrates the open state.</p>
  </div>
</pid-collapsible>

<!-- Emphasized state -->
<pid-collapsible emphasize="true" darkMode="system">
  <span slot="summary">Emphasized Example</span>
  <div>
    <p>This collapsible demonstrates the emphasized state.</p>
  </div>
</pid-collapsible>

<!-- With Footer state -->
<pid-collapsible open="true" emphasize="true" showFooter="true" darkMode="system">
  <span slot="summary">With Footer Example</span>
  <div>
    <p>This collapsible demonstrates the state with footer.</p>
  </div>
  <div slot="footer">Footer content</div>
</pid-collapsible>

<!-- Expanded state -->
<pid-collapsible open="true" emphasize="true" expanded="true" showFooter="true" darkMode="system">
  <span slot="summary">Expanded Example</span>
  <div>
    <p>This collapsible demonstrates the expanded state.</p>
  </div>
  <div slot="footer">Footer content</div>
</pid-collapsible>

<!-- Dark Mode state -->
<pid-collapsible open="true" emphasize="true" showFooter="true" darkMode="dark">
  <span slot="summary">Dark Mode Example</span>
  <div>
    <p>This collapsible demonstrates the dark mode state.</p>
  </div>
  <div slot="footer">Footer content</div>
</pid-collapsible>
        `,
      },
    },
  },
};
