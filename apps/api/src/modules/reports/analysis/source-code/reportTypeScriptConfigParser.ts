import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';

import type { SignalScope } from '../../domain/reportSignalContracts.js';
import type { TextFileMatch } from '../../application/ports/reportRepositoryReader.js';

export type ScopedTsconfigFile = TextFileMatch & { scope: SignalScope };

export type ParsedTsconfig = {
  compilerOptions: Record<string, unknown>;
  extendsPath: string | null;
  externalExtends: boolean;
  include: string[];
  references: string[];
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

const isLocalTsconfigReference = (path: string) => {
  return path.startsWith('./') || path.startsWith('../') || path.startsWith('/');
};

export const parseTsconfig = (content: string): ParsedTsconfig | null => {
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

export const getBooleanOption = (compilerOptions: Record<string, unknown>, key: string) => {
  const value = compilerOptions[key];

  return typeof value === 'boolean' ? value : null;
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

export const resolveReferencedTsconfigPath = (
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
