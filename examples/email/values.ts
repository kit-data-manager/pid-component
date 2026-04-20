export const EMAIL_examples = {
  VALID: 'someone@example.com',
  VALID_ALT: 'john.doe@demo.example',
  KIT_EMAIL: 'maximilian.inckmann@kit.edu',
  KIT_EMAIL_ALT: 'ys9159@kit.edu',
} as const;

export type EMAIL_example = typeof EMAIL_examples[keyof typeof EMAIL_examples];
