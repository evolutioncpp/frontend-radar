import { describe, expect, it } from 'vitest';

import { reportAnalysisSourceIds } from '../analysis/sources/reportAnalysisSources.js';
import { getCatalog } from './catalogs/reportLocalizationCatalogs.js';
import { localizeProjectReport } from './reportLocalization.js';
import { reportProjectDetectionSignalIds } from '../analysis/project-detector/reportProjectDetector.js';
import { reportScoreCheckIds } from '../scoring/reportScoreCheckIds.js';

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
  it('localizes new recommendation ids', () => {
    const localizedReport = localizeProjectReport(
      createReport([
        {
          description:
            'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
          id: 'add-a11y-tooling',
          severity: 'medium',
          title: 'Add accessibility checks',
        },
      ]),
      'ru',
    );

    expect(localizedReport.recommendations[0]).toMatchObject({
      description:
        'Добавьте eslint-plugin-jsx-a11y, axe-core или похожий инструмент, чтобы раньше находить регрессии доступности.',
      title: 'Добавить проверки доступности',
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
      {
        description: 'Add a build step so the selected frontend project is compiled in CI.',
        id: 'add-ci-build-step',
        severity: 'high',
        title: 'Run production build in CI',
      },
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
      description: 'Добавьте build step, чтобы выбранный frontend-проект проверялся в CI.',
      title: 'Запустить production build в CI',
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
});
