<script lang="ts" setup>
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
      <pid-component :value="value" open-by-default="true" style="display: block;" width="100%" />
      <v-divider v-if="license" class="my-4"></v-divider>
      <template v-if="license">
        <div class="text-caption text-grey text-uppercase font-weight-bold mb-3">
          License
        </div>
        <pid-component :value="license" style="display: block;" width="100%" />
      </template>
    </v-card-text>
  </v-card>
</template>
