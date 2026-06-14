import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';

import type {
  SourceCodeSignalCheck,
  SourceCodeSignals,
  SourceFileSignal,
} from '../../domain/reportSignalContracts.js';

const uniqueSources = (sources: readonly string[]) => [...new Set(sources)];

const createCheck = (sources: readonly string[]): SourceCodeSignalCheck => {
  const unique = uniqueSources(sources);

  return {
    found: unique.length > 0,
    sources: unique.slice(0, sourceCodeAnalysisConfig.sourcePreviewLimit),
  };
};

const countMatches = (content: string, pattern: RegExp) => {
  return [...content.matchAll(pattern)].length;
};

const entrypointPathPatterns = [
  /(?:^|\/)src\/(?:main|index)\.[cm]?[jt]sx?$/iu,
  /(?:^|\/)src\/App\.[cm]?[jt]sx?$/u,
  /(?:^|\/)(?:app|pages)\/(?:layout|page|_app|index)\.[cm]?[jt]sx?$/iu,
  /(?:^|\/)src\/router\.[cm]?[jt]sx?$/iu,
];

const isEntrypoint = (file: SourceFileSignal) => {
  return entrypointPathPatterns.some((pattern) => pattern.test(file.path));
};

const hasCodeSplitting = (file: SourceFileSignal) => {
  return (
    /\bReact\.lazy\s*\(/u.test(file.content) ||
    /\blazy\s*\(/u.test(file.content) ||
    /\bimport\s*\(/u.test(file.content)
  );
};

const hasErrorBoundary = (file: SourceFileSignal) => {
  return (
    /error[-_]?boundary/iu.test(file.path) ||
    /\bcomponentDidCatch\s*\(/u.test(file.content) ||
    /\bgetDerivedStateFromError\s*\(/u.test(file.content) ||
    /\breact-error-boundary\b/u.test(file.content) ||
    /(?:^|\/)error\.[cm]?[jt]sx?$/iu.test(file.path)
  );
};

export const analyzeSourceCode = (input: {
  files: SourceFileSignal[];
  isTruncated: boolean;
  sources: string[];
}): SourceCodeSignals => {
  const { files, isTruncated } = input;
  const sourceFiles = files.filter((file) => file.kind === 'source');
  const entrypointSources = sourceFiles.filter(isEntrypoint).map((file) => file.path);
  const codeSplittingSources = sourceFiles.filter(hasCodeSplitting).map((file) => file.path);
  const errorBoundarySources = sourceFiles.filter(hasErrorBoundary).map((file) => file.path);
  const codeHealthSources: string[] = [];
  let anyCount = 0;
  let consoleCount = 0;
  let eslintDisableCount = 0;
  let todoCount = 0;

  for (const file of sourceFiles) {
    const fileConsoleCount = countMatches(file.content, /\bconsole\.(?:log|debug)\s*\(/gu);
    const fileTodoCount = countMatches(file.content, /\b(?:TODO|FIXME)\b/giu);
    const fileEslintDisableCount = countMatches(file.content, /eslint-disable/giu);
    const fileAnyCount =
      countMatches(file.content, /(?:^|[^\w])as\s+any(?:[^\w]|$)/gu) +
      countMatches(file.content, /:\s*any(?:[^\w]|$)/gu);

    if (fileConsoleCount + fileTodoCount + fileEslintDisableCount + fileAnyCount > 0) {
      codeHealthSources.push(file.path);
    }

    anyCount += fileAnyCount;
    consoleCount += fileConsoleCount;
    eslintDisableCount += fileEslintDisableCount;
    todoCount += fileTodoCount;
  }

  return {
    codeHealth: {
      anyCount,
      consoleCount,
      eslintDisableCount,
      issueCount: anyCount + consoleCount + eslintDisableCount + todoCount,
      sources: uniqueSources(codeHealthSources).slice(
        0,
        sourceCodeAnalysisConfig.sourcePreviewLimit,
      ),
      todoCount,
    },
    codeSplitting: createCheck(codeSplittingSources),
    entrypoints: createCheck(entrypointSources),
    errorBoundaries: createCheck(errorBoundarySources),
    files: {
      count: sourceFiles.length,
      isTruncated,
      sources: uniqueSources(sourceFiles.map((file) => file.path)).slice(
        0,
        sourceCodeAnalysisConfig.sourcePreviewLimit,
      ),
    },
  };
};
