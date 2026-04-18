import type { TestRunnerConfig } from '@storybook/test-runner';
import { getViolations, injectAxe } from 'axe-playwright';
import fs from 'fs';
import path from 'path';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    // Run axe-core accessibility audit on every story.
    const violations = await getViolations(page, '#storybook-root', {
      rules: {
        // Color contrast checks can be unreliable with shadow DOM
        'color-contrast': { enabled: false },
        // Region landmark rule is too strict for isolated component stories
        'region': { enabled: false },
      },
    });

    const storyId = context.id || 'unknown';

    // Read baseline
    const baselinePath = path.resolve(process.cwd(), '.storybook', 'a11y-baseline.json');
    let baseline: Record<string, number> = {};
    if (fs.existsSync(baselinePath)) {
      baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    }

    const previousViolations = baseline[storyId] || 0;

    if (violations.length > 0) {
      console.warn(
        `[a11y] ${violations.length} violation(s) in "${storyId}":\n` +
        violations.map(v => `  - ${v.id}: ${v.description} (${v.impact})`).join('\n'),
      );
    }

    if (process.env.UPDATE_A11Y_BASELINE === 'true') {
      baseline[storyId] = violations.length;
      fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
    } else if (violations.length > previousViolations) {
      throw new Error(
        `A11y regressions detected in "${storyId}": Violations increased from ${previousViolations} to ${violations.length}. ` +
        `Please fix the new issues or update the baseline file if unavoidable.`,
      );
    }
  },
};

export default config;
