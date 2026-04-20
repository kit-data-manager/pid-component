import { EMAIL_examples } from './values';

export const email_texts = {
  BASIC: `Contact ${EMAIL_examples.VALID} for questions.`,
  MULTIPLE: `Contact ${EMAIL_examples.VALID} or ${EMAIL_examples.VALID_ALT}.`,
  KIT_REFERENCE: `Email ${EMAIL_examples.KIT_EMAIL} for support.`,
} as const;

export type email_text = typeof email_texts[keyof typeof email_texts];