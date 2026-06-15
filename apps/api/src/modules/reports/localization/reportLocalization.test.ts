import { describe, expect, it } from 'vitest';

import { getCatalog } from './catalogs/reportLocalizationCatalogs.js';
import { localizeProjectReport } from './reportLocalization.js';
import {
  reportAnalysisSourceIds,
  reportProjectDetectionSignalIds,
} from '../domain/reportSignalContracts.js';
import { reportRecommendationIds } from '../domain/reportRecommendations.js';
import { reportScoreCheckIds } from '../domain/reportScoreCheckContracts.js';

import type { ProjectReport } from '../domain/reportSchemas.js';

const emptyTooling: ProjectReport['tooling'] = {
  accessibility: [],
  bundlers: [],
  formatting: [],
  frameworks: [],
  linting: [],
  packageManager: [],
  testing: [],
  typing: [],
  uiReview: [],
};

const createRecommendation = (
  overrides: Partial<ProjectReport['recommendations'][number]> & {
    id: string;
  },
): ProjectReport['recommendations'][number] => ({
  severity: 'medium',
  categories: ['maintainability'],
  checkIds: [],
  impactLevel: 'important',
  effort: 'small',
  title: 'Recommendation title',
  description: 'Recommendation description.',
  action: 'Recommendation action.',
  ...overrides,
  id: overrides.id,
});

const createReport = (recommendations: ProjectReport['recommendations']): ProjectReport => ({
  analysisSources: [],
  checks: [],
  createdAt: '2026-06-09T00:00:00.000Z',
  id: 'report-id',
  recommendations,
  repository: {
    branch: 'main',
    defaultBranch: 'main',
    description: null,
    forks: 0,
    latestCommitDate: null,
    latestCommitSha: null,
    latestCommitTitle: null,
    license: null,
    name: 'repo',
    owner: 'owner',
    projectPath: null,
    projectDetection: {
      source: 'autodetect',
      path: null,
      packageJsonPath: 'package.json',
      confidence: 'high',
      signals: [
        {
          id: 'project-package-json',
          label: 'Frontend package.json',
          status: 'found',
          source: 'package.json',
        },
      ],
    },
    stars: 0,
    url: 'https://github.com/owner/repo',
  },
  scoreBreakdown: [],
  tooling: emptyTooling,
  totalScore: 0,
});

describe('localizeProjectReport', () => {
  it('localizes recommendation title, description and action', () => {
    const localizedReport = localizeProjectReport(
      createReport([
        createRecommendation({
          description:
            'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
          id: 'add-a11y-tooling',
          severity: 'medium',
          title: 'Add accessibility checks',
          action:
            'Add accessibility linting or test tooling and wire it into regular frontend checks.',
        }),
      ]),
      'ru',
    );

    expect(localizedReport.recommendations[0]).toMatchObject({
      description:
        'Добавьте eslint-plugin-jsx-a11y, axe-core или похожий инструмент, чтобы раньше находить регрессии доступности.',
      title: 'Добавить проверки доступности',
      action:
        'Подключите accessibility linting или тестовый инструмент к регулярным frontend-проверкам.',
    });
  });

  it('localizes analysis source labels and missing tooling labels', () => {
    const report = createReport([]);
    report.analysisSources = [
      {
        description: 'Repository metadata was loaded from GitHub API.',
        id: 'github-repository-metadata',
        kind: 'github_api',
        label: 'GitHub repository metadata',
        scope: 'github',
        source: 'GET /repos/{owner}/{repo}',
        status: 'found',
      },
      {
        description: 'Selected frontend package metadata was read.',
        id: 'project-package-json',
        kind: 'package_json',
        label: 'Selected package.json',
        scope: 'project',
        source: 'package.json',
        status: 'found',
      },
    ];
    report.tooling = {
      ...emptyTooling,
      frameworks: [
        {
          id: 'frameworks-missing',
          label: 'Not detected',
          sources: [],
          status: 'missing',
        },
      ],
    };

    const localizedReport = localizeProjectReport(report, 'ru');

    expect(localizedReport.analysisSources[0]?.source).toBe('GET /repos/owner/repo');
    expect(localizedReport.analysisSources[1]?.label).not.toBe('Selected package.json');
    expect(localizedReport.analysisSources[1]?.description).not.toBe(
      'Selected frontend package metadata was read.',
    );
    expect(localizedReport.tooling.frameworks[0]?.label).not.toBe('Not detected');
  });

  it('localizes new CI and dependency analysis details without mojibake', () => {
    const report = createReport([
      createRecommendation({
        description: 'Add a build step so the selected frontend project is compiled in CI.',
        id: 'add-ci-build-step',
        severity: 'high',
        title: 'Run production build in CI',
        action: 'Add a production build step to the workflow for the selected frontend package.',
      }),
    ]);
    report.analysisSources = [
      {
        description: 'Lockfile set matches one package manager.',
        id: 'lockfile-consistency',
        kind: 'file',
        label: 'Lockfile consistency',
        scope: 'project',
        source: 'package-lock.json',
        status: 'found',
      },
    ];
    report.scoreBreakdown = [
      {
        category: 'ci',
        description: 'Automated delivery checks from GitHub Actions and build scripts.',
        label: 'CI/CD',
        maxValue: 100,
        status: 'warning',
        value: 60,
        scoreDetails: {
          rawValue: 60,
          finalValue: 60,
          weight: 18,
          impactLevel: 'key',
          checks: [
            {
              confidence: 'medium',
              description: 'No pull request trigger was detected in analyzed workflows.',
              earned: 0,
              id: 'ci-pr-trigger',
              label: 'Pull request CI trigger',
              max: 15,
              scope: 'github',
              severity: 'major',
              source: '.github/workflows',
              status: 'unknown',
            },
            {
              confidence: 'medium',
              description: 'Only a root-level package lockfile was found.',
              earned: 12,
              id: 'lockfile',
              label: 'Package lockfile',
              max: 25,
              scope: 'root',
              severity: 'major',
              source: 'package-lock.json',
              status: 'partial',
            },
          ],
        },
      },
    ];

    const localizedReport = localizeProjectReport(report, 'ru');

    expect(localizedReport.analysisSources[0]).toMatchObject({
      description: 'Lockfile указывает на один package manager.',
      label: 'Согласованность lockfile',
    });
    expect(localizedReport.scoreBreakdown[0]?.scoreDetails.checks[0]).toMatchObject({
      description: 'Pull request trigger не найден в workflow.',
      label: 'Pull request CI trigger',
    });
    expect(localizedReport.scoreBreakdown[0]?.scoreDetails.checks[1]).toMatchObject({
      description: 'Найден только корневой package lockfile.',
      label: 'Package lockfile',
    });
    expect(localizedReport.recommendations[0]).toMatchObject({
      description: 'Добавьте build step, чтобы выбранный frontend-проект компилировался в CI.',
      title: 'Запускать production build в CI',
      action: 'Добавьте production build step в workflow для выбранного frontend-пакета.',
    });
  });

  it('localizes every scoring check id for English and Russian reports', () => {
    const report = createReport([]);
    report.scoreBreakdown = [
      {
        category: 'maintainability',
        description: 'Maintainability signals.',
        label: 'Maintainability',
        maxValue: 100,
        status: 'good',
        value: 70,
        scoreDetails: {
          rawValue: 70,
          finalValue: 70,
          weight: 16,
          impactLevel: 'important',
          checks: reportScoreCheckIds.map((id) => ({
            confidence: 'high',
            description: `fallback description ${id}`,
            earned: 1,
            id,
            label: `fallback label ${id}`,
            max: 1,
            scope: 'project',
            severity: 'minor',
            source: id,
            status: 'passed',
          })),
        },
      },
    ];

    for (const language of ['en', 'ru'] as const) {
      const localizedReport = localizeProjectReport(report, language);

      for (const check of localizedReport.scoreBreakdown[0]?.scoreDetails.checks ?? []) {
        expect(check.label).not.toMatch(/^fallback label/u);
        expect(check.description).not.toMatch(/^fallback description/u);
      }
    }
  });

  it('keeps README presence and README quality warning descriptions distinct', () => {
    const report = createReport([]);
    report.scoreBreakdown = [
      {
        category: 'documentation',
        description: 'Documentation signals.',
        label: 'Documentation',
        maxValue: 100,
        status: 'good',
        value: 75,
        scoreDetails: {
          rawValue: 75,
          finalValue: 75,
          weight: 6,
          impactLevel: 'supporting',
          checks: [
            {
              confidence: 'medium',
              description:
                'Root README was found, but it does not clearly document the selected frontend path.',
              earned: 20,
              id: 'readme',
              label: 'README',
              max: 45,
              scope: 'root',
              severity: 'critical',
              source: 'README.md',
              status: 'partial',
            },
            {
              confidence: 'high',
              description: 'README was found, but it is short or misses setup and usage details.',
              earned: 10,
              id: 'readme-quality',
              label: 'README quality',
              max: 35,
              scope: 'root',
              severity: 'major',
              source: 'README.md',
              status: 'partial',
            },
          ],
        },
      },
    ];

    const englishReport = localizeProjectReport(report, 'en');
    const russianReport = localizeProjectReport(report, 'ru');

    expect(englishReport.scoreBreakdown[0]?.scoreDetails.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'readme',
          description:
            'Root README exists, but it does not clearly document the selected frontend path.',
        }),
        expect.objectContaining({
          id: 'readme-quality',
          description: 'README was found, but it is short or misses setup and usage details.',
        }),
      ]),
    );
    expect(russianReport.scoreBreakdown[0]?.scoreDetails.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'readme',
          description:
            'README найден в корне, но не ясно, что он описывает выбранный frontend-путь.',
        }),
        expect.objectContaining({
          id: 'readme-quality',
          description: 'README найден, но он короткий или без деталей установки и использования.',
        }),
      ]),
    );
  });

  it('contains English and Russian localization for every source and project detection id', () => {
    for (const language of ['en', 'ru'] as const) {
      const catalog = getCatalog(language);

      for (const id of reportAnalysisSourceIds) {
        expect(catalog.analysisSources[id]?.label).toBeTruthy();
      }

      for (const id of reportProjectDetectionSignalIds) {
        expect(catalog.projectDetection[id]?.label).toBeTruthy();
      }
    }
  });

  it('contains English and Russian localization for every recommendation id', () => {
    for (const language of ['en', 'ru'] as const) {
      const catalog = getCatalog(language);

      for (const id of reportRecommendationIds) {
        expect(catalog.recommendations[id]?.title).toBeTruthy();
        expect(catalog.recommendations[id]?.description).toBeTruthy();
        expect(catalog.recommendations[id]?.action).toBeTruthy();
      }
    }
  });
});
