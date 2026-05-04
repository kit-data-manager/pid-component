'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Scale } from 'lucide-react';
import { PidComponent } from '@kit-data-manager/react-pid-component';

export function LicenseDialog() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Scale className="h-5 w-5 text-slate-700" />
        License Information
      </h2>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 disabled:pointer-events-none disabled:opacity-50">
            <Scale className="h-4 w-4" />
            View License Details
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 max-h-85vh w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg focus:outline-none">
            <Dialog.Title className="text-lg font-semibold text-slate-900 mb-2">
              Apache License 2.0
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600 mb-4">
              This dataset is published under the Apache 2.0 license, allowing free reuse
              with appropriate attribution.
            </Dialog.Description>
            <div className="mb-4">
              <PidComponent value="https://spdx.org/licenses/Apache-2.0" openByDefault={true} width="100%" />
            </div>
            <div className="flex justify-end">
              <Dialog.Close asChild>
                <button
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 disabled:pointer-events-none disabled:opacity-50">
                  Close
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
