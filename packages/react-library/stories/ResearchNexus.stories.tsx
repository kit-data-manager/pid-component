import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResearchNexusApp } from '../demo';
import React from 'react';
import { DemoProvider } from '../demo/DemoProvider';

const meta: Meta = {
  title: 'ResearchDemo',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**ResearchDemo** - A comprehensive demonstration of @kit-data-manager/pid-component
integrated with React + Mantine UI.

This story showcases:
- A realistic React application with proper component structure
- Multiple UI contexts using Mantine components (cards, tables, forms, modals)
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) running without blocking
  components below it in the DOM tree
- A research data portal with navigation, hero card, dataset table,
  author profiles, article content, interactive components, and license modal
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents

**Key demonstration:** The components below the autodetection zone (interactive list,
working form with state, content toggles, progress bars) remain fully functional while
autodetection runs above them, proving the DOM tree traversal does not block event
handlers or React state.

**Tech stack:** React 19 + Mantine v7 + @kit-data-manager/react-pid-component

**Folder structure:**
\`\`\`
demo/
├── ResearchNexusApp.tsx  # Main application component
├── DemoProvider.tsx      # Mantine provider wrapper
├── index.ts              # Exports
└── components/
    ├── Navigation.tsx
    ├── HeroCard.tsx
    ├── DoiCard.tsx
    ├── DatasetTable.tsx
    ├── AuthorCard.tsx
    ├── ArticleSection.tsx
    ├── InteractiveFilters.tsx
    ├── InteractiveComponents.tsx
    ├── LicenseDialog.tsx
    └── Footer.tsx
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
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
  render: () => <ResearchNexusApp />,
};