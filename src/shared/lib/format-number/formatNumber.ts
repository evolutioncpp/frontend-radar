export interface FormatNumberOptions {
  locale?: string | string[];
  compactFrom?: number;
  maximumFractionDigits?: number;
}

export const formatNumber = (value: number, options: FormatNumberOptions = {}) => {
  const { locale = 'en-US', compactFrom = 10_000, maximumFractionDigits = 1 } = options;

  if (!Number.isFinite(value)) {
    return '0';
  }

  const shouldUseCompactNotation = Math.abs(value) >= compactFrom;

  return new Intl.NumberFormat(locale, {
    notation: shouldUseCompactNotation ? 'compact' : 'standard',
    maximumFractionDigits,
  }).format(value);
};
