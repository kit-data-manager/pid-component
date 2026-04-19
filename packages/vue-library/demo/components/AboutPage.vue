<script setup lang="ts">
import { inject } from 'vue';
import type { PidDetectionController } from '@kit-data-manager/pid-component';

const articleRef = inject<{
  controller: PidDetectionController | null;
  root: HTMLElement | null;
  isActive: boolean
}>('autodiscovery');
</script>

<template>
  <div class="mb-8">
    <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="info" class="mr-2">mdi-information</v-icon>
      About ResearchDemo
      <v-chip color="info-lighten-5" text-color="info-darken-2" size="small" class="ml-3">
        {{ articleRef?.isActive ? 'Scanning Active' : 'Scanning Inactive' }}
      </v-chip>
    </h2>
    <v-card class="pa-6" elevation="1">
      <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.8;">
        This is a demonstration application showcasing the
        <strong>PID Component</strong> library. This component enables
        seamless detection and rendering of Persistent Identifiers (PIDs)
        including DOIs, ORCIDs, Handles, RORs, and more.
      </p>
      <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.8;">
        Explore the tabs below to see different PID types in action:
      </p>
      <v-tabs align-tabs="start" color="primary">
        <v-tab value="dois">DOIs</v-tab>
        <v-tab value="orcids">ORCIDs</v-tab>
        <v-tab value="handles">Handles</v-tab>
        <v-tab value="rors">RORs</v-tab>
      </v-tabs>
      <v-window>
        <v-window-item value="dois">
          <div class="pa-4">
            <pid-component value="10.1109/eScience65000.2025.00022" class="mb-2" />
            <pid-component value="10.5445/IR/1000185135" class="mb-2" />
            <pid-component value="10.1007/978-3-642-15582-6" class="mb-2" />
          </div>
        </v-window-item>
        <v-window-item value="orcids">
          <div class="pa-4">
            <pid-component value="0009-0005-2800-4833" class="mb-2" />
            <pid-component value="0009-0003-2196-9187" class="mb-2" />
            <pid-component value="0000-0001-6575-1022" class="mb-2" />
          </div>
        </v-window-item>
        <v-window-item value="handles">
          <div class="pa-4">
            <pid-component value="21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6" class="mb-2" />
            <pid-component value="20.1000/100.123456" class="mb-2" />
          </div>
        </v-window-item>
        <v-window-item value="rors">
          <div class="pa-4">
            <pid-component value="https://ror.org/04t3en479" class="mb-2" />
            <pid-component value="https://ror.org/02aj13c28" class="mb-2" />
          </div>
        </v-window-item>
      </v-window>
    </v-card>
  </div>
</template>
