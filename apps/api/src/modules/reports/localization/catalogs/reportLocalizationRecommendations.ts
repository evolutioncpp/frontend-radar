import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationRecommendations = {
  en: {
    'add-a11y-tooling': {
      title: 'Add accessibility checks',
      description:
        'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
      action: 'Add accessibility linting or test tooling and wire it into regular frontend checks.',
    },
    'add-build-script': {
      title: 'Add a production build script',
      description:
        'Expose a build script in package.json so CI can verify that the frontend compiles before delivery.',
      action: 'Add a package.json build script that creates a production frontend bundle.',
    },
    'add-bundler': {
      title: 'Declare frontend build tooling',
      description:
        'Add or expose a frontend bundler such as Vite, Next.js, Webpack or Parcel so build readiness is easier to verify.',
      action: 'Declare the frontend bundler in package metadata or config files.',
    },
    'add-ci-build-step': {
      title: 'Run production build in CI',
      description: 'Add a build step so the selected frontend project is compiled in CI.',
      action: 'Add a production build step to the workflow for the selected frontend package.',
    },
    'add-ci-install-step': {
      title: 'Install dependencies in CI',
      description:
        'Add an install step such as npm ci, pnpm install or yarn install before checks run.',
      action: 'Add a package-manager install step before lint, test and build jobs.',
    },
    'add-ci-lint-step': {
      title: 'Run linting in CI',
      description: 'Add a lint step to the GitHub Actions workflow for repeatable code checks.',
      action: 'Add the frontend lint command to the existing workflow.',
    },
    'add-ci-pr-checks': {
      title: 'Run CI on pull requests',
      description: 'Add a pull_request trigger so frontend checks run before code is merged.',
      action: 'Add a pull_request trigger to the existing GitHub Actions workflow.',
    },
    'add-ci-test-step': {
      title: 'Run tests in CI',
      description: 'Add a test step so regressions are caught automatically before delivery.',
      action: 'Add a test command to the existing workflow after dependency installation.',
    },
    'add-coverage-signal': {
      title: 'Add a coverage check',
      description:
        'Expose a coverage script or coverage configuration so test quality is easier to track over time.',
      action: 'Add a coverage script or enable coverage in the frontend test runner config.',
    },
    'add-env-example': {
      title: 'Document environment variables',
      description: 'Add an .env.example file so setup requirements are clear for contributors.',
      action: 'Create or update .env.example with safe placeholder values for required variables.',
    },
    'add-github-actions': {
      title: 'Add GitHub Actions checks',
      description: 'Add CI workflows so linting, tests and builds run for every change.',
      action:
        'Create a GitHub Actions workflow that runs install, lint, test and build on pull requests.',
    },
    'add-lint-script': {
      title: 'Add a lint script',
      description: 'Expose linting in package.json to make code quality checks repeatable.',
      action: 'Add a package.json lint script that runs the configured linter.',
    },
    'add-package-metadata': {
      title: 'Add package metadata',
      description:
        'Add package.json so scripts, dependencies and project tooling can be installed and checked consistently.',
      action:
        'Create package.json for the analyzed frontend package and commit the scripts it needs.',
    },
    'add-readme': {
      title: 'Add a project README',
      description:
        'Add setup, usage and contribution notes so contributors can understand and run the project quickly.',
      action:
        'Create a README with setup, usage and validation instructions for the frontend project.',
    },
    'add-storybook': {
      title: 'Add component documentation',
      description: 'Storybook or similar tooling helps review UI states and accessibility details.',
      action: 'Add Storybook or a similar component review tool for key UI states.',
    },
    'add-test-files': {
      title: 'Add representative test files',
      description:
        'Add test or spec files for the selected frontend package so the test script validates real behavior.',
      action: 'Add unit or component test files for the most important frontend paths.',
    },
    'add-test-script': {
      title: 'Add an automated test script',
      description: 'Expose a test script in package.json so quality checks are easy to run.',
      action: 'Add a package.json test script that runs the selected frontend test runner.',
    },
    'add-testing-library': {
      title: 'Add frontend testing tooling',
      description:
        'Add Vitest, Jest, Playwright or Testing Library so the test script has a clear frontend testing stack behind it.',
      action: 'Install or expose frontend testing tooling for unit, component or e2e checks.',
    },
    'add-typecheck-script': {
      title: 'Add a typecheck script',
      description:
        'Expose a dedicated typecheck script such as tsc --noEmit so CI and contributors can validate types without building.',
      action: 'Add a package.json typecheck script that runs TypeScript without emitting files.',
    },
    'add-typescript': {
      title: 'Add TypeScript coverage',
      description:
        'Add TypeScript configuration or dependencies so maintainability checks can catch interface and refactor issues earlier.',
      action: 'Add TypeScript config and dependencies for the selected frontend package.',
    },
    'align-package-manager': {
      title: 'Align package manager metadata',
      description: 'Make package.json packageManager match the committed lockfile package manager.',
      action:
        'Update packageManager metadata or regenerate the lockfile so both point to one tool.',
    },
    'commit-lockfile': {
      title: 'Commit a package lockfile',
      description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
      action: 'Generate and commit the lockfile for the package manager used by this project.',
    },
    'enable-typescript-strict': {
      title: 'Enable stricter TypeScript checks',
      description:
        'Enable strict mode or noImplicitAny plus strictNullChecks so refactors catch unsafe contracts earlier.',
      action: 'Enable strict TypeScript checks in the source tsconfig used by the frontend app.',
    },
    'ignore-secret-files': {
      title: 'Ignore local secret files',
      description:
        'Add .env*, .npmrc and private key patterns to .gitignore so local credentials are harder to commit accidentally.',
      action: 'Add env, npmrc and private-key patterns to .gitignore.',
    },
    'improve-readme': {
      title: 'Expand README setup and usage details',
      description:
        'Add installation/setup and usage/examples sections so the README explains how to run and validate the project.',
      action: 'Add setup and usage sections to the existing README.',
    },
    'move-tooling-to-dev-dependencies': {
      title: 'Move tooling to devDependencies',
      description:
        'Keep linting, testing and type tooling out of production dependencies where possible.',
      action: 'Move detected build/test/lint/type packages from dependencies to devDependencies.',
    },
    'reduce-source-health-warnings': {
      title: 'Reduce source-level maintainability warnings',
      description:
        'Review debug logs, TODO/FIXME comments, eslint-disable usage and explicit any hotspots in the selected frontend source.',
      action:
        'Review the reported source files and remove debug logs, stale TODOs and unsafe any usage.',
    },
    'remove-mixed-lockfiles': {
      title: 'Use one package manager lockfile',
      description:
        'Keep one package manager lockfile so local and CI installs resolve dependencies consistently.',
      action: 'Remove extra lockfiles and keep the one that matches the chosen package manager.',
    },
    'remove-sensitive-files': {
      title: 'Remove sensitive files from the repository',
      description:
        'Remove committed env, npmrc or private key files and rotate any exposed credentials before using the repository again.',
      action:
        'Delete committed sensitive files, rotate exposed credentials and keep only safe examples.',
    },
    'replace-hardcoded-secret': {
      title: 'Move hardcoded secrets out of source code',
      description:
        'Replace hardcoded secret-looking values with environment variables or a secret manager. The report intentionally does not expose the values.',
      action:
        'Move secret-looking values to environment variables or a secret manager and rotate them.',
    },
    'scope-ci-to-frontend-path': {
      title: 'Scope CI to the selected frontend path',
      description:
        'Use working-directory, workspace or filter options so CI checks target the analyzed frontend package.',
      action: 'Set working-directory, workspace or filter options for the selected frontend path.',
    },
  },
  ru: {
    'add-a11y-tooling': {
      title: 'Добавить проверки доступности',
      description:
        'Добавьте eslint-plugin-jsx-a11y, axe-core или похожий инструмент, чтобы раньше находить регрессии доступности.',
      action:
        'Подключите accessibility linting или тестовый инструмент к регулярным frontend-проверкам.',
    },
    'add-build-script': {
      title: 'Добавить production build-скрипт',
      description:
        'Откройте build-скрипт в package.json, чтобы CI мог проверять сборку frontend перед поставкой.',
      action: 'Добавьте в package.json build-скрипт, который создаёт production frontend bundle.',
    },
    'add-bundler': {
      title: 'Указать frontend build tooling',
      description:
        'Добавьте или явно подключите frontend bundler вроде Vite, Next.js, Webpack или Parcel, чтобы готовность сборки было проще проверять.',
      action: 'Опишите frontend bundler в package metadata или конфигурационных файлах.',
    },
    'add-ci-build-step': {
      title: 'Запускать production build в CI',
      description: 'Добавьте build step, чтобы выбранный frontend-проект компилировался в CI.',
      action: 'Добавьте production build step в workflow для выбранного frontend-пакета.',
    },
    'add-ci-install-step': {
      title: 'Устанавливать зависимости в CI',
      description: 'Добавьте install step: npm ci, pnpm install или yarn install перед проверками.',
      action: 'Добавьте шаг установки зависимостей перед lint, test и build jobs.',
    },
    'add-ci-lint-step': {
      title: 'Запускать lint в CI',
      description:
        'Добавьте lint step в GitHub Actions workflow для повторяемых проверок качества.',
      action: 'Добавьте frontend lint command в существующий workflow.',
    },
    'add-ci-pr-checks': {
      title: 'Запускать CI на pull request',
      description: 'Добавьте pull_request trigger, чтобы frontend-проверки выполнялись до merge.',
      action: 'Добавьте pull_request trigger в существующий GitHub Actions workflow.',
    },
    'add-ci-test-step': {
      title: 'Запускать тесты в CI',
      description: 'Добавьте test step, чтобы регрессии ловились автоматически до доставки.',
      action: 'Добавьте test command в существующий workflow после установки зависимостей.',
    },
    'add-coverage-signal': {
      title: 'Добавить проверку покрытия',
      description:
        'Добавьте coverage-скрипт или coverage-конфигурацию, чтобы качество тестов было проще отслеживать со временем.',
      action: 'Добавьте coverage script или включите coverage в конфигурации frontend test runner.',
    },
    'add-env-example': {
      title: 'Описать переменные окружения',
      description:
        'Добавьте .env.example, чтобы требования к настройке были понятны участникам проекта.',
      action: 'Создайте или обновите .env.example с безопасными placeholder-значениями.',
    },
    'add-github-actions': {
      title: 'Добавить проверки GitHub Actions',
      description:
        'Добавьте CI workflows, чтобы linting, тесты и сборка запускались при каждом изменении.',
      action:
        'Создайте GitHub Actions workflow, который запускает install, lint, test и build на pull requests.',
    },
    'add-lint-script': {
      title: 'Добавить lint-скрипт',
      description: 'Откройте linting в package.json, чтобы проверки качества были повторяемыми.',
      action: 'Добавьте в package.json lint-скрипт, который запускает настроенный линтер.',
    },
    'add-package-metadata': {
      title: 'Добавить package metadata',
      description:
        'Добавьте package.json, чтобы скрипты, зависимости и инструменты проекта устанавливались и проверялись единообразно.',
      action: 'Создайте package.json для выбранного frontend-пакета и зафиксируйте нужные скрипты.',
    },
    'add-readme': {
      title: 'Добавить README проекта',
      description:
        'Добавьте заметки по настройке, использованию и участию в проекте, чтобы контрибьюторы быстрее понимали, как его запускать.',
      action: 'Создайте README с настройкой, использованием и командами проверки frontend-проекта.',
    },
    'add-storybook': {
      title: 'Добавить документацию компонентов',
      description:
        'Storybook или похожий инструмент помогает проверять состояния UI и детали доступности.',
      action: 'Добавьте Storybook или похожий инструмент для просмотра ключевых UI-состояний.',
    },
    'add-test-files': {
      title: 'Добавить репрезентативные тестовые файлы',
      description:
        'Добавьте test/spec файлы для выбранного frontend-пакета, чтобы test-скрипт проверял реальное поведение.',
      action: 'Добавьте unit или component test files для самых важных frontend-путей.',
    },
    'add-test-script': {
      title: 'Добавить автоматизированный test-скрипт',
      description:
        'Откройте test-скрипт в package.json, чтобы проверки качества было легко запускать.',
      action: 'Добавьте в package.json test-скрипт для выбранного frontend test runner.',
    },
    'add-testing-library': {
      title: 'Добавить frontend testing tooling',
      description:
        'Добавьте Vitest, Jest, Playwright или Testing Library, чтобы за test-скриптом стоял понятный frontend test stack.',
      action:
        'Установите или явно подключите frontend testing tooling для unit, component или e2e checks.',
    },
    'add-typecheck-script': {
      title: 'Добавить typecheck-скрипт',
      description:
        'Откройте отдельный typecheck-скрипт вроде tsc --noEmit, чтобы CI и участники могли проверять типы без сборки.',
      action: 'Добавьте в package.json typecheck-скрипт, который запускает TypeScript без emit.',
    },
    'add-typescript': {
      title: 'Добавить TypeScript-покрытие',
      description:
        'Добавьте TypeScript-конфигурацию или зависимости, чтобы проверки поддерживаемости раньше ловили проблемы интерфейсов и рефакторинга.',
      action: 'Добавьте TypeScript config и зависимости для выбранного frontend-пакета.',
    },
    'align-package-manager': {
      title: 'Согласовать package manager metadata',
      description: 'Сделайте package.json packageManager согласованным с используемым lockfile.',
      action:
        'Обновите packageManager metadata или пересоздайте lockfile, чтобы оба указывали на один инструмент.',
    },
    'commit-lockfile': {
      title: 'Закоммитить package lockfile',
      description:
        'Lockfile делает установку зависимостей воспроизводимой на разных машинах и в CI.',
      action: 'Сгенерируйте и закоммитьте lockfile для package manager проекта.',
    },
    'enable-typescript-strict': {
      title: 'Включить более строгие проверки TypeScript',
      description:
        'Включите strict mode или noImplicitAny вместе со strictNullChecks, чтобы рефакторинг раньше ловил небезопасные контракты.',
      action: 'Включите строгие TypeScript-проверки в source tsconfig frontend-приложения.',
    },
    'ignore-secret-files': {
      title: 'Игнорировать локальные secret-файлы',
      description:
        'Добавьте .env*, .npmrc и паттерны приватных ключей в .gitignore, чтобы локальные секреты было сложнее случайно закоммитить.',
      action: 'Добавьте env, npmrc и private-key паттерны в .gitignore.',
    },
    'improve-readme': {
      title: 'Расширить README настройкой и примерами',
      description:
        'Добавьте разделы installation/setup и usage/examples, чтобы README объяснял, как запускать и проверять проект.',
      action: 'Добавьте setup и usage sections в существующий README.',
    },
    'move-tooling-to-dev-dependencies': {
      title: 'Перенести tooling в devDependencies',
      description:
        'Держите linting, testing и type tooling вне production dependencies, когда это возможно.',
      action: 'Перенесите найденные build/test/lint/type пакеты из dependencies в devDependencies.',
    },
    'reduce-source-health-warnings': {
      title: 'Уменьшить предупреждения по поддерживаемости исходников',
      description:
        'Проверьте debug-логи, TODO/FIXME, eslint-disable и explicit any hotspots в выбранном frontend-коде.',
      action:
        'Просмотрите указанные source files и уберите debug logs, устаревшие TODO и небезопасный any.',
    },
    'remove-mixed-lockfiles': {
      title: 'Оставить один package manager lockfile',
      description:
        'Держите один lockfile, чтобы локальная и CI-установка использовали один набор зависимостей.',
      action:
        'Удалите лишние lockfiles и оставьте тот, который соответствует выбранному package manager.',
    },
    'remove-sensitive-files': {
      title: 'Удалить чувствительные файлы из репозитория',
      description:
        'Удалите закоммиченные env-файлы, npmrc или приватные ключи и перевыпустите раскрытые credentials перед дальнейшим использованием репозитория.',
      action:
        'Удалите sensitive files, перевыпустите раскрытые credentials и оставьте только безопасные examples.',
    },
    'replace-hardcoded-secret': {
      title: 'Убрать захардкоженные секреты из исходников',
      description:
        'Замените похожие на секреты значения переменными окружения или secret manager. Отчёт намеренно не показывает сами значения.',
      action:
        'Перенесите похожие на секреты значения в environment variables или secret manager и перевыпустите их.',
    },
    'scope-ci-to-frontend-path': {
      title: 'Ограничить CI выбранной frontend-папкой',
      description:
        'Используйте working-directory, workspace или filter options, чтобы CI проверял выбранный frontend package.',
      action:
        'Настройте working-directory, workspace или filter options для выбранного frontend path.',
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['recommendations']>;
