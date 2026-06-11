import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationRecommendations = {
  en: {
    'add-a11y-tooling': {
      title: 'Add accessibility checks',
      description:
        'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
    },
    'add-build-script': {
      title: 'Add a production build script',
      description:
        'Expose a build script in package.json so CI can verify that the frontend compiles before delivery.',
    },
    'add-bundler': {
      title: 'Declare frontend build tooling',
      description:
        'Add or expose a frontend bundler such as Vite, Next.js, Webpack or Parcel so build readiness is easier to verify.',
    },
    'add-env-example': {
      title: 'Document environment variables',
      description: 'Add an .env.example file so setup requirements are clear for contributors.',
    },
    'add-github-actions': {
      title: 'Add GitHub Actions checks',
      description: 'Add CI workflows so linting, tests and builds run for every change.',
    },
    'add-ci-build-step': {
      title: 'Run production build in CI',
      description: 'Add a build step so the selected frontend project is compiled in CI.',
    },
    'add-ci-install-step': {
      title: 'Install dependencies in CI',
      description:
        'Add an install step such as npm ci, pnpm install or yarn install before checks run.',
    },
    'add-ci-lint-step': {
      title: 'Run linting in CI',
      description: 'Add a lint step to the GitHub Actions workflow for repeatable code checks.',
    },
    'add-ci-pr-checks': {
      title: 'Run CI on pull requests',
      description: 'Add a pull_request trigger so frontend checks run before code is merged.',
    },
    'add-ci-test-step': {
      title: 'Run tests in CI',
      description: 'Add a test step so regressions are caught automatically before delivery.',
    },
    'add-lint-script': {
      title: 'Add a lint script',
      description: 'Expose linting in package.json to make code quality checks repeatable.',
    },
    'add-package-metadata': {
      title: 'Add package metadata',
      description:
        'Add package.json so scripts, dependencies and project tooling can be installed and checked consistently.',
    },
    'add-readme': {
      title: 'Add a project README',
      description:
        'Add setup, usage and contribution notes so contributors can understand and run the project quickly.',
    },
    'add-storybook': {
      title: 'Add component documentation',
      description: 'Storybook or similar tooling helps review UI states and accessibility details.',
    },
    'add-test-script': {
      title: 'Add an automated test script',
      description: 'Expose a test script in package.json so quality checks are easy to run.',
    },
    'add-testing-library': {
      title: 'Add frontend testing tooling',
      description:
        'Add Vitest, Jest, Playwright or Testing Library so the test script has a clear frontend testing stack behind it.',
    },
    'add-typescript': {
      title: 'Add TypeScript coverage',
      description:
        'Add TypeScript configuration or dependencies so maintainability checks can catch interface and refactor issues earlier.',
    },
    'commit-lockfile': {
      title: 'Commit a package lockfile',
      description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
    },
    'align-package-manager': {
      title: 'Align package manager metadata',
      description: 'Make package.json packageManager match the committed lockfile package manager.',
    },
    'improve-readme': {
      title: 'Expand README setup and usage details',
      description:
        'Add installation/setup and usage/examples sections so the README explains how to run and validate the project.',
    },
    'move-tooling-to-dev-dependencies': {
      title: 'Move tooling to devDependencies',
      description:
        'Keep linting, testing and type tooling out of production dependencies where possible.',
    },
    'remove-mixed-lockfiles': {
      title: 'Use one package manager lockfile',
      description:
        'Keep one package manager lockfile so local and CI installs resolve dependencies consistently.',
    },
    'scope-ci-to-frontend-path': {
      title: 'Scope CI to the selected frontend path',
      description:
        'Use working-directory, workspace or filter options so CI checks target the analyzed frontend package.',
    },
  },
  ru: {
    'add-ci-build-step': {
      title: 'Запустить production build в CI',
      description: 'Добавьте build step, чтобы выбранный frontend-проект проверялся в CI.',
    },
    'add-ci-install-step': {
      title: 'Устанавливать зависимости в CI',
      description: 'Добавьте install step: npm ci, pnpm install или yarn install перед проверками.',
    },
    'add-ci-lint-step': {
      title: 'Запускать lint в CI',
      description:
        'Добавьте lint step в GitHub Actions workflow для повторяемых проверок качества.',
    },
    'add-ci-pr-checks': {
      title: 'Запускать CI на pull request',
      description: 'Добавьте pull_request trigger, чтобы frontend-проверки выполнялись до merge.',
    },
    'add-ci-test-step': {
      title: 'Запускать тесты в CI',
      description: 'Добавьте test step, чтобы регрессии ловились автоматически до доставки.',
    },
    'align-package-manager': {
      title: 'Согласовать package manager metadata',
      description: 'Сделайте package.json packageManager согласованным с используемым lockfile.',
    },
    'move-tooling-to-dev-dependencies': {
      title: 'Перенести tooling в devDependencies',
      description:
        'Уберите linting, testing и type tooling из production dependencies, когда это возможно.',
    },
    'remove-mixed-lockfiles': {
      title: 'Оставить один package manager lockfile',
      description:
        'Оставьте один lockfile, чтобы локальная и CI-установка использовали один набор зависимостей.',
    },
    'scope-ci-to-frontend-path': {
      title: 'Ограничить CI выбранной frontend-папкой',
      description:
        'Используйте working-directory, workspace или filter options, чтобы CI проверял выбранный frontend package.',
    },
    'add-a11y-tooling': {
      title: 'Добавить проверки доступности',
      description:
        'Добавьте eslint-plugin-jsx-a11y, axe-core или похожий инструмент, чтобы раньше находить регрессии доступности.',
    },
    'add-build-script': {
      title: 'Добавить production build-скрипт',
      description:
        'Добавьте build-скрипт в package.json, чтобы CI мог проверять сборку frontend перед поставкой.',
    },
    'add-bundler': {
      title: 'Указать frontend build tooling',
      description:
        'Добавьте или явно подключите frontend bundler вроде Vite, Next.js, Webpack или Parcel, чтобы готовность сборки было проще проверять.',
    },
    'add-env-example': {
      title: 'Описать переменные окружения',
      description:
        'Добавьте файл .env.example, чтобы требования к настройке были понятны участникам проекта.',
    },
    'add-github-actions': {
      title: 'Добавить проверки GitHub Actions',
      description:
        'Добавьте CI workflows, чтобы linting, тесты и сборка запускались при каждом изменении.',
    },
    'add-lint-script': {
      title: 'Добавить lint-скрипт',
      description: 'Добавьте linting в package.json, чтобы проверки качества были повторяемыми.',
    },
    'add-package-metadata': {
      title: 'Добавить package metadata',
      description:
        'Добавьте package.json, чтобы скрипты, зависимости и инструменты проекта устанавливались и проверялись единообразно.',
    },
    'add-readme': {
      title: 'Добавить README проекта',
      description:
        'Добавьте заметки по настройке, использованию и участию в проекте, чтобы контрибьюторы быстрее понимали, как его запустить.',
    },
    'add-storybook': {
      title: 'Добавить документацию компонентов',
      description:
        'Storybook или похожий инструмент поможет проверять состояния UI и детали доступности.',
    },
    'add-test-script': {
      title: 'Добавить автоматизированный test-скрипт',
      description:
        'Добавьте test-скрипт в package.json, чтобы проверки качества было легко запускать.',
    },
    'add-testing-library': {
      title: 'Добавить frontend testing tooling',
      description:
        'Добавьте Vitest, Jest, Playwright или Testing Library, чтобы за test-скриптом стоял понятный frontend test stack.',
    },
    'add-typescript': {
      title: 'Добавить TypeScript-покрытие',
      description:
        'Добавьте TypeScript-конфигурацию или зависимости, чтобы проверки поддерживаемости раньше ловили проблемы интерфейсов и рефакторинга.',
    },
    'commit-lockfile': {
      title: 'Закоммитить package lockfile',
      description: 'Lockfile делает установку зависимостей воспроизводимой на разных машинах и CI.',
    },
    'improve-readme': {
      title: 'Расширить README настройкой и примерами',
      description:
        'Добавьте разделы installation/setup и usage/examples, чтобы README объяснял, как запускать и проверять проект.',
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['recommendations']>;
