export const LOCALE_examples = {
  EN_US: 'en-US',
  DE_DE: 'de-DE',
  EN_GB: 'en-GB',
  FR_FR: 'fr-FR',
} as const;

export type LOCALE_example = typeof LOCALE_examples[keyof typeof LOCALE_examples];