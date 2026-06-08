export interface FormatScoreOptions {
  max?: number;
}

export const normalizeScore = (score: number, max = 100) => {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(score), 0), max);
};

export const formatScore = (score: number, options: FormatScoreOptions = {}) => {
  const { max = 100 } = options;
  const normalizedScore = normalizeScore(score, max);

  return `${normalizedScore}/${max}`;
};
