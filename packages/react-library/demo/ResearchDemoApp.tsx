'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { Container, Grid, Text } from '@mantine/core';
import {
  Navigation,
  HeroCard,
  DoiCard,
  DatasetTable,
  AuthorGrid,
  ArticleSection,
  LicenseDialog,
  Footer,
  DatasetsPage,
  AboutPage,
} from './components';
import { initPidDetection, type PidDetectionController } from '@kit-data-manager/pid-component';

interface AutodiscoveryContextValue {
  controller: PidDetectionController | null;
  isActive: boolean;
}

const AutodiscoveryContext = createContext<AutodiscoveryContextValue>({
  controller: null,
  isActive: false,
});

export function useAutodiscovery() {
  return useContext(AutodiscoveryContext);
}

const datasets = [
  {
    id: '1',
    title: 'KIT Data Metadata Analysis',
    doi: '10.5445/IR/1000185135',
    license: 'https://spdx.org/licenses/MIT',
  },
  {
    id: '2',
    title: 'Research Output Repository Schema',
    doi: '10.5445/IR/1000178054',
    license: 'https://spdx.org/licenses/Apache-2.0',
  },
  {
    id: '3',
    title: 'FDO Implementation Guidelines',
    doi: '10.5445/IR/1000151234',
    license: 'https://spdx.org/licenses/CC-BY-4.0',
  },
];

const authors = [
  { orcid: '0009-0005-2800-4833', name: 'Maximilian Inckmann', institution: 'Karlsruhe Institute of Technology' },
  { orcid: '0009-0003-2196-9187', name: 'Christopher Raquet', institution: 'Karlsruhe Institute of Technology' },
  { orcid: '0000-0001-6575-1022', name: 'Andreas Pfeil', institution: 'Karlsruhe Institute of Technology' },
];

interface AppProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export function ResearchDemoApp({ activePage = 'home', onNavigate }: AppProps) {
  const [currentPage, setCurrentPage] = useState(activePage);
  const [isActive, setIsActive] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PidDetectionController | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    onNavigate?.(page);
  };

  useEffect(() => {
    if (articleRef.current && !controllerRef.current) {
      controllerRef.current = initPidDetection({
        root: articleRef.current,
        darkMode: 'light',
      });
      setIsActive(true);
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
        setIsActive(false);
      }
    };
  }, []);

  return (
    <AutodiscoveryContext.Provider value={{ controller: controllerRef.current, isActive }}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Navigation activePage={currentPage} onNavigate={handleNavigate} />

        <Container size="xl" py="xl">
          {currentPage === 'home' && (
            <>
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <HeroCard
                    title="Comprehensive Analysis of Persistent Identifier Systems in FAIR Digital Objects"
                    description="This dataset contains the complete analysis of PID systems including Handle, DOI, and ORCID integrations across major research institutions. Published in IEEE eScience 2025."
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <DoiCard
                    value="10.1109/eScience65000.2025.00022"
                    license="https://spdx.org/licenses/Apache-2.0"
                  />
                </Grid.Col>
              </Grid>

              <div style={{ marginTop: 32 }}>
                <DatasetTable datasets={datasets} />
              </div>

              <AuthorGrid authors={authors} />

              <div ref={articleRef}>
                <ArticleSection />
              </div>
            </>
          )}

          {currentPage === 'datasets' && <DatasetsPage />}
          {currentPage === 'about' && <AboutPage />}

          <LicenseDialog />
        </Container>

        <Footer />
      </div>
    </AutodiscoveryContext.Provider>
  );
}
