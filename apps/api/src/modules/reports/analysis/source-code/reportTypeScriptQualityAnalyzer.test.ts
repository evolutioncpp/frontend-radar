import { describe, expect, it } from 'vitest';

import {
  analyzeTypeScriptQuality,
  getRelatedTsconfigPaths,
} from './reportTypeScriptQualityAnalyzer.js';

describe('analyzeTypeScriptQuality', () => {
  it('reads strict compiler options and project typecheck script', () => {
    const signals = analyzeTypeScriptQuality({
      isNestedProject: false,
      projectPackageJson: {
        scripts: {
          typecheck: 'tsc --noEmit',
        },
      },
      projectPackageJsonPath: 'package.json',
      rootPackageJson: null,
      tsconfigFiles: [
        {
          path: 'tsconfig.json',
          scope: 'project',
          content: JSON.stringify({
            compilerOptions: {
              noUncheckedIndexedAccess: true,
              strict: true,
            },
            include: ['src'],
          }),
        },
      ],
    });

    expect(signals.config).toMatchObject({
      configPaths: ['tsconfig.json'],
      exists: true,
      noUncheckedIndexedAccess: true,
      path: 'tsconfig.json',
      strict: true,
    });
    expect(signals.typecheck).toMatchObject({
      exists: true,
      scope: 'project',
      source: 'package.json scripts.typecheck',
    });
  });

  it('inherits strict compiler options from local extends', () => {
    const signals = analyzeTypeScriptQuality({
      isNestedProject: false,
      projectPackageJson: null,
      projectPackageJsonPath: null,
      rootPackageJson: null,
      tsconfigFiles: [
        {
          path: 'tsconfig.base.json',
          scope: 'project',
          content: JSON.stringify({
            compilerOptions: {
              strict: true,
            },
          }),
        },
        {
          path: 'tsconfig.json',
          scope: 'project',
          content: JSON.stringify({
            extends: './tsconfig.base.json',
            compilerOptions: {
              noUncheckedIndexedAccess: true,
            },
            include: ['src'],
          }),
        },
      ],
    });

    expect(signals.config).toMatchObject({
      strict: true,
      noUncheckedIndexedAccess: true,
    });
  });

  it('does not let missing referenced configs silently pass strictness', () => {
    const signals = analyzeTypeScriptQuality({
      isNestedProject: false,
      missingTsconfigPaths: ['tsconfig.app.json'],
      projectPackageJson: null,
      projectPackageJsonPath: null,
      rootPackageJson: null,
      tsconfigFiles: [
        {
          path: 'tsconfig.json',
          scope: 'project',
          content: JSON.stringify({
            references: [{ path: './tsconfig.app.json' }],
          }),
        },
      ],
    });

    expect(signals.config).toMatchObject({
      hasMissingConfig: true,
      parseError: true,
      strict: null,
    });
  });

  it('does not let tooling configs lower strictness when source configs are strict', () => {
    const signals = analyzeTypeScriptQuality({
      isNestedProject: false,
      projectPackageJson: null,
      projectPackageJsonPath: null,
      rootPackageJson: null,
      tsconfigFiles: [
        {
          path: 'tsconfig.app.json',
          scope: 'project',
          content: JSON.stringify({
            compilerOptions: {
              strict: true,
            },
          }),
        },
        {
          path: 'tsconfig.node.json',
          scope: 'project',
          content: JSON.stringify({
            compilerOptions: {
              strict: false,
            },
          }),
        },
      ],
    });

    expect(signals.config).toMatchObject({
      path: 'tsconfig.app.json',
      strict: true,
    });
  });

  it('marks unreadable local extends as unknown instead of passed', () => {
    const signals = analyzeTypeScriptQuality({
      isNestedProject: false,
      missingTsconfigPaths: ['tsconfig.base.json'],
      projectPackageJson: null,
      projectPackageJsonPath: null,
      rootPackageJson: null,
      tsconfigFiles: [
        {
          path: 'tsconfig.app.json',
          scope: 'project',
          content: JSON.stringify({
            extends: './tsconfig.base.json',
            compilerOptions: {},
          }),
        },
      ],
    });

    expect(signals.config).toMatchObject({
      hasMissingConfig: true,
      strict: null,
    });
  });

  it('uses root typecheck script as fallback for nested projects', () => {
    const signals = analyzeTypeScriptQuality({
      isNestedProject: true,
      projectPackageJson: {
        scripts: {},
      },
      projectPackageJsonPath: 'apps/web/package.json',
      rootPackageJson: {
        scripts: {
          'check:types': 'tsc -b --noEmit',
        },
      },
      tsconfigFiles: [],
    });

    expect(signals.typecheck).toMatchObject({
      exists: true,
      scope: 'root',
      source: 'package.json scripts.check:types',
    });
  });

  it('uses referenced tsconfig files for strictness evaluation', () => {
    const rootTsconfig = {
      path: 'apps/web/tsconfig.json',
      scope: 'project' as const,
      content: JSON.stringify({
        files: [],
        references: [{ path: './tsconfig.app.json' }, { path: './tsconfig.node.json' }],
      }),
    };

    expect(getRelatedTsconfigPaths(rootTsconfig).paths).toEqual([
      'apps/web/tsconfig.app.json',
      'apps/web/tsconfig.node.json',
    ]);

    const signals = analyzeTypeScriptQuality({
      isNestedProject: true,
      projectPackageJson: {
        scripts: {
          build: 'tsc -b && vite build',
        },
      },
      projectPackageJsonPath: 'apps/web/package.json',
      tsconfigFiles: [
        rootTsconfig,
        {
          path: 'apps/web/tsconfig.app.json',
          scope: 'project',
          content: JSON.stringify({
            compilerOptions: {
              strict: true,
            },
          }),
        },
        {
          path: 'apps/web/tsconfig.node.json',
          scope: 'project',
          content: JSON.stringify({
            compilerOptions: {
              noImplicitAny: true,
              strictNullChecks: true,
            },
          }),
        },
      ],
      rootPackageJson: null,
    });

    expect(signals.config).toMatchObject({
      exists: true,
      path: 'apps/web/tsconfig.app.json',
      strict: true,
    });
  });
});
