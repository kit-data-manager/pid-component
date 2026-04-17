import { newSpecPage } from '@stencil/core/testing';
import { PidWrapper } from './pid-wrapper';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBeTruthy: () => void;
  toBe: (expected: unknown) => void;
};

describe('pid-wrapper', () => {
  it('detects identifiers and injects pid-component placeholders', async () => {
    const page = await newSpecPage({
      components: [PidWrapper],
      html: `<pid-wrapper><p>DOI: 10.5880/fidgeo.2020.009</p></pid-wrapper>`,
    });

    await page.waitForChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    await page.waitForChanges();

    const enhancedNode = page.root?.querySelector('[data-pid-wrapper-enhanced]');
    const pidComponent = enhancedNode?.querySelector('pid-component');

    expect(enhancedNode).toBeTruthy();
    expect(pidComponent).toBeTruthy();
    expect(pidComponent?.getAttribute('value')).toBe('10.5880/fidgeo.2020.009');
    expect(pidComponent?.style.display).toBe('none');
  });

  it('shows pid-component after ready event', async () => {
    const page = await newSpecPage({
      components: [PidWrapper],
      html: `<pid-wrapper><p>ORCID: 0000-0002-1825-0097</p></pid-wrapper>`,
    });

    await page.waitForChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    await page.waitForChanges();

    const enhancedNode = page.root?.querySelector('[data-pid-wrapper-enhanced]');
    const original = enhancedNode?.querySelector('span');
    const pidComponent = enhancedNode?.querySelector('pid-component') as HTMLElement;

    pidComponent.dispatchEvent(new CustomEvent('pid-component-ready', { bubbles: true }));
    await page.waitForChanges();

    expect(original?.style.display).toBe('none');
    expect(pidComponent.style.display).toBe('inline-block');
  });
});
