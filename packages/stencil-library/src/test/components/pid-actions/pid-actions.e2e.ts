import { newE2EPage } from '@stencil/core/testing';

describe('pid-actions e2e', () => {
  /**
   * Helper to inject actions into pid-actions via page.evaluate(),
   * since the actions prop accepts an array of FoldableAction objects
   * which cannot be passed as HTML attributes.
   */
  async function createPageWithActions(
    page: Awaited<ReturnType<typeof newE2EPage>>,
    actions: Array<{ priority: number; title: string; link: string; style: string }>,
  ) {
    await page.setContent('<pid-actions></pid-actions>');
    await page.waitForChanges();

    // Set the actions property programmatically since it's an object array
    await page.$eval(
      'pid-actions',
      (el: any, actionsData: any[]) => {
        // FoldableAction is a class, so we create plain objects that match the getter interface
        el.actions = actionsData.map((a: any) => ({
          get priority() {
            return a.priority;
          },
          get title() {
            return a.title;
          },
          get link() {
            return a.link;
          },
          get style() {
            return a.style;
          },
          equals(other: any) {
            return a.priority === other.priority && a.title === other.title && a.link === other.link && a.style === other.style;
          },
        }));
      },
      actions,
    );
    await page.waitForChanges();
  }

  it('renders and gets hydrated class', async () => {
    const page = await newE2EPage();
    await page.setContent('<pid-actions></pid-actions>');
    const element = await page.find('pid-actions');
    expect(element).toHaveClass('hydrated');
  });

  it('renders nothing when no actions provided', async () => {
    const page = await newE2EPage();
    await page.setContent('<pid-actions></pid-actions>');
    await page.waitForChanges();

    const toolbar = await page.find('pid-actions [role="toolbar"]');
    expect(toolbar).toBeNull();
  });

  it('renders actions with correct structure', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'View Details', link: 'https://example.com/details', style: 'primary' },
      { priority: 2, title: 'Download', link: 'https://example.com/download', style: 'secondary' },
    ]);

    const toolbar = await page.find('pid-actions [role="toolbar"]');
    expect(toolbar).not.toBeNull();

    const links = await page.findAll('pid-actions a');
    expect(links.length).toBe(2);
  });

  it('action links have correct href', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'View Source', link: 'https://example.com/source', style: 'primary' },
    ]);

    const link = await page.find('pid-actions a');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://example.com/source');
  });

  it('has ARIA toolbar role', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'Action', link: 'https://example.com', style: 'primary' },
    ]);

    const toolbar = await page.find('pid-actions [role="toolbar"]');
    expect(toolbar).not.toBeNull();

    const ariaLabel = toolbar.getAttribute('aria-label');
    expect(ariaLabel).toBe('Available actions');
  });

  it('action links open in new tab', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'External', link: 'https://example.com', style: 'primary' },
    ]);

    const link = await page.find('pid-actions a');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('action links have accessible aria-label with new tab indicator', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'View Details', link: 'https://example.com', style: 'primary' },
    ]);

    const link = await page.find('pid-actions a');
    const ariaLabel = link.getAttribute('aria-label');
    expect(ariaLabel).toContain('View Details');
    expect(ariaLabel).toContain('opens in new tab');
  });

  it('renders action titles as text', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'Resolve DOI', link: 'https://doi.org/test', style: 'primary' },
      { priority: 2, title: 'View Metadata', link: 'https://example.com', style: 'secondary' },
    ]);

    const links = await page.findAll('pid-actions a');
    expect(links[0].textContent).toContain('Resolve DOI');
    expect(links[1].textContent).toContain('View Metadata');
  });

  it('has sr-only description for screen readers', async () => {
    const page = await newE2EPage();
    await createPageWithActions(page, [
      { priority: 1, title: 'Test', link: 'https://example.com', style: 'primary' },
    ]);

    const srOnly = await page.find('pid-actions .sr-only');
    expect(srOnly).not.toBeNull();
    expect(srOnly.textContent).toContain('new tabs');
  });
});
