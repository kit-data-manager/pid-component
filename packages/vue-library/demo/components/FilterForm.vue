<script setup lang="ts">
import { ref } from 'vue';

const search = ref('');
const dateRange = ref('30');
const submitted = ref(false);

const applyFilters = () => {
  submitted.value = true;
};

const dateRangeLabels: Record<string, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  'all': 'All time',
};
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-item>
      <v-card-title class="text-body-1 font-weight-bold">Dataset Filter</v-card-title>
      <v-card-subtitle>
        This form is fully functional while autodetection runs above.
      </v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <v-text-field
        v-model="search"
        label="Dataset Name"
        placeholder="Search datasets..."
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3"
      ></v-text-field>
      <v-select
        v-model="dateRange"
        label="Date Range"
        :items="[
          { title: 'Last 7 days', value: '7' },
          { title: 'Last 30 days', value: '30' },
          { title: 'Last 90 days', value: '90' },
          { title: 'All time', value: 'all' },
        ]"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3"
      ></v-select>
      <v-btn color="primary" block @click="applyFilters">
        Apply Filters
      </v-btn>
      <div v-if="submitted" class="mt-4 text-caption text-success">
        Filters applied! Search: "{{ search }}", Range: {{ dateRangeLabels[dateRange] }}
      </div>
    </v-card-text>
  </v-card>
</template>