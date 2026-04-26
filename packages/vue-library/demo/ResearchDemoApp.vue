<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, nextTick } from 'vue';
import {
  AppNavigation,
  HeroCard,
  DoiCard,
  DatasetTable,
  AuthorGrid,
  ArticleSection,
  LicenseDialog,
  AppFooter,
  DatasetsPage,
  AboutPage,
} from './components';
import { initPidDetection, type PidDetectionController } from '@kit-data-manager/pid-component';

const activePage = ref('home');
const articleSectionRef = ref<InstanceType<typeof ArticleSection> | null>(null);
const autodiscoveryController = ref<PidDetectionController | null>(null);

const handleNavigate = (page: string) => {
  activePage.value = page;
};

const initAutodetection = () => {
  const articleRoot = articleSectionRef.value?.getRoot();
  if (articleRoot && !autodiscoveryController.value) {
    autodiscoveryController.value = initPidDetection({
      root: articleRoot,
      darkMode: 'light',
    });
  }
};

provide('autodiscovery', {
  controller: autodiscoveryController,
  root: articleSectionRef.value?.getRoot() ?? null,
  isActive: autodiscoveryController,
});

onMounted(async () => {
  await nextTick();
  setTimeout(initAutodetection, 100);
});

onUnmounted(() => {
  if (autodiscoveryController.value) {
    autodiscoveryController.value.destroy();
    autodiscoveryController.value = null;
  }
});

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
</script>

<template>
  <v-app>
    <AppNavigation :active-page="activePage" @navigate="handleNavigate" />

    <v-main style="background: #f5f5f5;">
      <v-container fluid class="pa-8">

        <template v-if="activePage === 'home'">
          <v-row class="mb-6">
            <v-col cols="8">
              <HeroCard
                title="Comprehensive Analysis of Persistent Identifier Systems in FAIR Digital Objects"
                description="This dataset contains the complete analysis of PID systems including Handle, DOI, and ORCID integrations across major research institutions. Published in IEEE eScience 2025."
              />
            </v-col>
            <v-col cols="4">
              <DoiCard
                value="10.1109/eScience65000.2025.00022"
                license="https://spdx.org/licenses/Apache-2.0"
              />
            </v-col>
          </v-row>

          <DatasetTable :datasets="datasets" class="mb-6" />

          <AuthorGrid :authors="authors" />

          <ArticleSection ref="articleSectionRef" class="mb-6" />


        </template>

        <template v-else-if="activePage === 'datasets'">
          <DatasetsPage />
        </template>

        <template v-else-if="activePage === 'about'">
          <AboutPage />
        </template>

        <LicenseDialog />
      </v-container>
    </v-main>

    <AppFooter />
  </v-app>
</template>