import { ROR_examples } from './values';

export const ror_texts = {
  BASIC: `ROR ${ROR_examples.VALID}`,
  INSTITUTION_REFERENCE: `Institution: ${ROR_examples.VALID}`,
  IN_CONTEXT: `Conducted at ${ROR_examples.VALID}.`,
  INVALID_TEXT: `Affiliation at ${ROR_examples.INVALID_WRONG_DOMAIN} is listed.`,
  INVALID_TEXT_WITH_VALID: `Organization ${ROR_examples.VALID} (valid) and ${ROR_examples.INVALID_WRONG_DOMAIN} (invalid) are listed.`,
} as const;

export type ror_text = typeof ror_texts[keyof typeof ror_texts];