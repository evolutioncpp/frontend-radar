export const REPORT_ANALYSIS_VERSION = 1;

export const reportHistoryLimit = 50;

export const githubApiVersion = '2022-11-28';

export const githubRequestTimeoutMs = 10_000;

export const repositorySignalConfig = {
  a11yDependencies: ['eslint-plugin-jsx-a11y', '@axe-core/react', 'axe-core'],
  bundlerDependencies: ['vite', 'webpack', 'parcel', 'next', 'react-scripts'],
  envExamplePaths: ['.env.example', '.env.sample', 'env.example'],
  lockfilePaths: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'],
  readmePaths: ['README.md', 'README', 'readme.md'],
  storybookDependencies: ['storybook', '@storybook/react', '@storybook/react-vite'],
  storybookPaths: [
    '.storybook/main.ts',
    '.storybook/main.js',
    '.storybook/main.cjs',
    '.storybook/main.mjs',
  ],
  testingDependencies: ['@testing-library/react', 'vitest', 'jest', 'playwright'],
  typescriptDependencies: ['typescript', '@types/react', 'ts-node'],
  typescriptPaths: ['tsconfig.json', 'jsconfig.json'],
  workflowsPath: '.github/workflows',
} as const;

export const scoreThresholds = {
  critical: 0,
  warning: 50,
  good: 70,
  excellent: 90,
} as const;
