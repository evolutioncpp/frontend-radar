import { buildCiAnalysis } from '../ci/reportCiAnalyzer.js';
import {
  getValidWorkflowNames,
  getWorkflowSource,
  readWorkflowFiles,
} from './reportSignalPaths.js';

import type {
  ReportRepositoryReader,
  ReportRepositoryReaderContext,
} from '../../application/ports/reportRepositoryReader.js';
import type { RepositorySignals } from './reportSignalTypes.js';

export const collectRepositoryWorkflowSignals = async ({
  branch,
  context = {},
  onProgress,
  owner,
  projectPath,
  reader,
  repository,
  workflowNames,
}: {
  branch: string;
  context?: ReportRepositoryReaderContext;
  onProgress?: () => Promise<void> | void;
  owner: string;
  projectPath: string;
  reader: ReportRepositoryReader;
  repository: string;
  workflowNames: readonly string[];
}): Promise<Pick<RepositorySignals, 'ci' | 'ciAnalysis'>> => {
  const validWorkflowNames = getValidWorkflowNames(workflowNames);

  await onProgress?.();

  const workflowFilesResult = await readWorkflowFiles({
    branch,
    context,
    owner,
    reader,
    repository,
    workflowNames: validWorkflowNames,
  });

  return {
    ci: {
      exists: validWorkflowNames.length > 0,
      scope: validWorkflowNames.length > 0 ? 'github' : null,
      source: getWorkflowSource(validWorkflowNames),
      workflowNames: validWorkflowNames,
    },
    ciAnalysis: buildCiAnalysis({
      isWorkflowAnalysisTruncated: workflowFilesResult.isTruncated,
      projectPath,
      workflowFiles: workflowFilesResult.files,
    }),
  };
};
