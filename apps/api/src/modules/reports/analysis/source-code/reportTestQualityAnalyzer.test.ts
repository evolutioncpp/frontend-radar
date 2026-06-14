import { describe, expect, it } from 'vitest';

import { analyzeTestQuality } from './reportTestQualityAnalyzer.js';

import type { PackageJson } from '../../infrastructure/github/githubRepositoryReader.js';

const packageJson = {
  scripts: {
    test: 'vitest run',
    'test:coverage': 'vitest run',
  },
} satisfies PackageJson;

describe('analyzeTestQuality', () => {
  it('classifies test files and coverage signals', () => {
    const signals = analyzeTestQuality({
      files: [
        {
          path: 'apps/web/src/App.test.tsx',
          kind: 'test',
          content: "import { render } from '@testing-library/react';",
        },
        {
          path: 'apps/web/e2e/home.spec.ts',
          kind: 'e2e',
          content: "test('home page', async ({ page }) => {})",
        },
        {
          path: 'apps/web/vitest.config.ts',
          kind: 'config',
          content: 'coverage: { provider: "v8" }',
        },
      ],
      isTruncated: false,
      isNestedProject: false,
      projectPackageJson: packageJson,
      projectPackageJsonPath: 'apps/web/package.json',
      rootPackageJson: null,
    });

    expect(signals.files).toMatchObject({
      componentCount: 1,
      count: 2,
      e2eCount: 1,
      unitCount: 1,
    });
    expect(signals.coverage).toMatchObject({
      found: true,
      scope: 'project',
      sources: ['apps/web/package.json scripts.test:coverage', 'apps/web/vitest.config.ts'],
    });
  });

  it('uses root coverage scripts as partial monorepo fallback', () => {
    const signals = analyzeTestQuality({
      files: [],
      isTruncated: false,
      isNestedProject: true,
      projectPackageJson: { scripts: { test: 'vitest run' } },
      projectPackageJsonPath: 'apps/web/package.json',
      rootPackageJson: { scripts: { coverage: 'vitest --coverage' } },
    });

    expect(signals.coverage).toMatchObject({
      found: true,
      scope: 'root',
      sources: ['package.json scripts.coverage'],
    });
  });
});
