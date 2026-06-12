import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationScoreChecks = {
  en: {
    'a11y-tooling': {
      label: 'Accessibility tooling',
      descriptions: {
        found: 'Accessibility-focused tooling was found in dependencies.',
        missing: 'No accessibility-focused dependency was found.',
      },
    },
    'build-script': {
      label: 'Build script',
      descriptions: {
        found: 'package.json exposes a build script.',
        missing: 'package.json does not expose a build script.',
      },
    },
    bundler: {
      label: 'Frontend bundler',
      descriptions: {
        found: 'A common frontend bundler dependency was found.',
        missing: 'No common frontend bundler dependency was found.',
      },
    },
    'env-example': {
      label: 'Environment example',
      descriptions: {
        found: 'An environment example file was found.',
        missing: 'No environment example file was found.',
      },
    },
    'github-actions': {
      label: 'GitHub Actions workflow',
      descriptions: {
        found: 'A GitHub Actions workflow directory was found.',
        warning: 'GitHub Actions workflows were found, but their contents could not be analyzed.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'ci-build-step': {
      label: 'CI build step',
      descriptions: {
        found: 'GitHub Actions runs the build step.',
        warning: 'No build step was detected in analyzed workflows.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'ci-install-step': {
      label: 'CI install step',
      descriptions: {
        found: 'GitHub Actions installs dependencies.',
        warning: 'No dependency installation step was detected in analyzed workflows.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'ci-lint-step': {
      label: 'CI lint step',
      descriptions: {
        found: 'GitHub Actions runs linting.',
        warning: 'No lint step was detected in analyzed workflows.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'ci-pr-trigger': {
      label: 'Pull request CI trigger',
      descriptions: {
        found: 'GitHub Actions runs on pull requests.',
        warning: 'No pull request trigger was detected in analyzed workflows.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'ci-project-scope': {
      label: 'CI project scope',
      descriptions: {
        found: 'Workflow scope matches repository root or selected frontend path.',
        warning: 'Analyzed workflows do not clearly target the selected frontend path.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'ci-test-step': {
      label: 'CI test step',
      descriptions: {
        found: 'GitHub Actions runs tests.',
        warning: 'No test step was detected in analyzed workflows.',
        missing: 'No GitHub Actions workflow was found.',
      },
    },
    'lint-script': {
      label: 'Lint script',
      descriptions: {
        found: 'package.json exposes a lint script.',
        missing: 'package.json does not expose a lint script.',
      },
    },
    lockfile: {
      label: 'Package lockfile',
      descriptions: {
        found: 'A package lockfile was found.',
        warning: 'Only a root-level package lockfile was found.',
        missing: 'No package lockfile was found.',
      },
    },
    'lockfile-consistency': {
      label: 'Lockfile consistency',
      descriptions: {
        found: 'Lockfiles point to one package manager.',
        warning: 'Multiple package manager lockfiles were found.',
        missing: 'No package lockfile was found.',
      },
    },
    'package-manager': {
      label: 'Package manager',
      descriptions: {
        found: 'Package manager was detected from lockfile or package metadata.',
        warning: 'package.json packageManager does not match the detected lockfile.',
        missing: 'Package manager was not detected.',
      },
    },
    'package-json': {
      label: 'package.json',
      descriptions: {
        found: 'package.json was found.',
        missing: 'package.json was not found.',
      },
    },
    'dependency-hygiene': {
      label: 'Dependency hygiene',
      descriptions: {
        found: 'No dev-only tooling dependencies were found in production dependencies.',
        warning: 'Dev-only tooling dependencies were found in production dependencies.',
      },
    },
    readme: {
      label: 'README',
      descriptions: {
        found: 'README file was found.',
        missing: 'README file was not found.',
        warning: 'README was found, but it is short or misses setup and usage details.',
      },
    },
    'readme-quality': {
      label: 'README quality',
      descriptions: {
        found: 'README includes setup and usage details.',
        warning: 'README was found, but it is short or misses setup and usage details.',
        missing: 'README quality could not be evaluated because README was not found.',
      },
    },
    storybook: {
      label: 'Storybook',
      descriptions: {
        found: 'Storybook configuration or dependency was found.',
        missing: 'Storybook configuration or dependency was not found.',
      },
    },
    'test-script': {
      label: 'Test script',
      descriptions: {
        found: 'package.json exposes a test script.',
        missing: 'package.json does not expose a test script.',
      },
    },
    'testing-library': {
      label: 'Testing Library',
      descriptions: {
        found: 'A common frontend testing dependency was found.',
        missing: 'No common frontend testing dependency was found.',
      },
    },
    typescript: {
      label: 'TypeScript',
      descriptions: {
        found: 'TypeScript configuration or dependency was found.',
        missing: 'TypeScript configuration or dependency was not found.',
      },
    },
    linting: {
      label: 'Linting tooling',
      descriptions: {
        found: 'Linting configuration or dependency was found.',
        warning: 'Only root-level linting tooling was found.',
        missing: 'Linting configuration or dependency was not found.',
      },
    },
    formatting: {
      label: 'Formatting tooling',
      descriptions: {
        found: 'Formatting configuration or dependency was found.',
        warning: 'Only root-level formatting tooling was found.',
        missing: 'Formatting configuration or dependency was not found.',
      },
    },
  },
  ru: {
    'ci-build-step': {
      label: 'CI build step',
      descriptions: {
        found: 'GitHub Actions запускает build.',
        warning: 'Build step не найден в workflow.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'ci-install-step': {
      label: 'CI install step',
      descriptions: {
        found: 'GitHub Actions устанавливает зависимости.',
        warning: 'Install step не найден в workflow.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'ci-lint-step': {
      label: 'CI lint step',
      descriptions: {
        found: 'GitHub Actions запускает lint.',
        warning: 'Lint step не найден в workflow.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'ci-pr-trigger': {
      label: 'Pull request CI trigger',
      descriptions: {
        found: 'GitHub Actions запускается на pull request.',
        warning: 'Pull request trigger не найден в workflow.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'ci-project-scope': {
      label: 'CI project scope',
      descriptions: {
        found: 'Workflow нацелен на корень репозитория или выбранную frontend-папку.',
        warning: 'Workflow не указывает на выбранную frontend-папку.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'ci-test-step': {
      label: 'CI test step',
      descriptions: {
        found: 'GitHub Actions запускает тесты.',
        warning: 'Test step не найден в workflow.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'dependency-hygiene': {
      label: 'Гигиена зависимостей',
      descriptions: {
        found: 'Dev-only tooling не найден в production dependencies.',
        warning: 'Dev-only tooling найден в production dependencies.',
      },
    },
    'lockfile-consistency': {
      label: 'Согласованность lockfile',
      descriptions: {
        found: 'Lockfile указывает на один package manager.',
        warning: 'Найдено несколько lockfile разных package manager.',
        missing: 'Package lockfile не найден.',
      },
    },
    'package-manager': {
      label: 'Package manager',
      descriptions: {
        found: 'Package manager определён по lockfile или package metadata.',
        warning: 'package.json packageManager не совпадает с lockfile.',
        missing: 'Package manager не определён.',
      },
    },
    'a11y-tooling': {
      label: 'Инструменты доступности',
      descriptions: {
        found: 'Найдены зависимости для проверки доступности.',
        missing: 'Зависимости для проверки доступности не найдены.',
      },
    },
    'build-script': {
      label: 'Build-скрипт',
      descriptions: {
        found: 'В package.json есть build-скрипт.',
        missing: 'В package.json нет build-скрипта.',
      },
    },
    bundler: {
      label: 'Frontend bundler',
      descriptions: {
        found: 'Найдена распространённая зависимость frontend bundler.',
        missing: 'Распространённая зависимость frontend bundler не найдена.',
      },
    },
    'env-example': {
      label: 'Пример окружения',
      descriptions: {
        found: 'Файл с примером переменных окружения найден.',
        missing: 'Файл с примером переменных окружения не найден.',
      },
    },
    'github-actions': {
      label: 'Workflow GitHub Actions',
      descriptions: {
        found: 'Найдена директория workflow GitHub Actions.',
        warning: 'Workflow GitHub Actions найдены, но проанализирована только часть файлов.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'lint-script': {
      label: 'Lint-скрипт',
      descriptions: {
        found: 'В package.json есть lint-скрипт.',
        missing: 'В package.json нет lint-скрипта.',
      },
    },
    lockfile: {
      label: 'Package lockfile',
      descriptions: {
        found: 'Package lockfile найден.',
        warning: 'Найден только корневой package lockfile.',
        missing: 'Package lockfile не найден.',
      },
    },
    'package-json': {
      label: 'package.json',
      descriptions: {
        found: 'package.json найден.',
        missing: 'package.json не найден.',
      },
    },
    readme: {
      label: 'README',
      descriptions: {
        found: 'README-файл найден.',
        missing: 'README-файл не найден.',
        warning: 'README-файл найден, но он короткий или без деталей установки и использования.',
      },
    },
    'readme-quality': {
      label: 'Качество README',
      descriptions: {
        found: 'README содержит детали установки и использования.',
        warning: 'README-файл найден, но он короткий или без деталей установки и использования.',
        missing: 'Качество README нельзя оценить, потому что README не найден.',
      },
    },
    storybook: {
      label: 'Storybook',
      descriptions: {
        found: 'Конфигурация или зависимость Storybook найдена.',
        missing: 'Конфигурация или зависимость Storybook не найдена.',
      },
    },
    'test-script': {
      label: 'Test-скрипт',
      descriptions: {
        found: 'В package.json есть test-скрипт.',
        missing: 'В package.json нет test-скрипта.',
      },
    },
    'testing-library': {
      label: 'Testing Library',
      descriptions: {
        found: 'Найдена распространённая frontend-зависимость для тестов.',
        missing: 'Распространённая frontend-зависимость для тестов не найдена.',
      },
    },
    typescript: {
      label: 'TypeScript',
      descriptions: {
        found: 'Конфигурация или зависимость TypeScript найдена.',
        missing: 'Конфигурация или зависимость TypeScript не найдена.',
      },
    },
    linting: {
      label: 'Инструменты linting',
      descriptions: {
        found: 'Конфигурация или зависимость linting найдена.',
        warning: 'Найден только корневой инструмент linting.',
        missing: 'Конфигурация или зависимость linting не найдена.',
      },
    },
    formatting: {
      label: 'Инструменты форматирования',
      descriptions: {
        found: 'Конфигурация или зависимость форматирования найдена.',
        warning: 'Найден только корневой инструмент форматирования.',
        missing: 'Конфигурация или зависимость форматирования не найдена.',
      },
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['scoreChecks']>;
