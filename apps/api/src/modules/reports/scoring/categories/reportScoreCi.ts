import { createCheck, createCiCheck, createMetric } from '../reportScoreCheckBuilders.js';

import type { RepositorySignals } from '../../analysis/signals/reportSignals.js';

export const buildCiScore = (signals: RepositorySignals) =>
  createMetric({
    category: 'ci',
    label: 'CI/CD',
    description: 'Automated delivery checks from GitHub Actions workflows.',
    checks: [
      createCheck({
        description: signals.ci.exists ? undefined : 'No GitHub Actions workflow was found.',
        earned: signals.ci.exists ? 20 : 0,
        id: 'github-actions',
        label: 'GitHub Actions workflow',
        max: 20,
        scope: 'github',
        severity: 'critical',
        source: signals.ci.source ?? '.github/workflows',
        status: signals.ci.exists ? 'passed' : 'failed',
        confidence: 'high',
      }),
      createCiCheck({
        id: 'ci-pr-trigger',
        label: 'Pull request CI trigger',
        max: 15,
        missingDescription: 'No pull request trigger was detected in analyzed workflows.',
        signal: signals.ciAnalysis.pullRequest,
        severity: 'major',
      }),
      createCiCheck({
        id: 'ci-install-step',
        label: 'CI install step',
        max: 15,
        missingDescription: 'No dependency installation step was detected in analyzed workflows.',
        signal: signals.ciAnalysis.install,
        severity: 'major',
      }),
      createCiCheck({
        id: 'ci-lint-step',
        label: 'CI lint step',
        max: 15,
        missingDescription: 'No lint step was detected in analyzed workflows.',
        signal: signals.ciAnalysis.lint,
        severity: 'major',
      }),
      createCiCheck({
        id: 'ci-test-step',
        label: 'CI test step',
        max: 20,
        missingDescription: 'No test step was detected in analyzed workflows.',
        signal: signals.ciAnalysis.test,
        severity: 'major',
      }),
      createCiCheck({
        id: 'ci-build-step',
        label: 'CI build step',
        max: 15,
        missingDescription: 'No build step was detected in analyzed workflows.',
        signal: signals.ciAnalysis.build,
        severity: 'major',
      }),
      createCheck({
        description: !signals.ci.exists
          ? 'No GitHub Actions workflow was found.'
          : signals.projectPath && !signals.ciAnalysis.projectScope.found
            ? 'Analyzed workflows do not clearly target the selected frontend path.'
            : undefined,
        earned: !signals.ci.exists
          ? 0
          : !signals.projectPath
            ? 10
            : signals.ciAnalysis.projectScope.found
              ? 10
              : 3,
        id: 'ci-project-scope',
        label: 'CI project scope',
        max: 10,
        scope: signals.projectPath ? 'project' : 'repository',
        severity: signals.projectPath ? 'major' : 'minor',
        source: signals.ciAnalysis.projectScope.sources.join(', ') || signals.projectPath,
        status: !signals.ci.exists
          ? 'failed'
          : !signals.projectPath
            ? 'passed'
            : signals.ciAnalysis.projectScope.found
              ? 'passed'
              : 'partial',
        confidence: signals.ciAnalysis.projectScope.found ? 'high' : 'medium',
      }),
    ],
  });
