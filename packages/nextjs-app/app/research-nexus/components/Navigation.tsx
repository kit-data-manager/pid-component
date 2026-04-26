'use client';

import Link from 'next/link';
import { Database } from 'lucide-react';
import { PidComponent } from '@kit-data-manager/react-pid-component';
import { cn } from '../lib/utils';

export function Navigation() {
  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Database className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">ResearchDemo</span>
            <span
              className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Demo</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/research-nexus" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/research-nexus/datasets"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Datasets
            </Link>
            <Link href="/research-nexus/about"
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              About
            </Link>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <span className="text-sm text-slate-500">Powered by</span>
              <PidComponent value="https://ror.org/04t3en479" emphasizeComponent={false} hideSubcomponents={true} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
