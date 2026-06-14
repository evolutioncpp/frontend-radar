import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const addBuildScriptRecommendation = {
  id: 'add-build-script',
  severity: 'high',
  categories: ['performance'],
  checkIds: ['build-script'],
  impactLevel: 'key',
  effort: 'small',
  title: 'Add a production build script',
  description:
    'Expose a build script in package.json so CI can verify that the frontend compiles before delivery.',
  action: 'Add a package.json build script that creates a production frontend bundle.',
  isApplicable: (signals) =>
    signals.packageJson.exists && !signals.packageJson.scripts.build.exists,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;

export const addBundlerRecommendation = {
  id: 'add-bundler',
  severity: 'medium',
  categories: ['performance'],
  checkIds: ['bundler'],
  impactLevel: 'important',
  effort: 'medium',
  title: 'Declare frontend build tooling',
  description:
    'Add or expose a frontend bundler such as Vite, Next.js, Webpack or Parcel so build readiness is easier to verify.',
  action: 'Declare the frontend bundler in package metadata or config files.',
  isApplicable: (signals) => signals.packageJson.exists && !signals.bundler.found,
  getSource: (signals) => signals.packageJson.path ?? undefined,
} as const satisfies RecommendationDefinition;
