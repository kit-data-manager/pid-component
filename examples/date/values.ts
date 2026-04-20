export const DATE_examples = {
  ISO_8601: '2022-11-11T08:01:20.557+00:00',
  ISO_8601_ALT: '2024-06-15T09:30:00.000+02:00',
  DATE_ONLY: '2024-06-15',
  DATETIME_SHORT: '2023-11-20T00:00:00.000+01:00',
  INVALID_DATE_ONLY: '06-15',
  INVALID_NO_TIMEZONE: '2024-06-15T09:30:00',
  INVALID_NOT_A_DATE: 'not-a-date',
  INVALID_EMPTY: '',
} as const;

export type DATE_example = typeof DATE_examples[keyof typeof DATE_examples];
