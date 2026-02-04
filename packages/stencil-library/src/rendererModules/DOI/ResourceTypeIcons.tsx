// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FunctionalComponent, h } from '@stencil/core';

/**
 * Maps DataCite resource types to icons and display names
 */
export interface ResourceTypeInfo {
  icon: FunctionalComponent;
  displayName: string;
}

/**
 * Gets the resource type information including icon
 */
export function getResourceTypeInfo(resourceType?: string): ResourceTypeInfo {
  if (!resourceType) {
    return {
      icon: () => <span></span>,
      displayName: 'Resource',
    };
  }

  const type = resourceType.toLowerCase();

  // Map types to icons (using simple text icons for now, can be replaced with SVGs)
  if (type.includes('article') || type.includes('journal') || type.includes('paper')) {
    return {
      icon: () => <span class="text-lg">📄</span>,
      displayName: resourceType,
    };
  } else if (type.includes('book')) {
    return {
      icon: () => <span class="text-lg">📚</span>,
      displayName: resourceType,
    };
  } else if (type.includes('software') || type.includes('code')) {
    return {
      icon: () => <span class="text-lg">💻</span>,
      displayName: resourceType,
    };
  } else if (type.includes('dataset') || type.includes('data')) {
    return {
      icon: () => <span class="text-lg">📊</span>,
      displayName: resourceType,
    };
  } else if (type.includes('image') || type.includes('figure')) {
    return {
      icon: () => <span class="text-lg">🖼️</span>,
      displayName: resourceType,
    };
  } else if (type.includes('video') || type.includes('audiovisual')) {
    return {
      icon: () => <span class="text-lg">🎥</span>,
      displayName: resourceType,
    };
  } else if (type.includes('sound') || type.includes('audio')) {
    return {
      icon: () => <span class="text-lg">🔊</span>,
      displayName: resourceType,
    };
  } else if (type.includes('presentation') || type.includes('slides')) {
    return {
      icon: () => <span class="text-lg">📽️</span>,
      displayName: resourceType,
    };
  } else if (type.includes('preprint')) {
    return {
      icon: () => <span class="text-lg">📝</span>,
      displayName: resourceType,
    };
  } else if (type.includes('thesis') || type.includes('dissertation')) {
    return {
      icon: () => <span class="text-lg">🎓</span>,
      displayName: resourceType,
    };
  } else if (type.includes('report')) {
    return {
      icon: () => <span class="text-lg">📋</span>,
      displayName: resourceType,
    };
  } else if (type.includes('standard')) {
    return {
      icon: () => <span class="text-lg">📜</span>,
      displayName: resourceType,
    };
  } else if (type.includes('workflow')) {
    return {
      icon: () => <span class="text-lg">🔄</span>,
      displayName: resourceType,
    };
  } else if (type.includes('model')) {
    return {
      icon: () => <span class="text-lg">🧮</span>,
      displayName: resourceType,
    };
  }

  // Default
  return {
    icon: () => <span class="text-lg">📦</span>,
    displayName: resourceType,
  };
}

/**
 * DataCite logo SVG component
 */
export const DataCiteLogo: FunctionalComponent = () => (
  <svg class="h-5 w-auto" viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="datacite-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#40B4E5" stop-opacity="1" />
        <stop offset="100%" stop-color="#005580" stop-opacity="1" />
      </linearGradient>
    </defs>
    <circle cx="70" cy="70" r="60" fill="url(#datacite-gradient)" />
    <text x="150" y="85" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#333">DataCite</text>
  </svg>
);

/**
 * CrossRef logo SVG component  
 */
export const CrossRefLogo: FunctionalComponent = () => (
  <svg class="h-5 w-auto" viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="80" height="80" rx="10" fill="#F68212" />
    <text x="110" y="85" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#333">Crossref</text>
  </svg>
);
