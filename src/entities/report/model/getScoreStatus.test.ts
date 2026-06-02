import { describe, expect, test } from 'vitest';

import { getScoreStatus } from './getScoreStatus';

describe('getScoreStatus', () => {
  test('returns excellent for score greater than or equal to 90', () => {
    expect(getScoreStatus(90)).toBe('excellent');
    expect(getScoreStatus(100)).toBe('excellent');
  });

  test('returns good for score from 75 to 89', () => {
    expect(getScoreStatus(75)).toBe('good');
    expect(getScoreStatus(89)).toBe('good');
  });

  test('returns warning for score from 50 to 74', () => {
    expect(getScoreStatus(50)).toBe('warning');
    expect(getScoreStatus(74)).toBe('warning');
  });

  test('returns critical for score below 50', () => {
    expect(getScoreStatus(0)).toBe('critical');
    expect(getScoreStatus(49)).toBe('critical');
  });
});
