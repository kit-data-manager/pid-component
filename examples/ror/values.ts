export const ROR_examples = {
  VALID: 'https://ror.org/04t3en479',
  VALID_BARE: '04t3en479',
  SECOND: 'https://ror.org/02aj13c28',
  INVALID_WRONG_DOMAIN: 'https://example.com/04t3en479',
  INVALID_NO_SCHEME: 'ror.org/04t3en479',
  INVALID_WRONG_LENGTH: 'https://ror.org/04t3en47',
  INVALID_EMPTY: '',
} as const;

export type ROR_example = typeof ROR_examples[keyof typeof ROR_examples];