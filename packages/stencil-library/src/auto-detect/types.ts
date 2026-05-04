/**
 * Configuration for the automatic PID detection on a webpage.
 */
export interface PidDetectionConfig {
  /**
   * The root element to scan for PIDs. Defaults to document.body.
   */
  root?: HTMLElement;

  /**
   * Centralized settings for all auto-detected pid-components.
   * Can be a JSON string or an already-parsed array of settings objects.
   */
  settings?: string | { type: string; values: { name: string; value: unknown }[] }[];

  /**
   * Enable a MutationObserver to automatically scan new DOM nodes
   * as they are added to the root. Default: false.
   */
  observe?: boolean;

  /**
   * Dark mode setting for all auto-detected components.
   * Options: "light", "dark", "system". Default: "light".
   */
  darkMode?: 'light' | 'dark' | 'system';

  /**
   * Maximum depth of nested subcomponents. Default: 1.
   */
  levelOfSubcomponents?: number;

  /**
   * Number of items to show per page in the data table. Default: 10.
   */
  itemsPerPage?: number;

  /**
   * Whether to emphasize detected components with border and shadow. Default: false.
   * Non-emphasized components blend seamlessly into surrounding text.
   */
  emphasizeComponent?: boolean;

  /**
   * Whether to show a copy button on top-level components. Default: true.
   */
  showTopLevelCopy?: boolean;

  /**
   * Time-to-live for IndexedDB cache entries in milliseconds.
   * Default: 86400000 (24 hours).
   */
  defaultTTL?: number;

  /**
   * CSS selector for elements to exclude from scanning.
   * Elements matching this selector (and their descendants) will be skipped.
   */
  exclude?: string;

  /**
   * Ordered list of renderer keys to activate for auto-detection.
   *
   * If set, only these renderers are used during scanning, in the specified
   * order. This allows activating renderers that are not auto-discoverable
   * by default (e.g. `EmailType`, `URLType`, `LocaleType`, `JSONType`),
   * or restricting detection to a specific subset.
   *
   * If not set, only renderers with `autoDiscoverableByDefault: true` in the
   * renderer registry participate (currently: `DateType`, `ORCIDType`,
   * `DOIType`, `HandleType`, `RORType`, `SPDXType`).
   *
   * Available keys: `DateType`, `ORCIDType`, `DOIType`, `HandleType`,
   * `RORType`, `SPDXType`, `EmailType`, `URLType`, `LocaleType`, `JSONType`.
   *
   * Example: ["DOIType", "ORCIDType", "HandleType", "EmailType"]
   */
  renderers?: string[];

  /**
   * When renderers is set and no listed renderer matches, this controls
   * whether to fall back to the full default renderer registry.
   * Default: true (always falls back).
   * Set to false to strictly restrict detection to only the listed renderers.
   */
  fallbackToAll?: boolean;
}

/**
 * Controller returned by initPidDetection() for lifecycle management.
 */
export interface PidDetectionController {
  /**
   * Pause the MutationObserver (if enabled).
   * Does nothing if observe was not set to true.
   */
  stop(): void;

  /**
   * Re-scan the root element for PIDs. Useful after dynamic content changes.
   * Skips text nodes that were already processed.
   */
  rescan(): void;

  /**
   * Tear down everything: disconnect observer, terminate worker,
   * remove all injected pid-components, and restore original text nodes.
   */
  destroy(): void;
}

/**
 * A single match detected during scanning.
 */
export interface DetectionMatch {
  /** Start character index within the text node content */
  start: number;
  /** End character index (exclusive) within the text node content */
  end: number;
  /** The matched PID value */
  value: string;
  /** The renderer key of the best-fit renderer */
  rendererKey: string;
}

/**
 * Tracks a single replacement for later restoration.
 */
export interface ReplacementRecord {
  /** The wrapper element that was inserted */
  wrapper: HTMLElement;
  /** The original full text of the parent text node (for restore) */
  originalText: string;
  /** Reference to preceding text node (may be null) */
  precedingTextNode: Text | null;
  /** Reference to following text node (may be null) */
  followingTextNode: Text | null;
  /** The pid-component element */
  pidComponent: HTMLElement;
  /** Observer watching for component load */
  observer: MutationObserver;
  /** The original text span inside the wrapper */
  originalSpan: HTMLElement;
}
