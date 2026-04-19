import type { Meta, StoryObj } from '@storybook/angular';
import { ResearchNexusComponent } from '../src/app/research-nexus.component';
import { moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

const meta: Meta = {
  title: 'ResearchNexus',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**ResearchNexus** - A comprehensive demonstration of @kit-data-manager/pid-component
integrated with Angular Material.

This story showcases:
- A realistic Angular application with proper standalone component structure
- Multiple UI contexts using Angular Material components (cards, tables, chips, buttons)
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) running without blocking
  components below it in the DOM tree
- A research data portal with navigation, hero card, dataset table,
  author profiles, article content, interactive components, and license dialog

**Key demonstration:** The components below the autodetection zone (sortable list,
working form with ngModel, content toggles, progress bars) remain fully functional while
autodetection runs above them, proving the DOM tree traversal does not block Angular
event bindings or state.

**Tech stack:** Angular 21 + Angular Material + @kit-data-manager/angular-pid-component

**Folder structure:**
\`\`\`
src/app/
├── research-nexus.component.ts  # Main application component
├── index.ts                     # Exports
└── components/
    ├── navigation.component.ts
    ├── hero-card.component.ts
    ├── dataset-table.component.ts
    ├── author-card.component.ts
    ├── article-section.component.ts
    ├── interactive-filters.component.ts
    ├── interactive-components.component.ts
    ├── license-dialog.component.ts
    └── footer.component.ts
\`\`\`
        `,
      },
    },
  },
  decorators: [
    applicationConfig({
      providers: [provideNoopAnimations()],
    }),
    moduleMetadata({
      imports: [ResearchNexusComponent],
    }),
  ],
};
export default meta;

type Story = StoryObj;

export const ResearchNexus: Story = {
  name: 'Research Data Portal',
  render: () => ({
    template: '<app-research-nexus />',
  }),
};