import { Navigation } from './components/Navigation';
import { HeroCard, DoiCard } from './components/HeroCard';
import { DatasetTable } from './components/DatasetTable';
import { AuthorGrid } from './components/AuthorCard';
import { ArticleSection } from './components/ArticleSection';
import { SortableList, FilterForm } from './components/InteractiveFilters';
import { ContentTypeToggles, ProgressIndicators } from './components/InteractiveComponents';
import { LicenseDialog } from './components/LicenseDialog';
import { Footer } from './components/Footer';

const datasets = [
  {
    id: '1',
    title: 'KIT Data Metadata Analysis',
    doi: '10.5445/IR/1000185135',
    license: 'https://spdx.org/licenses/MIT',
  },
  {
    id: '2',
    title: 'Research Output Repository Schema',
    doi: '10.5445/IR/1000178054',
    license: 'https://spdx.org/licenses/Apache-2.0',
  },
  {
    id: '3',
    title: 'FDO Implementation Guidelines',
    doi: '10.5445/IR/1000151234',
    license: 'https://spdx.org/licenses/CC-BY-4.0',
  },
];

const authors = [
  { orcid: '0009-0005-2800-4833', name: 'Maximilian Inckmann', institution: 'Karlsruhe Institute of Technology' },
  { orcid: '0009-0003-2196-9187', name: 'Christopher Raquet', institution: 'Karlsruhe Institute of Technology' },
  { orcid: '0000-0001-6575-1022', name: 'Andreas Pfeil', institution: 'Karlsruhe Institute of Technology' },
];

export default function ResearchDemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <HeroCard
            className="col-span-2"
            title="Comprehensive Analysis of Persistent Identifier Systems in FAIR Digital Objects"
            description="This dataset contains the complete analysis of PID systems including Handle, DOI, and ORCID integrations across major research institutions. Published in IEEE eScience 2025."
          />
          <DoiCard
            value="10.1109/eScience65000.2025.00022"
            license="https://spdx.org/licenses/Apache-2.0"
          />
        </div>

        <DatasetTable datasets={datasets} className="mb-8" />

        <AuthorGrid authors={authors} />

        <ArticleSection />

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            Interactive Components
            <span
              className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              Working Below Autodetection
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <SortableList />
            <FilterForm />
            <ContentTypeToggles />
            <ProgressIndicators />
          </div>
        </div>

        <LicenseDialog />
      </main>

      <Footer />
    </div>
  );
}
