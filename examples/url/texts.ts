import { URL_examples } from './values';

export const url_texts = {
  BASIC: `Visit ${URL_examples.KIT_WEBSITE} for more information.`,
  GITHUB_REFERENCE: `Project available on ${URL_examples.GITHUB}.`,
  WEBSITE_REFERENCE: `See ${URL_examples.KIT_WEBSITE} for details.`,
  INVALID_TEXT: `Visit ${URL_examples.INVALID_NOT_A_URL} for details.`,
  INVALID_TEXT_WITH_VALID: `Website ${URL_examples.KIT_WEBSITE} (valid) and ${URL_examples.INVALID_WRONG_PROTOCOL} (invalid) are linked.`,
} as const;

export type url_text = typeof url_texts[keyof typeof url_texts];