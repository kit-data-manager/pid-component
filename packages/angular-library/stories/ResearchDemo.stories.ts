import type { Meta, StoryObj } from '@storybook/angular';
import { ResearchDemoComponent } from '../src/app/research-demo.component';
import { moduleMetadata, applicationConfig } from '@storybook/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

const meta: Meta = {
  title: 'ResearchDemo',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**ResearchDemo** - A comprehensive demonstration of @kit-data-manager/pid-component
integrated with Angular Material.

This story showcases:
- A realistic Angular application with proper standalone component structure
- Multiple UI contexts using Angular Material components (cards, tables, chips, dialogs)
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) on article content
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents
- A research data portal with navigation, hero card, dataset table,
  author profiles, article content with autodetection, and license dialog

**Tech stack:** Angular 21 + Angular Material + @kit-data-manager/angular-pid-component

**Folder structure:**
\`\`\`
src/app/
├── research-demo.component.ts   # Main application component
├── index.ts                      # Exports
└── components/
    ├── navigation.component.ts   # Sticky nav with ROR pid-component
    ├── hero-card.component.ts    # Hero card
    ├── dataset-table.component.ts # Table with DOI and license pid-components
    ├── author-card.component.ts  # Author cards with ORCID pid-component
    ├── article-section.component.ts # Autodetection (initPidDetection) zone
    ├── about-page.component.ts   # Tabbed PID type showcase
    ├── license-dialog.component.ts # Dialog with SPDX pid-component
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
      imports: [ResearchDemoComponent],
    }),
  ],
};
export default meta;

type Story = StoryObj;

export const ResearchDemo: Story = {
  name: 'Research Data Portal',
  render: () => ({
    template: '<app-research-demo />',
  }),
};