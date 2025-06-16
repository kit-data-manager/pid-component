// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Component, h, Method, Prop, State, Watch } from '@stencil/core';

/**
 * @slot - Content is placed inside the component as a fallback if input data is invalid
 */
@Component({
  tag: 'json-viewer',
  styleUrl: 'json-viewer.css',
  shadow: true,
})
export class JsonViewer {
  /**
   * The JSON data to display. Can be a JSON string or a JavaScript object.
   */
  @Prop() data: string | object;

  /**
   * Initial view mode for the JSON data. Can be 'tree' or 'code'.
   */
  @Prop() viewMode: 'tree' | 'code' = 'tree';

  /**
   * Maximum height of the viewer in pixels. Set to 0 for no limit.
   */
  @Prop() maxHeight: number = 500;

  /**
   * Set to true to enable line numbers in code view.
   */
  @Prop() showLineNumbers: boolean = true;

  /**
   * Set to true to open all nodes in tree view initially.
   */
  @Prop() expandAll: boolean = false;

  /**
   * Theme for syntax highlighting. Options: 'light' or 'dark'.
   */
  @Prop() theme: 'light' | 'dark' = 'light';

  /**
   * Internal state to track the current view mode
   */
  @State() currentViewMode: 'tree' | 'code';

  /**
   * Track expanded nodes to maintain state between toggles
   */
  @State() expandedNodes: Set<string> = new Set();

  /**
   * Internal state to store the parsed JSON data
   */
  @State() parsedData: unknown = null;

  /**
   * Internal state to track error during JSON parsing
   */
  @State() error: string | null = null;

  /**
   * Internal state to indicate successful copy action
   */
  @State() copied: boolean = false;

  /**
   * Watch for changes in the data prop and reparse
   */
  @Watch('data')
  handleDataChange() {
    this.parseData();
  }

  /**
   * Watch for changes in the viewMode prop
   */
  @Watch('viewMode')
  handleViewModeChange() {
    this.currentViewMode = this.viewMode;
  }

  /**
   * Watch for changes in the expandAll prop
   */
  @Watch('expandAll')
  handleExpandAllChange() {
    if (this.expandAll) {
      this.expandAllNodes();
    } else {
      this.collapseAllNodes();
    }
  }

  /**
   * Component initialization
   */
  componentWillLoad() {
    this.currentViewMode = this.viewMode;
    this.parseData();
    if (this.expandAll) {
      this.expandAllNodes();
    }
  }

  /**
   * Parse the input data into a JavaScript object
   * and remove Stencil/other private helper props.
   */
  private parseData() {
    try {
      let raw: unknown;

      if (typeof this.data === 'string') {
        raw = JSON.parse(this.data);
      } else if (this.data !== null && typeof this.data === 'object') {
        raw = this.data;
      } else {
        throw new Error('Invalid data format');
      }

      // 👇 NEW: deep-clone while stripping keys that start with "$"
      this.parsedData = this.sanitizeData(raw);
      this.error = null;
    } catch (err) {
      this.error = err.message;
      this.parsedData = null;
    }
  }

  /**
   * Recursively clone `data`, dropping every property
   * whose key begins with "$" (e.g. "$elm$", "$cmp$", …).
   */
  private sanitizeData = (data: unknown): unknown => {
    if (Array.isArray(data)) {
      return data.map(this.sanitizeData);
    }

    if (data !== null && typeof data === 'object') {
      const cleaned: Record<string, unknown> = {};

      Object.entries(data).forEach(([key, value]) => {
        if (!key.startsWith('$')) {
          cleaned[key] = this.sanitizeData(value);
        }
      });

      return cleaned;
    }

    return data; // primitives stay as-is
  };

  /**
   * Toggle between tree view and code view
   */
  private toggleView = () => {
    this.currentViewMode = this.currentViewMode === 'tree' ? 'code' : 'tree';
  };

  /**
   * Method to copy the JSON data to clipboard
   */
  private copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(this.parsedData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      this.copied = true;

      // Reset copied state after delay
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy JSON to clipboard:', err);
      // Silent error handling to not disrupt user experience
      // Create a temporary fallback for browsers without clipboard API
      this.createFallbackCopyMethod(JSON.stringify(this.parsedData, null, 2));
    }
  };

  /**
   * Fallback method for copying text when Clipboard API is not available
   */
  private createFallbackCopyMethod(text: string) {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');

    // Hide the element
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';

    // Set the text content
    textArea.value = text;

    // Add to DOM
    document.body.appendChild(textArea);

    // Focus and select the text
    textArea.focus();
    textArea.select();

    // Try to copy
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.copied = true;
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      // Silent error handling
    } finally {
      // Clean up
      document.body.removeChild(textArea);
    }
  }

  /**
   * Expand all nodes in the tree view
   */
  @Method()
  async expandAllNodes() {
    this.expandNodeRecursive(this.parsedData, 'root');
  }

  /**
   * Collapse all nodes in the tree view
   */
  @Method()
  async collapseAllNodes() {
    this.expandedNodes = new Set();
  }

  /**
   * Recursive function to expand all nodes
   */
  private expandNodeRecursive(data: unknown, path: string) {
    if (data !== null && typeof data === 'object') {
      this.expandedNodes.add(path);

      Object.entries(data).forEach(([key, value]) => {
        const newPath = path ? `${path}.${key}` : key;
        this.expandNodeRecursive(value, newPath);
      });

      // Create a new Set to trigger state update
      this.expandedNodes = new Set(this.expandedNodes);
    }
  }

  /**
   * Renders a JSON node as part of the tree view
   */
  private renderTreeNode = (key: string, value: unknown, depth: number = 0, path: string = '') => {
    const isExpandable = typeof value === 'object' && value !== null;
    const currentPath = path ? `${path}.${key}` : key;
    const nodeId = `node-${currentPath}`;
    const isArray = Array.isArray(value);

    // Handle keyboard navigation for details/summary elements
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const details = (e.target as HTMLElement).closest('details');
        if (details) {
          details.open = !details.open;
          // Update expanded nodes state
          if (details.open) {
            this.expandedNodes.add(nodeId);
          } else {
            this.expandedNodes.delete(nodeId);
          }
          // Create a new Set to trigger state update
          this.expandedNodes = new Set(this.expandedNodes);
        }
      }
    };

    if (isExpandable) {
      const entries = isArray ? Object.entries(value) : Object.entries(value);
      const itemCount = entries.length;
      const itemText = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
      const nodeType = isArray ? 'array' : 'object';
      const expandedState = this.expandedNodes.has(nodeId);

      // Handle toggling of node expansion
      const toggleExpand = (e: Event) => {
        const details = (e.target as HTMLElement).closest('details');
        if (details && details.open) {
          this.expandedNodes.add(nodeId);
        } else {
          this.expandedNodes.delete(nodeId);
        }
        // Create a new Set to trigger state update
        this.expandedNodes = new Set(this.expandedNodes);
      };

      return (
        <div class="ml-4">
          <details class="mb-1" open={expandedState} onToggle={toggleExpand} id={nodeId}>
            <summary
              class={`group relative flex cursor-pointer list-none items-center rounded py-1 pl-5 font-mono ${
                this.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
              } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none`}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="button"
              aria-expanded={expandedState ? 'true' : 'false'}
              aria-controls={`${nodeId}-content`}
              aria-label={`${key}: ${nodeType} with ${itemText}, ${expandedState ? 'click to collapse' : 'click to expand'}`}
            >
              <div class="flex w-full items-center">
                <span class={`mr-2 font-medium ${this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{key}: </span>
                <span class={`flex items-center gap-1 ${this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>{isArray ? '[' : '{'}</span>
                  <span>{itemText}</span>
                  <span>{isArray ? ']' : '}'}</span>
                  <span
                    class={`ml-2 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${this.theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}
                    aria-hidden="true"
                  >
                    {expandedState ? 'Click to collapse' : 'Click to expand'}
                  </span>
                </span>
              </div>
            </summary>
            <div
              id={`${nodeId}-content`}
              class={`ml-4 border-l-2 pl-3 ${this.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
              role="group"
              aria-label={`Contents of ${key} ${nodeType}`}
            >
              {entries.map(([k, v], index) => (
                <div key={`${nodeId}-${index}`}>{this.renderTreeNode(isArray ? `${k}` : k, v, depth + 1, currentPath)}</div>
              ))}
            </div>
          </details>
        </div>
      );
    }

    // Render primitive values with syntax highlighting
    let valueClass = '';
    let displayValue = JSON.stringify(value);
    let valueType = typeof value;

    if (valueType === 'string') {
      valueClass = this.theme === 'dark' ? 'text-green-400' : 'text-green-600';
    } else if (valueType === 'number') {
      valueClass = this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    } else if (valueType === 'boolean') {
      valueClass = this.theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
    } else if (value === null) {
      valueClass = this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
      displayValue = 'null';
      valueType = 'undefined';
    }

    return (
      <div
        class={`flex items-center py-1 font-mono text-sm ${this.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} rounded`}
        tabIndex={0}
        role="treeitem"
        aria-label={`${key}: ${displayValue} (${valueType})`}
      >
        <span class={`font-medium ${this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>{key}: </span>
        <span class={valueClass}>{displayValue}</span>
      </div>
    );
  };

  /**
   * Format a line of JSON for the code view with syntax highlighting
   */
  private formatCodeLine = (line: string) => {
    const stringClass = this.theme === 'dark' ? 'text-green-400' : 'text-green-600';
    const booleanClass = this.theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
    const nullClass = this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    const numberClass = this.theme === 'dark' ? 'text-blue-400' : 'text-blue-600';

    return line
      .replace(/(".+?")(: )?/g, `<span class="${stringClass}">$1</span>$2`) // keys and string values
      .replace(/: (true|false)([,}\]\s])/g, `: <span class="${booleanClass}">$1</span>$2`) // booleans
      .replace(/: (null)([,}\]\s])/g, `: <span class="${nullClass}">$1</span>$2`) // null
      .replace(/: ([0-9]+(\.[0-9]+)?)([,}\]\s])/g, `: <span class="${numberClass}">$1</span>$3`); // numbers
  };

  render() {
    // Show error if JSON is invalid
    if (this.error) {
      return (
        <div class="p-4 text-center text-red-500" role="alert" aria-live="assertive">
          <p>Invalid JSON: {this.error}</p>
          <slot></slot>
        </div>
      );
    }

    // Show message if no data
    if (!this.parsedData) {
      return (
        <div class="p-4 text-center text-gray-500" role="status" aria-live="polite">
          <p>No data provided</p>
          <slot></slot>
        </div>
      );
    }

    // Format JSON for code view
    const formattedJson = JSON.stringify(this.parsedData, null, 2);
    const containerStyle = this.maxHeight > 0 ? { maxHeight: `${this.maxHeight}px` } : {};

    // Generate unique IDs for ARIA relationships
    const viewerId = `json-viewer-${Math.random().toString(36).substring(2, 11)}`;
    const contentId = `${viewerId}-content`;

    return (
      <div
        class={`overflow-hidden rounded-lg border shadow ${this.theme === 'dark' ? 'border-gray-600 bg-gray-800 text-gray-50' : 'border-gray-200 bg-white text-gray-800'}`}
        role="region"
        aria-labelledby={`${viewerId}-title`}
      >
        <div class={`flex items-center justify-between border-b p-3 ${this.theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
          <div class="flex items-center gap-2">
            <span id={`${viewerId}-title`} class={`text-sm font-medium ${this.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
              JSON Viewer
            </span>
            <span class={`text-xs ${this.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} aria-live="polite">
              ({Object.keys(this.parsedData).length} {Object.keys(this.parsedData).length === 1 ? 'property' : 'properties'})
            </span>
          </div>

          <button
            onClick={this.toggleView}
            class={`flex cursor-pointer items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              this.theme === 'dark'
                ? 'border border-gray-600 bg-gray-900 text-gray-50 hover:border-blue-600 hover:bg-gray-700'
                : 'border border-gray-200 bg-gray-100 text-gray-800 hover:border-blue-400 hover:bg-gray-50'
            } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none`}
            aria-controls={contentId}
            aria-label={`Switch to ${this.currentViewMode === 'tree' ? 'code' : 'tree'} view`}
            type="button"
          >
            {this.currentViewMode === 'tree' ? 'Code View' : 'Tree View'}
          </button>
        </div>

        <div
          id={contentId}
          class={`relative overflow-auto ${this.theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
          style={containerStyle}
          role="group"
          aria-label={`JSON data in ${this.currentViewMode} view`}
        >
          {/* Overlay copy button */}
          <button
            onClick={this.copyToClipboard}
            class={`absolute top-2 right-2 z-10 rounded-md p-1 transition-all duration-200 ${
              this.copied
                ? this.theme === 'dark'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-800'
                : this.theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            } opacity-75 hover:opacity-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none`}
            title={this.copied ? 'Copied!' : 'Copy JSON to clipboard'}
            aria-label={this.copied ? 'JSON copied to clipboard' : 'Copy JSON to clipboard'}
            type="button"
          >
            {/* Screen reader text */}
            <span class="sr-only">{this.copied ? 'Copied!' : 'Copy JSON'}</span>

            {/* Visual icon */}
            {this.copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <title>Check mark</title>
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <title>Copy icon</title>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
            )}
          </button>

          {/* Tree View */}
          {this.currentViewMode === 'tree' && (
            <div class={`p-4 pr-12 ${this.theme === 'dark' ? '' : 'bg-gray-50'}`}>
              {Object.entries(this.parsedData).map(([key, value], index) => (
                <div key={`root-${index}`}>{this.renderTreeNode(key, value, 0, 'root')}</div>
              ))}
            </div>
          )}

          {/* Code View */}
          {this.currentViewMode === 'code' && (
            <div class={`pr-12 font-mono text-sm ${this.theme === 'dark' ? '' : 'bg-gray-50'}`}>
              {this.showLineNumbers ? (
                <div class="flex">
                  <div
                    class={`border-r px-2 py-4 text-right select-none ${this.theme === 'dark' ? 'border-gray-600 bg-gray-900 text-gray-400' : 'border-gray-200 bg-gray-100 text-gray-500'}`}
                  >
                    {formattedJson.split('\n').map((_, i) => (
                      <div class="min-h-5" key={`line-${i}`}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <pre class={`flex-grow overflow-x-auto p-4 whitespace-pre-wrap ${this.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formattedJson.split('\n').map((line, i) => (
                      <div class="min-h-5" key={`code-${i}`} innerHTML={this.formatCodeLine(line)} />
                    ))}
                  </pre>
                </div>
              ) : (
                <pre class="flex-grow overflow-x-auto p-4 whitespace-pre-wrap">
                  {formattedJson.split('\n').map((line, i) => (
                    <div class="min-h-5" key={`code-${i}`} innerHTML={this.formatCodeLine(line)} />
                  ))}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
