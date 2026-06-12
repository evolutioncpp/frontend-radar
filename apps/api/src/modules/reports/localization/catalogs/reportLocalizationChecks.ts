import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationChecks = {
  en: {
    'readme-exists': {
      label: 'README exists',
      description: 'README file was not found.',
    },
    'package-json-exists': {
      label: 'package.json exists',
      description: 'package.json was not found.',
    },
    'typescript-detected': {
      label: 'TypeScript detected',
      description: 'TypeScript configuration or dependency was not found.',
    },
    'lint-script-exists': {
      label: 'Lint script exists',
      description: 'package.json does not expose a lint script.',
    },
    'test-script-exists': {
      label: 'Test script exists',
      description: 'package.json does not expose a test script.',
    },
    'build-script-exists': {
      label: 'Build script exists',
      description: 'package.json does not expose a build script.',
    },
    'github-actions-exists': {
      label: 'GitHub Actions workflow exists',
      description: 'No GitHub Actions workflow was found.',
    },
    'env-example-exists': {
      label: 'Environment example exists',
      description: 'No environment example file was found.',
    },
  },
  ru: {
    'readme-exists': {
      label: 'README найден',
      description: 'README-файл не найден.',
    },
    'package-json-exists': {
      label: 'package.json найден',
      description: 'package.json не найден.',
    },
    'typescript-detected': {
      label: 'TypeScript обнаружен',
      description: 'Конфигурация или зависимость TypeScript не найдена.',
    },
    'lint-script-exists': {
      label: 'Скрипт lint найден',
      description: 'В package.json нет скрипта lint.',
    },
    'test-script-exists': {
      label: 'Скрипт test найден',
      description: 'В package.json нет скрипта test.',
    },
    'build-script-exists': {
      label: 'Скрипт build найден',
      description: 'В package.json нет скрипта build.',
    },
    'github-actions-exists': {
      label: 'Workflow GitHub Actions найден',
      description: 'Workflow GitHub Actions не найден.',
    },
    'env-example-exists': {
      label: 'Пример переменных окружения найден',
      description: 'Файл с примером переменных окружения не найден.',
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['checks']>;
