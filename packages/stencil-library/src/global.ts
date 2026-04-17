import { PidAutoDetector } from './utils/PidAutoDetector';
import type { PidAutoDetectConfig } from './utils/PidAutoDetector';

declare global {
  interface Window {
    /**
     * Optional global configuration for the pid-component auto-detection feature.
     * Set this object **before** loading the pid-component script to enable
     * automatic scanning of the page for PIDs.
     *
     * @example
     * ```html
     * <script>
     *   window.pidComponentConfig = {
     *     targetSelector: 'main',
     *     darkMode: 'system',
     *   };
     * </script>
     * <script type="module" src="pid-component.esm.js"></script>
     * ```
     */
    pidComponentConfig?: PidAutoDetectConfig;
  }
}

/**
 * Stencil global initialization script.
 * Runs once when the pid-component bundle is first loaded.
 * If `window.pidComponentConfig` is set, the auto-detector is started.
 */
export default function () {
  const config = window.pidComponentConfig;
  if (!config) return;

  const detector = new PidAutoDetector(config);

  const init = () => void detector.start();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
