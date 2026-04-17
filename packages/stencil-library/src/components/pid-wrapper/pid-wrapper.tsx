// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, h, Prop } from '@stencil/core';
import { PidAutoDetector } from '../../utils/PidAutoDetector';

@Component({
  tag: 'pid-wrapper',
  shadow: false,
})
export class PidWrapper {
  /**
   * CSS selector for the area in which identifiers should be detected.
   * Defaults to the full document body.
   */
  @Prop() targetSelector: string = 'body';

  // ── Inherited pid-component props ──────────────────────────────────────────
  // All props below are forwarded verbatim to every auto-injected pid-component.
  // They intentionally mirror the pid-component API so users only need to
  // configure a single element on the page.

  /**
   * Stringified JSON settings passed to each detected pid-component.
   * @see pid-component#settings
   */
  @Prop() settings: string = '[]';

  /**
   * Whether detected pid-components should be open by default.
   * @see pid-component#openByDefault
   */
  @Prop() openByDefault: boolean = false;

  /**
   * Number of table rows per page in each detected pid-component.
   * @see pid-component#amountOfItems
   */
  @Prop() amountOfItems: number = 10;

  /**
   * Maximum depth of nested sub-components to render.
   * @see pid-component#levelOfSubcomponents
   */
  @Prop() levelOfSubcomponents: number = 1;

  /**
   * When true, sub-components are never shown.
   * @see pid-component#hideSubcomponents
   */
  @Prop() hideSubcomponents: boolean = false;

  /**
   * Whether detected pid-components show a border/shadow emphasis.
   * @see pid-component#emphasizeComponent
   */
  @Prop() emphasizeComponent: boolean = true;

  /**
   * Whether the copy button is shown at the top level of detected pid-components.
   * @see pid-component#showTopLevelCopy
   */
  @Prop() showTopLevelCopy: boolean = true;

  /**
   * Default time-to-live (ms) for IndexedDB cache entries.
   * @see pid-component#defaultTTL
   */
  @Prop() defaultTTL: number = 24 * 60 * 60 * 1000;

  /**
   * Initial width applied to each detected pid-component (e.g. '500px').
   * @see pid-component#width
   */
  @Prop() width?: string;

  /**
   * Initial height applied to each detected pid-component (e.g. '300px').
   * @see pid-component#height
   */
  @Prop() height?: string;

  /**
   * Dark-mode setting forwarded to every detected pid-component.
   * @see pid-component#darkMode
   */
  @Prop() darkMode: 'light' | 'dark' | 'system' = 'light';

  private detector?: PidAutoDetector;

  async componentDidLoad() {
    this.detector = new PidAutoDetector({
      targetSelector: this.targetSelector,
      settings: this.settings,
      openByDefault: this.openByDefault,
      amountOfItems: this.amountOfItems,
      levelOfSubcomponents: this.levelOfSubcomponents,
      hideSubcomponents: this.hideSubcomponents,
      emphasizeComponent: this.emphasizeComponent,
      showTopLevelCopy: this.showTopLevelCopy,
      defaultTTL: this.defaultTTL,
      width: this.width,
      height: this.height,
      darkMode: this.darkMode,
    });
    await this.detector.start();
  }

  disconnectedCallback() {
    this.detector?.stop();
  }

  render() {
    return <slot />;
  }
}


