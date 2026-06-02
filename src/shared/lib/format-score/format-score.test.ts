import { formatScore } from './format-score';

describe('formatScore', () => {
  test('formats rounded score out of 100', () => {
    expect(formatScore(82.4)).toBe('82/100');
    expect(formatScore(82.6)).toBe('83/100');
  });
});
