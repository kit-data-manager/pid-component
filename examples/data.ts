import { DOI_examples } from './doi/values';
import { ORCID_examples } from './orcid/values';
import { SPDX_examples } from './spdx/values';

export const demo_datasets = [
  {
    id: '1',
    title: 'KIT Data Metadata Analysis',
    doi: DOI_examples.DATACITE_JOURNAL_PAPER,
    license: SPDX_examples.MIT,
  },
  {
    id: '2',
    title: 'Research Output Repository Schema',
    doi: DOI_examples.DATACITE_SLIDES,
    license: SPDX_examples.APACHE_2_0,
  },
  {
    id: '3',
    title: 'FDO Implementation Guidelines',
    doi: DOI_examples.DATACITE_PREPRINT,
    license: SPDX_examples.CC_BY_4_0,
  },
] as const;

export const demo_authors = [
  {
    orcid: ORCID_examples.VALID,
    name: 'Maximilian Inckmann',
    institution: 'Karlsruhe Institute of Technology',
  },
  {
    orcid: ORCID_examples.VALID_ALT,
    name: 'Christopher Raquet',
    institution: 'Karlsruhe Institute of Technology',
  },
  {
    orcid: ORCID_examples.VALID_SECOND,
    name: 'Andreas Pfeil',
    institution: 'Karlsruhe Institute of Technology',
  },
] as const;