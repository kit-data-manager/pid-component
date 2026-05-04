export const CONSTANTS = {
  DEFAULT_WIDTH: '500px',
  DEFAULT_HEIGHT: '300px',
  MIN_WIDTH: 300,
  MIN_HEIGHT: 200,
  PADDING_WIDTH: 40,
  PADDING_HEIGHT: 60,
  FOOTER_HEIGHT: 60,
};

export const Z_INDICES = {
  RESIZE_HANDLE: 10,
  COPY_BUTTON: 20,
  FOOTER_CONTENT: 30,
  PAGINATION: 40,
  STICKY_ELEMENTS: 50,
};

export const RESIZE_INDICATOR_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L2 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 8L8 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M22 14L14 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>
`;

export const CLICK_DEBOUNCE_MS = 300;
export const DOUBLE_CLICK_THRESHOLD_MS = 300;
export const SINGLE_CLICK_DELAY_MS = 200;
export const SAFARI_RESIZE_DELAY_MS = 50;

export function getResponsiveDefaultWidth(availableWidth: number): string {
  if (availableWidth < 600) {
    return '100%';
  }
  if (availableWidth <= 1024) {
    return '70%';
  }
  return '50%';
}

export function calculateContentDimensions(
  contentElement: HTMLElement | null,
  showFooter: boolean,
): { contentWidth: number; contentHeight: number; maxWidth: number; maxHeight: number } {
  const contentWidth = contentElement?.scrollWidth || CONSTANTS.MIN_WIDTH;
  const contentHeight = contentElement?.scrollHeight || CONSTANTS.MIN_HEIGHT;

  const footerHeight = showFooter ? CONSTANTS.FOOTER_HEIGHT : 0;
  const maxWidth = contentWidth + CONSTANTS.PADDING_WIDTH;
  const maxHeight = contentHeight + CONSTANTS.PADDING_HEIGHT + footerHeight;

  return { contentWidth, contentHeight, maxWidth, maxHeight };
}

export function isSafariBrowser(userAgent: string): boolean {
  return /^((?!chrome|android).)*safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent);
}

export function isInteractiveElement(tagName: string): boolean {
  const interactiveTags = ['BUTTON', 'A', 'COPY-BUTTON', 'PID-ACTIONS'];
  return interactiveTags.includes(tagName.toUpperCase());
}

export function shouldSkipClick(target: HTMLElement | null): boolean {
  if (!target) return false;
  return target.closest('copy-button') !== null ||
    target.closest('[slot="summary-actions"]') !== null ||
    target.tagName === 'BUTTON' ||
    target.tagName === 'A' ||
    target.getAttribute?.('role') === 'button';
}

export function getHostClasses(
  isOpen: boolean,
  isEmphasized: boolean,
  isDarkMode: boolean,
  initialWidth?: string,
): string {
  const baseClasses = ['relative', 'font-sans', 'leading-normal'];

  if (isEmphasized) {
    baseClasses.push('box-border', 'border', 'rounded-md', 'shadow-xs');
    baseClasses.push(isDarkMode ? 'border-gray-600' : 'border-gray-300');
  }

  if (isOpen) {
    baseClasses.push('mb-2', 'max-w-full', 'text-xs', 'block');
  } else {
    baseClasses.push(initialWidth === '100%' ? 'max-w-full' : 'max-w-md');
    baseClasses.push('my-0', 'text-sm', 'inline-block');
  }

  if (isDarkMode) {
    baseClasses.push('text-white');
  }

  return baseClasses.join(' ');
}

export function getDetailsClasses(isOpen: boolean, isDarkMode: boolean): string {
  const baseClasses = ['group', 'w-full', 'font-sans', 'transition-all', 'duration-200', 'ease-in-out', 'flex', 'flex-col'];

  if (!isOpen) {
    baseClasses.push('text-clip', 'overflow-hidden');
  }

  if (isDarkMode) {
    baseClasses.push('bg-gray-800', 'text-white');
  }

  return baseClasses.join(' ');
}

export function getSummaryClasses(
  isOpen: boolean,
  isDarkMode: boolean,
  isEmphasized: boolean,
  lineHeight: number,
): string {
  const baseClasses = [
    'font-bold',
    'font-mono',
    'cursor-pointer',
    'list-none',
    'flex',
    'items-center',
    'focus:outline-hidden',
    'focus-visible:ring-2',
    'focus-visible:ring-blue-400',
    'focus-visible:ring-offset-1',
    'rounded-lg',
    'marker:hidden',
    '[&::-webkit-details-marker]:hidden',
    'select-none',
    'py-0',
    'min-w-1/10',
  ];

  if (isOpen) {
    baseClasses.push('sticky', 'top-0', `z-${Z_INDICES.STICKY_ELEMENTS}`, 'overflow-x-auto', 'backdrop-blur-xs');
    if (isDarkMode) {
      baseClasses.push('bg-gray-800');
      if (isEmphasized) {
        baseClasses.push('border-b', 'box-border', 'border-gray-700');
      }
    } else {
      baseClasses.push('bg-white', 'text-ellipsis');
      if (isEmphasized) {
        baseClasses.push('border-b', 'box-border', 'border-gray-100');
      }
    }
  } else {
    baseClasses.push('whitespace-nowrap', 'overflow-hidden', 'text-ellipsis', 'truncate', 'max-w-full');
  }

  baseClasses.push(`h-[${lineHeight}px]`);

  return baseClasses.join(' ');
}

export function getContentClasses(isOpen: boolean, isDarkMode: boolean): string {
  const baseClasses = ['grow', 'flex', 'flex-col', 'min-h-0'];

  if (!isOpen) {
    baseClasses.push('overflow-hidden', 'p-0');
  }

  if (isDarkMode) {
    baseClasses.push('bg-gray-800', 'text-white');
  }

  return baseClasses.join(' ');
}

export function getFooterClasses(isDarkMode: boolean): string {
  const baseClasses = [
    'flex',
    'flex-col',
    'w-full',
    'mt-auto',
    'sticky',
    'bottom-0',
    'left-0',
    'right-0',
    'border-t',
    `z-${Z_INDICES.FOOTER_CONTENT}`,
    'backdrop-blur-xs',
  ];

  if (isDarkMode) {
    baseClasses.push('bg-gray-800', 'border-gray-700');
  } else {
    baseClasses.push('bg-white', 'border-gray-200');
  }

  return baseClasses.join(' ');
}

export function getFooterActionsClasses(isDarkMode: boolean): string {
  const baseClasses = ['flex', 'items-center', 'justify-between', 'gap-2', 'p-1', 'min-h-12', 'shrink-0', 'overflow-x-auto'];

  if (isDarkMode) {
    baseClasses.push('bg-gray-800');
  } else {
    baseClasses.push('bg-white');
  }

  return baseClasses.join(' ');
}

export function getChevronRotationClasses(_isOpen: boolean): string {
  return `transition-transform duration-200 group-open:rotate-180 mr-2 ml-1`;
}

export function getChevronColorClass(isDarkMode: boolean): string {
  return isDarkMode ? 'text-gray-300' : 'text-gray-600';
}
