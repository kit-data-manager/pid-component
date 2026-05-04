'use client';

import { type ReactNode } from 'react';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

export const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily: 'Inter, system-ui, sans-serif',
});

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  return (
    <MantineProvider theme={theme}>
      {children}
    </MantineProvider>
  );
}
