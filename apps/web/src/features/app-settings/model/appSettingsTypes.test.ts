import { describe, expect, test } from 'vitest';

import {
  reportScoreCategoryOptionMap,
  reportScoreCategoryOptions,
  reportScoreCategoryOrder,
} from './appSettingsTypes';

describe('appSettingsTypes', () => {
  test('keeps metric options backed by exhaustive option metadata', () => {
    const categoriesFromMap = Object.keys(reportScoreCategoryOptionMap).sort();
    const categoriesFromOrder = [...reportScoreCategoryOrder].sort();

    expect(categoriesFromOrder).toEqual(categoriesFromMap);
    expect(new Set(reportScoreCategoryOrder).size).toBe(reportScoreCategoryOrder.length);
    expect(reportScoreCategoryOptions).toEqual(reportScoreCategoryOrder);
    expect(reportScoreCategoryOrder).toEqual([
      'documentation',
      'testing',
      'ci',
      'dependencies',
      'security',
      'maintainability',
      'performance',
      'accessibility',
    ]);
  });
});
