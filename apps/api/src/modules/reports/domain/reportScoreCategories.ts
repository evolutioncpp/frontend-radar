import { scoreCategories } from './reportSchemas.js';

import type { ScoreCategory } from './reportSchemas.js';

export const defaultEnabledScoreCategories = [...scoreCategories] satisfies ScoreCategory[];

export const defaultScoreCategoriesKey = defaultEnabledScoreCategories.join(',');

const scoreCategorySet = new Set<ScoreCategory>(scoreCategories);

export const normalizeEnabledScoreCategories = (
  categories?: readonly unknown[] | null,
): ScoreCategory[] => {
  if (!categories || categories.length === 0) {
    return [...defaultEnabledScoreCategories];
  }

  const requestedCategories = new Set(
    categories.filter(
      (category): category is ScoreCategory =>
        typeof category === 'string' && scoreCategorySet.has(category as ScoreCategory),
    ),
  );
  const normalizedCategories = scoreCategories.filter((category) =>
    requestedCategories.has(category),
  );

  return normalizedCategories.length > 0
    ? normalizedCategories
    : [...defaultEnabledScoreCategories];
};

export const createScoreCategoriesKey = (categories?: readonly ScoreCategory[] | null): string => {
  return normalizeEnabledScoreCategories(categories).join(',');
};
