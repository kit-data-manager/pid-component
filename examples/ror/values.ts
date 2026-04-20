export const ROR_examples = {
  VALID: 'https://ror.org/04t3en479',
  VALID_BARE: '04t3en479',
  SECOND: 'https://ror.org/02aj13c28',
} as const;

export type ROR_example = typeof ROR_examples[keyof typeof ROR_examples];