import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import ResearchNexusPage from '../app/research-nexus/page';

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
- Autodetection scanning (initPidDetection) running without blocking
  components below it in the DOM tree
- Varied configurations: emphasized, non-emphasized, hidden subcomponents, and active subcomponents
- A research data portal with navigation, hero card, dataset table,
  author profiles, article content, interactive components, and license modal

**Key demonstration:** The components below the autodetection zone (interactive tabs,
working forms, sortable lists) remain fully functional while autodetection runs
above them, proving the DOM tree traversal does not block event handlers or state.

**Tech stack:** Next.js App Router + Radix UI + Tailwind CSS + @kit-data-manager/react-pid-component

**Folder structure:**
\`\`\`
app/research-nexus/
├── page.tsx          # Main portal page
├── layout.tsx        # Layout with metadata
├── about/page.tsx    # About page
├── datasets/page.tsx # Datasets page
└── components/
    ├── Navigation.tsx
    ├── HeroCard.tsx
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
  render: () => <ResearchNexusPage />,
};