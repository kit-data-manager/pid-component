import { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import {
  DOI_examples,
  EMAIL_examples,
  HANDLE_examples,
  ORCID_examples,
  ROR_examples,
  SPDX_examples,
  URL_examples,
} from '../examples';

const meta: Meta = {
  title: 'Introduction',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * A single `<pid-component>` resolving a DOI. The component automatically
 * detects the identifier type, fetches metadata, and renders an interactive
 * preview with expandable details.
 */
export const PidComponentDemo: Story = {
  name: 'PID Component',
  render: () => html`
    <div style="max-width: 700px; font-family: sans-serif; line-height: 1.6;">
      <p>
        The following DOI is rendered by a single
        <code
          style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">&lt;pid-component&gt;</code>
        tag. Click it to expand and see the resolved metadata:
      </p>
      <div style="margin: 16px 0;">
        <pid-component value="${DOI_examples.DATACITE_JOURNAL_PAPER}" dark-mode="light"
                       open-by-default="false"></pid-component>
      </div>
    </div>
  `,
};

/**
 * `initPidDetection()` scans a block of text and automatically replaces
 * recognized identifiers (DOIs, ORCiDs, Handle PIDs, ROR IDs, SPDX
 * licenses, URLs, emails) with interactive components -- no manual markup
 * needed.
 */
export const AutoDetectionDemo: Story = {
  name: 'Auto-Detection',
  render: () => {
    const container = document.createElement('div');
    container.style.maxWidth = '700px';
    container.style.fontFamily = 'sans-serif';
    container.innerHTML = `
      <p style="margin-bottom: 12px; color: #555; font-size: 0.95em;">
        The paragraph below is plain text. <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">initPidDetection()</code>
        scans it and turns every recognized identifier into an interactive component:
      </p>
      <div id="intro-auto-detect" style="line-height: 1.8; padding: 16px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa;">
        <p>
          This dataset is published as a FAIR Digital Object at
          ${HANDLE_examples.FDO_TYPED} and was created by researcher
          ${ORCID_examples.VALID}. The work was conducted at
          ${ROR_examples.VALID} and is available under the
          ${SPDX_examples.APACHE_2_0} license. The paper is available at
          DOI ${DOI_examples.CROSSREF_JOURNAL_PAPER}.
        </p>
        <p style="margin-top: 8px;">
          For questions, contact ${EMAIL_examples.VALID} or visit
          ${URL_examples.KIT_WEBSITE}.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('../packages/stencil-library/src/auto-detect/initPidDetection');
      const root = container.querySelector('#intro-auto-detect') as HTMLElement;
      if (root) {
        initPidDetection({
          root,
          darkMode: 'light',
        });
      }
    }, 100);

    return container;
  },
};
