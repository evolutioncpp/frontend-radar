import { GithubClient } from './githubClient.js';
import { GithubRepositoryReader, type RepositorySnapshot } from './githubRepositoryReader.js';
import { buildChecks } from './reportChecks.js';
import { buildRecommendations } from './reportRecommendations.js';
import { buildScoreBreakdown } from './reportScoreCalculator.js';
import { resolveReportProject } from './reportProjectDetector.js';
import { buildReportAnalysisSources } from './reportAnalysisSources.js';
import { buildReportTooling } from './reportToolingAnalyzer.js';
import { collectRepositorySignals } from './reportSignals.js';

import type {
  CreateReportAnalysisRequest,
  ProjectReport,
  ReportProjectPathSource,
} from './reportSchemas.js';

export {
  GithubApiError,
  GithubRepositoryNotFoundError,
  getReportAnalysisFailure,
  isGithubApiError,
  isGithubRepositoryNotFoundError,
} from './githubErrors.js';

type ReportAnalysisInput = Omit<
  CreateReportAnalysisRequest,
  'projectPath' | 'projectPathSource'
> & {
  id: string;
  createdAt: Date;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
  latestCommitTitle: string | null;
  projectPath: string;
  projectPathSource: ReportProjectPathSource;
};

export type { RepositorySnapshot };

export interface ReportAnalyzer {
  analyze(input: ReportAnalysisInput): Promise<ProjectReport>;
  getRepositorySnapshot(owner: string, repository: string): Promise<RepositorySnapshot>;
  resolveProjectPath(
    owner: string,
    repository: string,
    ref: string,
    projectPath?: string | null,
    projectPathSource?: ReportProjectPathSource | null,
  ): Promise<string>;
}

export class GithubReportAnalyzer implements ReportAnalyzer {
  constructor(private readonly reader = new GithubRepositoryReader(new GithubClient())) {}

  async getRepositorySnapshot(owner: string, repository: string) {
    return this.reader.getRepositorySnapshot(owner, repository);
  }

  async resolveProjectPath(
    owner: string,
    repository: string,
    ref: string,
    projectPath?: string | null,
    projectPathSource?: ReportProjectPathSource | null,
  ) {
    const project = await resolveReportProject({
      branch: ref,
      owner,
      projectPath,
      projectPathSource,
      reader: this.reader,
      repository,
    });

    return project.projectPath;
  }

  async analyze(input: ReportAnalysisInput): Promise<ProjectReport> {
    const repositoryMetadata = await this.reader.fetchRepositoryMetadata(
      input.owner,
      input.repository,
    );
    const defaultBranch = repositoryMetadata.defaultBranch;
    const analysisRef = input.latestCommitSha ?? defaultBranch;
    const project = await resolveReportProject({
      branch: analysisRef,
      owner: input.owner,
      projectPath: input.projectPath,
      projectPathSource: input.projectPathSource,
      reader: this.reader,
      repository: input.repository,
    });
    const signals = await collectRepositorySignals({
      branch: analysisRef,
      owner: input.owner,
      packageJson: project.packageJson,
      packageJsonPath: project.packageJsonPath,
      projectPath: project.projectPath,
      reader: this.reader,
      repository: input.repository,
      rootPackageJson: project.rootPackageJson,
    });
    const analysisSources = buildReportAnalysisSources(signals);
    const scoreBreakdown = buildScoreBreakdown(signals);
    const tooling = buildReportTooling(signals);
    const totalScore = Math.round(
      scoreBreakdown.reduce((sum, metric) => sum + metric.value, 0) / scoreBreakdown.length,
    );

    return {
      id: input.id,
      createdAt: input.createdAt.toISOString(),
      analysisSources,
      totalScore,
      tooling,
      repository: {
        owner: repositoryMetadata.owner,
        name: repositoryMetadata.name,
        url: repositoryMetadata.htmlUrl,
        description: repositoryMetadata.description,
        stars: repositoryMetadata.stars,
        forks: repositoryMetadata.forks,
        defaultBranch,
        projectPath: project.projectPath || null,
        projectDetection: project.projectDetection,
        latestCommitSha: input.latestCommitSha,
        latestCommitDate: input.latestCommitDate ?? repositoryMetadata.pushedAt,
        latestCommitTitle: input.latestCommitTitle,
        license: repositoryMetadata.license,
      },
      scoreBreakdown,
      checks: buildChecks(signals),
      recommendations: buildRecommendations(signals),
    };
  }
}
