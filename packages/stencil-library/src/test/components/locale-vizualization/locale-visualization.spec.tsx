import { newSpecPage } from '@stencil/core/testing';
import { LocaleVisualization } from '../../../components/locale-vizualization/locale-visualization';
import { checkA11y } from '../../axe-helper';

describe('locale-visualization', () => {
  it('renders with locale prop', async () => {
    const page = await newSpecPage({
      components: [LocaleVisualization],
      html: '<locale-visualization locale="en"></locale-visualization>',
    });
    expect(page.root).toBeTruthy();
    expect(page.root.tagName).toBe('LOCALE-VISUALIZATION');
  });

  it('sets the locale prop correctly', async () => {
    const page = await newSpecPage({
      components: [LocaleVisualization],
      html: '<locale-visualization locale="de"></locale-visualization>',
    });
    expect(page.rootInstance.locale).toBe('de');
  });

  it('displays locale information in a span', async () => {
    const page = await newSpecPage({
      components: [LocaleVisualization],
      html: '<locale-visualization locale="en"></locale-visualization>',
    });
    const span = page.root.querySelector('span');
    expect(span).toBeTruthy();
    expect(span.textContent.length).toBeGreaterThan(0);
  });

  it('showFlag defaults to true', async () => {
    const page = await newSpecPage({
      components: [LocaleVisualization],
      html: '<locale-visualization locale="en"></locale-visualization>',
    });
    expect(page.rootInstance.showFlag).toBe(true);
  });
});

describe('locale-visualization accessibility', () => {
  it('has no a11y violations', async () => {
    const page = await newSpecPage({
      components: [LocaleVisualization],
      html: '<locale-visualization locale="en"></locale-visualization>',
    });
    await checkA11y(page.root.outerHTML);
  });
});
