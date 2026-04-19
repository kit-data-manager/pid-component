'use client';

import { useEffect, useRef } from 'react';
import { initPidDetection, type PidDetectionConfig } from '@kit-data-manager/pid-component';
import { cn } from '../lib/utils';

interface ArticleSectionProps {
  className?: string;
  config?: Partial<PidDetectionConfig>;
}

export function ArticleSection({ className, config }: ArticleSectionProps) {
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!articleRef.current) return;
    const ctrl = initPidDetection({ root: articleRef.current, darkMode: 'light', ...config });
    return () => ctrl.destroy();
  }, [config]);

  return (
    <div className={cn('mb-8', className)}>
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <span>Article Content</span>
        <span
          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
          Autodetection Active
        </span>
      </h2>
      <div
        ref={articleRef}
        className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <p className="text-sm leading-relaxed text-slate-700 mb-4">
          This research paper investigates the integration of persistent identifiers across distributed
          research infrastructures. The dataset was created as part of the project identified by
          <strong> 21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</strong> and is hosted at
          the <strong>https://ror.org/04t3en479</strong> research institution. The work builds upon
          previous findings published in DOI <strong>10.1109/eScience.2024.1042</strong> and extends
          the methodology to handle Handle System resolutions at scale.
        </p>
        <p className="text-sm leading-relaxed text-slate-700 mb-4">
          For questions about the dataset, please contact the corresponding author
          at <strong>someone@example.com</strong>. The complete analysis framework is available under
          <strong> https://spdx.org/licenses/Apache-2.0</strong> and can be freely reused
          in accordance with the license terms.
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          The research team, led by <strong>0009-0005-2800-4833</strong> and including
          contributions from <strong>0009-0003-2196-9187</strong>, has made the dataset
          available through the KIT Data Manager repository. Additional resources are accessible
          at <strong>https://scc.kit.edu</strong>.
        </p>
      </div>
    </div>
  );
}
