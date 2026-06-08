import { describe, expect, test } from 'vitest';

import { formatDate } from './formatDate';

const localDate = new Date(2026, 5, 2);
const isoDate = '2026-06-02T00:00:00.000Z';

describe('formatDate', () => {
  test('formats date for English locale', () => {
    expect(formatDate(localDate, 'en')).toBe('June 2, 2026');
  });

  test('formats date for Russian locale', () => {
    expect(formatDate(localDate, 'ru')).toBe('2 \u0438\u044e\u043d\u044f 2026 \u0433.');
  });

  test('supports custom date format options', () => {
    expect(
      formatDate(isoDate, 'en', {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC',
      }),
    ).toBe('Jun 02');
  });
});
