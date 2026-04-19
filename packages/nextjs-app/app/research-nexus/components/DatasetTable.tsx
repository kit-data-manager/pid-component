import { FileText } from 'lucide-react';
import { PidComponent } from '@kit-data-manager/react-pid-component';
import { cn } from '../lib/utils';

interface Dataset {
  id: string;
  title: string;
  doi: string;
  license: string;
}

interface DatasetTableProps {
  datasets: Dataset[];
  className?: string;
}

export function DatasetTable({ datasets, className }: DatasetTableProps) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="flex items-center gap-3 p-6 border-b border-slate-100">
        <FileText className="h-5 w-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">Related Datasets</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Title</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">DOI</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">License
            </th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions
            </th>
          </tr>
          </thead>
          <tbody>
          {datasets.map((dataset) => (
            <tr key={dataset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm text-slate-700">{dataset.title}</td>
              <td className="px-6 py-4">
                <PidComponent value={dataset.doi} emphasizeComponent={false} />
              </td>
              <td className="px-6 py-4">
                <PidComponent value={dataset.license} emphasizeComponent={false} />
              </td>
              <td className="px-6 py-4">
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:pointer-events-none disabled:opacity-50">
                  View
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
