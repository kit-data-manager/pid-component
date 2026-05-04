'use client';

import { FileText } from 'lucide-react';
import { PidComponent } from '@kit-data-manager/react-pid-component';
import { cn } from '../lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

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

const columns = [
  { key: 'title', label: 'Title', initialWidth: 30 },
  { key: 'doi', label: 'DOI', initialWidth: 30 },
  { key: 'license', label: 'License', initialWidth: 25 },
  { key: 'actions', label: 'Actions', initialWidth: 15 },
] as const;

export function DatasetTable({ datasets, className }: DatasetTableProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(columns.map((c) => [c.key, c.initialWidth])),
  );
  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const onMouseMove = useCallback((e: MouseEvent) => {
    const resizing = resizingRef.current;
    if (!resizing || !tableRef.current) return;
    const tableWidth = tableRef.current.offsetWidth;
    const deltaPercent = ((e.clientX - resizing.startX) / tableWidth) * 100;
    const newWidth = Math.max(5, resizing.startWidth + deltaPercent);
    setColumnWidths((prev) => ({ ...prev, [resizing.key]: newWidth }));
  }, []);

  const onMouseUp = useCallback(() => {
    resizingRef.current = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }, [onMouseMove]);

  const onResizeStart = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault();
      resizingRef.current = { key, startX: e.clientX, startWidth: columnWidths[key] };
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [columnWidths, onMouseMove, onMouseUp],
  );

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden', className)}>
      <div className="flex items-center gap-3 p-6 border-b border-slate-100">
        <FileText className="h-5 w-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-900">Related Datasets</h2>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table ref={tableRef} className="w-full" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3 relative select-none"
                style={{ width: `${columnWidths[col.key]}%` }}
              >
                {col.label}
                <span
                  onMouseDown={(e) => onResizeStart(e, col.key)}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300"
                />
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {datasets.map((dataset) => (
            <tr key={dataset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td
                className="px-6 py-4 text-sm text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap">{dataset.title}</td>
              <td className="px-6 py-4 overflow-hidden">
                <PidComponent value={dataset.doi} emphasizeComponent={false} />
              </td>
              <td className="px-6 py-4 overflow-hidden">
                <PidComponent value={dataset.license} emphasizeComponent={false} />
              </td>
              <td className="px-6 py-4 overflow-hidden">
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
