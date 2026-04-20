export const ORCID_examples = {
  VALID: '0009-0005-2800-4833',
  VALID_ALT: '0009-0003-2196-9187',
  VALID_SECOND: '0000-0001-6575-1022',
  VALID_WITH_HTTPS: 'https://orcid.org/0009-0005-2800-4833',
} as const;

export type ORCID_example = typeof ORCID_examples[keyof typeof ORCID_examples];