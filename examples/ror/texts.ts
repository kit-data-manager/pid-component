import { ROR_examples } from './values';

export const ror_texts = {
  BASIC: `ROR ${ROR_examples.VALID}`,
  INSTITUTION_REFERENCE: `Institution: ${ROR_examples.VALID}`,
  IN_CONTEXT: `Conducted at ${ROR_examples.VALID}.`,
} as const;

export type ror_text = typeof ror_texts[keyof typeof ror_texts];