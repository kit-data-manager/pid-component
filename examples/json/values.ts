export const JSON_examples = {
  SIMPLE: '{"name": "pid-component", "version": "1.0.0"}',
  ARRAY: '{"features": ["PIDs", "ORCiDs", "DOIs"]}',
  NESTED: '{"project": "pid-component", "version": "0.4.0", "renderers": ["DOI", "ORCiD", "Handle"]}',
  DATASET: '{"id": 1, "title": "Test Dataset", "doi": "10.5445/IR/1000185135"}',
} as const;

export type JSON_example = typeof JSON_examples[keyof typeof JSON_examples];