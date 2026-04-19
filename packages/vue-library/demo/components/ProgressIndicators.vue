<script setup lang="ts">
const downloadProgress = 73;
const metadataProgress = 45;
const validationProgress = 12;
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-item>
      <v-card-title class="text-body-1 font-weight-bold">Download Progress</v-card-title>
      <v-card-subtitle>
        Progress bars update while autodetection runs above.
      </v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <div class="mb-4">
        <div class="d-flex justify-space-between mb-1">
          <span class="text-caption">Dataset download</span>
          <span class="text-caption text-grey">{{ downloadProgress }}%</span>
        </div>
        <v-progress-linear
          :model-value="downloadProgress"
          color="success"
          height="8"
          rounded
        ></v-progress-linear>
      </div>
      <div class="mb-4">
        <div class="d-flex justify-space-between mb-1">
          <span class="text-caption">Metadata extraction</span>
          <span class="text-caption text-grey">{{ metadataProgress }}%</span>
        </div>
        <v-progress-linear
          :model-value="metadataProgress"
          color="primary"
          height="8"
          rounded
        ></v-progress-linear>
      </div>
      <div>
        <div class="d-flex justify-space-between mb-1">
          <span class="text-caption">Validation</span>
          <span class="text-caption text-grey">{{ validationProgress }}%</span>
        </div>
        <v-progress-linear
          :model-value="validationProgress"
          color="warning"
          height="8"
          rounded
        ></v-progress-linear>
      </div>
    </v-card-text>
  </v-card>
</template>