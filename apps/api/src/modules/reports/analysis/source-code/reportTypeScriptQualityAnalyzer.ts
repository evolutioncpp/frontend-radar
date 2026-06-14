import {
  getBooleanOption,
  parseTsconfig,
  resolveReferencedTsconfigPath,
  type ParsedTsconfig,
  type ScopedTsconfigFile,
} from './reportTypeScriptConfigParser.js';

import type {
  TypeScriptConfigKind,
  TypeScriptQualitySignals,
  TypecheckSignal,
} from '../../domain/reportSignalContracts.js';
import type { SignalScope } from '../../domain/reportSignalContracts.js';
import type { PackageJson } from '../../application/ports/reportRepositoryReader.js';

type ParsedConfigEntry = {
  compilerOptions: Record<string, unknown>;
  file: ScopedTsconfigFile;
  externalExtends: boolean;
  kind: TypeScriptConfigKind;
  parseError: boolean;
};

const hasCompilerOptions = (compilerOptions: Record<string, unknown>) => {
  return Object.keys(compilerOptions).length > 0;
};

const hasExplicitStrictOptions = (compilerOptions: Record<string, unknown>) => {
  return (
    getBooleanOption(compilerOptions, 'strict') !== null ||
    getBooleanOption(compilerOptions, 'noImplicitAny') !== null ||
    getBooleanOption(compilerOptions, 'strictNullChecks') !== null
  );
};

const isStrictCompilerOptions = (compilerOptions: Record<string, unknown>) => {
  return (
    getBooleanOption(compilerOptions, 'strict') === true ||
    (getBooleanOption(compilerOptions, 'noImplicitAny') === true &&
      getBooleanOption(compilerOptions, 'strictNullChecks') === true)
  );
};

const getEffectiveBooleanOption = (
  parsedConfigs: Array<{ compilerOptions: Record<string, unknown> }>,
  key: string,
) => {
  const values = parsedConfigs
    .map(({ compilerOptions }) => getBooleanOption(compilerOptions, key))
    .filter((value): value is boolean => value !== null);

  if (values.length === 0) {
    return null;
  }

  return values.every(Boolean);
};

const getTsconfigKind = (
  file: ScopedTsconfigFile,
  parsed: ParsedTsconfig | null,
): TypeScriptConfigKind => {
  const fileName = file.path.split('/').pop()?.toLowerCase() ?? file.path.toLowerCase();
  const include = parsed?.include.join(' ').toLowerCase() ?? '';

  if (/(?:eslint|node)/iu.test(fileName)) {
    return 'tooling';
  }

  if (
    /(?:test|spec|vitest|jest|e2e|cypress|playwright)/iu.test(fileName) ||
    /(?:test|spec|e2e|cypress|playwright)/iu.test(include)
  ) {
    return 'test';
  }

  if (
    fileName === 'tsconfig.app.json' ||
    /(?:^|[\s/])(?:src|app|pages)(?:[\s/]|$)/iu.test(include)
  ) {
    return 'source';
  }

  return 'unknown';
};

const mergeCompilerOptions = (
  entry: ScopedTsconfigFile,
  parsedByPath: Map<string, ParsedTsconfig | null>,
  visited = new Set<string>(),
): Record<string, unknown> => {
  if (visited.has(entry.path)) {
    return {};
  }

  visited.add(entry.path);
  const parsed = parsedByPath.get(entry.path);

  if (!parsed) {
    return {};
  }

  const parentPath = parsed.extendsPath
    ? resolveReferencedTsconfigPath(entry.path, parsed.extendsPath, 'extends')
    : null;
  const parentOptions =
    parentPath && parsedByPath.has(parentPath)
      ? mergeCompilerOptions(
          {
            content: '',
            path: parentPath,
            scope: entry.scope,
          },
          parsedByPath,
          visited,
        )
      : {};

  return {
    ...parentOptions,
    ...parsed.compilerOptions,
  };
};

const findTypecheckScript = ({
  packageJson,
  packageJsonPath,
  scope,
}: {
  packageJson: PackageJson | null;
  packageJsonPath: string | null;
  scope: SignalScope;
}): TypecheckSignal => {
  const scripts = packageJson?.scripts ?? {};
  const entry = Object.entries(scripts).find(([name, value]) => {
    if (typeof value !== 'string') {
      return false;
    }

    return (
      /type(?:-?check|s)?/iu.test(name) ||
      /\b(?:tsc\s+(?:--noEmit|-b)|vue-tsc|svelte-check)\b/iu.test(value)
    );
  });

  if (!entry || !packageJsonPath) {
    return {
      exists: false,
      scope: null,
      source: null,
      value: null,
    };
  }

  const [name, value] = entry;

  return {
    exists: true,
    scope,
    source: `${packageJsonPath} scripts.${name}`,
    value: typeof value === 'string' ? value : null,
  };
};

export const analyzeTypeScriptQuality = ({
  isNestedProject,
  missingTsconfigPaths = [],
  projectPackageJson,
  projectPackageJsonPath,
  rootPackageJson,
  tsconfigFiles,
}: {
  isNestedProject: boolean;
  missingTsconfigPaths?: string[];
  projectPackageJson: PackageJson | null;
  projectPackageJsonPath: string | null;
  rootPackageJson: PackageJson | null;
  tsconfigFiles: ScopedTsconfigFile[];
}): TypeScriptQualitySignals => {
  const parsedByPath = new Map(
    tsconfigFiles.map((file) => [file.path, parseTsconfig(file.content)]),
  );
  const entries = tsconfigFiles.map((file): ParsedConfigEntry => {
    const parsed = parsedByPath.get(file.path) ?? null;

    return {
      compilerOptions: parsed ? mergeCompilerOptions(file, parsedByPath) : {},
      externalExtends: parsed?.externalExtends ?? false,
      file,
      kind: getTsconfigKind(file, parsed),
      parseError: parsed === null,
    };
  });
  const sourceEntries = entries.filter((entry) => entry.kind === 'source');
  const compilerOptionEntries = entries.filter(
    (entry) => !entry.parseError && hasCompilerOptions(entry.compilerOptions),
  );
  const evaluationEntries =
    sourceEntries.length > 0
      ? sourceEntries
      : compilerOptionEntries.length > 0
        ? compilerOptionEntries
        : entries;
  const evaluationWithOptions = evaluationEntries.filter(
    (entry) => !entry.parseError && hasCompilerOptions(entry.compilerOptions),
  );
  const hasMissingRelevantConfig =
    missingTsconfigPaths.length > 0 &&
    missingTsconfigPaths.some(
      (path) => getTsconfigKind({ content: '', path, scope: 'project' }, null) !== 'tooling',
    );
  const hasParseError = evaluationEntries.some((entry) => entry.parseError);
  const hasUnknownExternalExtends = evaluationWithOptions.some(
    (entry) => entry.externalExtends && !hasExplicitStrictOptions(entry.compilerOptions),
  );
  const strict =
    hasMissingRelevantConfig || hasParseError || hasUnknownExternalExtends
      ? null
      : evaluationWithOptions.length > 0
        ? evaluationWithOptions.every((entry) => isStrictCompilerOptions(entry.compilerOptions))
        : null;
  const sourcePaths =
    strict === false
      ? evaluationWithOptions
          .filter((entry) => !isStrictCompilerOptions(entry.compilerOptions))
          .map((entry) => entry.file.path)
      : evaluationWithOptions.map((entry) => entry.file.path);
  const projectTypecheck = findTypecheckScript({
    packageJson: projectPackageJson,
    packageJsonPath: projectPackageJsonPath,
    scope: 'project',
  });
  const rootTypecheck = projectTypecheck.exists
    ? projectTypecheck
    : findTypecheckScript({
        packageJson: rootPackageJson,
        packageJsonPath: 'package.json',
        scope: isNestedProject ? 'root' : 'project',
      });

  return {
    config: {
      allowJs: getEffectiveBooleanOption(evaluationWithOptions, 'allowJs'),
      configPaths: tsconfigFiles.map((file) => file.path),
      exists: tsconfigFiles.length > 0,
      hasMissingConfig: hasMissingRelevantConfig,
      hasParseError: entries.some((entry) => entry.parseError),
      noImplicitAny: getEffectiveBooleanOption(evaluationWithOptions, 'noImplicitAny'),
      noUncheckedIndexedAccess: getEffectiveBooleanOption(
        evaluationWithOptions,
        'noUncheckedIndexedAccess',
      ),
      parseError: hasParseError || hasMissingRelevantConfig || hasUnknownExternalExtends,
      path:
        [...sourcePaths, ...(hasMissingRelevantConfig ? missingTsconfigPaths : [])].join(', ') ||
        tsconfigFiles[0]?.path ||
        null,
      scope: tsconfigFiles[0]?.scope ?? null,
      strict,
      strictNullChecks: getEffectiveBooleanOption(evaluationWithOptions, 'strictNullChecks'),
    },
    typecheck: rootTypecheck,
  };
};
