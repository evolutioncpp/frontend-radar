import type { RepositorySignals } from '../reportSignalContracts.js';

export const firstSource = (...sources: Array<string | null | undefined>) => {
  return sources.find(
    (source): source is string => typeof source === 'string' && source.length > 0,
  );
};

export const firstToolingSource = (sources: RepositorySignals['typescript']['sources']) => {
  return sources[0]?.raw;
};

export const isReadmeIncomplete = (signals: RepositorySignals) => {
  return (
    !signals.readme.isSubstantial ||
    !signals.readme.hasInstallSection ||
    !signals.readme.hasUsageSection
  );
};
