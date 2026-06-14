import { firstToolingSource } from './reportRecommendationHelpers.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addA11yToolingRecommendation = {
  id: 'add-a11y-tooling',
  severity: 'medium',
  categories: ['accessibility'],
  checkIds: ['a11y-tooling'],
  impactLevel: 'important',
  effort: 'medium',
  title: 'Add accessibility checks',
  description:
    'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
  action: 'Add accessibility linting or test tooling and wire it into regular frontend checks.',
  isApplicable: (signals) => !signals.a11yTooling.found,
  getSource: (signals) => firstToolingSource(signals.a11yTooling.sources),
} as const satisfies RecommendationDefinition;
