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
        <pid-component value="${HANDLE_examples.FDO_TYPED}" dark-mode="light"
        "
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
  render: (_args, context) => {
    // React to Storybook's light/dark backgrounds toggle so the card (and the
    // PID components) follow the toolbar selection rather than just the OS.
    const bg = context?.globals?.backgrounds as { name?: string; value?: string } | undefined;
    const isDark = String(bg?.value ?? '').toLowerCase().includes('dark') ||
      String(bg?.name ?? '').toLowerCase().includes('dark') ||
      String(bg?.value) === '#222';

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.fontFamily = 'sans-serif';
    container.innerHTML = `
      <style>
        #intro-note code {
          background: ${isDark ? '#33334d' : '#f0f0f0'};
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
        }
        #intro-auto-detect {
          line-height: 1.8;
          padding: 16px;
          border-radius: 6px;
          background: ${isDark ? '#1a1a2e' : '#fafafa'};
          border: 1px solid ${isDark ? '#33334d' : '#e0e0e0'};
          color: ${isDark ? '#fff' : '#1a1a1a'};
          transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        #intro-auto-detect code {
          background: ${isDark ? '#33334d' : '#f0f0f0'};
          color: ${isDark ? '#fff' : 'inherit'};
        }
      </style>
      <p id="intro-note" style="margin-bottom: 12px; ${isDark ? 'color: #ccc;' : 'color: #555;'} font-size: 0.95em;">
        The paragraph below is plain text. <code style="padding: 2px 6px; border-radius: 3px; font-size: 0.9em;">initPidDetection()</code>
        scans it and turns every recognized identifier into an interactive component:
      </p>
      <div id="intro-auto-detect">
        <p>
          This web component can visualize FAIR Digital Objects such as ${HANDLE_examples.FDO_TYPED} and other PIDs.
          It was created by ${ORCID_examples.VALID} at ${ROR_examples.VALID} and is available under the ${SPDX_examples.APACHE_2_0} license.
          This work was presented as a lightning talk at the 2nd FDO conference, you can read this paper ${DOI_examples.VALID_BARE}.
        </p>
        <p style="margin-top: 8px;">
          For questions, contact ${EMAIL_examples.KIT_EMAIL}.
        </p>
      </div>
    `;

    setTimeout(async () => {
      const { initPidDetection } = await import('../packages/stencil-library/src/auto-detect/initPidDetection');
      const root = container.querySelector('#intro-auto-detect') as HTMLElement;
      if (root) {
        initPidDetection({
          root,
          darkMode: isDark ? 'dark' : 'light',
          settings:
            '[{"type":"ORCIDType","values":[{"name":"showAffiliation","value":false}]}]',
        });
      }
    }, 100);

    return container;
  },
};
