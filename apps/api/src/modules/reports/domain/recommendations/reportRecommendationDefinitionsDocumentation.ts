import { isReadmeIncomplete } from './reportRecommendationHelpers.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addReadmeRecommendation = {
  id: 'add-readme',
  severity: 'medium',
  categories: ['documentation'],
  checkIds: ['readme'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Add a project README',
  description:
    'Add setup, usage and contribution notes so contributors can understand and run the project quickly.',
  action: 'Create a README with setup, usage and validation instructions for the frontend project.',
  isApplicable: (signals) => !signals.readme.exists,
  getSource: () => 'README.md',
} as const satisfies RecommendationDefinition;

export const improveReadmeRecommendation = {
  id: 'improve-readme',
  severity: 'medium',
  categories: ['documentation'],
  checkIds: ['readme-quality'],
  impactLevel: 'important',
  effort: 'small',
  title: 'Expand README setup and usage details',
  description:
    'Add installation/setup and usage/examples sections so the README explains how to run and validate the project.',
  action: 'Add setup and usage sections to the existing README.',
  isApplicable: (signals) => signals.readme.exists && isReadmeIncomplete(signals),
  getSource: (signals) => signals.readme.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const addEnvExampleRecommendation = {
  id: 'add-env-example',
  severity: 'low',
  categories: ['documentation', 'security'],
  checkIds: ['env-example', 'security-env-documentation'],
  impactLevel: 'supporting',
  effort: 'small',
  title: 'Document environment variables',
  description: 'Add an .env.example file so setup requirements are clear for contributors.',
  action: 'Create or update .env.example with safe placeholder values for required variables.',
  isApplicable: (signals, context) =>
    !signals.envExample.exists &&
    (context.enabledCategorySet.has('documentation') || signals.security.envUsage.found),
  getSource: () => '.env.example',
} as const satisfies RecommendationDefinition;
