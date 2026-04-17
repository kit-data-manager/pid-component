import { newE2EPage } from '@stencil/core/testing';

describe('copy-button e2e', () => {
  it('renders and gets hydrated class', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="test-value"></copy-button>');
    const element = await page.find('copy-button');
    expect(element).toHaveClass('hydrated');
  });

  it('renders a button element', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="hello"></copy-button>');
    await page.waitForChanges();

    const button = await page.find('copy-button button');
    expect(button).not.toBeNull();
    expect(button.tagName).toBe('BUTTON');
  });

  it('button has correct aria-label', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="test" label="DOI"></copy-button>');
    await page.waitForChanges();

    const button = await page.find('copy-button button');
    const ariaLabel = button.getAttribute('aria-label');
    expect(ariaLabel).toBe('Copy DOI to clipboard');
  });

  it('button has default aria-label when no label prop', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="test"></copy-button>');
    await page.waitForChanges();

    const button = await page.find('copy-button button');
    const ariaLabel = button.getAttribute('aria-label');
    expect(ariaLabel).toBe('Copy content to clipboard');
  });

  it('shows "Copy" label text by default', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="test"></copy-button>');
    await page.waitForChanges();

    const button = await page.find('copy-button button');
    const text = button.textContent;
    expect(text).toContain('Copy');
  });

  it('value attribute is set correctly', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="10.1234/test-doi"></copy-button>');
    const element = await page.find('copy-button');
    expect(await element.getProperty('value')).toBe('10.1234/test-doi');
  });

  it('button has type="button" attribute', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="test"></copy-button>');
    await page.waitForChanges();

    const button = await page.find('copy-button button');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('button has title attribute matching aria-label', async () => {
    const page = await newE2EPage();
    await page.setContent('<copy-button value="test" label="identifier"></copy-button>');
    await page.waitForChanges();

    const button = await page.find('copy-button button');
    const ariaLabel = button.getAttribute('aria-label');
    const title = button.getAttribute('title');
    expect(title).toBe(ariaLabel);
  });
});
