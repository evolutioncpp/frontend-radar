export const REPORT_ANALYSIS_VERSION = 1;

export const reportHistoryLimit = 50;

export const githubApiVersion = '2022-11-28';

export const githubRequestTimeoutMs = 10_000;

export const repositorySignalConfig = {
  a11yDependencies: ['eslint-plugin-jsx-a11y', '@axe-core/react', 'axe-core'],
  accessibilityConfigPaths: ['axe.config.js', 'axe.config.ts', 'pa11yci.json', '.pa11yci'],
  bundlerDependencies: ['vite', 'webpack', 'parcel', 'next', 'react-scripts'],
  bundlerConfigPaths: [
    'vite.config.ts',
    'vite.config.js',
    'vite.config.mts',
    'vite.config.mjs',
    'webpack.config.ts',
    'webpack.config.js',
    'webpack.config.cjs',
    'next.config.ts',
    'next.config.js',
    'next.config.mjs',
  ],
  formattingDependencies: ['prettier', 'dprint', 'biome', '@biomejs/biome'],
  formattingConfigPaths: [
    'prettier.config.js',
    'prettier.config.cjs',
    'prettier.config.mjs',
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    'biome.json',
    'biome.jsonc',
    'dprint.json',
  ],
  envExamplePaths: ['.env.example', '.env.sample', 'env.example'],
  frameworkConfigPaths: [
    'next.config.ts',
    'next.config.js',
    'next.config.mjs',
    'svelte.config.js',
    'svelte.config.ts',
    'nuxt.config.ts',
    'nuxt.config.js',
    'astro.config.ts',
    'astro.config.mjs',
    'angular.json',
  ],
  frameworkDependencies: [
    'react',
    'react-dom',
    'vue',
    '@vue/runtime-dom',
    'svelte',
    '@sveltejs/kit',
    '@angular/core',
    'next',
  ],
  frontendDependencies: [
    'react',
    'react-dom',
    'vue',
    '@vue/runtime-dom',
    'svelte',
    '@sveltejs/kit',
    '@angular/core',
    'next',
    'vite',
    'webpack',
    'parcel',
    'react-scripts',
  ],
  frontendPathSegments: ['web', 'frontend', 'client', 'app', 'ui'],
  frontendProjectPaths: ['apps/web', 'web', 'frontend', 'client', 'app'],
  lintingDependencies: ['eslint', '@eslint/js', 'typescript-eslint', '@biomejs/biome', 'biome'],
  lintingConfigPaths: [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
    '.eslintrc',
    '.eslintrc.json',
    '.eslintrc.yaml',
    '.eslintrc.yml',
    '.eslintrc.js',
    '.eslintrc.cjs',
    'biome.json',
    'biome.jsonc',
  ],
  lockfilePaths: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lock', 'bun.lockb'],
  readmePaths: ['README.md', 'README', 'readme.md'],
  storybookDependencies: ['storybook', '@storybook/react', '@storybook/react-vite'],
  storybookPaths: [
    '.storybook/main.ts',
    '.storybook/main.js',
    '.storybook/main.cjs',
    '.storybook/main.mjs',
  ],
  testingDependencies: ['@testing-library/react', 'vitest', 'jest', 'playwright'],
  testingConfigPaths: [
    'vitest.config.ts',
    'vitest.config.js',
    'vitest.config.mts',
    'vitest.config.mjs',
    'jest.config.ts',
    'jest.config.js',
    'jest.config.cjs',
    'playwright.config.ts',
    'playwright.config.js',
  ],
  typescriptDependencies: ['typescript', '@types/react', 'ts-node'],
  typescriptPaths: ['tsconfig.json', 'jsconfig.json'],
  workflowsPath: '.github/workflows',
} as const;

export const dependencyAnalysisConfig = {
  devOnlyDependencyNames: [
    '@biomejs/biome',
    '@eslint/js',
    '@storybook/react',
    '@storybook/react-vite',
    '@types/react',
    'biome',
    'dprint',
    'eslint',
    'eslint-plugin-jsx-a11y',
    'jest',
    'playwright',
    'prettier',
    'storybook',
    'ts-node',
    'typescript',
    'typescript-eslint',
    'vitest',
  ],
  devOnlyDependencyPrefixes: ['@types/'],
  packageManagerByLockfile: {
    'bun.lock': 'bun',
    'bun.lockb': 'bun',
    'package-lock.json': 'npm',
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
  },
} as const;

export const ciWorkflowAnalysisConfig = {
  buildCommandPatterns: [
    /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?build\b/i,
    /\b(?:vite|next|webpack|parcel|react-scripts)\s+build\b/i,
  ],
  cachePatterns: [/\bactions\/cache\b/i, /\bsetup-node\b[\s\S]*?\bcache\s*:/i],
  installCommandPatterns: [
    /\bnpm\s+ci\b/i,
    /\bnpm\s+install\b/i,
    /\bpnpm\s+install\b/i,
    /\byarn\s+install\b/i,
    /\bbun\s+install\b/i,
  ],
  limit: 10,
  lintCommandPatterns: [/\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?lint\b/i, /\b(?:eslint|biome)\b/i],
  priorityNamePatterns: [/ci/i, /check/i, /test/i, /lint/i, /build/i, /pr/i, /quality/i],
  pullRequestTriggerPatterns: [/\bpull_request\b/i, /\bpull-request\b/i],
  pushTriggerPatterns: [/\bpush\b/i],
  testCommandPatterns: [
    /\b(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?test\b/i,
    /\b(?:vitest|jest)\b/i,
    /\bplaywright\s+test\b/i,
  ],
} as const;

export const readmeQualityConfig = {
  installSectionPatterns: [
    /\binstallation\b/i,
    /\binstall\b/i,
    /\bsetup\b/i,
    /\bgetting started\b/i,
    /\bquick start\b/i,
  ],
  minLength: 600,
  usageSectionPatterns: [/\busage\b/i, /\bexample\b/i, /\bexamples\b/i, /\bapi\b/i],
} as const;

export const sourcePreviewConfig = {
  workflowPreviewLimit: 3,
} as const;

export const sourceCodeAnalysisConfig = {
  codeHealthIssueWarnThreshold: 3,
  codeHealthIssueFailThreshold: 12,
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'],
  ignoredDirectoryNames: [
    '.next',
    '.nuxt',
    '.vite',
    'build',
    'coverage',
    'dist',
    'node_modules',
    'storybook-static',
  ],
  ignoredFilePatterns: [/\.d\.ts$/iu, /generatedApi\.(?:t|j)s$/iu],
  maxDepth: 6,
  maxFileSizeBytes: 80_000,
  maxFiles: 120,
  sourcePreviewLimit: 4,
  tsconfigMaxDepth: 4,
  tsconfigMaxFiles: 16,
  tsconfigMaxRelatedPaths: 8,
} as const;

export const scoreThresholds = {
  critical: 0,
  warning: 50,
  good: 70,
  excellent: 90,
} as const;

export const scoreCategoryWeights = {
  accessibility: 12,
  ci: 18,
  dependencies: 14,
  documentation: 10,
  maintainability: 16,
  performance: 12,
  testing: 18,
} as const;

export const scoreCaps = {
  criticalMissingCheck: 49,
  warningKeyCheck: 89,
} as const;

export const scoreImpactWeightThresholds = {
  important: 14,
  key: 18,
} as const;
