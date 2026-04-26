<script setup lang="ts">
import { ref, provide, onMounted, onUnmounted, nextTick } from 'vue';
import {
  initPidDetection,
  type PidDetectionController,
  type PidDetectionConfig,
} from '@kit-data-manager/pid-component';

const props = withDefaults(defineProps<{
  config?: PidDetectionConfig;
  standalone?: boolean;
}>(), {
  standalone: true,
});

const articleRef = ref<HTMLElement | null>(null);
const isInitialized = ref(false);

interface AutodiscoveryProvider {
  controller: PidDetectionController | null;
  root: HTMLElement | null;
  isActive: boolean;
}

let controller: PidDetectionController | null = null;

const initAutodetection = () => {
  if (articleRef.value && !controller) {
    controller = initPidDetection({
      root: articleRef.value,
      darkMode: 'light',
      emphasizeComponent: false,
      ...props.config,
    });
    isInitialized.value = true;

    provide<AutodiscoveryProvider>('autodiscovery', {
      get controller() {
        return controller;
      },
      get root() {
        return articleRef.value;
      },
      get isActive() {
        return isInitialized.value;
      },
    });
  }
};

onMounted(async () => {
  await nextTick();
  if (props.standalone) {
    initAutodetection();
  }
});

onUnmounted(() => {
  if (controller && props.standalone) {
    controller.destroy();
    controller = null;
    isInitialized.value = false;
  }
});

defineExpose({
  initAutodetection,
  isInitialized,
  getRoot: () => articleRef.value,
});
</script>

<template>
  <div class="mb-8">
    <h2 class="text-h6 font-weight-bold mb-4 d-flex align-center">
      <v-icon color="success" class="mr-2">mdi-file-document</v-icon>
      Article Content
      <v-chip
        :color="isInitialized ? 'success-lighten-5' : 'error-lighten-5'"
        :text-color="isInitialized ? 'success-darken-2' : 'error-darken-2'"
        size="small"
        class="ml-3"
      >
        {{ isInitialized ? 'Autodetection Active' : 'Autodetection Inactive' }}
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
        For questions about this research, please contact the corresponding author
        at <strong>someone@example.com</strong>. The complete analysis framework is available under
        <strong>https://spdx.org/licenses/Apache-2.0</strong> and can be freely reused
        in accordance with the license terms. The research was conducted at the institution
        associated with ROR <strong>https://ror.org/04t3en479</strong>.
      </p>
      <p class="text-body-2 text-grey-darken-1 mb-4" style="line-height: 1.8;">
        The research has been published in multiple venues including the.Handle System
        <strong>20.1000/100</strong> and DOI <strong>10.1016/j.future.2025.01.004</strong>.
        Related works include ISBN references <strong>978-3-642-54441-6</strong> and
        ISSN <strong>2041-1723</strong> for the journal.
      </p>
      <p class="text-body-2 text-grey-darken-1" style="line-height: 1.8;">
        The Handle identifier <strong>20.1000/100</strong> resolves to the Handle system
        documentation. For more information about persistent identifiers, visit
        <strong>https://www.pidconsortium.eu/</strong>. The research data is archived
        at <strong>https://doi.org/10.5281/zenodo.1234567</strong>.
      </p>
    </v-card>
  </div>
</template>
