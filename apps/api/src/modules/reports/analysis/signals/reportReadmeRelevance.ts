import type { PackageJson } from '../../application/ports/reportRepositoryReader.js';

export type ReadmeProjectRelevance = {
  found: boolean;
  reasons: string[];
};

const emptyReadmeProjectRelevance = {
  found: false,
  reasons: [],
} as const satisfies ReadmeProjectRelevance;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const normalizeText = (value: string) => value.replace(/\\/gu, '/').toLowerCase();

const normalizeProjectPath = (projectPath: string) =>
  projectPath
    .replace(/\\/gu, '/')
    .replace(/^\.\/+/u, '')
    .replace(/\/+$/u, '');

const hasProjectPathCommand = (content: string, projectPath: string) => {
  const escapedProjectPath = escapeRegExp(projectPath);

  return [
    new RegExp(`(?:^|\\s)-w\\s+["']?${escapedProjectPath}["']?`, 'iu'),
    new RegExp(`(?:^|\\s)--workspace(?:\\s+|=)["']?${escapedProjectPath}["']?`, 'iu'),
    new RegExp(`(?:^|\\s)cd\\s+["']?${escapedProjectPath}["']?`, 'iu'),
  ].some((pattern) => pattern.test(content));
};

export const getReadmeProjectRelevance = ({
  content,
  packageJson,
  projectPath,
}: {
  content: string;
  packageJson: PackageJson | null;
  projectPath: string;
}): ReadmeProjectRelevance => {
  const normalizedProjectPath = normalizeProjectPath(projectPath);

  if (!normalizedProjectPath) {
    return emptyReadmeProjectRelevance;
  }

  const normalizedContent = normalizeText(content);
  const reasons = new Set<string>();

  if (normalizedContent.includes(normalizedProjectPath.toLowerCase())) {
    reasons.add('project-path');
  }

  if (packageJson?.name && normalizedContent.includes(packageJson.name.toLowerCase())) {
    reasons.add('package-name');
  }

  if (hasProjectPathCommand(normalizedContent, normalizedProjectPath.toLowerCase())) {
    reasons.add('workspace-command');
  }

  return {
    found: reasons.size > 0,
    reasons: [...reasons],
  };
};
