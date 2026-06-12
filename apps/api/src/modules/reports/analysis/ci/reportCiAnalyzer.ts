import { ciWorkflowAnalysisConfig } from '../../domain/reportAnalysisConfig.js';

export type CiCheckSignal = {
  found: boolean;
  sources: string[];
};

export type CiAnalysis = {
  analyzedWorkflowPaths: string[];
  build: CiCheckSignal;
  cache: CiCheckSignal;
  install: CiCheckSignal;
  isWorkflowAnalysisTruncated?: boolean;
  lint: CiCheckSignal;
  projectScope: CiCheckSignal;
  pullRequest: CiCheckSignal;
  push: CiCheckSignal;
  test: CiCheckSignal;
};

export type WorkflowFile = {
  content: string;
  name: string;
  path: string;
};

const matchesAnyPattern = (content: string, patterns: readonly RegExp[]) => {
  return patterns.some((pattern) => pattern.test(content));
};

const uniqueStrings = (values: readonly string[]) => [...new Set(values)];

const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
};

const normalizeWorkflowTarget = (value: string) => {
  return value
    .trim()
    .replace(/#.*$/u, '')
    .trim()
    .replace(/^['"]|['"]$/gu, '')
    .replace(/\\/gu, '/')
    .replace(/^\.\//u, '')
    .replace(/\.\.\.$/u, '')
    .replace(/\/+$/u, '');
};

const matchesProjectPathTarget = (target: string, projectPath: string) => {
  const normalizedTarget = normalizeWorkflowTarget(target);
  const normalizedProjectPath = normalizeWorkflowTarget(projectPath);

  return (
    normalizedTarget === normalizedProjectPath ||
    normalizedTarget.startsWith(`${normalizedProjectPath}/`)
  );
};

const getWorkflowTargetValues = (content: string) => {
  const targetPatterns = [
    /working-directory\s*:\s*["']?([^"'\n]+)/giu,
    /(?:--workspace|--filter)(?:\s+|=)["']?([^"'\s]+)/giu,
  ];

  return targetPatterns.flatMap((pattern) =>
    [...content.matchAll(pattern)].map((match) => match[1] ?? ''),
  );
};

export const sortWorkflowNamesByAnalysisPriority = (workflowNames: readonly string[]) => {
  return [...workflowNames].sort((left, right) => {
    const getPriority = (workflowName: string) => {
      const index = ciWorkflowAnalysisConfig.priorityNamePatterns.findIndex((pattern) =>
        pattern.test(workflowName),
      );

      return index === -1 ? ciWorkflowAnalysisConfig.priorityNamePatterns.length : index;
    };
    const priorityDiff = getPriority(left) - getPriority(right);

    return priorityDiff || left.localeCompare(right);
  });
};

const createCheckSignal = (
  workflowFiles: readonly WorkflowFile[],
  predicate: (workflow: WorkflowFile) => boolean,
): CiCheckSignal => {
  const sources = workflowFiles.filter(predicate).map((workflow) => workflow.path);

  return {
    found: sources.length > 0,
    sources: uniqueStrings(sources),
  };
};

const hasProjectScope = (workflow: WorkflowFile, projectPath: string) => {
  if (!projectPath) {
    return true;
  }

  const escapedProjectPath = escapeRegex(projectPath);
  const projectPathPattern = new RegExp(
    `(?:^|[\\s"'(:=])${escapedProjectPath}(?:$|[\\s"'\\),:/])`,
    'iu',
  );

  return (
    projectPathPattern.test(workflow.content) ||
    getWorkflowTargetValues(workflow.content).some((target) =>
      matchesProjectPathTarget(target, projectPath),
    )
  );
};

export const buildCiAnalysis = ({
  isWorkflowAnalysisTruncated = false,
  projectPath,
  workflowFiles,
}: {
  isWorkflowAnalysisTruncated?: boolean;
  projectPath: string;
  workflowFiles: readonly WorkflowFile[];
}): CiAnalysis => {
  const analyzedWorkflowPaths = workflowFiles.map((workflow) => workflow.path);

  return {
    analyzedWorkflowPaths,
    build: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.buildCommandPatterns),
    ),
    cache: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.cachePatterns),
    ),
    install: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.installCommandPatterns),
    ),
    isWorkflowAnalysisTruncated,
    lint: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.lintCommandPatterns),
    ),
    projectScope: createCheckSignal(workflowFiles, (workflow) =>
      hasProjectScope(workflow, projectPath),
    ),
    pullRequest: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.pullRequestTriggerPatterns),
    ),
    push: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.pushTriggerPatterns),
    ),
    test: createCheckSignal(workflowFiles, (workflow) =>
      matchesAnyPattern(workflow.content, ciWorkflowAnalysisConfig.testCommandPatterns),
    ),
  };
};
