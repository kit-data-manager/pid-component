import { newSpecPage } from '@stencil/core/testing';
import { ColorHighlight } from '../../../components/color-highlight/color-highlight';

describe('color-highlight', () => {
  it('renders with text prop', async () => {
    const page = await newSpecPage({
      components: [ColorHighlight],
      html: '<color-highlight text="DOI"></color-highlight>',
    });
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('COLOR-HIGHLIGHT');
  });

  it('displays the text content', async () => {
    const page = await newSpecPage({
      components: [ColorHighlight],
      html: '<color-highlight text="Handle"></color-highlight>',
    });
    const span = page.root.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent).toBe('Handle');
  });

  it('applies a color style to the span', async () => {
    const page = await newSpecPage({
      components: [ColorHighlight],
      html: '<color-highlight text="ORCID"></color-highlight>',
    });
    const span = page.root.querySelector('span');
    expect(span).toBeTruthy();
    const style = span.getAttribute('style');
    expect(style).toContain('color:');
    expect(style).toContain('hsl(');
  });

  it('sets the text prop correctly', async () => {
    const page = await newSpecPage({
      components: [ColorHighlight],
      html: '<color-highlight text="TestValue"></color-highlight>',
    });
    expect(page.rootInstance.text).toBe('TestValue');
  });
});
