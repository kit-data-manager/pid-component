import { Creator } from './DataCiteInfo';

/**
 * Supported citation styles
 */
export enum CitationStyle {
  APA = 'APA',
  CHICAGO = 'Chicago',
  IEEE = 'IEEE',
  HARVARD = 'Harvard',
  ANGLIA_RUSKIN = 'Anglia Ruskin',
}

/**
 * Formats a citation preview for a DOI based on the given style
 */
export function formatCitationPreview(
  title: string,
  creators: Creator[],
  year?: string,
  style: CitationStyle = CitationStyle.APA,
): string {
  if (!title || creators.length === 0) {
    return title || 'Untitled';
  }

  const firstAuthor = creators[0];
  const authorCount = creators.length;

  switch (style) {
    case CitationStyle.APA:
      return formatAPA(firstAuthor, authorCount, title, year);
    
    case CitationStyle.CHICAGO:
      return formatChicago(firstAuthor, authorCount, title, year);
    
    case CitationStyle.IEEE:
      return formatIEEE(firstAuthor, authorCount, title, year);
    
    case CitationStyle.HARVARD:
      return formatHarvard(firstAuthor, authorCount, title, year);
    
    case CitationStyle.ANGLIA_RUSKIN:
      return formatAngliaRuskin(firstAuthor, authorCount, title, year);
    
    default:
      return formatAPA(firstAuthor, authorCount, title, year);
  }
}

/**
 * APA style: Author, A. A. (Year). Title...
 */
function formatAPA(author: Creator, count: number, title: string, year?: string): string {
  const authorName = author.familyName || author.name.split(' ').pop() || author.name;
  const etAl = count > 1 ? ' et al.' : '';
  const yearPart = year ? ` (${year.split('-')[0]})` : '';
  const titleTrunc = truncateTitle(title, 60);
  
  return `${authorName}${etAl}${yearPart}. ${titleTrunc}`;
}

/**
 * Chicago style: Author, First Last. Year. "Title..."
 */
function formatChicago(author: Creator, count: number, title: string, year?: string): string {
  const authorName = author.familyName || author.name.split(' ').pop() || author.name;
  const firstName = author.givenName || author.name.split(' ')[0] || '';
  const etAl = count > 1 ? ' et al.' : '';
  const yearPart = year ? ` ${year.split('-')[0]}.` : '';
  const titleTrunc = truncateTitle(title, 60);
  
  return `${authorName}, ${firstName}${etAl}.${yearPart} "${titleTrunc}"`;
}

/**
 * IEEE style: [1] A. Author et al., "Title..."
 */
function formatIEEE(author: Creator, count: number, title: string, year?: string): string {
  const initial = author.givenName ? author.givenName.charAt(0) + '.' : '';
  const authorName = author.familyName || author.name.split(' ').pop() || author.name;
  const etAl = count > 1 ? ' et al.' : '';
  const titleTrunc = truncateTitle(title, 60);
  const yearPart = year ? `, ${year.split('-')[0]}` : '';
  
  return `${initial} ${authorName}${etAl}, "${titleTrunc}"${yearPart}`;
}

/**
 * Harvard style: Author, A.A., Year. Title...
 */
function formatHarvard(author: Creator, count: number, title: string, year?: string): string {
  const authorName = author.familyName || author.name.split(' ').pop() || author.name;
  const initials = author.givenName 
    ? author.givenName.split(' ').map(n => n.charAt(0) + '.').join('')
    : '';
  const etAl = count > 1 ? ' et al.' : '';
  const yearPart = year ? `, ${year.split('-')[0]}` : '';
  const titleTrunc = truncateTitle(title, 60);
  
  return `${authorName}, ${initials}${etAl}${yearPart}. ${titleTrunc}`;
}

/**
 * Anglia Ruskin style: AUTHOR, Year. Title...
 */
function formatAngliaRuskin(author: Creator, count: number, title: string, year?: string): string {
  const authorName = (author.familyName || author.name.split(' ').pop() || author.name).toUpperCase();
  const etAl = count > 1 ? ' ET AL.' : '';
  const yearPart = year ? ` ${year.split('-')[0]}.` : '';
  const titleTrunc = truncateTitle(title, 60);
  
  return `${authorName}${etAl}${yearPart} ${titleTrunc}`;
}

/**
 * Truncates title to specified length with ellipsis
 */
function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;
  
  // Try to truncate at word boundary
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Gets the default citation style
 */
export function getDefaultCitationStyle(): CitationStyle {
  return CitationStyle.APA; // APA is most commonly used in academia
}

/**
 * Parses citation style from settings
 */
export function getCitationStyleFromSettings(settings?: { name: string; value: unknown }[]): CitationStyle {
  if (!settings) return getDefaultCitationStyle();
  
  const styleSetting = settings.find(s => s.name === 'citationStyle');
  if (!styleSetting) return getDefaultCitationStyle();
  
  const styleValue = String(styleSetting.value).toUpperCase();
  
  switch (styleValue) {
    case 'APA':
      return CitationStyle.APA;
    case 'CHICAGO':
      return CitationStyle.CHICAGO;
    case 'IEEE':
      return CitationStyle.IEEE;
    case 'HARVARD':
      return CitationStyle.HARVARD;
    case 'ANGLIARUSKIN':
    case 'ANGLIA_RUSKIN':
      return CitationStyle.ANGLIA_RUSKIN;
    default:
      return getDefaultCitationStyle();
  }
}
