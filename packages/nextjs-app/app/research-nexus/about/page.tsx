import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { PidComponent } from '@kit-data-manager/react-pid-component';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">About ResearchDemo</h1>
          <p className="text-slate-700 leading-relaxed mb-4">
            This is a demonstration application that showcases the integration of
            Persistent Identifier (PID) systems in FAIR Digital Objects. Our platform showcases how
            modern web components can seamlessly integrate with existing frameworks to provide
            interactive and informative displays of research metadata.
          </p>
          <p className="text-slate-700 leading-relaxed mb-4">
            The portal uses the <strong>pid-component</strong> library to render DOIs, ORCIDs, ROR IDs,
            Handle PIDs, SPDX license references, and more - all with automatic detection and
            resolution from their respective registries.
          </p>
          <div className="rounded-lg bg-slate-50 p-6 border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Institution</h2>
            <div className="flex items-center gap-3">
              <span className="text-slate-700">Hosted by</span>
              <PidComponent value="https://ror.org/04t3en479" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact</h2>
          <p className="text-slate-700 mb-2">
            For questions or inquiries, please contact the corresponding author:
          </p>
          <p className="text-slate-700">
            <strong>Email:</strong> <PidComponent value="mailto:someone@example.com" />
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}