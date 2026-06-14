export const joinRepositoryPath = (...segments: Array<string | null | undefined>) => {
  return segments
    .flatMap((segment) => segment?.split('/') ?? [])
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/');
};
