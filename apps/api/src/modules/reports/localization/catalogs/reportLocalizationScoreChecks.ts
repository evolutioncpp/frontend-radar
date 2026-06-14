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
        warning: 'Only a root-level build script was found.',
      },
    },
    bundler: {
      label: 'Frontend bundler',
      descriptions: {
        found: 'A common frontend bundler dependency was found.',
        missing: 'No common frontend bundler dependency was found.',
        warning: 'Only root-level bundler tooling was found.',
      },
    },
    'ci-build-step': {
      label: 'CI build step',
      descriptions: {
        found: 'GitHub Actions runs the build step.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'No build step was detected in analyzed workflows.',
      },
    },
    'ci-install-step': {
      label: 'CI install step',
      descriptions: {
        found: 'GitHub Actions installs dependencies.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'No dependency installation step was detected in analyzed workflows.',
      },
    },
    'ci-lint-step': {
      label: 'CI lint step',
      descriptions: {
        found: 'GitHub Actions runs linting.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'No lint step was detected in analyzed workflows.',
      },
    },
    'ci-pr-trigger': {
      label: 'Pull request CI trigger',
      descriptions: {
        found: 'GitHub Actions runs on pull requests.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'No pull request trigger was detected in analyzed workflows.',
      },
    },
    'ci-project-scope': {
      label: 'CI project scope',
      descriptions: {
        found: 'Workflow scope matches repository root or selected frontend path.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'Analyzed workflows do not clearly target the selected frontend path.',
      },
    },
    'ci-test-step': {
      label: 'CI test step',
      descriptions: {
        found: 'GitHub Actions runs tests.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'No test step was detected in analyzed workflows.',
      },
    },
    'code-health': {
      label: 'Source health',
      descriptions: {
        found: 'No obvious debug, TODO, eslint-disable or explicit any hotspots were detected.',
        missing: 'Source files were not found in the selected frontend path.',
        warning: 'Source-level maintainability warnings were detected.',
      },
    },
    'code-splitting': {
      label: 'Code splitting',
      descriptions: {
        found: 'Lazy loading or dynamic imports were detected in source files.',
        missing: 'No lazy loading or dynamic import signal was detected.',
      },
    },
    'dependency-hygiene': {
      label: 'Dependency hygiene',
      descriptions: {
        found: 'No dev-only tooling dependencies were found in production dependencies.',
        warning: 'Dev-only tooling dependencies were found in production dependencies.',
      },
    },
    'env-example': {
      label: 'Environment example',
      descriptions: {
        found: 'An environment example file was found.',
        missing: 'No environment example file was found.',
      },
    },
    formatting: {
      label: 'Formatting tooling',
      descriptions: {
        found: 'Formatting configuration or dependency was found.',
        missing: 'Formatting configuration or dependency was not found.',
        warning: 'Only root-level formatting tooling was found.',
      },
    },
    'github-actions': {
      label: 'GitHub Actions workflow',
      descriptions: {
        found: 'A GitHub Actions workflow directory was found.',
        missing: 'No GitHub Actions workflow was found.',
        warning: 'GitHub Actions workflows were found, but only part of them was analyzed.',
      },
    },
    'lint-script': {
      label: 'Lint script',
      descriptions: {
        found: 'package.json exposes a lint script.',
        missing: 'package.json does not expose a lint script.',
        warning: 'Only a root-level lint script was found.',
      },
    },
    linting: {
      label: 'Linting tooling',
      descriptions: {
        found: 'Linting configuration or dependency was found.',
        missing: 'Linting configuration or dependency was not found.',
        warning: 'Only root-level linting tooling was found.',
      },
    },
    lockfile: {
      label: 'Package lockfile',
      descriptions: {
        found: 'A package lockfile was found.',
        missing: 'No package lockfile was found.',
        warning: 'Only a root-level package lockfile was found.',
      },
    },
    'lockfile-consistency': {
      label: 'Lockfile consistency',
      descriptions: {
        found: 'Lockfiles point to one package manager.',
        missing: 'No package lockfile was found.',
        warning: 'Multiple package manager lockfiles were found.',
      },
    },
    'package-json': {
      label: 'package.json',
      descriptions: {
        found: 'package.json was found.',
        missing: 'package.json was not found.',
      },
    },
    'package-manager': {
      label: 'Package manager',
      descriptions: {
        found: 'Package manager was detected from lockfile or package metadata.',
        missing: 'Package manager was not detected.',
        warning: 'package.json packageManager does not match the detected lockfile.',
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
        missing: 'README quality could not be evaluated because README was not found.',
        warning: 'README was found, but it is short or misses setup and usage details.',
      },
    },
    storybook: {
      label: 'Storybook',
      descriptions: {
        found: 'Storybook configuration or dependency was found.',
        missing: 'Storybook configuration or dependency was not found.',
        warning: 'Only root-level Storybook tooling was found.',
      },
    },
    'test-coverage': {
      label: 'Coverage signal',
      descriptions: {
        found: 'A coverage script or coverage configuration was detected.',
        missing: 'No coverage script or coverage configuration was detected.',
        warning: 'Only a root-level coverage script or coverage configuration was detected.',
      },
    },
    'test-files': {
      label: 'Test files',
      descriptions: {
        found: 'Test or spec files were found in the selected frontend path.',
        missing: 'No test or spec files were found in the selected frontend path.',
      },
    },
    'test-script': {
      label: 'Test script',
      descriptions: {
        found: 'package.json exposes a test script.',
        missing: 'package.json does not expose a test script.',
        warning: 'Only a root-level test script was found.',
      },
    },
    'testing-library': {
      label: 'Testing tooling',
      descriptions: {
        found: 'A common frontend testing dependency was found.',
        missing: 'No common frontend testing dependency was found.',
        warning: 'Only root-level testing tooling was found.',
      },
    },
    'typecheck-script': {
      label: 'Typecheck script',
      descriptions: {
        found: 'package.json exposes a dedicated typecheck script.',
        missing: 'package.json does not expose a dedicated typecheck script.',
        warning: 'Only a root-level typecheck script was found.',
      },
    },
    typescript: {
      label: 'TypeScript',
      descriptions: {
        found: 'TypeScript configuration or dependency was found.',
        missing: 'TypeScript configuration or dependency was not found.',
        warning: 'Only root-level TypeScript tooling was found.',
      },
    },
    'typescript-config': {
      label: 'TypeScript config',
      descriptions: {
        found: 'TypeScript configuration was found.',
        missing: 'TypeScript configuration was not found.',
        warning: 'TypeScript configuration was found, but could not be parsed.',
      },
    },
    'typescript-strict': {
      label: 'TypeScript strictness',
      descriptions: {
        found: 'TypeScript strictness is enabled.',
        missing: 'TypeScript strictness could not be evaluated because tsconfig was not found.',
        warning: 'TypeScript is configured, but strict compiler checks are not enabled.',
      },
    },
  },
  ru: {
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
        warning: 'Найден только корневой build-скрипт.',
      },
    },
    bundler: {
      label: 'Frontend bundler',
      descriptions: {
        found: 'Найдена распространённая зависимость frontend bundler.',
        missing: 'Распространённая зависимость frontend bundler не найдена.',
        warning: 'Найден только корневой bundler tooling.',
      },
    },
    'ci-build-step': {
      label: 'CI build step',
      descriptions: {
        found: 'GitHub Actions запускает build.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Build step не найден в workflow.',
      },
    },
    'ci-install-step': {
      label: 'CI install step',
      descriptions: {
        found: 'GitHub Actions устанавливает зависимости.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Install step не найден в workflow.',
      },
    },
    'ci-lint-step': {
      label: 'CI lint step',
      descriptions: {
        found: 'GitHub Actions запускает lint.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Lint step не найден в workflow.',
      },
    },
    'ci-pr-trigger': {
      label: 'Pull request CI trigger',
      descriptions: {
        found: 'GitHub Actions запускается на pull request.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Pull request trigger не найден в workflow.',
      },
    },
    'ci-project-scope': {
      label: 'CI project scope',
      descriptions: {
        found: 'Workflow нацелен на корень репозитория или выбранную frontend-папку.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Workflow не указывает на выбранную frontend-папку.',
      },
    },
    'ci-test-step': {
      label: 'CI test step',
      descriptions: {
        found: 'GitHub Actions запускает тесты.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Test step не найден в workflow.',
      },
    },
    'code-health': {
      label: 'Состояние исходников',
      descriptions: {
        found: 'Не найдено явных debug, TODO, eslint-disable или explicit any hotspots.',
        missing: 'Исходные файлы не найдены в выбранной frontend-папке.',
        warning: 'Найдены предупреждения по поддерживаемости исходников.',
      },
    },
    'code-splitting': {
      label: 'Code splitting',
      descriptions: {
        found: 'В исходниках найдены lazy loading или dynamic import.',
        missing: 'Сигналы lazy loading или dynamic import не найдены.',
      },
    },
    'dependency-hygiene': {
      label: 'Гигиена зависимостей',
      descriptions: {
        found: 'Dev-only tooling не найден в production dependencies.',
        warning: 'Dev-only tooling найден в production dependencies.',
      },
    },
    'env-example': {
      label: 'Пример окружения',
      descriptions: {
        found: 'Файл с примером переменных окружения найден.',
        missing: 'Файл с примером переменных окружения не найден.',
      },
    },
    formatting: {
      label: 'Инструменты форматирования',
      descriptions: {
        found: 'Конфигурация или зависимость форматирования найдена.',
        missing: 'Конфигурация или зависимость форматирования не найдена.',
        warning: 'Найден только корневой инструмент форматирования.',
      },
    },
    'github-actions': {
      label: 'Workflow GitHub Actions',
      descriptions: {
        found: 'Найдена директория workflow GitHub Actions.',
        missing: 'Workflow GitHub Actions не найден.',
        warning: 'Workflow GitHub Actions найден, но проанализирована только часть файлов.',
      },
    },
    'lint-script': {
      label: 'Lint-скрипт',
      descriptions: {
        found: 'В package.json есть lint-скрипт.',
        missing: 'В package.json нет lint-скрипта.',
        warning: 'Найден только корневой lint-скрипт.',
      },
    },
    linting: {
      label: 'Инструменты linting',
      descriptions: {
        found: 'Конфигурация или зависимость linting найдена.',
        missing: 'Конфигурация или зависимость linting не найдена.',
        warning: 'Найден только корневой инструмент linting.',
      },
    },
    lockfile: {
      label: 'Package lockfile',
      descriptions: {
        found: 'Package lockfile найден.',
        missing: 'Package lockfile не найден.',
        warning: 'Найден только корневой package lockfile.',
      },
    },
    'lockfile-consistency': {
      label: 'Согласованность lockfile',
      descriptions: {
        found: 'Lockfile указывает на один package manager.',
        missing: 'Package lockfile не найден.',
        warning: 'Найдено несколько lockfile разных package manager.',
      },
    },
    'package-json': {
      label: 'package.json',
      descriptions: {
        found: 'package.json найден.',
        missing: 'package.json не найден.',
      },
    },
    'package-manager': {
      label: 'Package manager',
      descriptions: {
        found: 'Package manager определён по lockfile или package metadata.',
        missing: 'Package manager не определён.',
        warning: 'package.json packageManager не совпадает с lockfile.',
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
        missing: 'Качество README нельзя оценить, потому что README не найден.',
        warning: 'README найден, но он короткий или без деталей установки и использования.',
      },
    },
    storybook: {
      label: 'Storybook',
      descriptions: {
        found: 'Конфигурация или зависимость Storybook найдена.',
        missing: 'Конфигурация или зависимость Storybook не найдена.',
        warning: 'Найден только корневой Storybook tooling.',
      },
    },
    'test-coverage': {
      label: 'Coverage-сигнал',
      descriptions: {
        found: 'Найден coverage-скрипт или coverage-конфигурация.',
        missing: 'Coverage-скрипт или coverage-конфигурация не найдены.',
        warning: 'Найден только корневой coverage-скрипт или coverage-конфигурация.',
      },
    },
    'test-files': {
      label: 'Тестовые файлы',
      descriptions: {
        found: 'В выбранной frontend-папке найдены test/spec файлы.',
        missing: 'В выбранной frontend-папке не найдены test/spec файлы.',
      },
    },
    'test-script': {
      label: 'Test-скрипт',
      descriptions: {
        found: 'В package.json есть test-скрипт.',
        missing: 'В package.json нет test-скрипта.',
        warning: 'Найден только корневой test-скрипт.',
      },
    },
    'testing-library': {
      label: 'Testing tooling',
      descriptions: {
        found: 'Найдена распространённая frontend-зависимость для тестов.',
        missing: 'Распространённая frontend-зависимость для тестов не найдена.',
        warning: 'Найден только корневой testing tooling.',
      },
    },
    'typecheck-script': {
      label: 'Typecheck-скрипт',
      descriptions: {
        found: 'В package.json есть отдельный typecheck-скрипт.',
        missing: 'В package.json нет отдельного typecheck-скрипта.',
        warning: 'Найден только корневой typecheck-скрипт.',
      },
    },
    typescript: {
      label: 'TypeScript',
      descriptions: {
        found: 'Конфигурация или зависимость TypeScript найдена.',
        missing: 'Конфигурация или зависимость TypeScript не найдена.',
        warning: 'Найден только корневой TypeScript tooling.',
      },
    },
    'typescript-config': {
      label: 'TypeScript config',
      descriptions: {
        found: 'Конфигурация TypeScript найдена.',
        missing: 'Конфигурация TypeScript не найдена.',
        warning: 'Конфигурация TypeScript найдена, но её не удалось прочитать.',
      },
    },
    'typescript-strict': {
      label: 'Строгость TypeScript',
      descriptions: {
        found: 'Строгие проверки TypeScript включены.',
        missing: 'Строгость TypeScript нельзя оценить, потому что tsconfig не найден.',
        warning: 'TypeScript настроен, но строгие проверки компилятора не включены.',
      },
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['scoreChecks']>;
