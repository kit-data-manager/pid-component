'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';

export function SortableList() {
  const [items] = useState([
    { id: 1, name: 'Dataset A - 1,234 items', active: true },
    { id: 2, name: 'Dataset B - 567 items', active: true },
    { id: 3, name: 'Dataset C - 2,891 items', active: true },
    { id: 4, name: 'Dataset D - 432 items', active: false },
  ]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Sortable Dataset List</h3>
      <p className="text-xs text-slate-500 mb-4">
        This list is fully interactive - sorting works immediately while
        autodetection runs above. DOM tree traversal does not block event handlers.
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div className={cn('h-2 w-2 rounded-full', item.active ? 'bg-emerald-500' : 'bg-slate-300')} />
            <span className="flex-1 text-sm text-slate-700">{item.name}</span>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50">
              Sort
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilterForm() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('30');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Dataset Filter</h3>
      <p className="text-xs text-slate-500 mb-4">
        This form is fully functional while autodetection runs above.
        Input events and state updates work immediately.
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">Dataset Name</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets..."
            className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-700 mb-1 block">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50 w-full">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
