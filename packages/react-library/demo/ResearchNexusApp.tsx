'use client';

import { useState } from 'react';
import { Container, Grid, Badge } from '@mantine/core';
import {
  Navigation,
  HeroCard,
  DoiCard,
  DatasetTable,
  AuthorGrid,
  ArticleSection,
  SortableList,
  FilterForm,
  ContentTypeToggles,
  ProgressIndicators,
  LicenseDialog,
  Footer,
} from './components';

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

export function ResearchNexusApp({ activePage = 'home', onNavigate }: AppProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Navigation activePage={activePage} onNavigate={onNavigate} />

      <Container size="xl" py="xl">
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

        <ArticleSection />

        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <Badge color="yellow" variant="light" size="lg">
              Working Below Autodetection
            </Badge>
            <span style={{ marginLeft: 8, fontWeight: 600 }}>Interactive Components</span>
          </div>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SortableList />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <FilterForm />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ContentTypeToggles />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ProgressIndicators />
            </Grid.Col>
          </Grid>
        </div>

        <LicenseDialog />
      </Container>

      <Footer />
    </div>
  );
}
