import { EMAIL_examples } from './values';

export const email_texts = {
  BASIC: `Contact ${EMAIL_examples.VALID} for questions.`,
  MULTIPLE: `Contact ${EMAIL_examples.VALID} or ${EMAIL_examples.VALID_ALT}.`,
  KIT_REFERENCE: `Email ${EMAIL_examples.KIT_EMAIL} for support.`,
  INVALID_TEXT: `Contact ${EMAIL_examples.INVALID_MISSING_DOMAIN} for more information.`,
  INVALID_TEXT_WITH_VALID: `Email ${EMAIL_examples.VALID} (valid) and ${EMAIL_examples.INVALID_NOT_AN_EMAIL} (invalid) in document.`,
} as const;

export type email_text = typeof email_texts[keyof typeof email_texts];