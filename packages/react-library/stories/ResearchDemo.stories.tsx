import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResearchDemoApp } from '../demo';
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
- Multiple UI contexts using Mantine components (cards, tables, modals)
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) on article content
- A research data portal with navigation, hero card, dataset table,
  author profiles, article content with autodetection, and license modal
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents

**Tech stack:** React 19 + Mantine v7 + @kit-data-manager/react-pid-component

**Folder structure:**
\`\`\`
demo/
├── ResearchDemoApp.tsx   # Main application component
├── DemoProvider.tsx       # Mantine provider wrapper
├── index.ts               # Exports
└── components/
    ├── Navigation.tsx     # Sticky nav with ROR pid-component
    ├── HeroCard.tsx       # Hero + DOI card with pid-component
    ├── DatasetTable.tsx   # Table with DOI and license pid-components
    ├── AuthorCard.tsx     # Author cards with ORCID pid-component
    ├── ArticleSection.tsx # Autodetection (initPidDetection) zone
    ├── LicenseDialog.tsx  # Modal with SPDX pid-component
    ├── AboutPage.tsx      # Tabbed PID type showcase
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
  id: 'react-research-demo',
  name: 'Research Data Portal',
  decorators: [
    (Story) => (
      <DemoProvider>
        <Story />
      </DemoProvider>
    ),
  ],
  render: () => <ResearchDemoApp />,
};