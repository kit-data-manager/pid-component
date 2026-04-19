// Import Tailwind CSS for ShadCN-style components
import './preview.css';

// Register all custom elements using the dist-custom-elements bundle.
// The lazy loader (defineCustomElements from /loader) does NOT work in
// static Storybook builds because Vite bundles everything at build time
// and the Stencil lazy-loading runtime cannot fetch chunks at runtime.
// Instead, we import each component's defineCustomElement individually.
import {
  defineCustomElement as definePidComponent,
} from '@kit-data-manager/pid-component/dist/components/pid-component.js';
import {
  defineCustomElement as defineCopyButton,
} from '@kit-data-manager/pid-component/dist/components/copy-button.js';
import {
  defineCustomElement as defineJsonViewer,
} from '@kit-data-manager/pid-component/dist/components/json-viewer.js';
import {
  defineCustomElement as definePidActions,
} from '@kit-data-manager/pid-component/dist/components/pid-actions.js';
import {
  defineCustomElement as definePidCollapsible,
} from '@kit-data-manager/pid-component/dist/components/pid-collapsible.js';
import {
  defineCustomElement as definePidDataTable,
} from '@kit-data-manager/pid-component/dist/components/pid-data-table.js';
import {
  defineCustomElement as definePidPagination,
} from '@kit-data-manager/pid-component/dist/components/pid-pagination.js';
import {
  defineCustomElement as definePidTooltip,
} from '@kit-data-manager/pid-component/dist/components/pid-tooltip.js';
import {
  defineCustomElement as defineColorHighlight,
} from '@kit-data-manager/pid-component/dist/components/color-highlight.js';
import {
  defineCustomElement as defineLocaleVisualization,
} from '@kit-data-manager/pid-component/dist/components/locale-visualization.js';

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
  tags: ['autodocs'],
  parameters: {
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
  },
};
