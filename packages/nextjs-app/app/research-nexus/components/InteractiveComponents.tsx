'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';

const contentTypes = ['Datasets', 'Publications', 'Software', 'Workflows'] as const;

export function ContentTypeToggles() {
  const [active, setActive] = useState<string>('Datasets');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Content Type Toggles</h3>
      <p className="text-xs text-slate-500 mb-4">
        These toggles maintain state independently of the autodetection
        running above. React state is not blocked by DOM tree traversal.
      </p>
      <div className="flex flex-wrap gap-2">
        {contentTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActive(type)}
            className={cn(
              'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              active === type
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
            )}
          >
            {type}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3">Selected: {active}</p>
    </div>
  );
}

export function ProgressIndicators() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Download Progress</h3>
      <p className="text-xs text-slate-500 mb-4">
        Progress updates work while autodetection runs above.
        requestAnimationFrame is not blocked.
      </p>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-700">Dataset download</span>
            <span className="text-xs text-slate-500">73%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '73%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-700">Metadata extraction</span>
            <span className="text-xs text-slate-500">45%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '45%' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-slate-700">Validation</span>
            <span className="text-xs text-slate-500">12%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
