export function getAriaLabel(isCopied: boolean, label?: string): string {
  const baseLabel = label || 'content';
  return isCopied ? `${baseLabel} copied to clipboard` : `Copy ${baseLabel} to clipboard`;
}

export function getButtonText(isCopied: boolean): string {
  return isCopied ? '✓ Copied!' : 'Copy';
}

export function getButtonTitle(isCopied: boolean, label?: string): string {
  return getAriaLabel(isCopied, label);
}

export function isDarkModeEnabled(parent: Element | null): boolean {
  if (!parent) return false;
  return parent.classList.contains('bg-gray-800');
}

export function getButtonClasses(copied: boolean, isDarkMode: boolean): string {
  const baseClasses = 'relative z-30 max-h-min flex-none items-center rounded-md border px-2 py-0.5 font-mono font-medium transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-hidden';

  if (copied) {
    return isDarkMode
      ? `${baseClasses} bg-green-700 text-white border-gray-600`
      : `${baseClasses} bg-green-200 text-green-900 border-gray-400`;
  }

  return isDarkMode
    ? `${baseClasses} bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 hover:text-white`
    : `${baseClasses} bg-white text-slate-800 border-slate-500 hover:bg-blue-200`;
}

export function getHostClasses(): string {
  return 'inline-block align-baseline text-xs';
}

export function getSrOnlyText(): string {
  return 'Content copied to clipboard';
}

export const DEFAULT_LABEL = 'content';
export const COPY_SUCCESS_DURATION_MS = 1500;
export const FALLBACK_TEXTAREA_STYLE = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;opacity:0;';