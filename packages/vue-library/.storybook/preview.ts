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

// Import Vuetify styles and MDI icon font
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { setup } from '@storybook/vue3-vite';
import type { Preview } from '@storybook/vue3-vite';

const vuetify = createVuetify({
  components,
  directives,
});

// Install Vuetify 3 on the Vue app instance (required for Vue 3 + Vuetify 3).
// Must call the framework's setup() to register the plugin, not just export it.
setup((app) => {
  app.use(vuetify);
});

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
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
  decorators: [
    (story) => ({
      components: { story },
      template: '<v-app><story /></v-app>',
    }),
  ],
};

export default preview;