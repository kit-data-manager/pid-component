import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ResearchNexusApp from '../demo/ResearchNexusApp.vue';

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
- Multiple UI contexts using Vuetify components (cards, tables, chips, buttons, dialogs)
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) running without blocking
  components below it in the DOM tree
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents
- A realistic research data portal UI

Key demonstration: The components below the autodetection zone (interactive cards,
working form elements, progress indicators) remain fully functional while
autodetection runs above them, proving the DOM tree traversal does not block.

**Tech stack:** Vuetify 3 + Vue 3 + @kit-data-manager/vue-pid-component

**Folder structure:**
\`\`\`
demo/
├── ResearchNexusApp.vue  # Main application component
├── index.ts              # Exports
└── components/
    ├── AppNavigation.vue
    ├── HeroCard.vue
    ├── DoiCard.vue
    ├── DatasetTable.vue
    ├── AuthorCard.vue
    ├── AuthorGrid.vue
    ├── ArticleSection.vue
    ├── SortableList.vue
    ├── FilterForm.vue
    ├── ContentToggles.vue
    ├── ProgressIndicators.vue
    ├── LicenseDialog.vue
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
    components: { ResearchNexusApp },
    template: '<ResearchNexusApp />',
  }),
};