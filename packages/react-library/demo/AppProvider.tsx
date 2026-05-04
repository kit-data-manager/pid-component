'use client';

import { type ReactNode } from 'react';
import { DemoProvider } from './DemoProvider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <DemoProvider>
      {children}
    </DemoProvider>
  );
}

export { DemoProvider } from './DemoProvider';
