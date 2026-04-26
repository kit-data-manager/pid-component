<script setup lang="ts">
import { PidComponent } from '../../lib';

defineProps<{
  value: string;
  license?: string;
}>();
</script>

<template>
  <v-card class="fill-height" elevation="1">
    <v-card-text>
      <div class="text-caption text-grey text-uppercase font-weight-bold mb-3">
        Digital Object Identifier
      </div>
      <pid-component :value="value" open-by-default="true" width="100%" style="display: block;" />
      <v-divider v-if="license" class="my-4"></v-divider>
      <template v-if="license">
        <div class="text-caption text-grey text-uppercase font-weight-bold mb-3">
          License
        </div>
        <pid-component :value="license" width="100%" style="display: block;" />
      </template>
    </v-card-text>
  </v-card>
</template>