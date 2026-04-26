import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ResearchDemoApp from '../demo/ResearchDemoApp.vue';

const meta: Meta = {
  title: 'ResearchDemo',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**ResearchDemo** - A comprehensive demonstration of @kit-data-manager/pid-component
integrated with Vuetify 3 components.

This story showcases:
- Multiple UI contexts using Vuetify components (cards, tables, chips, dialogs)
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) on article content
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents
- A realistic research data portal UI

**Tech stack:** Vuetify 3 + Vue 3 + @kit-data-manager/vue-pid-component

**Folder structure:**
\`\`\`
demo/
├── ResearchDemoApp.vue    # Main application component
├── index.ts                # Exports
└── components/
    ├── AppNavigation.vue   # Sticky nav with ROR pid-component
    ├── HeroCard.vue        # Hero card
    ├── DoiCard.vue         # DOI card with pid-component
    ├── DatasetTable.vue    # Table with DOI and license pid-components
    ├── AuthorCard.vue      # Author card with ORCID pid-component
    ├── AuthorGrid.vue      # Author grid layout
    ├── ArticleSection.vue  # Autodetection (initPidDetection) zone
    ├── LicenseDialog.vue   # Dialog with SPDX pid-component
    ├── AboutPage.vue       # Tabbed PID type showcase
    └── AppFooter.vue
\`\`\`
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const ResearchDemo: Story = {
  name: 'Research Data Portal',
  render: () => ({
    components: { ResearchDemoApp },
    template: '<ResearchDemoApp />',
  }),
};