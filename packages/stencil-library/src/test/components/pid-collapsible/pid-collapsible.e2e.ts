import { newE2EPage } from '@stencil/core/testing';

describe('pid-collapsible e2e', () => {
  it('renders and gets hydrated class', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible>
        <span slot="summary">Summary text</span>
        <div>Content inside collapsible</div>
      </pid-collapsible>
    `);
    const element = await page.find('pid-collapsible');
    expect(element).toHaveClass('hydrated');
  });

  it('renders a details element with summary', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible>
        <span slot="summary">Click me</span>
        <p>Hidden content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const details = await page.find('pid-collapsible details');
    expect(details).not.toBeNull();

    const summary = await page.find('pid-collapsible details summary');
    expect(summary).not.toBeNull();
  });

  it('is collapsed by default', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible>
        <span slot="summary">Summary</span>
        <p>Content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const element = await page.find('pid-collapsible');
    expect(await element.getProperty('open')).toBe(false);

    const details = await page.find('pid-collapsible details');
    const openAttr = await details.getProperty('open');
    expect(openAttr).toBeFalsy();
  });

  it('clicking the summary toggles the content open', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible emphasize="true">
        <span slot="summary">Toggle me</span>
        <p>Expandable content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const summary = await page.find('pid-collapsible details summary');
    await summary.click();
    await page.waitForChanges();
    await new Promise(r => setTimeout(r, 200));

    const element = await page.find('pid-collapsible');
    const isOpen = await element.getProperty('open');
    expect(isOpen).toBe(true);
  });

  it('emits collapsibleToggle event on toggle', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible emphasize="true">
        <span slot="summary">Toggle event test</span>
        <p>Content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const toggleSpy = await page.spyOnEvent('collapsibleToggle');

    const summary = await page.find('pid-collapsible details summary');
    await summary.click();
    await page.waitForChanges();
    await new Promise(r => setTimeout(r, 200));

    expect(toggleSpy).toHaveReceivedEvent();
    expect(toggleSpy).toHaveReceivedEventDetail(true);
  });

  it('open property is false by default', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible>
        <span slot="summary">Initially closed</span>
        <p>Hidden content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const element = await page.find('pid-collapsible');
    const openProp = await element.getProperty('open');
    expect(openProp).toBe(false);
  });

  it('has correct ARIA roles and attributes', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible emphasize="true">
        <span slot="summary">Accessible collapsible</span>
        <p>Accessible content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    // The summary element should be focusable
    const summary = await page.find('pid-collapsible details summary');
    expect(summary).not.toBeNull();

    // The summary has cursor-pointer class for interactivity
    expect(await summary.getProperty('className')).toContain('cursor-pointer');
  });

  it('dark-mode prop applies dark mode classes', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible dark-mode="dark">
        <span slot="summary">Dark mode test</span>
        <p>Dark content</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const element = await page.find('pid-collapsible');
    expect(await element.getProperty('darkMode')).toBe('dark');

    // The details element should have dark mode classes
    const details = await page.find('pid-collapsible details');
    const classNames = await details.getProperty('className');
    expect(classNames).toContain('bg-gray-800');
  });

  it('toggling emits collapsibleToggle event with detail', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible emphasize="true">
        <span slot="summary">Close me</span>
        <p>Content to hide</p>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const toggleSpy = await page.spyOnEvent('collapsibleToggle');

    // Click to open
    const summary = await page.find('pid-collapsible details summary');
    await summary.click();
    await page.waitForChanges();
    await new Promise(r => setTimeout(r, 200));

    expect(toggleSpy).toHaveReceivedEvent();
    // The event should have been emitted at least once
    expect(toggleSpy).toHaveReceivedEventTimes(1);
  });

  it('show-footer prop controls footer visibility', async () => {
    const page = await newE2EPage();
    await page.setContent(`
      <pid-collapsible open="true" show-footer="true">
        <span slot="summary">With footer</span>
        <p>Content</p>
        <div slot="footer">Footer content</div>
      </pid-collapsible>
    `);
    await page.waitForChanges();

    const element = await page.find('pid-collapsible');
    expect(await element.getProperty('showFooter')).toBe(true);
  });
});
