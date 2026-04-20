import { ORCID_examples } from './values';

export const orcid_texts = {
  BASIC: `ORCID ${ORCID_examples.VALID}`,
  AUTHOR_REFERENCE: `Author: ${ORCID_examples.VALID}`,
  MULTI_AUTHOR: `Researchers ${ORCID_examples.VALID} and ${ORCID_examples.VALID_ALT} contributed to this work.`,
  CONTACT: `Contact author at ${ORCID_examples.VALID}.`,
  INVALID_TEXT: `Researcher ${ORCID_examples.INVALID_NOT_AN_ORCID} contributed to this work.`,
  INVALID_TEXT_WITH_VALID: `Author orcid: ${ORCID_examples.VALID} has invalid orcid: ${ORCID_examples.INVALID_TOO_SHORT} in the database.`,
} as const;

export type orcid_text = typeof orcid_texts[keyof typeof orcid_texts];