import { DATE_examples } from './values';

export const date_texts = {
  BASIC: `Published on ${DATE_examples.ISO_8601}.`,
  UPDATED: `Last updated: ${DATE_examples.ISO_8601_ALT}.`,
  DATE_ONLY: `Created on ${DATE_examples.DATE_ONLY}.`,
  INVALID_TEXT: `Date of publication: ${DATE_examples.INVALID_DATE_ONLY}.`,
  INVALID_TEXT_WITH_VALID: `Event on ${DATE_examples.INVALID_NO_TIMEZONE} (no timezone) and valid ${DATE_examples.ISO_8601} (valid) in text.`,
} as const;

export type date_text = typeof date_texts[keyof typeof date_texts];