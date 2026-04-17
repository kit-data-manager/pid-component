import type { TestRunnerConfig } from '@storybook/test-runner';
import { getViolations, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    // Run axe-core accessibility audit on every story.
    // We use getViolations() instead of checkA11y() so that violations
    // are reported as warnings, not test failures. This lets us track
    // a11y issues incrementally without blocking CI.
    // Switch to checkA11y() once all violations are resolved.
    const violations = await getViolations(page, '#storybook-root', {
      rules: {
        // Color contrast checks can be unreliable with shadow DOM
        'color-contrast': { enabled: false },
        // Region landmark rule is too strict for isolated component stories
        'region': { enabled: false },
      },
    });

    if (violations.length > 0) {
      const storyId = context.id || 'unknown';
      console.warn(
        `[a11y] ${violations.length} violation(s) in "${storyId}":\n` +
        violations.map(v => `  - ${v.id}: ${v.description} (${v.impact})`).join('\n'),
      );
    }
  },
};

export default config;
