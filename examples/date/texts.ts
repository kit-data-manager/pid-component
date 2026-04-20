import { DATE_examples } from './values';

export const date_texts = {
  BASIC: `Published on ${DATE_examples.ISO_8601}.`,
  UPDATED: `Last updated: ${DATE_examples.ISO_8601_ALT}.`,
  DATE_ONLY: `Created on ${DATE_examples.DATE_ONLY}.`,
} as const;

export type date_text = typeof date_texts[keyof typeof date_texts];