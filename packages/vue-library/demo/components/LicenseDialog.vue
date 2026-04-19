<script setup lang="ts">
import { ref } from 'vue';
import { PidComponent } from '../../lib';

const dialogOpen = ref(false);

const openDialog = () => {
  dialogOpen.value = true;
};
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-item>
      <v-card-title class="text-body-1 font-weight-bold d-flex align-center ga-2">
        <v-icon color="grey-darken-2">mdi-scale-balance</v-icon>
        License Information
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-btn color="primary" @click="openDialog">
        <v-icon start>mdi-scale-balance</v-icon>
        View License Details
      </v-btn>
    </v-card-text>
  </v-card>

  <v-dialog v-model="dialogOpen" max-width="600">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">Apache License 2.0</v-card-title>
      <v-card-text>
        <p class="text-body-2 text-grey mb-4">
          This dataset is published under the Apache 2.0 license, allowing free reuse with appropriate attribution.
        </p>
        <pid-component value="https://spdx.org/licenses/Apache-2.0" open-by-default="true" width="100%"
                       style="display: block;" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="outlined" color="grey" @click="dialogOpen = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
