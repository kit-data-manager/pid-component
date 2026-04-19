import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ResearchDemoPage from '../app/research-nexus/page';

const meta: Meta = {
  title: 'ResearchDemo',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**ResearchDemo** - A comprehensive demonstration of @kit-data-manager/pid-component
integrated with Next.js App Router and ShadCN/UI (Radix + Tailwind).

This story showcases:
- A realistic multi-page Next.js application structure with proper routing
- Multiple UI contexts using ShadCN-style Radix UI components with Tailwind CSS
- Explicit PID component usage alongside design system components
- Autodetection scanning (initPidDetection) on article content
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents
- A research data portal with navigation, hero card, dataset table,
  author profiles, article content with autodetection, and license modal

**Tech stack:** Next.js App Router + Radix UI + Tailwind CSS + @kit-data-manager/react-pid-component

**Folder structure:**
\`\`\`
app/research-nexus/
├── page.tsx           # Main portal page
├── layout.tsx         # Layout with metadata
├── about/page.tsx     # About page with PID showcase
├── datasets/page.tsx  # Datasets page
└── components/
    ├── Navigation.tsx     # Sticky nav with ROR pid-component
    ├── HeroCard.tsx       # Hero card
    ├── DatasetTable.tsx   # Table with DOI and license pid-components
    ├── AuthorCard.tsx     # Author cards with ORCID pid-component
    ├── ArticleSection.tsx # Autodetection (initPidDetection) zone
    ├── LicenseDialog.tsx  # Dialog with SPDX pid-component
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
  render: () => <ResearchDemoPage />,
};