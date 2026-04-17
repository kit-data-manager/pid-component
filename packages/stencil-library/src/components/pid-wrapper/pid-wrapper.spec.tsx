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

    const enhancedNode = page.root?.querySelector('[data-pid-enhanced]');
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

    const enhancedNode = page.root?.querySelector('[data-pid-enhanced]');
    const original = enhancedNode?.querySelector('span');
    const pidComponent = enhancedNode?.querySelector('pid-component') as HTMLElement;

    pidComponent.dispatchEvent(new CustomEvent('pid-component-ready', { bubbles: true }));
    await page.waitForChanges();

    expect(original?.style.display).toBe('none');
    expect(pidComponent.style.display).toBe('inline-block');
  });

  it('forwards all inherited config props to injected pid-component', async () => {
    const page = await newSpecPage({
      components: [PidWrapper],
      html: `<pid-wrapper
        dark-mode="dark"
        settings='[{"type":"DOIType","values":[]}]'
        open-by-default="true"
        amount-of-items="5"
        level-of-subcomponents="2"
        hide-subcomponents="true"
        emphasize-component="false"
        show-top-level-copy="false"
        default-t-t-l="3600000"
        width="400px"
        height="250px"
      ><p>DOI: 10.5880/fidgeo.2020.009</p></pid-wrapper>`,
    });

    await page.waitForChanges();
    await new Promise(resolve => setTimeout(resolve, 0));
    await page.waitForChanges();

    const pidComponent = page.root?.querySelector('[data-pid-enhanced] pid-component');

    expect(pidComponent?.getAttribute('dark-mode')).toBe('dark');
    expect(pidComponent?.getAttribute('settings')).toBe('[{"type":"DOIType","values":[]}]');
    expect(pidComponent?.getAttribute('open-by-default')).toBe('true');
    expect(pidComponent?.getAttribute('amount-of-items')).toBe('5');
    expect(pidComponent?.getAttribute('level-of-subcomponents')).toBe('2');
    expect(pidComponent?.getAttribute('hide-subcomponents')).toBe('true');
    expect(pidComponent?.getAttribute('emphasize-component')).toBe('false');
    expect(pidComponent?.getAttribute('show-top-level-copy')).toBe('false');
    expect(pidComponent?.getAttribute('default-t-t-l')).toBe('3600000');
    expect(pidComponent?.getAttribute('width')).toBe('400px');
    expect(pidComponent?.getAttribute('height')).toBe('250px');
  });
});
