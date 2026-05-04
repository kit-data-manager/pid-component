export interface JsonNode {
  key: string;
  value: unknown;
  path: string;
  isExpandable: boolean;
  isArray: boolean;
  itemCount?: number;
}

export function sanitizeData(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (data !== null && typeof data === 'object') {
    const cleaned: Record<string, unknown> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (!key.startsWith('$')) {
        cleaned[key] = sanitizeData(value);
      }
    });

    return cleaned;
  }

  return data;
}

export function expandNodeRecursive(
  data: unknown,
  path: string,
  expandedNodes: Set<string>,
): Set<string> {
  if (data !== null && typeof data === 'object') {
    expandedNodes.add(path);

    Object.entries(data).forEach(([key, value]) => {
      const newPath = path ? `${path}.${key}` : key;
      expandNodeRecursive(value, newPath, expandedNodes);
    });

    return new Set(expandedNodes);
  }

  return expandedNodes;
}

export function getNodeType(value: unknown): 'array' | 'object' | 'primitive' {
  if (value !== null && typeof value === 'object') {
    return Array.isArray(value) ? 'array' : 'object';
  }
  return 'primitive';
}

export function getNodeInfo(data: unknown, key: string, path: string): JsonNode {
  const isExpandable = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  let itemCount: number | undefined;
  if (isExpandable) {
    const entries = Object.entries(data as Record<string, unknown>);
    itemCount = entries.length;
  }

  return {
    key,
    value: data,
    path,
    isExpandable,
    isArray,
    itemCount,
  };
}

export function formatCodeLine(
  line: string,
  isDarkMode: boolean,
): string {
  const stringClass = isDarkMode ? 'text-green-400' : 'text-green-600';
  const booleanClass = isDarkMode ? 'text-purple-400' : 'text-purple-600';
  const nullClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const numberClass = isDarkMode ? 'text-blue-400' : 'text-blue-600';

  return line
    .replace(/(".+?")(: )?/g, `<span class="${stringClass}">$1</span>$2`)
    .replace(/: (true|false)([,}\]\s])/g, `: <span class="${booleanClass}">$1</span>$2`)
    .replace(/: (null)([,}\]\s])/g, `: <span class="${nullClass}">$1</span>$2`)
    .replace(/: ([0-9]+(\.[0-9]+)?)([,}\]\s])/g, `: <span class="${numberClass}">$1</span>$3`);
}

export function getItemCountText(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

export function getValueDisplay(value: unknown): { display: string; type: string } {
  if (value === null) {
    return { display: 'null', type: 'null' };
  }

  const type = typeof value;

  if (type === 'string') {
    return { display: JSON.stringify(value), type: 'string' };
  }

  if (type === 'number') {
    return { display: JSON.stringify(value), type: 'number' };
  }

  if (type === 'boolean') {
    return { display: JSON.stringify(value), type: 'boolean' };
  }

  if (type === 'object' || type === 'symbol' || typeof value === 'function') {
    return { display: JSON.stringify(value), type: 'object' };
  }

  return { display: String(value), type };
}

export function parseJsonSafe(input: string | object | null | undefined): { data: unknown; error: string | null } {
  if (input === null || input === undefined) {
    return { data: null, error: 'Invalid data format' };
  }

  if (typeof input === 'object') {
    return { data: input, error: null };
  }

  if (typeof input !== 'string') {
    return { data: null, error: 'Invalid data format' };
  }

  try {
    const parsed = JSON.parse(input);
    return { data: parsed, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}

export const DEFAULT_MAX_HEIGHT = 500;
export const DEFAULT_LINE_HEIGHT = 24;
export const DEFAULT_VIEW_MODE = 'tree' as const;
export type ViewMode = 'tree' | 'code';
