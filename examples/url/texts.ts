import { URL_examples } from './values';

export const url_texts = {
  BASIC: `Visit ${URL_examples.KIT_WEBSITE} for more information.`,
  GITHUB_REFERENCE: `Project available on ${URL_examples.GITHUB}.`,
  WEBSITE_REFERENCE: `See ${URL_examples.KIT_WEBSITE} for details.`,
} as const;

export type url_text = typeof url_texts[keyof typeof url_texts];