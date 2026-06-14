import { addA11yToolingRecommendation } from './reportRecommendationDefinitionsAccessibility.js';
import {
  addCiBuildStepRecommendation,
  addCiInstallStepRecommendation,
  addCiLintStepRecommendation,
  addCiPrChecksRecommendation,
  addCiTestStepRecommendation,
  addGithubActionsRecommendation,
  scopeCiToFrontendPathRecommendation,
} from './reportRecommendationDefinitionsCi.js';
import {
  addEnvExampleRecommendation,
  addReadmeRecommendation,
  improveReadmeRecommendation,
} from './reportRecommendationDefinitionsDocumentation.js';
import {
  addPackageMetadataRecommendation,
  alignPackageManagerRecommendation,
  commitLockfileRecommendation,
  moveToolingToDevDependenciesRecommendation,
  removeMixedLockfilesRecommendation,
} from './reportRecommendationDefinitionsDependencies.js';
import {
  addLintScriptRecommendation,
  addStorybookRecommendation,
  addTypecheckScriptRecommendation,
  addTypeScriptRecommendation,
  enableTypeScriptStrictRecommendation,
  reduceSourceHealthWarningsRecommendation,
} from './reportRecommendationDefinitionsMaintainability.js';
import {
  addBuildScriptRecommendation,
  addBundlerRecommendation,
} from './reportRecommendationDefinitionsPerformance.js';
import {
  ignoreSecretFilesRecommendation,
  removeSensitiveFilesRecommendation,
  replaceHardcodedSecretRecommendation,
} from './reportRecommendationDefinitionsSecurity.js';
import {
  addCoverageSignalRecommendation,
  addTestFilesRecommendation,
  addTestingLibraryRecommendation,
  addTestScriptRecommendation,
} from './reportRecommendationDefinitionsTesting.js';

import type { RecommendationDefinition } from './reportRecommendationTypes.js';

export const recommendationDefinitions = [
  addPackageMetadataRecommendation,
  addGithubActionsRecommendation,
  addCiTestStepRecommendation,
  addCiBuildStepRecommendation,
  addTestScriptRecommendation,
  addTestFilesRecommendation,
  addBuildScriptRecommendation,
  removeSensitiveFilesRecommendation,
  replaceHardcodedSecretRecommendation,
  addCiPrChecksRecommendation,
  addCiInstallStepRecommendation,
  addCiLintStepRecommendation,
  scopeCiToFrontendPathRecommendation,
  addCoverageSignalRecommendation,
  addReadmeRecommendation,
  improveReadmeRecommendation,
  addLintScriptRecommendation,
  addTypeScriptRecommendation,
  enableTypeScriptStrictRecommendation,
  addTypecheckScriptRecommendation,
  reduceSourceHealthWarningsRecommendation,
  addTestingLibraryRecommendation,
  addA11yToolingRecommendation,
  addBundlerRecommendation,
  commitLockfileRecommendation,
  removeMixedLockfilesRecommendation,
  alignPackageManagerRecommendation,
  moveToolingToDevDependenciesRecommendation,
  ignoreSecretFilesRecommendation,
  addStorybookRecommendation,
  addEnvExampleRecommendation,
] as const satisfies readonly RecommendationDefinition[];
