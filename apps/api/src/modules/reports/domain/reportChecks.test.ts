import { describe, expect, it } from 'vitest';

import { buildChecks } from './reportChecks.js';

import type { ScoreCategory } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignalContracts.js';

const createSignals = (overrides: Partial<RepositorySignals> = {}): RepositorySignals =>
  ({
    readme: {
      exists: true,
    },
    packageJson: {
      exists: true,
      scripts: {
        build: {
          exists: true,
        },
        lint: {
          exists: true,
        },
        test: {
          exists: true,
        },
      },
    },
    typescript: {
      found: true,
    },
    ci: {
      exists: true,
    },
    envExample: {
      exists: true,
    },
    ...overrides,
  }) as RepositorySignals;

const getCheckIds = (categories?: readonly ScoreCategory[]) => {
  return buildChecks(createSignals(), categories).map((check) => check.id);
};

describe('buildChecks', () => {
  it('returns all legacy checks for default categories', () => {
    expect(getCheckIds()).toEqual([
      'readme-exists',
      'package-json-exists',
      'typescript-detected',
      'lint-script-exists',
      'test-script-exists',
      'build-script-exists',
      'github-actions-exists',
      'env-example-exists',
    ]);
  });

  it('treats empty categories as the default category set', () => {
    expect(getCheckIds([])).toEqual(getCheckIds());
  });

  it('returns documentation checks when documentation is enabled', () => {
    expect(getCheckIds(['documentation'])).toEqual(['readme-exists', 'env-example-exists']);
  });

  it('returns CI checks when CI is enabled', () => {
    expect(getCheckIds(['ci'])).toEqual(['github-actions-exists']);
  });

  it('returns only environment example from legacy checks when security is enabled', () => {
    expect(getCheckIds(['security'])).toEqual(['env-example-exists']);
  });

  it('returns package metadata and test script checks when testing is enabled', () => {
    expect(getCheckIds(['testing'])).toEqual(['package-json-exists', 'test-script-exists']);
  });
});
