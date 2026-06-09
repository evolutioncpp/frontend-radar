import { normalizeSupportedLanguage } from '@frontend-radar/localization';

import { reportEvidenceIds } from './reportEvidence.js';

import type { ProjectReport, ReportAnalysisErrorCode } from './reportSchemas.js';
import type { ReportEvidenceId } from './reportEvidence.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

type ScoreCategory = ProjectReport['scoreBreakdown'][number]['category'];
type EvidenceStatus = ProjectReport['scoreBreakdown'][number]['evidence'][number]['status'];

type ReportLocalizationCatalog = {
  checks: Record<string, { label: string; description?: string }>;
  errors: Record<ReportAnalysisErrorCode, string>;
  evidence: Record<
    ReportEvidenceId,
    {
      label: string;
      descriptions: Partial<Record<EvidenceStatus, string>>;
    }
  >;
  metrics: Record<ScoreCategory, { label: string; description: string }>;
  recommendations: Record<string, { title: string; description: string }>;
  reportNotFound: string;
};

const reportLocalizationCatalogs: Record<SupportedLanguage, ReportLocalizationCatalog> = {
  en: {
    checks: {
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
    errors: {
      analysis_failed: 'Repository analysis failed.',
      github_rate_limited: 'GitHub API rate limit exceeded. Try again later.',
      github_unavailable: 'GitHub is unavailable right now. Try again later.',
      repository_forbidden: 'GitHub repository is private or access is forbidden.',
      repository_not_found: 'GitHub repository not found',
      repository_verification_failed: 'GitHub repository could not be verified.',
    },
    evidence: {
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
          missing: 'No package lockfile was found.',
        },
      },
      'package-json': {
        label: 'package.json',
        descriptions: {
          found: 'package.json was found.',
          missing: 'package.json was not found.',
        },
      },
      readme: {
        label: 'README',
        descriptions: {
          found: 'README file was found.',
          missing: 'README file was not found.',
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
    },
    metrics: {
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
    recommendations: {
      'add-env-example': {
        title: 'Document environment variables',
        description: 'Add an .env.example file so setup requirements are clear for contributors.',
      },
      'add-github-actions': {
        title: 'Add GitHub Actions checks',
        description: 'Add CI workflows so linting, tests and builds run for every change.',
      },
      'add-lint-script': {
        title: 'Add a lint script',
        description: 'Expose linting in package.json to make code quality checks repeatable.',
      },
      'add-storybook': {
        title: 'Add component documentation',
        description:
          'Storybook or similar tooling helps review UI states and accessibility details.',
      },
      'add-test-script': {
        title: 'Add an automated test script',
        description: 'Expose a test script in package.json so quality checks are easy to run.',
      },
      'commit-lockfile': {
        title: 'Commit a package lockfile',
        description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
      },
    },
    reportNotFound: 'Report analysis not found',
  },
  ru: {
    checks: {
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
    errors: {
      analysis_failed: 'Не удалось проанализировать репозиторий.',
      github_rate_limited: 'Превышен лимит запросов к GitHub. Попробуйте позже.',
      github_unavailable: 'GitHub сейчас недоступен. Попробуйте позже.',
      repository_forbidden: 'Репозиторий приватный или доступ к нему запрещён.',
      repository_not_found: 'Репозиторий GitHub не найден.',
      repository_verification_failed: 'Не удалось проверить репозиторий GitHub.',
    },
    evidence: {
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
    },
    metrics: {
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
    recommendations: {
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
      'commit-lockfile': {
        title: 'Закоммитить package lockfile',
        description:
          'Lockfile делает установку зависимостей воспроизводимой на разных машинах и CI.',
      },
    },
    reportNotFound: 'Отчёт анализа не найден.',
  },
};

const getCatalog = (language: SupportedLanguage) => {
  return reportLocalizationCatalogs[normalizeSupportedLanguage(language)];
};

const isReportEvidenceId = (id: string): id is ReportEvidenceId => {
  return (reportEvidenceIds as readonly string[]).includes(id);
};

export const getLocalizedReportErrorMessage = (
  code: ReportAnalysisErrorCode,
  language: SupportedLanguage,
) => {
  return getCatalog(language).errors[code];
};

export const getLocalizedReportNotFoundMessage = (language: SupportedLanguage) => {
  return getCatalog(language).reportNotFound;
};

const localizeEvidence = (
  evidence: ProjectReport['scoreBreakdown'][number]['evidence'],
  catalog: ReportLocalizationCatalog,
) => {
  return evidence.map((item) => {
    const translation = isReportEvidenceId(item.id) ? catalog.evidence[item.id] : undefined;
    const description = translation?.descriptions[item.status] ?? item.description;

    return {
      ...item,
      label: translation?.label ?? item.label,
      ...(description ? { description } : {}),
    };
  });
};

export const localizeProjectReport = (
  report: ProjectReport,
  language: SupportedLanguage,
): ProjectReport => {
  const catalog = getCatalog(language);

  return {
    ...report,
    checks: report.checks.map((check) => {
      const translation = catalog.checks[check.id];
      const description = check.description
        ? (translation?.description ?? check.description)
        : undefined;

      return {
        ...check,
        label: translation?.label ?? check.label,
        ...(description ? { description } : {}),
      };
    }),
    recommendations: report.recommendations.map((recommendation) => {
      const translation = catalog.recommendations[recommendation.id];

      return {
        ...recommendation,
        title: translation?.title ?? recommendation.title,
        description: translation?.description ?? recommendation.description,
      };
    }),
    scoreBreakdown: report.scoreBreakdown.map((metric) => {
      const translation = catalog.metrics[metric.category];

      return {
        ...metric,
        evidence: localizeEvidence(metric.evidence, catalog),
        label: translation?.label ?? metric.label,
        description: translation?.description ?? metric.description,
      };
    }),
  };
};
