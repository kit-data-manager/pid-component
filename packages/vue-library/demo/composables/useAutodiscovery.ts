import { provide, ref, type Ref } from 'vue';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

export interface AutodiscoveryProvider {
  controller: PidDetectionController;
  root: HTMLElement | null;
}

const AUTODISCOVERY_KEY = Symbol('autodiscovery');

export function createAutodiscoveryProvider(config: PidDetectionConfig = {}) {
  const root = ref<HTMLElement | null>(null);
  const controller = ref<PidDetectionController | null>(null);
  const isActive = ref(false);

  const initDetection = () => {
    if (!root.value || controller.value) return;

    controller.value = initPidDetection({
      root: root.value,
      darkMode: 'light',
      ...config,
    });
    isActive.value = true;
  };

  const destroy = () => {
    if (controller.value) {
      controller.value.destroy();
      controller.value = null;
      isActive.value = false;
    }
  };

  provide<AutodiscoveryProvider>(AUTODISCOVERY_KEY, {
    get controller() {
      return controller.value!;
    },
    get root() {
      return root.value;
    },
  });

  return {
    root,
    controller,
    isActive,
    initDetection,
    destroy,
  };
}

export function useAutodiscovery() {
  return {
    root: injectAutodiscovery(),
  };
}

export function injectAutodiscovery(): Ref<HTMLElement | null> | undefined {
  const provider = (globalThis as any).__VUE_INJECT__?.(AUTODISCOVERY_KEY);
  return provider?.root;
}

export function useAutodiscoveryController(): Ref<PidDetectionController | null> | undefined {
  const provider = (globalThis as any).__VUE_INJECT__?.(AUTODISCOVERY_KEY);
  return provider?.controller;
}
