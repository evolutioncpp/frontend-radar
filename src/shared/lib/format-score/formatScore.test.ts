import { describe, expect, test } from 'vitest';

import { formatScore, normalizeScore } from './formatScore';

describe('formatScore', () => {
  test('formats rounded score out of 100', () => {
    expect(formatScore(82.4)).toBe('82/100');
    expect(formatScore(82.6)).toBe('83/100');
  });

  test('supports custom max value', () => {
    expect(formatScore(7, { max: 10 })).toBe('7/10');
  });

  test('clamps score below zero', () => {
    expect(formatScore(-20)).toBe('0/100');
  });

  test('clamps score above max value', () => {
    expect(formatScore(140)).toBe('100/100');
  });

  test('formats non-finite values as zero', () => {
    expect(formatScore(Number.NaN)).toBe('0/100');
    expect(formatScore(Number.POSITIVE_INFINITY)).toBe('0/100');
  });
});

describe('normalizeScore', () => {
  test('normalizes score value', () => {
    expect(normalizeScore(82.4)).toBe(82);
    expect(normalizeScore(82.6)).toBe(83);
    expect(normalizeScore(-10)).toBe(0);
    expect(normalizeScore(120)).toBe(100);
  });
});
