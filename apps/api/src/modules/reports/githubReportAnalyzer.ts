import { GithubClient } from './githubClient.js';
import { GithubRepositoryReader, type RepositorySnapshot } from './githubRepositoryReader.js';
import { buildChecks } from './reportChecks.js';
import { buildRecommendations } from './reportRecommendations.js';
import { buildScoreBreakdown } from './reportScoreCalculator.js';
import { collectRepositorySignals } from './reportSignals.js';

import type { CreateReportAnalysisRequest, ProjectReport } from './reportSchemas.js';

export {
  GithubApiError,
  GithubRepositoryNotFoundError,
  getReportAnalysisFailure,
  isGithubApiError,
  isGithubRepositoryNotFoundError,
} from './githubErrors.js';

type ReportAnalysisInput = CreateReportAnalysisRequest & {
  id: string;
  createdAt: Date;
  latestCommitDate: string | null;
  latestCommitSha: string | null;
};

export type { RepositorySnapshot };

export interface ReportAnalyzer {
  analyze(input: ReportAnalysisInput): Promise<ProjectReport>;
  getRepositorySnapshot(owner: string, repository: string): Promise<RepositorySnapshot>;
}

export class GithubReportAnalyzer implements ReportAnalyzer {
  constructor(private readonly reader = new GithubRepositoryReader(new GithubClient())) {}

  async getRepositorySnapshot(owner: string, repository: string) {
    return this.reader.getRepositorySnapshot(owner, repository);
  }

  async analyze(input: ReportAnalysisInput): Promise<ProjectReport> {
    const repositoryMetadata = await this.reader.fetchRepositoryMetadata(
      input.owner,
      input.repository,
    );
    const defaultBranch = repositoryMetadata.defaultBranch;
    const analysisRef = input.latestCommitSha ?? defaultBranch;
    const packageJson = await this.reader.readPackageJson(
      input.owner,
      input.repository,
      analysisRef,
    );
    const signals = await collectRepositorySignals({
      branch: analysisRef,
      owner: input.owner,
      packageJson,
      reader: this.reader,
      repository: input.repository,
    });
    const scoreBreakdown = buildScoreBreakdown(signals);
    const totalScore = Math.round(
      scoreBreakdown.reduce((sum, metric) => sum + metric.value, 0) / scoreBreakdown.length,
    );

    return {
      id: input.id,
      createdAt: input.createdAt.toISOString(),
      totalScore,
      repository: {
        owner: repositoryMetadata.owner,
        name: repositoryMetadata.name,
        url: repositoryMetadata.htmlUrl,
        description: repositoryMetadata.description,
        stars: repositoryMetadata.stars,
        forks: repositoryMetadata.forks,
        defaultBranch,
        latestCommitSha: input.latestCommitSha,
        latestCommitDate: input.latestCommitDate ?? repositoryMetadata.pushedAt,
        license: repositoryMetadata.license,
      },
      scoreBreakdown,
      checks: buildChecks(signals),
      recommendations: buildRecommendations(signals),
    };
  }
}
