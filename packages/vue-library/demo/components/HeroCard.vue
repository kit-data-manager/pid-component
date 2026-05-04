<script lang="ts" setup>

defineProps<{
  title?: string;
  description?: string;
  doi?: string;
}>();
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-item>
      <template #prepend>
        <div class="d-flex gap-2">
          <v-chip color="blue-lighten-5" size="small" text-color="blue-darken-2">DOI</v-chip>
          <v-chip color="green-lighten-5" size="small" text-color="green-darken-2">Research Data</v-chip>
        </div>
      </template>
    </v-card-item>
    <v-card-text>
      <h1 class="text-h5 font-weight-bold mb-2 text-grey-darken-3">
        {{ title || 'Comprehensive Analysis of Persistent Identifier Systems in FAIR Digital Objects' }}
      </h1>
      <p class="text-body-2 text-grey mb-6">
        {{ description || 'This dataset contains the complete analysis of PID systems including Handle, DOI, and ORCID integrations across major research institutions. Published in IEEE eScience 2025.'
        }}
      </p>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" prepend-icon="mdi-download">Download Dataset</v-btn>
      <v-btn prepend-icon="mdi-open-in-new" variant="outlined">View Source</v-btn>
    </v-card-actions>
  </v-card>
</template>
