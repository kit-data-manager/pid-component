import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { AuthorCard } from '../components/AuthorCard';

const authors = [
  { orcid: '0009-0005-2800-4833', name: 'Maximilian Inckmann', institution: 'Karlsruhe Institute of Technology' },
  { orcid: '0009-0003-2196-9187', name: 'Christopher Raquet', institution: 'Karlsruhe Institute of Technology' },
  { orcid: '0000-0001-6575-1022', name: 'Andreas Pfeil', institution: 'Karlsruhe Institute of Technology' },
];

export default function DatasetsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Research Datasets</h1>
          <p className="text-slate-600">
            Browse and explore the research datasets available in the ResearchNexus portal.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <p className="text-slate-700 leading-relaxed">
            This research paper investigates the integration of persistent identifiers across distributed
            research infrastructures. The dataset was created as part of the project identified by
            <strong> 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</strong> and is hosted at
            the <strong>https://ror.org/04t3en479</strong> research institution. The work builds upon
            previous findings published in DOI <strong>10.1109/eScience.2024.1042</strong> and extends
            the methodology to handle Handle System resolutions at scale.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-4">Core Team</h2>
        <div className="grid grid-cols-3 gap-4">
          {authors.map((author) => (
            <AuthorCard key={author.orcid} author={author} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}