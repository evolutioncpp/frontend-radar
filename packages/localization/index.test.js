import { describe, expect, test } from 'vitest';

import {
  defaultLanguage,
  getPreferredSupportedLanguage,
  normalizeSupportedLanguage,
  supportedLanguages,
} from './index.js';

describe('localization helpers', () => {
  test('exposes supported languages and default language', () => {
    expect(supportedLanguages).toEqual(['en', 'ru']);
    expect(defaultLanguage).toBe('en');
  });

  test.each([
    ['en', 'en'],
    ['en-US', 'en'],
    ['ru', 'ru'],
    ['ru-RU', 'ru'],
    ['FR', 'en'],
    ['', 'en'],
    [null, 'en'],
  ])('normalizes %s to %s', (value, expectedLanguage) => {
    expect(normalizeSupportedLanguage(value)).toBe(expectedLanguage);
  });

  test.each([
    ['ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7', 'ru'],
    ['fr-CA,fr;q=0.9,en;q=0.8', 'en'],
    ['de;q=0.9,ru;q=0.8,en;q=0.7', 'ru'],
    ['ru;q=0,en;q=0.5', 'en'],
    ['unknown', 'en'],
    [undefined, 'en'],
  ])('selects preferred supported language from %s', (value, expectedLanguage) => {
    expect(getPreferredSupportedLanguage(value)).toBe(expectedLanguage);
  });
});
