import { describe, expect, test } from 'vitest';

import { formatNumber } from './formatNumber';

describe('formatNumber', () => {
  test('formats regular numbers', () => {
    expect(formatNumber(128)).toBe('128');
    expect(formatNumber(9999)).toBe('9,999');
  });

  test('formats large numbers with compact notation', () => {
    expect(formatNumber(12800)).toBe('12.8K');
    expect(formatNumber(235000)).toBe('235K');
  });

  test('supports custom compact threshold', () => {
    expect(formatNumber(1200, { compactFrom: 1000 })).toBe('1.2K');
  });

  test('supports negative numbers', () => {
    expect(formatNumber(-12800)).toBe('-12.8K');
  });

  test('returns zero for non-finite values', () => {
    expect(formatNumber(Number.NaN)).toBe('0');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('0');
  });
});
