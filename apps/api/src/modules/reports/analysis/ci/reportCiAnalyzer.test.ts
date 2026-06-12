import { describe, expect, it } from 'vitest';

import { buildCiAnalysis, sortWorkflowNamesByAnalysisPriority } from './reportCiAnalyzer.js';

describe('reportCiAnalyzer', () => {
  it('detects PR trigger, install, lint, test, build and project scope signals', () => {
    const analysis = buildCiAnalysis({
      projectPath: 'apps/web',
      workflowFiles: [
        {
          content: [
            'on: [pull_request, push]',
            'jobs:',
            '  checks:',
            '    defaults:',
            '      run:',
            '        working-directory: apps/web',
            '    steps:',
            '      - uses: actions/setup-node@v4',
            '        with:',
            '          cache: pnpm',
            '      - run: pnpm install --frozen-lockfile',
            '      - run: pnpm lint',
            '      - run: pnpm test',
            '      - run: pnpm build',
          ].join('\n'),
          name: 'ci.yml',
          path: '.github/workflows/ci.yml',
        },
      ],
    });

    expect(analysis.pullRequest).toMatchObject({ found: true });
    expect(analysis.install).toMatchObject({ found: true });
    expect(analysis.lint).toMatchObject({ found: true });
    expect(analysis.test).toMatchObject({ found: true });
    expect(analysis.build).toMatchObject({ found: true });
    expect(analysis.cache).toMatchObject({ found: true });
    expect(analysis.projectScope).toMatchObject({ found: true });
  });

  it('does not treat unrelated workspace hints as selected project scope', () => {
    const analysis = buildCiAnalysis({
      projectPath: 'apps/web',
      workflowFiles: [
        {
          content: [
            'on: pull_request',
            'jobs:',
            '  checks:',
            '    defaults:',
            '      run:',
            '        working-directory: apps/api',
            '    steps:',
            '      - run: pnpm --filter apps/api test',
          ].join('\n'),
          name: 'ci.yml',
          path: '.github/workflows/ci.yml',
        },
      ],
    });

    expect(analysis.projectScope).toMatchObject({
      found: false,
      sources: [],
    });
  });

  it('keeps missing quality steps explicit for deploy-only workflows', () => {
    const analysis = buildCiAnalysis({
      projectPath: 'apps/web',
      workflowFiles: [
        {
          content: [
            'on: push',
            'jobs:',
            '  deploy:',
            '    steps:',
            '      - run: echo deploy',
          ].join('\n'),
          name: 'deploy.yml',
          path: '.github/workflows/deploy.yml',
        },
      ],
    });

    expect(analysis.push).toMatchObject({ found: true });
    expect(analysis.pullRequest).toMatchObject({ found: false });
    expect(analysis.install).toMatchObject({ found: false });
    expect(analysis.lint).toMatchObject({ found: false });
    expect(analysis.test).toMatchObject({ found: false });
    expect(analysis.build).toMatchObject({ found: false });
    expect(analysis.projectScope).toMatchObject({ found: false });
  });

  it('prioritizes likely quality workflow names before deploy and release workflows', () => {
    expect(
      sortWorkflowNamesByAnalysisPriority(['release.yml', 'deploy.yml', 'lint.yml', 'ci.yml']),
    ).toEqual(['ci.yml', 'lint.yml', 'deploy.yml', 'release.yml']);
  });
});
