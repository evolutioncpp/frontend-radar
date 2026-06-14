import type { ProjectReport } from './reportSchemas.js';
import type { RepositorySignals } from './reportSignalContracts.js';

type ReportRecommendation = ProjectReport['recommendations'][number];

const recommendationSeverityOrder = {
  high: 0,
  medium: 1,
  low: 2,
} as const satisfies Record<ReportRecommendation['severity'], number>;

const isReadmeIncomplete = (signals: RepositorySignals) => {
  return (
    !signals.readme.isSubstantial ||
    !signals.readme.hasInstallSection ||
    !signals.readme.hasUsageSection
  );
};

const sortRecommendationsByPriority = (recommendations: ProjectReport['recommendations']) => {
  return recommendations
    .map((recommendation, index) => ({
      index,
      recommendation,
    }))
    .sort((left, right) => {
      const severityDiff =
        recommendationSeverityOrder[left.recommendation.severity] -
        recommendationSeverityOrder[right.recommendation.severity];

      return severityDiff || left.index - right.index;
    })
    .map(({ recommendation }) => recommendation);
};

export const buildRecommendations = (signals: RepositorySignals) => {
  const recommendations: ProjectReport['recommendations'] = [];

  if (!signals.packageJson.exists) {
    recommendations.push({
      id: 'add-package-metadata',
      severity: 'high',
      title: 'Add package metadata',
      description:
        'Add package.json so scripts, dependencies and project tooling can be installed and checked consistently.',
    });
  }

  if (!signals.ci.exists) {
    recommendations.push({
      id: 'add-github-actions',
      severity: 'high',
      title: 'Add GitHub Actions checks',
      description: 'Add CI workflows so linting, tests and builds run for every change.',
    });
  } else {
    if (!signals.ciAnalysis.pullRequest.found) {
      recommendations.push({
        id: 'add-ci-pr-checks',
        severity: 'medium',
        title: 'Run CI on pull requests',
        description: 'Add a pull_request trigger so frontend checks run before code is merged.',
      });
    }

    if (!signals.ciAnalysis.install.found) {
      recommendations.push({
        id: 'add-ci-install-step',
        severity: 'medium',
        title: 'Install dependencies in CI',
        description:
          'Add an install step such as npm ci, pnpm install or yarn install before checks run.',
      });
    }

    if (!signals.ciAnalysis.lint.found) {
      recommendations.push({
        id: 'add-ci-lint-step',
        severity: 'medium',
        title: 'Run linting in CI',
        description: 'Add a lint step to the GitHub Actions workflow for repeatable code checks.',
      });
    }

    if (!signals.ciAnalysis.test.found) {
      recommendations.push({
        id: 'add-ci-test-step',
        severity: 'high',
        title: 'Run tests in CI',
        description: 'Add a test step so regressions are caught automatically before delivery.',
      });
    }

    if (!signals.ciAnalysis.build.found) {
      recommendations.push({
        id: 'add-ci-build-step',
        severity: 'high',
        title: 'Run production build in CI',
        description: 'Add a build step so the selected frontend project is compiled in CI.',
      });
    }

    if (signals.projectPath && !signals.ciAnalysis.projectScope.found) {
      recommendations.push({
        id: 'scope-ci-to-frontend-path',
        severity: 'medium',
        title: 'Scope CI to the selected frontend path',
        description:
          'Use working-directory, workspace or filter options so CI checks target the analyzed frontend package.',
      });
    }
  }

  if (signals.packageJson.exists && !signals.packageJson.scripts.test.exists) {
    recommendations.push({
      id: 'add-test-script',
      severity: 'high',
      title: 'Add an automated test script',
      description: 'Expose a test script in package.json so quality checks are easy to run.',
    });
  }

  if (signals.packageJson.exists && signals.testQuality.files.count === 0) {
    recommendations.push({
      id: 'add-test-files',
      severity: 'high',
      title: 'Add representative test files',
      description:
        'Add test or spec files for the selected frontend package so the test script validates real behavior.',
    });
  }

  if (signals.packageJson.exists && !signals.testQuality.coverage.found) {
    recommendations.push({
      id: 'add-coverage-signal',
      severity: 'medium',
      title: 'Add a coverage check',
      description:
        'Expose a coverage script or coverage configuration so test quality is easier to track over time.',
    });
  }

  if (signals.packageJson.exists && !signals.packageJson.scripts.build.exists) {
    recommendations.push({
      id: 'add-build-script',
      severity: 'high',
      title: 'Add a production build script',
      description:
        'Expose a build script in package.json so CI can verify that the frontend compiles before delivery.',
    });
  }

  if (!signals.readme.exists) {
    recommendations.push({
      id: 'add-readme',
      severity: 'medium',
      title: 'Add a project README',
      description:
        'Add setup, usage and contribution notes so contributors can understand and run the project quickly.',
    });
  } else if (isReadmeIncomplete(signals)) {
    recommendations.push({
      id: 'improve-readme',
      severity: 'medium',
      title: 'Expand README setup and usage details',
      description:
        'Add installation/setup and usage/examples sections so the README explains how to run and validate the project.',
    });
  }

  if (signals.packageJson.exists && !signals.packageJson.scripts.lint.exists) {
    recommendations.push({
      id: 'add-lint-script',
      severity: 'medium',
      title: 'Add a lint script',
      description: 'Expose linting in package.json to make code quality checks repeatable.',
    });
  }

  if (!signals.typescript.found) {
    recommendations.push({
      id: 'add-typescript',
      severity: 'medium',
      title: 'Add TypeScript coverage',
      description:
        'Add TypeScript configuration or dependencies so maintainability checks can catch interface and refactor issues earlier.',
    });
  } else {
    if (
      signals.typescriptQuality.config.exists &&
      signals.typescriptQuality.config.strict === false &&
      !(
        signals.typescriptQuality.config.noImplicitAny &&
        signals.typescriptQuality.config.strictNullChecks
      )
    ) {
      recommendations.push({
        id: 'enable-typescript-strict',
        severity: 'medium',
        title: 'Enable stricter TypeScript checks',
        description:
          'Enable strict mode or noImplicitAny plus strictNullChecks so refactors catch unsafe contracts earlier.',
      });
    }

    if (!signals.typescriptQuality.typecheck.exists) {
      recommendations.push({
        id: 'add-typecheck-script',
        severity: 'medium',
        title: 'Add a typecheck script',
        description:
          'Expose a dedicated typecheck script such as tsc --noEmit so CI and contributors can validate types without building.',
      });
    }
  }

  if (signals.sourceCode.codeHealth.issueCount > 0) {
    recommendations.push({
      id: 'reduce-source-health-warnings',
      severity: signals.sourceCode.codeHealth.issueCount >= 12 ? 'medium' : 'low',
      title: 'Reduce source-level maintainability warnings',
      description:
        'Review debug logs, TODO/FIXME comments, eslint-disable usage and explicit any hotspots in the selected frontend source.',
    });
  }

  if (signals.packageJson.exists && !signals.testingLibrary.found) {
    recommendations.push({
      id: 'add-testing-library',
      severity: 'medium',
      title: 'Add frontend testing tooling',
      description:
        'Add Vitest, Jest, Playwright or Testing Library so the test script has a clear frontend testing stack behind it.',
    });
  }

  if (!signals.a11yTooling.found) {
    recommendations.push({
      id: 'add-a11y-tooling',
      severity: 'medium',
      title: 'Add accessibility checks',
      description:
        'Add eslint-plugin-jsx-a11y, axe-core or similar tooling so accessibility regressions are easier to catch.',
    });
  }

  if (signals.packageJson.exists && !signals.bundler.found) {
    recommendations.push({
      id: 'add-bundler',
      severity: 'medium',
      title: 'Declare frontend build tooling',
      description:
        'Add or expose a frontend bundler such as Vite, Next.js, Webpack or Parcel so build readiness is easier to verify.',
    });
  }

  if (signals.packageJson.exists && !signals.lockfile.exists) {
    recommendations.push({
      id: 'commit-lockfile',
      severity: 'medium',
      title: 'Commit a package lockfile',
      description: 'A lockfile keeps dependency installs reproducible across machines and CI.',
    });
  }

  if (signals.dependencyHealth.hasMixedLockfiles) {
    recommendations.push({
      id: 'remove-mixed-lockfiles',
      severity: 'medium',
      title: 'Use one package manager lockfile',
      description:
        'Keep one package manager lockfile so local and CI installs resolve dependencies consistently.',
    });
  }

  if (signals.dependencyHealth.packageManagerMismatch) {
    recommendations.push({
      id: 'align-package-manager',
      severity: 'medium',
      title: 'Align package manager metadata',
      description: 'Make package.json packageManager match the committed lockfile package manager.',
    });
  }

  if (signals.dependencyHealth.misplacedDevDependencySources.length > 0) {
    recommendations.push({
      id: 'move-tooling-to-dev-dependencies',
      severity: 'medium',
      title: 'Move tooling to devDependencies',
      description:
        'Keep linting, testing and type tooling out of production dependencies where possible.',
    });
  }

  if (!signals.storybook.found) {
    recommendations.push({
      id: 'add-storybook',
      severity: 'low',
      title: 'Add component documentation',
      description: 'Storybook or similar tooling helps review UI states and accessibility details.',
    });
  }

  if (!signals.envExample.exists) {
    recommendations.push({
      id: 'add-env-example',
      severity: 'low',
      title: 'Document environment variables',
      description: 'Add an .env.example file so setup requirements are clear for contributors.',
    });
  }

  return sortRecommendationsByPriority(recommendations);
};
