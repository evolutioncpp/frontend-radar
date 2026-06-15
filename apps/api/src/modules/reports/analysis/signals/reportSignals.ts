import { readmeQualityConfig } from '../../domain/reportAnalysisConfig.js';

import { buildDependencyHealth } from '../dependencies/reportDependencyAnalyzer.js';
import {
  createEffectiveScriptSignal,
  createPackageJsonSignal,
  createScriptSignal,
  getDependencyNames,
  getDependencySourceMap,
  getWorkspaceMatch,
} from './reportSignalPackage.js';
import { getReadmeProjectRelevance } from './reportReadmeRelevance.js';
import { createPathSignal, getPrimaryLockfile, hasTextPattern } from './reportSignalPaths.js';
import { collectRepositoryBaseSignals } from './reportSignalBaseCollector.js';
import { collectSourceQualitySignals } from './reportSignalSourceAnalysis.js';
import { collectRepositoryToolSignals } from './reportSignalToolCollector.js';
import { collectRepositoryWorkflowSignals } from './reportSignalWorkflowCollector.js';

import type {
  ReportRepositoryReaderContext,
  ReportRepositoryReader,
  PackageJson,
} from '../../application/ports/reportRepositoryReader.js';
import type { RepositorySignals, ScriptName, ScriptSignal } from './reportSignalTypes.js';

export type {
  CollectRepositorySignalsInput,
  DependencySection,
  PackageJsonSignal,
  PathSignal,
  RepositorySignals,
  ScriptName,
  ScriptSignal,
  SignalScope,
  ToolSignal,
} from './reportSignalTypes.js';

export const collectRepositorySignals = async ({
  branch,
  owner,
  packageJson,
  packageJsonPath,
  projectPath,
  reader,
  repository,
  rootPackageJson,
  onProgress,
  context = {},
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  onProgress?: (
    stage: 'source_scan' | 'security_scan' | 'workflow_analysis',
  ) => Promise<void> | void;
  owner: string;
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
  rootPackageJson?: PackageJson | null;
}) => {
  const isNestedProject = projectPath !== '';
  const rootPackage = rootPackageJson ?? (isNestedProject ? null : packageJson);
  const workspace = getWorkspaceMatch(projectPath, rootPackage);
  const projectPackageJson = packageJson;
  const projectDependencyNames = getDependencyNames(projectPackageJson);
  const rootDependencyNames = isNestedProject ? getDependencyNames(rootPackage) : [];
  const projectDependencySourceMap = getDependencySourceMap(projectPackageJson, packageJsonPath);
  const rootDependencySourceMap = getDependencySourceMap(rootPackage, 'package.json');
  const baseSignals = await collectRepositoryBaseSignals({
    branch,
    context,
    owner,
    projectPath,
    reader,
    repository,
  });
  const sourceQualitySignals = await collectSourceQualitySignals({
    branch,
    context,
    envExample: baseSignals.envExample,
    isNestedProject,
    onProgress,
    owner,
    packageJsonPath,
    projectPackageJson,
    projectPath,
    reader,
    repository,
    rootPackageJson: rootPackage,
    typescriptPath: baseSignals.typescriptPath,
  });
  const workflowSignals = await collectRepositoryWorkflowSignals({
    branch,
    context,
    onProgress: () => onProgress?.('workflow_analysis'),
    owner,
    projectPath,
    reader,
    repository,
    workflowNames: baseSignals.workflowNames,
  });
  const primaryLockfile = getPrimaryLockfile(baseSignals.lockfiles);
  const dependencyHealth = buildDependencyHealth({
    lockfiles: baseSignals.lockfiles,
    packageJson: projectPackageJson,
    packageJsonPath,
    rootPackageJson: rootPackage,
  });
  const toolSignals = collectRepositoryToolSignals({
    accessibilityConfigPath: baseSignals.accessibilityConfigPath,
    bundlerConfigPath: baseSignals.bundlerConfigPath,
    formattingConfigPath: baseSignals.formattingConfigPath,
    frameworkConfigPath: baseSignals.frameworkConfigPath,
    lintingConfigPath: baseSignals.lintingConfigPath,
    projectDependencyNames,
    projectDependencySourceMap,
    rootDependencyNames,
    rootDependencySourceMap,
    storybookPath: baseSignals.storybookPath,
    testingConfigPath: baseSignals.testingConfigPath,
    typescriptPath: baseSignals.typescriptPath,
  });
  const scriptSignals = {
    build: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'build',
      useRootFallback: isNestedProject,
    }),
    lint: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'lint',
      useRootFallback: isNestedProject,
    }),
    test: createEffectiveScriptSignal({
      projectPackageJson,
      projectPackageJsonPath: packageJsonPath,
      rootPackageJson: rootPackage,
      scriptName: 'test',
      useRootFallback: isNestedProject,
    }),
  } satisfies Record<ScriptName, ScriptSignal>;
  const packageJsonSignal = createPackageJsonSignal({
    dependencies: projectDependencyNames,
    packageJson: projectPackageJson,
    path: packageJsonPath,
    scripts: scriptSignals,
    scope: 'project',
  });
  return {
    ...toolSignals,
    ci: workflowSignals.ci,
    ciAnalysis: workflowSignals.ciAnalysis,
    dependencyHealth,
    envExample: baseSignals.envExample,
    isNestedProject,
    lockfile: {
      ...primaryLockfile,
      packageManager: dependencyHealth.primaryPackageManager,
    },
    packageJson: packageJsonSignal,
    projectPath,
    readme: {
      ...baseSignals.readmeFile,
      ...createPathSignal(
        baseSignals.readmeFile?.path ?? null,
        baseSignals.readmeFile?.scope ?? null,
      ),
      hasInstallSection: baseSignals.readmeFile
        ? hasTextPattern(baseSignals.readmeFile.content, readmeQualityConfig.installSectionPatterns)
        : false,
      hasUsageSection: baseSignals.readmeFile
        ? hasTextPattern(baseSignals.readmeFile.content, readmeQualityConfig.usageSectionPatterns)
        : false,
      isSubstantial: baseSignals.readmeFile
        ? baseSignals.readmeFile.content.length >= readmeQualityConfig.minLength
        : false,
      length: baseSignals.readmeFile?.content.length ?? 0,
      projectRelevance: baseSignals.readmeFile
        ? getReadmeProjectRelevance({
            content: baseSignals.readmeFile.content,
            packageJson: projectPackageJson,
            projectPath,
          })
        : {
            found: false,
            reasons: [],
          },
    },
    rootPackageJson: createPackageJsonSignal({
      dependencies: rootDependencyNames,
      packageJson: rootPackage,
      path: isNestedProject && rootPackage ? 'package.json' : packageJsonPath,
      scripts: {
        build: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'build',
        }),
        lint: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'lint',
        }),
        test: createScriptSignal({
          packageJson: rootPackage,
          packageJsonPath: isNestedProject ? 'package.json' : packageJsonPath,
          scope: isNestedProject ? 'root' : 'project',
          scriptName: 'test',
        }),
      },
      scope: isNestedProject ? 'root' : 'project',
    }),
    security: sourceQualitySignals.security,
    sourceCode: sourceQualitySignals.sourceCode,
    testQuality: sourceQualitySignals.testQuality,
    typescriptQuality: sourceQualitySignals.typescriptQuality,
    workspace,
  } satisfies RepositorySignals;
};
