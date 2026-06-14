import { sourceCodeAnalysisConfig } from '../../domain/reportAnalysisConfig.js';
import { joinRepositoryPath } from '../../domain/reportPathUtils.js';

import type { SourceFileSignal } from '../../domain/reportSignalContracts.js';
import type {
  ReportRepositoryReaderContext,
  ReportRepositoryReader,
  RepositoryDirectoryEntry,
} from '../../application/ports/reportRepositoryReader.js';

type ScanDirectory = {
  depth: number;
  path: string;
};

const hasAllowedExtension = (path: string) => {
  const normalizedPath = path.toLowerCase();

  return sourceCodeAnalysisConfig.fileExtensions.some((extension) =>
    normalizedPath.endsWith(extension),
  );
};

const isIgnoredFile = (path: string) => {
  return sourceCodeAnalysisConfig.ignoredFilePatterns.some((pattern) => pattern.test(path));
};

const isIgnoredDirectory = (entry: RepositoryDirectoryEntry) => {
  return sourceCodeAnalysisConfig.ignoredDirectoryNames.includes(
    entry.name as (typeof sourceCodeAnalysisConfig.ignoredDirectoryNames)[number],
  );
};

const getFileKind = (path: string): SourceFileSignal['kind'] => {
  if (/(?:^|\/)(?:e2e|cypress)\//iu.test(path)) {
    return 'e2e';
  }

  if (/(?:^|\/)__tests__\//iu.test(path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/iu.test(path)) {
    return 'test';
  }

  if (
    /(?:^|\/)(?:vite|vitest|jest|playwright|cypress|webpack|next|eslint|prettier|tailwind|postcss|storybook|babel|rollup)\.config\.[cm]?[jt]s$/iu.test(
      path,
    ) ||
    /(?:^|\/)\.?storybook\/main\.[cm]?[jt]s$/iu.test(path)
  ) {
    return 'config';
  }

  return 'source';
};

const getPreviewSources = (files: readonly SourceFileSignal[]) => {
  return files.slice(0, sourceCodeAnalysisConfig.sourcePreviewLimit).map((file) => file.path);
};

export const scanProjectSourceFiles = async ({
  branch,
  context = {},
  owner,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
}): Promise<{
  files: SourceFileSignal[];
  isTruncated: boolean;
  sources: string[];
}> => {
  if (
    typeof reader.listDirectoryEntries !== 'function' ||
    typeof reader.readTextFile !== 'function'
  ) {
    return {
      files: [],
      isTruncated: false,
      sources: [],
    };
  }

  const files: SourceFileSignal[] = [];
  const queue: ScanDirectory[] = [{ path: projectPath, depth: 0 }];
  let isTruncated = false;

  while (queue.length > 0 && files.length < sourceCodeAnalysisConfig.maxFiles) {
    const directory = queue.shift();

    if (!directory) {
      break;
    }

    const entries = await reader.listDirectoryEntries(
      owner,
      repository,
      branch,
      directory.path,
      context,
    );

    for (const entry of entries) {
      if (entry.type === 'dir') {
        if (directory.depth >= sourceCodeAnalysisConfig.maxDepth || isIgnoredDirectory(entry)) {
          if (directory.depth >= sourceCodeAnalysisConfig.maxDepth) {
            isTruncated = true;
          }

          continue;
        }

        queue.push({
          depth: directory.depth + 1,
          path: entry.path || joinRepositoryPath(directory.path, entry.name),
        });
        continue;
      }

      const filePath = entry.path || joinRepositoryPath(directory.path, entry.name);

      if (!hasAllowedExtension(filePath) || isIgnoredFile(filePath)) {
        continue;
      }

      if (files.length >= sourceCodeAnalysisConfig.maxFiles) {
        isTruncated = true;
        break;
      }

      const content = await reader.readTextFile(owner, repository, branch, filePath, context);

      if (content === null) {
        continue;
      }

      if (content.length > sourceCodeAnalysisConfig.maxFileSizeBytes) {
        isTruncated = true;
        continue;
      }

      files.push({
        content,
        kind: getFileKind(filePath),
        path: filePath,
      });
    }
  }

  if (queue.length > 0) {
    isTruncated = true;
  }

  return {
    files,
    isTruncated,
    sources: getPreviewSources(files),
  };
};
