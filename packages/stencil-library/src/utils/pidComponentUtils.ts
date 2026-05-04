export function shouldShowFooter(
  hasActions: boolean,
  hasPagination: boolean,
): boolean {
  return hasActions || hasPagination;
}

export function getPreviewClasses(
  isTopLevel: boolean,
  isEmphasized: boolean,
  isTemporarilyEmphasized: boolean,
  isDarkMode: boolean,
  isExpanded: boolean,
  lineHeight: number,
): string {
  if (!isTopLevel) return '';

  const baseClasses = [
    'group',
    'rounded-md',
    'border',
    'py-0',
    'shadow-sm',
    'inline-flex',
    'cursor-pointer',
    'list-none',
    'flex-nowrap',
    'items-center',
    'overflow-hidden',
    'font-mono',
    'font-bold',
    'text-clip',
  ];

  if (isEmphasized || isTemporarilyEmphasized) {
    baseClasses.push(isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white');
  } else {
    if (isDarkMode) {
      baseClasses.push('bg-gray-800/60');
    }
  }

  if (!isExpanded) {
    baseClasses.push(`h-[${lineHeight || 24}px]`);
    baseClasses.push(`leading-[${lineHeight || 24}px]`);
  }

  return baseClasses.join(' ');
}

export function getPreviewTextClasses(
  isExpanded: boolean,
  isTopLevel: boolean,
): string {
  if (!isTopLevel) return '';
  const base = 'inline-block font-mono font-medium select-all';
  if (isExpanded) {
    return `${base} text-xs max-w-[60vw] overflow-x-auto whitespace-nowrap`;
  }
  return `${base} text-sm max-w-full truncate`;
}

export function getHostElementClasses(_isExpanded: boolean): string {
  return 'relative font-sans';
}

export function getItemRangeText(
  start: number,
  end: number,
  total: number,
): string {
  return `Showing ${start}-${end} of ${total}`;
}

export function calculateItemRange(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number,
): { start: number; end: number } {
  const start = currentPage * itemsPerPage;
  const end = Math.min(start + itemsPerPage, totalItems);
  return { start, end };
}
