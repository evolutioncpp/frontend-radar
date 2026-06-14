import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';

import type {
  SourceCodeSignalCheck,
  SourceFileSignal,
  TestQualitySignals,
} from '../../domain/reportSignalContracts.js';
import type { PackageJson } from '../../application/ports/reportRepositoryReader.js';

const uniqueSources = (sources: readonly string[]) => [...new Set(sources)];

const createCheck = (sources: readonly string[]): SourceCodeSignalCheck => {
  const unique = uniqueSources(sources);

  return {
    found: unique.length > 0,
    sources: unique.slice(0, sourceCodeAnalysisConfig.sourcePreviewLimit),
  };
};

const isTestFile = (path: string) => {
  return /(?:^|\/)__tests__\//iu.test(path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/iu.test(path);
};

const isE2eFile = (path: string, content: string) => {
  return (
    /(?:^|\/)(?:e2e|playwright|cypress)\//iu.test(path) ||
    /(?:playwright|cypress)\.config\.[cm]?[jt]s$/iu.test(path) ||
    /\btest\s*\(\s*['"`].*?\bpage\b/iu.test(content) ||
    /\bcy\./u.test(content)
  );
};

const isComponentTest = (file: SourceFileSignal) => {
  return (
    /\.(?:test|spec)\.[cm]?[jt]sx$/iu.test(file.path) ||
    /@testing-library\/(?:react|vue|svelte|angular)/iu.test(file.content) ||
    /\brender\s*\(/u.test(file.content)
  );
};

const getCoverageScriptSources = ({
  packageJson,
  packageJsonPath,
}: {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
}) => {
  if (!packageJson?.scripts || !packageJsonPath) {
    return [];
  }

  return Object.entries(packageJson.scripts)
    .filter(([name, value]) => {
      if (typeof value !== 'string') {
        return false;
      }

      return (
        /coverage/iu.test(name) ||
        /(?:--coverage|\bnyc\b|\bc8\b|\b(?:vitest|jest)\b[^\n\r]*\bcoverage\b)/iu.test(value)
      );
    })
    .map(([name]) => `${packageJsonPath} scripts.${name}`);
};

const hasCoverageConfig = (file: SourceFileSignal) => {
  return (
    /coverage/iu.test(file.path) ||
    /\bcoverage\s*:/iu.test(file.content) ||
    /\bcoverageProvider\s*:/iu.test(file.content)
  );
};

export const analyzeTestQuality = ({
  files,
  isTruncated,
  isNestedProject,
  projectPackageJson,
  projectPackageJsonPath,
  rootPackageJson,
}: {
  files: SourceFileSignal[];
  isTruncated: boolean;
  isNestedProject: boolean;
  projectPackageJson: PackageJson | null;
  projectPackageJsonPath: string | null;
  rootPackageJson: PackageJson | null;
}): TestQualitySignals => {
  const testFiles = files.filter((file) => isTestFile(file.path));
  const e2eFiles = files.filter((file) => isE2eFile(file.path, file.content));
  const componentTestFiles = testFiles.filter(isComponentTest);
  const unitTestFiles = testFiles.filter((file) => !isE2eFile(file.path, file.content));
  const projectCoverageScriptSources = getCoverageScriptSources({
    packageJson: projectPackageJson,
    packageJsonPath: projectPackageJsonPath,
  });
  const rootCoverageScriptSources =
    projectCoverageScriptSources.length === 0 && isNestedProject
      ? getCoverageScriptSources({
          packageJson: rootPackageJson,
          packageJsonPath: 'package.json',
        })
      : [];
  const coverageConfigSources = files
    .filter((file) => file.kind === 'config')
    .filter(hasCoverageConfig)
    .map((file) => file.path);
  const coverageSources = [
    ...projectCoverageScriptSources,
    ...rootCoverageScriptSources,
    ...coverageConfigSources,
  ];

  return {
    coverage: {
      ...createCheck(coverageSources),
      scope:
        projectCoverageScriptSources.length > 0 || coverageConfigSources.length > 0
          ? 'project'
          : rootCoverageScriptSources.length > 0
            ? 'root'
            : null,
    },
    e2e: createCheck(e2eFiles.map((file) => file.path)),
    files: {
      componentCount: componentTestFiles.length,
      count: testFiles.length,
      e2eCount: e2eFiles.length,
      isTruncated,
      sources: uniqueSources(testFiles.map((file) => file.path)).slice(
        0,
        sourceCodeAnalysisConfig.sourcePreviewLimit,
      ),
      unitCount: unitTestFiles.length,
    },
  };
};
