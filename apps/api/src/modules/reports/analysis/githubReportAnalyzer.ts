import { GithubClient } from '../infrastructure/github/githubClient.js';
import { GithubRepositoryReader } from '../infrastructure/github/githubRepositoryReader.js';
import { buildChecks } from '../domain/reportChecks.js';
import { buildRecommendations } from '../domain/reportRecommendations.js';
import { buildScoreBreakdown } from '../scoring/reportScoreCalculator.js';
import { calculateWeightedTotalScore } from '../scoring/reportScoringEngine.js';
import { resolveReportProject } from './project-detector/reportProjectDetector.js';
import { buildReportAnalysisSources } from './sources/reportAnalysisSources.js';
import { buildReportTooling } from './tooling/reportToolingAnalyzer.js';
import { collectRepositorySignals } from './signals/reportSignals.js';

import type { ReportAnalysisInput, ReportAnalyzer } from '../application/ports/reportAnalyzer.js';
import type { ProjectReport, ReportProjectPathSource } from '../domain/reportSchemas.js';

export {
  GithubApiError,
  GithubBranchNotFoundError,
  GithubRepositoryNotFoundError,
  getReportAnalysisFailure,
  isGithubApiError,
  isGithubBranchNotFoundError,
  isGithubRepositoryNotFoundError,
} from '../infrastructure/github/githubErrors.js';

export class GithubReportAnalyzer implements ReportAnalyzer {
  constructor(private readonly reader = new GithubRepositoryReader(new GithubClient())) {}

  async getRepositorySnapshot(owner: string, repository: string, branch?: string | null) {
    return this.reader.getRepositorySnapshot(owner, repository, branch);
  }

  async listRepositoryBranches(owner: string, repository: string) {
    return this.reader.listBranches(owner, repository);
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
    const reportBranch = input.branch || defaultBranch;
    const analysisRef = input.latestCommitSha ?? reportBranch;
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
    const analysisSources = buildReportAnalysisSources(signals, {
      name: repositoryMetadata.name,
      owner: repositoryMetadata.owner,
    });
    const scoreBreakdown = buildScoreBreakdown(signals);
    const tooling = buildReportTooling(signals);
    const totalScore = calculateWeightedTotalScore(scoreBreakdown);

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
        branch: reportBranch,
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
