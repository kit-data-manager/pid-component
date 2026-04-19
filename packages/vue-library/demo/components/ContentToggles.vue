<script setup lang="ts">
import { ref } from 'vue';

const contentTypes = ['Datasets', 'Publications', 'Software', 'Workflows'] as const;
const activeType = ref('Datasets');
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-item>
      <v-card-title class="text-body-1 font-weight-bold">Content Type Toggles</v-card-title>
      <v-card-subtitle>
        These toggles maintain state while autodetection runs above.
      </v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <v-chip-group v-model="activeType" mandatory>
        <v-chip
          v-for="type in contentTypes"
          :key="type"
          :value="type"
          :color="activeType === type ? 'primary' : 'default'"
          :variant="activeType === type ? 'flat' : 'outlined'"
        >
          {{ type }}
        </v-chip>
      </v-chip-group>
      <div class="mt-4 text-caption text-grey">
        Selected: {{ activeType }}
      </div>
    </v-card-text>
  </v-card>
</template>