import { Database } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Database className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">ResearchDemo</span>
          </div>
          <p className="text-sm text-slate-500">
            Research Data Portal powered by KIT Data Manager
          </p>
        </div>
      </div>
    </footer>
  );
}