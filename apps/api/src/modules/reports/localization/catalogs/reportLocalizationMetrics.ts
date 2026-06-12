import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationMetrics = {
  en: {
    accessibility: {
      label: 'Accessibility',
      description: 'Accessibility linting, component review and testing signals.',
    },
    ci: {
      label: 'CI/CD',
      description: 'Automated delivery checks from GitHub Actions and build scripts.',
    },
    dependencies: {
      label: 'Dependencies',
      description: 'Package metadata and lockfile consistency signals.',
    },
    documentation: {
      label: 'Documentation',
      description: 'README and environment documentation signals found in the repository.',
    },
    maintainability: {
      label: 'Maintainability',
      description: 'TypeScript, linting and project structure maintainability signals.',
    },
    performance: {
      label: 'Performance',
      description: 'Build tooling and frontend bundler readiness.',
    },
    testing: {
      label: 'Testing',
      description: 'Test scripts and common frontend testing dependencies.',
    },
  },
  ru: {
    accessibility: {
      label: 'Доступность',
      description: 'Сигналы accessibility-линтинга, проверки компонентов и тестирования.',
    },
    ci: {
      label: 'CI/CD',
      description: 'Автоматические проверки доставки из GitHub Actions и build-скриптов.',
    },
    dependencies: {
      label: 'Зависимости',
      description: 'Сигналы package metadata и согласованности lockfile.',
    },
    documentation: {
      label: 'Документация',
      description: 'Сигналы README и документации окружения, найденные в репозитории.',
    },
    maintainability: {
      label: 'Поддерживаемость',
      description: 'Сигналы TypeScript, линтинга и поддерживаемости структуры проекта.',
    },
    performance: {
      label: 'Производительность',
      description: 'Готовность build tooling и frontend bundler.',
    },
    testing: {
      label: 'Тестирование',
      description: 'Тестовые скрипты и распространённые frontend-зависимости для тестов.',
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['metrics']>;
