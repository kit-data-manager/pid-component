<script setup lang="ts">
import { PidComponent } from '../../lib';

interface Dataset {
  id: string;
  title: string;
  doi: string;
  license: string;
}

defineProps<{
  datasets: Dataset[];
}>();
</script>

<template>
  <v-card elevation="1">
    <v-card-title class="d-flex align-center pa-4 border-b">
      <v-icon color="grey-darken-2" class="mr-2">mdi-file-document</v-icon>
      <span class="text-h6">Related Datasets</span>
    </v-card-title>
    <v-data-table
      :headers="[
        { title: 'Title', key: 'title', sortable: true },
        { title: 'DOI', key: 'doi', sortable: false },
        { title: 'License', key: 'license', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false }
      ]"
      :items="datasets"
      class="elevation-0"
    >
      <template #item.doi="{ item }">
        <pid-component :value="item.doi" :emphasize-component="false" style="display: inline-block;" />
      </template>
      <template #item.license="{ item }">
        <pid-component :value="item.license" :emphasize-component="false" style="display: inline-block;" />
      </template>
      <template #item.actions="{ item }">
        <v-btn size="small" variant="text" color="primary">View</v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>