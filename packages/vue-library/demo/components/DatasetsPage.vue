<script lang="ts" setup>
import { inject, ref } from 'vue';
import type { PidDetectionController } from '@kit-data-manager/pid-component';

defineProps<{
  excludeArticleRef?: boolean;
}>();

const articleRef = inject<{
  controller: PidDetectionController | null;
  root: HTMLElement | null;
  isActive: boolean
}>('autodiscovery');

const headers = [
  { title: 'ID', key: 'id', align: 'start' as const },
  { title: 'Title', key: 'title', align: 'start' as const },
  { title: 'DOI', key: 'doi', align: 'start' as const },
  { title: 'License', key: 'license', align: 'start' as const },
];

const datasets = ref([
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
]);
</script>

<template>
  <div class="mb-8">
    <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-database</v-icon>
      Dataset Overview
      <v-chip class="ml-3" color="primary-lighten-5" size="small" text-color="primary-darken-2">
        {{ articleRef?.isActive ? 'Scanning Active' : 'Scanning Inactive' }}
      </v-chip>
    </h2>
    <v-card class="pa-6" elevation="1">
      <v-data-table
        :headers="headers"
        :items="datasets"
        :items-per-page="5"
        class="elevation-0"
      >
        <template v-slot:item.doi="{ item }">
          <pid-component :open-by-default="false" :value="item.doi" />
        </template>
        <template v-slot:item.license="{ item }">
          <pid-component :open-by-default="false" :value="item.license" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
