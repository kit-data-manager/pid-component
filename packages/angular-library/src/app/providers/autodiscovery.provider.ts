import { Injectable, OnDestroy, Optional } from '@angular/core';
import {
  initPidDetection,
  type PidDetectionConfig,
  type PidDetectionController,
} from '@kit-data-manager/pid-component';

@Injectable()
export class AutodiscoveryProvider implements OnDestroy {
  private controller: PidDetectionController | null = null;
  private rootElement: HTMLElement | null = null;
  private isActive = false;

  constructor(@Optional() private config: PidDetectionConfig = {}) {
  }

  initialize(root: HTMLElement, config?: PidDetectionConfig): void {
    if (this.controller || !root) return;

    this.rootElement = root;
    this.controller = initPidDetection({
      root,
      darkMode: 'light',
      ...this.config,
      ...config,
    });
    this.isActive = true;
  }

  getController(): PidDetectionController | null {
    return this.controller;
  }

  getRoot(): HTMLElement | null {
    return this.rootElement;
  }

  isInitialized(): boolean {
    return this.isActive;
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.controller) {
      this.controller.destroy();
      this.controller = null;
      this.isActive = false;
    }
  }
}

export const AUTODISCOVERY_PROVIDER = new AutodiscoveryProvider();
