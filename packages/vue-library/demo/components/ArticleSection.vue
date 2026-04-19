<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  initPidDetection,
  type PidDetectionController,
  type PidDetectionConfig,
} from '@kit-data-manager/pid-component';

const props = withDefaults(defineProps<{
  config?: PidDetectionConfig;
}>(), {
  config: () => ({}),
});

const articleRef = ref<HTMLElement | null>(null);
let controller: PidDetectionController | undefined;

onMounted(() => {
  if (articleRef.value) {
    controller = initPidDetection({
      root: articleRef.value,
      darkMode: 'light',
      ...props.config,
    });
  }
});

onUnmounted(() => {
  controller?.destroy();
});
</script>

<template>
  <div class="mb-8">
    <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="success" class="mr-2">mdi-file-document</v-icon>
      Article Content
      <v-chip color="success-lighten-5" text-color="success-darken-2" size="small" class="ml-3">
        Autodetection Active
      </v-chip>
    </h2>
    <v-card ref="articleRef" class="pa-6" elevation="1">
      <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.8;">
        This research paper investigates the integration of persistent identifiers across distributed
        research infrastructures. The dataset was created as part of the project identified by
        <strong>21.T11981/be908bd1-e049-4d35-975e-8e27d40117e6</strong> and is hosted at
        the <strong>https://ror.org/04t3en479</strong> research institution. The work builds upon
        previous findings published in DOI <strong>10.1109/eScience.2024.1042</strong> and extends
        the methodology to handle Handle System resolutions at scale.
      </p>
      <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.8;">
        For questions about the dataset, please contact the corresponding author
        at <strong>someone@example.com</strong>. The complete analysis framework is available under
        <strong>https://spdx.org/licenses/Apache-2.0</strong> and can be freely reused
        in accordance with the license terms.
      </p>
      <p class="text-body-2 text-grey-darken-1" style="line-height: 1.8;">
        The research team, led by <strong>0009-0005-2800-4833</strong> and including
        contributions from <strong>0009-0003-2196-9187</strong>, has made the dataset
        available through the KIT Data Manager repository. Additional resources are accessible
        at <strong>https://scc.kit.edu</strong>.
      </p>
    </v-card>
  </div>
</template>
