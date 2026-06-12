import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationAnalysisSources = {
  en: {
    'github-repository-metadata': {
      label: 'GitHub repository metadata',
      descriptions: {
        found: 'Repository metadata was loaded from GitHub API.',
      },
    },
    'project-package-json': {
      label: 'Selected package.json',
      descriptions: {
        found: 'package.json was found for the selected frontend project.',
        missing: 'Selected package.json was not found.',
      },
    },
    'root-package-json': {
      label: 'Root package.json',
      descriptions: {
        found: 'Root package.json was found for monorepo context.',
        missing: 'Root package.json was not found for this monorepo project.',
      },
    },
    readme: {
      label: 'README',
      descriptions: {
        found: 'README was found for the selected project.',
        warning: 'Only root-level README or incomplete README was found.',
        missing: 'README file was not found.',
      },
    },
    'env-example': {
      label: 'Environment example',
      descriptions: {
        found: 'Environment example file was found.',
        warning: 'Only root-level environment example was found.',
        missing: 'Environment example file was not found.',
      },
    },
    lockfile: {
      label: 'Package lockfile',
      descriptions: {
        found: 'Package lockfile was found.',
        warning: 'Only root-level package lockfile was found.',
        missing: 'Package lockfile was not found.',
      },
    },
    'lockfile-consistency': {
      label: 'Lockfile consistency',
      descriptions: {
        found: 'Lockfiles point to one package manager.',
        warning: 'Multiple package manager lockfiles were found.',
        missing: 'Package lockfile was not found.',
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
    'dependency-hygiene': {
      label: 'Dependency hygiene',
      descriptions: {
        found: 'No dev-only tooling dependencies were found in production dependencies.',
        warning: 'Dev-only tooling dependencies were found in production dependencies.',
      },
    },
    'github-actions': {
      label: 'GitHub Actions workflows',
      descriptions: {
        found: 'GitHub Actions workflows were found.',
        warning: 'GitHub Actions workflows were found, but their contents could not be analyzed.',
        missing: 'GitHub Actions workflows were not found.',
      },
    },
    'ci-pr-trigger': {
      label: 'Pull request CI trigger',
      descriptions: {
        found: 'GitHub Actions runs on pull requests.',
        missing: 'Pull request trigger was not detected in analyzed workflows.',
      },
    },
    'ci-install-step': {
      label: 'CI install step',
      descriptions: {
        found: 'Dependency installation step was detected in GitHub Actions.',
        missing: 'Dependency installation step was not detected in analyzed workflows.',
      },
    },
    'ci-quality-steps': {
      label: 'CI quality steps',
      descriptions: {
        found: 'Lint, test and build steps were detected in GitHub Actions.',
        warning: 'One or more lint, test or build steps were not detected in analyzed workflows.',
        missing: 'GitHub Actions workflows were not found.',
      },
    },
    'ci-project-scope': {
      label: 'CI project scope',
      descriptions: {
        found: 'Workflow scope matches repository root or selected frontend path.',
        warning: 'Analyzed workflows do not clearly target the selected frontend path.',
        missing: 'GitHub Actions workflows were not found.',
      },
    },
    'build-script': {
      label: 'Build script',
      descriptions: {
        found: 'Project build script was found.',
        warning: 'Only root-level build script was found.',
        missing: 'Build script was not found.',
      },
    },
    'test-script': {
      label: 'Test script',
      descriptions: {
        found: 'Project test script was found.',
        warning: 'Only root-level test script was found.',
        missing: 'Test script was not found.',
      },
    },
    'lint-script': {
      label: 'Lint script',
      descriptions: {
        found: 'Project lint script was found.',
        warning: 'Only root-level lint script was found.',
        missing: 'Lint script was not found.',
      },
    },
    typescript: {
      label: 'TypeScript',
      descriptions: {
        found: 'Project TypeScript signal was found.',
        warning: 'Only root-level TypeScript signal was found.',
        missing: 'TypeScript signal was not found.',
      },
    },
    storybook: {
      label: 'Storybook',
      descriptions: {
        found: 'Project Storybook signal was found.',
        warning: 'Only root-level Storybook signal was found.',
        missing: 'Storybook signal was not found.',
      },
    },
    frameworks: {
      label: 'Frontend frameworks',
      descriptions: {
        found: 'Frontend framework dependency was found.',
        warning: 'Only root-level framework dependency was found.',
        missing: 'Frontend framework dependency was not found.',
      },
    },
    bundler: {
      label: 'Frontend bundler',
      descriptions: {
        found: 'Frontend bundler dependency was found.',
        warning: 'Only root-level bundler dependency was found.',
        missing: 'Frontend bundler dependency was not found.',
      },
    },
    testing: {
      label: 'Testing tooling',
      descriptions: {
        found: 'Testing tooling dependency was found.',
        warning: 'Only root-level testing dependency was found.',
        missing: 'Testing tooling dependency was not found.',
      },
    },
    linting: {
      label: 'Linting tooling',
      descriptions: {
        found: 'Linting tooling dependency was found.',
        warning: 'Only root-level linting dependency was found.',
        missing: 'Linting tooling dependency was not found.',
      },
    },
    formatting: {
      label: 'Formatting tooling',
      descriptions: {
        found: 'Formatting tooling dependency was found.',
        warning: 'Only root-level formatting dependency was found.',
        missing: 'Formatting tooling dependency was not found.',
      },
    },
    accessibility: {
      label: 'Accessibility tooling',
      descriptions: {
        found: 'Accessibility tooling dependency was found.',
        warning: 'Only root-level accessibility dependency was found.',
        missing: 'Accessibility tooling dependency was not found.',
      },
    },
  },
  ru: {
    'ci-install-step': {
      label: 'Шаг установки в CI',
      descriptions: {
        found: 'Шаг установки зависимостей найден в GitHub Actions.',
        missing: 'Шаг установки зависимостей не найден в workflow.',
      },
    },
    'ci-pr-trigger': {
      label: 'CI на pull request',
      descriptions: {
        found: 'GitHub Actions запускается на pull request.',
        missing: 'Триггер pull request не найден в проанализированных workflow.',
      },
    },
    'ci-project-scope': {
      label: 'Область CI',
      descriptions: {
        found: 'Workflow нацелен на корень репозитория или выбранную frontend-папку.',
        warning: 'Workflow не указывает на выбранную frontend-папку.',
        missing: 'Workflow GitHub Actions не найден.',
      },
    },
    'ci-quality-steps': {
      label: 'Шаги качества в CI',
      descriptions: {
        found: 'Шаги lint, test и build найдены в GitHub Actions.',
        warning: 'Один или несколько шагов lint, test и build не найдены в workflow.',
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
    'github-repository-metadata': {
      label: 'Метаданные GitHub-репозитория',
      descriptions: {
        found: 'Метаданные репозитория загружены через GitHub API.',
      },
    },
    'project-package-json': {
      label: 'Выбранный package.json',
      descriptions: {
        found: 'package.json найден для выбранного frontend-проекта.',
        missing: 'Выбранный package.json не найден.',
      },
    },
    'root-package-json': {
      label: 'Корневой package.json',
      descriptions: {
        found: 'Корневой package.json найден для контекста monorepo.',
        missing: 'Корневой package.json не найден для этого monorepo-проекта.',
      },
    },
    readme: {
      label: 'README',
      descriptions: {
        found: 'README найден для выбранного проекта.',
        warning: 'Найден только корневой README или README неполный.',
        missing: 'README не найден.',
      },
    },
    'env-example': {
      label: 'Пример окружения',
      descriptions: {
        found: 'Файл с примером окружения найден.',
        warning: 'Найден только корневой пример окружения.',
        missing: 'Файл с примером окружения не найден.',
      },
    },
    lockfile: {
      label: 'Lockfile пакетов',
      descriptions: {
        found: 'Lockfile пакетов найден.',
        warning: 'Найден только корневой lockfile пакетов.',
        missing: 'Lockfile пакетов не найден.',
      },
    },
    'github-actions': {
      label: 'GitHub Actions workflows',
      descriptions: {
        found: 'Workflow GitHub Actions найдены.',
        warning: 'Workflow GitHub Actions найдены, но проанализирована только часть файлов.',
        missing: 'Workflow GitHub Actions не найдены.',
      },
    },
    'build-script': {
      label: 'Build-скрипт',
      descriptions: {
        found: 'Build-скрипт проекта найден.',
        warning: 'Найден только корневой build-скрипт.',
        missing: 'Build-скрипт не найден.',
      },
    },
    'test-script': {
      label: 'Test-скрипт',
      descriptions: {
        found: 'Test-скрипт проекта найден.',
        warning: 'Найден только корневой test-скрипт.',
        missing: 'Test-скрипт не найден.',
      },
    },
    'lint-script': {
      label: 'Lint-скрипт',
      descriptions: {
        found: 'Lint-скрипт проекта найден.',
        warning: 'Найден только корневой lint-скрипт.',
        missing: 'Lint-скрипт не найден.',
      },
    },
    typescript: {
      label: 'TypeScript',
      descriptions: {
        found: 'TypeScript-сигнал проекта найден.',
        warning: 'Найден только корневой TypeScript-сигнал.',
        missing: 'TypeScript-сигнал не найден.',
      },
    },
    storybook: {
      label: 'Storybook',
      descriptions: {
        found: 'Storybook-сигнал проекта найден.',
        warning: 'Найден только корневой Storybook-сигнал.',
        missing: 'Storybook-сигнал не найден.',
      },
    },
    frameworks: {
      label: 'Frontend-фреймворки',
      descriptions: {
        found: 'Frontend-фреймворк найден в зависимостях.',
        warning: 'Frontend-фреймворк найден только в корневых зависимостях.',
        missing: 'Frontend-фреймворк не найден в зависимостях.',
      },
    },
    bundler: {
      label: 'Frontend bundler',
      descriptions: {
        found: 'Frontend bundler найден в зависимостях.',
        warning: 'Bundler найден только в корневых зависимостях.',
        missing: 'Frontend bundler не найден в зависимостях.',
      },
    },
    testing: {
      label: 'Инструменты тестирования',
      descriptions: {
        found: 'Инструмент тестирования найден в зависимостях.',
        warning: 'Инструмент тестирования найден только в корневых зависимостях.',
        missing: 'Инструмент тестирования не найден в зависимостях.',
      },
    },
    linting: {
      label: 'Инструменты linting',
      descriptions: {
        found: 'Инструмент linting найден в зависимостях.',
        warning: 'Инструмент linting найден только в корневых зависимостях.',
        missing: 'Инструмент linting не найден в зависимостях.',
      },
    },
    formatting: {
      label: 'Инструменты форматирования',
      descriptions: {
        found: 'Инструмент форматирования найден в зависимостях.',
        warning: 'Инструмент форматирования найден только в корневых зависимостях.',
        missing: 'Инструмент форматирования не найден в зависимостях.',
      },
    },
    accessibility: {
      label: 'Инструменты доступности',
      descriptions: {
        found: 'Инструмент доступности найден в зависимостях.',
        warning: 'Инструмент доступности найден только в корневых зависимостях.',
        missing: 'Инструмент доступности не найден в зависимостях.',
      },
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['analysisSources']>;
