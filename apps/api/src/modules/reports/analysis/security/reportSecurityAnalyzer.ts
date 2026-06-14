import { securityAnalysisConfig } from '../../domain/reportAnalysisConfig.js';
import { joinRepositoryPath } from '../../domain/reportPathUtils.js';

import type {
  ReportRepositoryReaderContext,
  ReportRepositoryReader,
  RepositoryDirectoryEntry,
} from '../../application/ports/reportRepositoryReader.js';
import type {
  PathSignal,
  SecuritySecretPatternKind,
  SecuritySecretPatternMatch,
  SecuritySensitiveFile,
  SecuritySignals,
  SourceFileSignal,
} from '../../domain/reportSignalContracts.js';

type SecurityDirectoryScope = Exclude<SecuritySensitiveFile['scope'], null>;

type SecurityDirectory = {
  path: string;
  scope: SecurityDirectoryScope;
};

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

const getPreviewSources = (sources: readonly string[]) => {
  return uniqueStrings(sources).slice(0, securityAnalysisConfig.sourcePreviewLimit);
};

const isSensitiveFileName = (name: string) => {
  return securityAnalysisConfig.sensitiveFileNames.includes(
    name as (typeof securityAnalysisConfig.sensitiveFileNames)[number],
  );
};

const getSensitiveFileKind = (entry: RepositoryDirectoryEntry): SecuritySensitiveFile['kind'] => {
  if (entry.name === '.npmrc') {
    return 'npmrc';
  }

  if (securityAnalysisConfig.privateKeyFilePatterns.some((pattern) => pattern.test(entry.path))) {
    return 'private_key';
  }

  return 'env';
};

const isSensitiveFile = (entry: RepositoryDirectoryEntry) => {
  return (
    entry.type === 'file' &&
    (isSensitiveFileName(entry.name) ||
      securityAnalysisConfig.privateKeyFilePatterns.some((pattern) => pattern.test(entry.path)))
  );
};

const getSecurityDirectories = (projectPath: string): SecurityDirectory[] => {
  if (!projectPath) {
    return [{ path: '', scope: 'project' }];
  }

  return [
    { path: projectPath, scope: 'project' },
    { path: '', scope: 'root' },
  ];
};

const listSensitiveFiles = async ({
  branch,
  context,
  owner,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  context: ReportRepositoryReaderContext;
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
}) => {
  if (typeof reader.listDirectoryEntries !== 'function') {
    return [];
  }

  const files: SecuritySensitiveFile[] = [];

  for (const directory of getSecurityDirectories(projectPath)) {
    const entries = await reader.listDirectoryEntries(
      owner,
      repository,
      branch,
      directory.path,
      context,
    );

    for (const entry of entries) {
      if (!isSensitiveFile(entry)) {
        continue;
      }

      files.push({
        kind: getSensitiveFileKind(entry),
        path: entry.path || joinRepositoryPath(directory.path, entry.name),
        scope: directory.scope,
      });
    }
  }

  return files;
};

const readGitignore = async ({
  branch,
  context,
  owner,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  context: ReportRepositoryReaderContext;
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
}): Promise<(PathSignal & { content: string | null }) | null> => {
  const projectGitignorePath = joinRepositoryPath(projectPath, '.gitignore');
  const projectContent = await reader.readTextFile(
    owner,
    repository,
    branch,
    projectGitignorePath,
    context,
  );

  if (projectContent !== null) {
    return {
      content: projectContent,
      exists: true,
      path: projectGitignorePath,
      scope: 'project',
    };
  }

  if (projectPath) {
    const rootContent = await reader.readTextFile(owner, repository, branch, '.gitignore', context);

    if (rootContent !== null) {
      return {
        content: rootContent,
        exists: true,
        path: '.gitignore',
        scope: 'root',
      };
    }
  }

  return null;
};

const hasGitignorePattern = (content: string, patterns: readonly RegExp[]) => {
  return patterns.some((pattern) => pattern.test(content));
};

const getGitignoreSignal = async (input: {
  branch: string;
  context: ReportRepositoryReaderContext;
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
}): Promise<SecuritySignals['gitignore']> => {
  const gitignore = await readGitignore(input);

  if (!gitignore) {
    return {
      coversEnvFiles: false,
      coversNpmrc: false,
      coversPrivateKeys: false,
      exists: false,
      path: null,
      scope: null,
    };
  }

  return {
    coversEnvFiles: hasGitignorePattern(
      gitignore.content ?? '',
      securityAnalysisConfig.gitignoreEnvPatterns,
    ),
    coversNpmrc: hasGitignorePattern(
      gitignore.content ?? '',
      securityAnalysisConfig.gitignoreNpmrcPatterns,
    ),
    coversPrivateKeys: hasGitignorePattern(
      gitignore.content ?? '',
      securityAnalysisConfig.gitignorePrivateKeyPatterns,
    ),
    exists: true,
    path: gitignore.path,
    scope: gitignore.scope,
  };
};

const isPlaceholderValue = (value: string) => {
  return securityAnalysisConfig.placeholderValuePatterns.some((pattern) => pattern.test(value));
};

const isSpecializedSecretValue = (value: string) => {
  return [
    securityAnalysisConfig.highConfidenceSecretPatterns.githubToken,
    securityAnalysisConfig.highConfidenceSecretPatterns.awsAccessKey,
    securityAnalysisConfig.highConfidenceSecretPatterns.jwt,
    securityAnalysisConfig.highConfidenceSecretPatterns.privateKey,
  ].some((pattern) => pattern.test(value));
};

const hasGenericSecretAssignment = (content: string) => {
  const pattern = securityAnalysisConfig.highConfidenceSecretPatterns.genericAssignment;
  const matcher = new RegExp(
    pattern.source,
    pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`,
  );

  for (const match of content.matchAll(matcher)) {
    const value = match[1]?.trim();

    if (value && !isPlaceholderValue(value) && !isSpecializedSecretValue(value)) {
      return true;
    }
  }

  return false;
};

const secretPatternChecks: Array<{
  kind: SecuritySecretPatternKind;
  test: (content: string) => boolean;
}> = [
  {
    kind: 'github_token',
    test: (content) =>
      securityAnalysisConfig.highConfidenceSecretPatterns.githubToken.test(content),
  },
  {
    kind: 'aws_access_key',
    test: (content) =>
      securityAnalysisConfig.highConfidenceSecretPatterns.awsAccessKey.test(content),
  },
  {
    kind: 'jwt',
    test: (content) => securityAnalysisConfig.highConfidenceSecretPatterns.jwt.test(content),
  },
  {
    kind: 'private_key',
    test: (content) => securityAnalysisConfig.highConfidenceSecretPatterns.privateKey.test(content),
  },
  {
    kind: 'generic_secret',
    test: hasGenericSecretAssignment,
  },
];

const detectHardcodedSecrets = (files: readonly SourceFileSignal[]) => {
  const matches: SecuritySecretPatternMatch[] = [];
  let isTruncated = false;

  for (const file of files) {
    if (file.kind !== 'source' && file.kind !== 'config') {
      continue;
    }

    for (const check of secretPatternChecks) {
      if (!check.test(file.content)) {
        continue;
      }

      if (matches.length >= securityAnalysisConfig.maxSecretMatches) {
        isTruncated = true;
        break;
      }

      matches.push({
        kind: check.kind,
        path: file.path,
      });
    }

    if (isTruncated) {
      break;
    }
  }

  const sources = getPreviewSources(matches.map((match) => match.path));

  return {
    count: matches.length,
    found: matches.length > 0,
    isTruncated,
    matches,
    sources,
  } satisfies SecuritySignals['hardcodedSecrets'];
};

const detectEnvUsage = (
  files: readonly SourceFileSignal[],
  envExample: PathSignal,
): SecuritySignals['envUsage'] => {
  const sources = getPreviewSources(
    files
      .filter((file) => file.kind === 'source' || file.kind === 'config')
      .filter((file) => /\b(?:process\.env|import\.meta\.env)\b/u.test(file.content))
      .map((file) => file.path),
  );

  return {
    found: sources.length > 0,
    sources,
    withoutExample: sources.length > 0 && !envExample.exists,
  };
};

export const analyzeSecurity = async ({
  branch,
  context = {},
  envExample,
  files,
  owner,
  projectPath,
  reader,
  repository,
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  envExample: PathSignal;
  files: readonly SourceFileSignal[];
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
}): Promise<SecuritySignals> => {
  const [sensitiveFiles, gitignore] = await Promise.all([
    listSensitiveFiles({
      branch,
      context,
      owner,
      projectPath,
      reader,
      repository,
    }),
    getGitignoreSignal({
      branch,
      context,
      owner,
      projectPath,
      reader,
      repository,
    }),
  ]);

  return {
    envUsage: detectEnvUsage(files, envExample),
    gitignore,
    hardcodedSecrets: detectHardcodedSecrets(files),
    sensitiveFiles: {
      files: sensitiveFiles,
      found: sensitiveFiles.length > 0,
      sources: getPreviewSources(sensitiveFiles.map((file) => file.path)),
    },
  };
};
