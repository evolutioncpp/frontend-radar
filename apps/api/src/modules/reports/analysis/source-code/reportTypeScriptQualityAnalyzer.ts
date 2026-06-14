import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';

import type {
  SignalScope,
  TypeScriptConfigKind,
  TypeScriptQualitySignals,
  TypecheckSignal,
} from '../../domain/reportSignalContracts.js';
import type {
  PackageJson,
  TextFileMatch,
} from '../../infrastructure/github/githubRepositoryReader.js';

export type ScopedTsconfigFile = TextFileMatch & { scope: SignalScope };

type ParsedTsconfig = {
  compilerOptions: Record<string, unknown>;
  extendsPath: string | null;
  externalExtends: boolean;
  include: string[];
  references: string[];
};

type ParsedConfigEntry = {
  compilerOptions: Record<string, unknown>;
  file: ScopedTsconfigFile;
  externalExtends: boolean;
  kind: TypeScriptConfigKind;
  parseError: boolean;
};

const stripJsonComments = (content: string) => {
  let result = '';
  let isInsideString = false;
  let isEscaped = false;
  let commentMode: 'block' | 'line' | null = null;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (commentMode === 'line') {
      if (char === '\n' || char === '\r') {
        commentMode = null;
        result += char;
      }

      continue;
    }

    if (commentMode === 'block') {
      if (char === '\n' || char === '\r') {
        result += char;
      }

      if (char === '*' && nextChar === '/') {
        commentMode = null;
        index += 1;
      }

      continue;
    }

    if (isInsideString) {
      result += char;

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if (char === '"') {
        isInsideString = false;
      }

      continue;
    }

    if (char === '"') {
      isInsideString = true;
      result += char;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      commentMode = 'line';
      index += 1;
      continue;
    }

    if (char === '/' && nextChar === '*') {
      commentMode = 'block';
      index += 1;
      continue;
    }

    result += char;
  }

  return result;
};

const getStringArray = (value: unknown) => {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
};

const getReferencePaths = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((reference) => {
      if (typeof reference !== 'object' || reference === null || Array.isArray(reference)) {
        return null;
      }

      const path = (reference as Record<string, unknown>).path;

      return typeof path === 'string' ? path : null;
    })
    .filter((path): path is string => path !== null);
};

const parseTsconfig = (content: string): ParsedTsconfig | null => {
  try {
    const parsed = JSON.parse(stripJsonComments(content)) as unknown;

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const compilerOptions = record.compilerOptions;
    const extendsValue = record.extends;

    return {
      compilerOptions:
        typeof compilerOptions === 'object' &&
        compilerOptions !== null &&
        !Array.isArray(compilerOptions)
          ? (compilerOptions as Record<string, unknown>)
          : {},
      extendsPath:
        typeof extendsValue === 'string' && isLocalTsconfigReference(extendsValue)
          ? extendsValue
          : null,
      externalExtends: typeof extendsValue === 'string' && !isLocalTsconfigReference(extendsValue),
      include: getStringArray(record.include),
      references: getReferencePaths(record.references),
    };
  } catch {
    return null;
  }
};

const getBooleanOption = (compilerOptions: Record<string, unknown>, key: string) => {
  const value = compilerOptions[key];

  return typeof value === 'boolean' ? value : null;
};

const isLocalTsconfigReference = (path: string) => {
  return path.startsWith('./') || path.startsWith('../') || path.startsWith('/');
};

const normalizeRepositoryPath = (...segments: string[]) => {
  const normalizedSegments: string[] = [];

  for (const segment of segments) {
    for (const part of segment.replace(/\\/gu, '/').split('/')) {
      if (!part || part === '.') {
        continue;
      }

      if (part === '..') {
        if (normalizedSegments.length === 0) {
          return null;
        }

        normalizedSegments.pop();
        continue;
      }

      normalizedSegments.push(part);
    }
  }

  return normalizedSegments.join('/');
};

const getDirectoryPath = (path: string) => {
  const lastSeparatorIndex = path.lastIndexOf('/');

  return lastSeparatorIndex === -1 ? '' : path.slice(0, lastSeparatorIndex);
};

const ensureJsonPath = (path: string) => {
  return /\.json$/iu.test(path) ? path : `${path}.json`;
};

const resolveReferencedTsconfigPath = (
  tsconfigPath: string,
  referencePath: string,
  mode: 'extends' | 'reference',
) => {
  const baseDirectory = getDirectoryPath(tsconfigPath);
  const resolvedPath = normalizeRepositoryPath(baseDirectory, referencePath);

  if (!resolvedPath) {
    return null;
  }

  if (mode === 'reference') {
    return /\.json$/iu.test(resolvedPath)
      ? resolvedPath
      : normalizeRepositoryPath(resolvedPath, 'tsconfig.json');
  }

  return ensureJsonPath(resolvedPath);
};

export const isTypeScriptConfigPath = (path: string) => {
  const normalizedPath = path.toLowerCase();

  return /(?:^|\/)(?:tsconfig|jsconfig)(?:\.[^/]*)?\.json$/u.test(normalizedPath);
};

export const getRelatedTsconfigPaths = (tsconfigFile: ScopedTsconfigFile) => {
  const parsed = parseTsconfig(tsconfigFile.content);

  if (!parsed) {
    return {
      externalExtends: false,
      paths: [],
    };
  }

  const paths = [
    ...parsed.references.map((referencePath) =>
      resolveReferencedTsconfigPath(tsconfigFile.path, referencePath, 'reference'),
    ),
    ...(parsed.extendsPath
      ? [resolveReferencedTsconfigPath(tsconfigFile.path, parsed.extendsPath, 'extends')]
      : []),
  ].filter((path): path is string => path !== null && path !== tsconfigFile.path);

  return {
    externalExtends: parsed.externalExtends,
    paths: Array.from(new Set(paths)).slice(0, sourceCodeAnalysisConfig.tsconfigMaxRelatedPaths),
  };
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
