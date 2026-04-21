import { FunctionalComponent, h } from '@stencil/core';

/**
 * Maps DataCite resource types to icons and display names
 */
export interface ResourceTypeInfo {
  icon: FunctionalComponent;
  displayName: string;
}

const userFriendlyResourceType: { [key: string]: string } = {
  'article': "📰 Article",
  'book': "📚 Book",
  'chapter': "📖 Chapter",
  'software': "💻 Software",
  'dataset': "📊 Dataset",
  'image': "🖼️ Image",
  'video': "🎥 Video",
  'audio': "🎵 Audio",
  'presentation': "🧑‍🏫 Presentation",
  'preprint': "📝 Preprint",
  'thesis': "🎓 Thesis",
  'report': "📋 Report",
  'standard': "📜 Standard",
  'workflow': "🔄 Workflow",
  'model': "🧮 Model",
  'paper': "📄 Paper",
  'journal': "📰 Journal",
  'code': "💻 Code",
  'institution': "🏛️ Institution",
  'conferencepaper': "🎤 Conference Paper",
  'database': "🗄️ Database",
  'other': "❓ Other",
  'journalarticle': "📄 Journal Article",
  'proceedingsarticle': "🎤 Proceedings Article",
  'reportseries': "📋 Report Series",
  'bookchapter': "📖 Book Chapter",
  'monograph': "📚 Monograph",
  'editedbook': "📚 Edited Book",
  'reportpaper': "📋 Report Paper",
};

export function beautifyResourceType(resourceType: string): string {
  const normalized = resourceType
    .toLowerCase()
    .replace("_", "").replace("-", "");
  return userFriendlyResourceType[normalized] || resourceType;
}

/**
 * DataCite logo SVG component
 * Downloaded from https://datacite.org/datacite-schwoop/ on 2026-02-04
 */
export const DataCiteLogo = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 103.8" class={'h-4'}>
    <defs>
      <style>
        {`.cls-1{fill:#00b1e2;}`}
        {`.cls-2{fill:#243b54;}`}
      </style>
    </defs>
    <path class="cls-1" d="M5,73.38c.86.16,1.63.32,2.65.47,43.5,8.64,108.26-2.8,116.59-23.89,6.54-17.05-30-29.11-72.62-27.63a13.94,13.94,0,0,0-2.49.15c22.73,2.26,43.2,11.29,35,25.38C75.2,63.27,37.3,73.54,5,73.38"></path>
    <path class="cls-2" d="M100.27,75.53C92.72,121.3,53.18,94,43.84,62.15,30.3,29.07,42.36-13.43,76.22,11.48c-28-12.85-31,24.36-19,50.82,10,22.11,31.59,36.35,42,13.54.47-.15.86-.15,1-.31"></path>
  </svg>
);

/**
 * CrossRef logo SVG component
 * Downloaded from https://assets.crossref.org on 2026-02-04 (Text removed for enhanced brevity)
 */
export const CrossRefLogo = () => (
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg"
       x="0px" y="0px"
       class={'h-4'}
       viewBox="0 0 65.400002 95.199999"
  >
    <style type="text/css">
      {`.st0{fill:#3EB1C8;}`}
      {`.st1{fill:#D8D2C4;}`}
      {`.st2{fill:#4F5858;}`}
      {`.st3{fill:#FFC72C;}`}
      {`.st4{fill:#EF3340;}`}
    </style>
    <g
      id="g16"
      transform="translate(-69.570409,-17.62496)">
      <polygon
        class="st0"
        points="111.8,66.8 135.4,59 177.2,73.3 111.8,95.5 "
        id="polygon1"
        transform="translate(-42.229591,17.32496)" />
      <polygon
        class="st1"
        points="111.8,51.2 135.4,59 177.2,44.6 153.6,36.8 "
        id="polygon2"
        transform="translate(-42.229591,17.32496)" />
      <polygon
        class="st2"
        points="135.4,59 177.2,44.6 177.2,73.3 "
        id="polygon3"
        transform="translate(-42.229591,17.32496)" />
      <polygon
        class="st3"
        points="177.2,29 153.6,36.8 111.8,22.5 177.2,0.3 "
        id="polygon4"
        transform="translate(-42.229591,17.32496)" />
      <polygon
        class="st4"
        points="153.6,36.8 111.8,51.2 111.8,22.5 "
        id="polygon5"
        transform="translate(-42.229591,17.32496)" />
    </g>
  </svg>
);
