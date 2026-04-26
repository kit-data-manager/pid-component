import { Navigation } from './components/Navigation';
import { HeroCard, DoiCard } from './components/HeroCard';
import { DatasetTable } from './components/DatasetTable';
import { AuthorGrid } from './components/AuthorCard';
import { ArticleSection } from './components/ArticleSection';
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

        <LicenseDialog />
      </main>

      <Footer />
    </div>
  );
}
