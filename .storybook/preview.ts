import '../packages/stencil-library/src/tailwind.css';
import {
  defineCustomElement as definePidComponent,
} from '../packages/stencil-library/dist/components/pid-component.js';
import { defineCustomElement as defineCopyButton } from '../packages/stencil-library/dist/components/copy-button.js';
import { defineCustomElement as defineJsonViewer } from '../packages/stencil-library/dist/components/json-viewer.js';
import { defineCustomElement as definePidActions } from '../packages/stencil-library/dist/components/pid-actions.js';
import {
  defineCustomElement as definePidCollapsible,
} from '../packages/stencil-library/dist/components/pid-collapsible.js';
import {
  defineCustomElement as definePidDataTable,
} from '../packages/stencil-library/dist/components/pid-data-table.js';
import {
  defineCustomElement as definePidPagination,
} from '../packages/stencil-library/dist/components/pid-pagination.js';
import { defineCustomElement as definePidTooltip } from '../packages/stencil-library/dist/components/pid-tooltip.js';
import {
  defineCustomElement as defineColorHighlight,
} from '../packages/stencil-library/dist/components/color-highlight.js';
import {
  defineCustomElement as defineLocaleVisualization,
} from '../packages/stencil-library/dist/components/locale-visualization.js';

// Register all custom elements using the dist-custom-elements bundle.
// This is self-contained (no lazy loading), so it works correctly when
// bundled by Vite for both dev and static Storybook builds.
definePidComponent();
defineCopyButton();
defineJsonViewer();
definePidActions();
definePidCollapsible();
definePidDataTable();
definePidPagination();
definePidTooltip();
defineColorHighlight();
defineLocaleVisualization();

export default {
  parameters: {
    a11y: {
      context: {},
      config: {},
      options: {},
    },
    backgrounds: {
      options: {
        dark: { name: 'Dark', value: '#222' },
        light: { name: 'Light', value: '#F7F9F2' },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        order: [
          'intro', 'pid-component', 'auto-detect', 'react-vite', 'react-nextjs', 'vue', 'angular', 'Internal', '*',
        ],
      },
    },
  },
  tags: ['autodocs'],
};
